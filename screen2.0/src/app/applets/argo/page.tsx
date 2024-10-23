"use client"
import React, { useMemo } from "react"
import { useState } from "react"
import { Stack, Typography, Box, TextField, Button, Alert, CircularProgress, IconButton } from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import BedUpload, { getIntersect, parseDataInput } from "../../_mainsearch/bedupload"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { GENE_EXP_QUERY, LINKED_GENES, Z_SCORES_QUERY } from "./queries"
import { ApolloQueryResult, useLazyQuery, useQuery } from "@apollo/client"
import { client } from "../../search/_ccredetails/client"
import { ZScores, LinkedGenes, GenomicRegion, CCREAssays, CCREClasses, RankedRegions, FilterState } from "./types"
import { BED_INTERSECT_QUERY } from "../../_mainsearch/queries"
import InfoIcon from '@mui/icons-material/Info';
import Filters from "./filters"

const scoreNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"]
const conservationNames = ["vertebrates", "mammals", "primates"]
const linkedGenesMethods = ["Intact-HiC", "CTCF-ChIAPET", "RNAPII-ChIAPET", "CRISPRi-FlowFISH", "eQTLs"]
const allScoreNames = scoreNames.concat(conservationNames).concat(linkedGenesMethods)
const allScoresObj = { "dnase": false, "h3k4me3": false, "h3k27ac": false, "ctcf": false, "atac": false, "conservation": true, "TFMotifs": false, "cCREs": true, "CA": true, "CA_CTCF": true, "CA_H3K4me3": true, "CA_TF": true, "dELS": true, "pELS": true, "PLS": true, "TF": true, "vertebrates": false, "mammals": false, "primates": false, "Intact-HiC": false, "CTCF-ChIAPET": false, "RNAPII-ChIAPET": false, "CRISPRi-FlowFISH": false, "eQTLs": false }
const allFiltersObj = {
    headerFilters: { "conservation": true, "TFMotifs": false, "cCREs": true, },
    conservationFilters: { "240_mam_phyloP": true, "240_mam_phastCons": false, "43_prim_phyloP": false, "43_prim_phastCons": false, "100_vert_phyloP": false, "100_vert_phastCons": false },
    classFilters: { "CA": true, "CA_CTCF": true, "CA_H3K4me3": true, "CA_TF": true, "dELS": true, "pELS": true, "PLS": true, "TF": true },
    assayFilters: { "dnase": false, "h3k4me3": false, "h3k27ac": false, "ctcf": false, "atac": false },
    linkedGeneFilters: { "Intact-HiC": false, "CTCF-ChIAPET": false, "RNAPII-ChIAPET": false, "CRISPRi-FlowFISH": false, "eQTLs": false },
};

export default function Argo(props: { header?: false, optionalFunction?: Function }) {
    //Old state variables
    const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
    const [selectedSearch, setSelectedSearch] = useState<string>("BED File")
    const [dataAPI, setDataAPI] = useState<[]>([]) // The intersection data returned from BedUpload component
    const [rows, setRows] = useState<any[]>([]) // The main data displayed on the table
    const [key, setKey] = useState<string>()
    const [columns, setColumns] = useState([]) // State variable used to display the columns in the DataTable

    const [availableScores, setAvailableScores] = useState(allFiltersObj) // This is all the scores available according to the query, all false scores are disabled checkboxes below
    const [checkedScores, setCheckedScores] = useState(allFiltersObj) // This is the scores the user has selected, used for checkbox control

    const [getOutput] = useLazyQuery(BED_INTERSECT_QUERY)

    //UI state variables
    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const [shownTable, setShownTable] = useState<"sequence" | "element" | "gene">(null);

    // Filter state variables
    /**
     * @todo group necesary filter states together
     */
    const [inputRegions, setInputRegions] = useState<GenomicRegion[]>([]);

    const [filterVariables, setFilterVariables] = useState<FilterState>({
        useConservation: true,
        alignment: "241-mam-phyloP",
        rankBy: "max",
        useMotifs: false,
        motifCatalog: "factorbook",
        numOverlappingMotifs: true,
        motifScoreDelta: false,
        overlapsTFPeak: false,
        usecCREs: true,
        cCREAssembly: "GRCh38",
        mustHaveOrtholog: false,
        selectedBiosample: null,
        assays: {
            DNase: true,
            ATAC: true,
            CTCF: true,
            H3K4me3: true,
            H3K27ac: true,
        },
        availableAssays: {
            DNase: true,
            ATAC: true,
            CTCF: true,
            H3K4me3: true,
            H3K27ac: true,
        },
        classes: {
            CA: true,
            CACTCF: true,
            CAH3K4me3: true,
            CATF: true,
            dELS: true,
            pELS: true,
            PLS: true,
            TF: true,
        },
        useGenes: true,
    });

    //update the filter variable state
    const updateFilter = (key: keyof FilterState, value: any) => {
        setFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    // To update a specific assay
    const toggleAssay = (assayName: keyof CCREAssays) => {
        updateFilter('assays', {
            ...filterVariables.assays,
            [assayName]: !filterVariables.assays[assayName]
        });
    };

    // To update a specific class
    const toggleClass = (className: keyof CCREClasses) => {
        updateFilter('classes', {
            ...filterVariables.classes,
            [className]: !filterVariables.classes[className]
        });
    };

    const MainColHeader = ({ tableName, onClick }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {tableName}
            <IconButton
                size="small"
                onClick={onClick}
            >
                <InfoIcon
                    fontSize="inherit"
                    color={shownTable === tableName.toLowerCase() ? "primary" : "inherit"}
                />
            </IconButton>
        </div>
    );

    const mainColumns: DataTableColumn<any>[] = useMemo(() => {

        const cols: DataTableColumn<any>[] = [
            { header: "Input Region", value: (row) => `${row.genomicRegion.chr}:${row.genomicRegion.start}-${row.genomicRegion.end}` },
            { header: "Aggregate", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) }
        ]
        /**
         * @todo add corresponding checkbox states to these checks
         * and type "rows" state variable properly, and add to type arguments above DataTableColumn<NEW_TYPE>
         * correctly populate input region
         * correctly populate row values
         */
        if (filterVariables.useConservation || filterVariables.useMotifs) {
            cols.push({ header: "Seqence", HeaderRender: () => <MainColHeader tableName="Sequence" onClick={() => setShownTable("sequence")} />, value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) })
        }
        filterVariables.usecCREs && cols.push({ header: "Element", HeaderRender: () => <MainColHeader tableName="Element" onClick={() => setShownTable("element")} />, value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) })
        filterVariables.useGenes && cols.push({ header: "Gene", HeaderRender: () => <MainColHeader tableName="Gene" onClick={() => setShownTable("gene")} />, value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) })

        return cols

    }, [MainColHeader, setShownTable])

    const sequenceColumns: DataTableColumn<any>[] = useMemo(() => {

        const cols: DataTableColumn<any>[] = [
            { header: "Input Region", value: (row) => `${row.genomicRegion.chr}:${row.genomicRegion.start}-${row.genomicRegion.end}` },
        ]
        /**
         * @todo add corresponding checkbox states to these checks
         * and type "rows" state variable properly, and add to type arguments above DataTableColumn<NEW_TYPE>
         * correctly populate input region
         * correctly populate row values
         */

        if (filterVariables.useConservation) {
            switch (filterVariables.alignment) {
                case "241-mam-phyloP":
                    cols.push({ header: "241-Mammal(phyloP) Score", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) });
                    break;
                case "447-mam-phyloP":
                    cols.push({ header: "447-Mammal(phyloP) Score", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) });
                    break;
                case "241-mam-phastCons":
                    cols.push({ header: "241-Mammal(phastCons) Score", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) });
                    break;
                case "43-prim-phyloP":
                    cols.push({ header: "43-Primate(phyloP) Score", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) });
                    break;
                case "43-prim-phastCons":
                    cols.push({ header: "43-Primate(phastCons) Score", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) });
                    break;
                case "243-prim-phastCons":
                    cols.push({ header: "243-Primate(phastCons) Score", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) });
                    break;
                case "100-vert-phyloP":
                    cols.push({ header: "100-Vertebrate(phyloP) Score", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) });
                    break;
                case "100-vert-phastCons":
                    cols.push({ header: "100-Vertebrate(phastCons) Score", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) });
                    break;
                default:
                    break;
            }
        }
        if (filterVariables.useMotifs) {
            filterVariables.numOverlappingMotifs && cols.push({ header: "# of Overlapping Motifs", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) })
            filterVariables.motifScoreDelta && cols.push({ header: "Motif Score Delta", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) })
            filterVariables.overlapsTFPeak && cols.push({ header: "Overlaps TF Peak", value: (row) => row.aggRank, render: (row) => row.aggRank.toFixed(2) })
        }

        return cols

    }, [filterVariables.alignment, filterVariables.numOverlappingMotifs, filterVariables.motifScoreDelta, filterVariables.overlapsTFPeak, filterVariables.useMotifs, filterVariables.useConservation])

    const elementColumns: DataTableColumn<any>[] = useMemo(() => {

        const cols: DataTableColumn<any>[] = [
            { header: "Input Region", value: (row) => `${row.genomicRegion.chr}:${row.genomicRegion.start}-${row.genomicRegion.end}` },
        ]
        /**
         * @todo add corresponding checkbox states to these checks
         * and type "rows" state variable properly, and add to type arguments above DataTableColumn<NEW_TYPE>
         * correctly populate input region
         * correctly populate row values
         */
        if (filterVariables.usecCREs) {
            filterVariables.assays.DNase && cols.push({ header: "DNase", value: (row) => row.dnase, render: (row) => row.dnase.toFixed(2) })
            filterVariables.assays.H3K4me3 && cols.push({ header: "H3K4me3", value: (row) => row.h3k4me3, render: (row) => row.h3k4me3.toFixed(2) })
            filterVariables.assays.H3K27ac && cols.push({ header: "H3K27ac", value: (row) => row.h3k27ac, render: (row) => row.h3k27ac.toFixed(2) })
            filterVariables.assays.CTCF && cols.push({ header: "CTCF", value: (row) => row.ctcf, render: (row) => row.ctcf.toFixed(2) })
            filterVariables.assays.ATAC && cols.push({ header: "ATAC", value: (row) => row.atac, render: (row) => row.atac.toFixed(2) })
        }

        return cols

    }, [filterVariables.assays, filterVariables.usecCREs, filterVariables.classes])

    const assayColumns = [
        { header: "DNase", value: (row) => row.dnase, render: (row) => row.dnase.toFixed(2) },
        { header: "H3K4me3", value: (row) => row.h3k4me3, render: (row) => row.h3k4me3.toFixed(2) },
        { header: "H3K27ac", value: (row) => row.h3k27ac, render: (row) => row.h3k27ac.toFixed(2) },
        { header: "CTCF", value: (row) => row.ctcf, render: (row) => row.ctcf.toFixed(2) },
        { header: "ATAC", value: (row) => row.atac, render: (row) => row.atac.toFixed(2) },
    ]



    const { loading: loading_scores, error: error_scores } = useQuery(Z_SCORES_QUERY, {
        variables: {
            assembly: assembly,
            accessions: rows.length > 0 ? rows.map((s) => s.accession) : dataAPI.map((r) => r[4]),
            cellType: filterVariables.selectedBiosample ? filterVariables.selectedBiosample.name : null
        },
        skip: rows.length == 0 && dataAPI.length == 0,
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(d) {
            let data = d['cCRESCREENSearch']
            let result = null
            if (filterVariables.selectedBiosample) {
                // This makes a copy of the existing row and just updates the scores to ctspecific
                result = rows.map((obj) => {
                    let o = { ...obj }
                    let matchingObj = data.find((e) => o.accession == e.info.accession)
                    o.dnase = matchingObj.ctspecific.dnase_zscore
                    o.h3k4me3 = matchingObj.ctspecific.h3k4me3_zscore
                    o.h3k27ac = matchingObj.ctspecific.h3k27ac_zscore
                    o.ctcf = matchingObj.ctspecific.ctcf_zscore
                    o.atac = matchingObj.ctspecific.atac_zscore
                    return o
                }
                )
            }
            else {
                // The else is only for when the query runs the first time
                // This is done so that if a biosample is deselected, the linked genes data is not lost
                let mapFunc = (obj) => {
                    let o = { ...obj }
                    let matchingObj = data.find((e) => o.accession == e.info.accession)
                    o.dnase = matchingObj.dnase_zscore
                    o.h3k4me3 = matchingObj.promoter_zscore
                    o.h3k27ac = matchingObj.enhancer_zscore
                    o.ctcf = matchingObj.ctcf_zscore
                    o.atac = matchingObj.atac_zscore
                    o.vertebrates = matchingObj.vertebrates
                    o.mammals = matchingObj.mammals
                    o.primates = matchingObj.primates
                    return o
                }
                if (rows.length > 0) {
                    result = rows.map(mapFunc)
                }
                else {
                    result = dataAPI
                        .map((e) => {
                            return {
                                // This is annoying because currently an array of objects is not being returned
                                // The order of the array is the same as the order of the ccre file
                                // Index 4 is accessions, 6 is chr, 7 is start, 8 is stop 
                                // chr, start, stop should be of user uploaded file and not of our files hence not index 0,1,2

                                accession: e[4],
                                user_id: `${e[6]}_${e[7]}_${e[8]}${(e[9] && e[10]) ? '_' + e[9] : ''}`,
                                linked_genes: [],
                                genomicRegion: {
                                    chr: e[0],
                                    start: e[1],
                                    end: e[2]
                                }
                            }
                        })
                        .map(mapFunc)
                }
            }

            let scoresToInclude = filterVariables.selectedBiosample ? scoreNames.filter((s) => filterVariables.selectedBiosample[s]) : scoreNames
            let availableScoresCopy = { ...availableScores }

            if (assembly != "mm10") {
                // Including conservation scores if assembly is not mouse
                scoresToInclude = scoresToInclude.concat(conservationNames)
            }

            // Linked genes is by default unavailable and disabled, it is made available inside the query below
            allScoreNames.forEach((s) => {
                if (scoresToInclude.indexOf(s) !== -1) {
                    availableScoresCopy.assayFilters[s] = true
                }
                else {
                    availableScoresCopy.assayFilters[s] = false
                }
            })
            setAvailableScores(availableScoresCopy)
            setCheckedScores(availableScoresCopy)
            setRows(evaluateRankings(result, availableScoresCopy))
        }
    })


    const { loading: loading_genes, error: error_genes } = useQuery(LINKED_GENES, {
        variables: {
            assembly: assembly.toLowerCase(),
            accessions: (rows.length > 0 && filterVariables.selectedBiosample) ? rows.map((s) => s.accession) : [],
        },
        skip: rows.length == 0 || !!filterVariables.selectedBiosample,
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(data) {
            if (data.linkedGenes.length > 0) {
                setRows(rows.map((obj) => {
                    let objCopy = { ...obj }
                    let matchingObjs = data.linkedGenes.filter((e) => e.accession == obj.accession)
                    let linkedGenes: LinkedGenes[] = matchingObjs.map((e) => {
                        // The Chromatin part is because Chromatin has sub-methods which is present in the assay field
                        return { gene_id: e.geneid, method: e.method == "Chromatin" ? e.assay : e.method, tpm: 0 }
                    })
                    objCopy.linked_genes = linkedGenes
                    return objCopy
                }))
            }
        },
    })

    const { loading: loading_quantifications, error: error_quantifications } = useQuery(GENE_EXP_QUERY, {
        variables: {
            assembly: assembly,
            biosample_value: filterVariables.selectedBiosample ? filterVariables.selectedBiosample.name : "",
            gene_id: Array.from(rows.reduce((acc, e) => { e.linked_genes.map((e) => e.gene_id).forEach((el) => acc.add(el)); return acc }, new Set([]))) // Using Set to avoid duplicates
        },
        skip: !!filterVariables.selectedBiosample || rows.length == 0,
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(data) {
            let listGenes = []
            data.gene_dataset.forEach((e) => {
                e.gene_quantification_files.forEach((el) => {
                    listGenes = listGenes.concat(el.quantifications)
                }
                )
            })
            if (listGenes.length > 0) {
                let availableScoresCopy = { ...availableScores }
                linkedGenesMethods.forEach((m) => availableScoresCopy.linkedGeneFilters[m] = false)
                let newScores = rows.map((obj) => {
                    let objCopy = { ...obj }
                    objCopy.linked_genes = objCopy.linked_genes.map((gene) => {
                        let geneCopy = { ...gene }
                        let matchingGenes = listGenes.filter((o) => o.gene.id.split(".")[0] == gene.gene_id)

                        let max_tpm = 0
                        matchingGenes.forEach((matchingGene) => {
                            // If a matching gene is found for any method, the method is made available to select
                            availableScoresCopy.linkedGeneFilters[`${gene.method}`] = true

                            if (matchingGene.tpm > max_tpm) {
                                max_tpm = matchingGene.tpm
                            }
                        })
                        geneCopy.tpm = max_tpm
                        return geneCopy
                    })
                    objCopy = evaluateMaxTPM(objCopy)
                    return objCopy
                })
                setAvailableScores(availableScoresCopy)
                setCheckedScores(availableScoresCopy)
                setRows(evaluateRankings(newScores, availableScoresCopy))
            }
        },
    })

    const handleSearchChange = (event: SelectChangeEvent) => {
        setDataAPI([])
        setAvailableScores(allFiltersObj)
        setCheckedScores(allFiltersObj)
        updateFilter('selectedBiosample', null)
        setRows([])
        setColumns([])
        setSelectedSearch(event.target.value)
    }

    function appletCallBack(data) {
        updateFilter('selectedBiosample', null)
        setDataAPI(data)
        setRows([])
        configureInputedRegions(data)
        setDrawerOpen(true)
    }

    function configureInputedRegions(data) {
        const regions = data.map(item => ({
            chr: item[0],         // Index 0 for inputed chromosome
            start: Number(item[1]), // Index 1 for inputed start, convert to number
            end: Number(item[2])     // Index 2 for inputed end, convert to number
        }));

        // Sort the regions
        const sortedRegions = regions.sort((a, b) => {
            const chrA = a.chr.replace('chr', '');
            const chrB = b.chr.replace('chr', '');

            if (chrA !== chrB) {
                return chrA - chrB;
            }
            if (a.start !== b.start) {
                return a.start - b.start;
            }
        });

        setInputRegions(sortedRegions);
    }

    function handleTextUpload(event) {
        let uploadedData = event.get("textUploadFile").toString()
        getIntersect(getOutput, parseDataInput(uploadedData), assembly, appletCallBack, console.error)
    }

    function evaluateRankings(data, available) {
        // This below code is inspired from this link to create a ranking column for each score for every row
        // https://stackoverflow.com/questions/60989105/ranking-numbers-in-an-array-using-javascript
        let scoresToInclude = allScoreNames.filter((s) => available.assayFilters[s])
        scoresToInclude.forEach((scoreName) => {
            let score_column = data.map((r, i) => [i, r[scoreName]])
            score_column.sort((a, b) => b[1] - a[1])
            score_column.forEach((row, i) => {
                data[row[0]][`${scoreName}_rank`] = i + 1
            })
        })
        setColumns(assayColumns.filter(
            (e) => available.assayFilters[e.header.toLowerCase()] || available.assayFilters[e.header]
        ))
        let random_string = Math.random().toString(36).slice(2, 10)
        setKey(random_string) // Setting a key to force update the DataTable component to refresh with the new columns
        return calculateAggregateRank(data, scoresToInclude)
    }

    function evaluateMaxTPM(score: ZScores) {
        // This finds the Max TPM for each method in a given row
        let scoreCopy = { ...score }
        linkedGenesMethods.forEach((method) => {
            let maxTPM = 0
            let method_genes = scoreCopy.linked_genes.filter((gene) => gene.method == method)
            method_genes.forEach((e) => maxTPM = e.tpm > maxTPM ? e.tpm : maxTPM)
            scoreCopy[method] = maxTPM
        })
        return scoreCopy
    }

    function calculateAggregateRank(data, scoresToInclude) {
        // This finds the Aggregate Rank depending on which scores are checked by the user
        data.forEach((row) => {
            let count = 0;
            let sum = 0;
            scoresToInclude.forEach((score) => {
                sum += row[`${score}_rank`]
                count += 1
            })
            row.aggRank = sum / count
        })
        return data
    }

    function handleCheckBoxChange(event, groupName) {
        let checkedCopy = JSON.parse(JSON.stringify(checkedScores));
        checkedCopy[groupName][event.target.value] = event.target.checked;
        setCheckedScores(checkedCopy);

        let scoresToInclude = Object.keys(checkedCopy[groupName]).filter((e) => checkedCopy[groupName][e]);
        setRows(calculateAggregateRank([...rows], scoresToInclude));
        setColumns(assayColumns.filter(
            (e) => checkedCopy[groupName][e.header.toLowerCase().split(' ')[0]] || checkedCopy[groupName][e.header]
        ));
        setKey(scoresToInclude.join(' '));
    }

    return (
        <Box display="flex" >
            <Filters
                filterVariables={filterVariables}
                updateFilter={updateFilter}
                toggleAssay={toggleAssay}
                toggleClass={toggleClass}
                drawerOpen={drawerOpen}
                toggleDrawer={toggleDrawer}
                rows={rows}
            />
            <Box
                ml={drawerOpen ? "25vw" : 0}
                padding={3}
                flexGrow={1}
                height={"100%"}
            >
                <Typography variant="h4" mb={3}>
                    <b>A</b>ggregate <b>R</b>ank <b>G</b>enerat<b>o</b>r
                </Typography>

                {error_scores && (
                    <Alert variant="filled" severity="error">
                        {error_scores.message}
                    </Alert>
                )}
                {error_genes && (
                    <Alert variant="filled" severity="error">
                        {error_genes.message}
                    </Alert>
                )}
                {error_quantifications && (
                    <Alert variant="filled" severity="error">
                        {error_quantifications.message}
                    </Alert>
                )}
                <Stack direction={props.header ? "row" : "column"} spacing={3} mt="10px">
                    <Stack direction={"row"} alignItems={"center"} flexWrap={"wrap"}>
                        {!props.header && (
                            <Typography variant={"h5"} mr={1} alignSelf="center">
                                Upload Through
                            </Typography>
                        )}
                        <Stack
                            direction={"row"}
                            alignItems={"center"}
                            flexWrap={props.header ? "nowrap" : "wrap"}
                        >
                            <FormControl
                                variant="standard"
                                size="medium"
                                sx={{ '& .MuiInputBase-root': { fontSize: '1.5rem' } }}
                            >
                                <Select
                                    fullWidth
                                    id="select-search"
                                    value={selectedSearch}
                                    onChange={handleSearchChange}
                                    SelectDisplayProps={{
                                        style: { paddingBottom: '0px', paddingTop: '1px' },
                                    }}
                                >
                                    <MenuItem value={"BED File"}>BED File</MenuItem>
                                    <MenuItem value={"Text Box"}>Text Box</MenuItem>
                                </Select>
                            </FormControl>
                        </Stack>
                    </Stack>
                </Stack>
                <Box mt="20px" width="30vw">
                    {selectedSearch === "BED File" ? (
                        <BedUpload
                            assembly={assembly}
                            appletCallback={appletCallBack}
                        />
                    ) :
                        <FormControl fullWidth>
                            <form action={handleTextUpload}>
                                <TextField name="textUploadFile" multiline fullWidth rows={5}
                                    placeholder="Copy and paste your data from Excel here"
                                ></TextField>
                                <Button type="submit" size="medium" variant="outlined">Submit</Button>
                            </form>
                        </FormControl>

                    }
                </Box>
                {rows.length > 0 &&
                    <Box mt="20px" id="123456">
                        <DataTable
                            key={Math.random()}
                            columns={mainColumns}
                            rows={rows}
                            sortColumn={1}
                            sortDescending
                            itemsPerPage={5}
                            searchable
                            tableTitle="ARGO"
                        />
                    </Box>
                }
                {(shownTable === "sequence" && (filterVariables.useConservation || filterVariables.useMotifs)) && (
                    <Box mt="20px">
                        <DataTable
                            key={Math.random()}
                            columns={sequenceColumns}
                            rows={rows}
                            sortColumn={0}
                            sortDescending
                            itemsPerPage={5}
                            searchable
                            tableTitle="Sequence Details"
                        />
                    </Box>
                )}
                {(shownTable === "element" && filterVariables.usecCREs) && (
                    <Box mt="20px">
                        {(loading_scores || loading_genes || loading_quantifications) ? <CircularProgress /> :
                            <DataTable
                                key={Math.random()}
                                columns={elementColumns}
                                rows={rows}
                                sortColumn={0}
                                sortDescending
                                itemsPerPage={10}
                                searchable
                                tableTitle="User Uploaded cCREs Ranked By Scores"
                            >
                            </DataTable>
                        }
                    </Box>
                )}
                {shownTable === "gene" && (
                    <Box mt="20px">
                        <DataTable
                            key={`sequence-${key}`}
                            columns={[
                                {
                                    header: "Accession",
                                    value: (row) => row.accession
                                },
                                {
                                    header: "User ID",
                                    value: (row) => row.user_id
                                },
                                {
                                    header: "Aggregate Rank",
                                    value: (row) => row.aggRank,
                                    render: (row) => row.aggRank.toFixed(2)
                                },
                            ]}
                            rows={rows}
                            sortColumn={1}
                            sortDescending
                            itemsPerPage={5}
                            searchable
                            tableTitle="Gene Details"
                        />
                    </Box>
                )}
            </Box>
        </Box>
    )
}