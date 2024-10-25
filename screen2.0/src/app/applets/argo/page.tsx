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
import { ZScores, LinkedGenes, GenomicRegion, CCREAssays, CCREClasses, RankedRegions, ElementFilterState, SequenceFilterState, GeneFilterState } from "./types"
import { BED_INTERSECT_QUERY } from "../../_mainsearch/queries"
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import Filters from "./filters"
import { CancelRounded } from "@mui/icons-material"

const scoreNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"]
const conservationNames = ["vertebrates", "mammals", "primates"]
const linkedGenesMethods = ["Intact-HiC", "CTCF-ChIAPET", "RNAPII-ChIAPET", "CRISPRi-FlowFISH", "eQTLs"]
const allScoreNames = scoreNames.concat(conservationNames).concat(linkedGenesMethods)

export default function Argo(props: { header?: false, optionalFunction?: Function }) {
    //Old state variables
    const [dataAPI, setDataAPI] = useState<[]>([]) // The intersection data returned from BedUpload component

    const [getOutput] = useLazyQuery(BED_INTERSECT_QUERY)

    //UI state variables
    const [selectedSearch, setSelectedSearch] = useState<string>("BED File")
    const [drawerOpen, setDrawerOpen] = useState(false);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const [shownTable, setShownTable] = useState<"sequence" | "element" | "gene">(null);

    // Table variables
    const [inputRegions, setInputRegions] = useState<GenomicRegion[]>([]);
    const [sequenceRanks, setSequenceRanks] = useState<RankedRegions>([]);
    const [elementRanks, setElementRanks] = useState<RankedRegions>([]);
    const [geneRanks, setGeneRanks] = useState<RankedRegions>([]);
    /**
     * @todo
     * strictly type rows
     */
    const [mainRows, setMainRows] = useState<any[]>([]) // Data displayed on the main table
    const [sequenceRows, setSequenceRows] = useState<any[]>([]) // Data displayed on the sequence table
    const [elementRows, setElementRows] = useState<any[]>([]) // Data displayed on the element table
    const [geneRows, setGeneRows] = useState<any[]>([]) // Data displayed on the gene table

    // Filter state variables
    const [sequenceFilterVariables, setSequenceFilterVariables] = useState<SequenceFilterState>({
        useConservation: true,
        alignment: "241-mam-phyloP",
        rankBy: "max",
        useMotifs: false,
        motifCatalog: "factorbook",
        numOverlappingMotifs: true,
        motifScoreDelta: false,
        overlapsTFPeak: false
    });

    const [elementFilterVariables, setElementFilterVariables] = useState<ElementFilterState>({
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
        }
    });

    const [geneFilterVariables, setGeneFilterVariables] = useState<GeneFilterState>({
        useGenes: true
    });

    //update specific variable in sequence filters
    const updateSequenceFilter = (key: keyof SequenceFilterState, value: any) => {
        setSequenceFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //update specific variable in element filters
    const updateElementFilter = (key: keyof ElementFilterState, value: any) => {
        setElementFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //update a specific assay
    const toggleAssay = (assayName: keyof CCREAssays) => {
        updateElementFilter('assays', {
            ...elementFilterVariables.assays,
            [assayName]: !elementFilterVariables.assays[assayName]
        });
    };

    //update a specific class
    const toggleClass = (className: keyof CCREClasses) => {
        updateElementFilter('classes', {
            ...elementFilterVariables.classes,
            [className]: !elementFilterVariables.classes[className]
        });
    };

    //update specific variable in gene filters
    const updateGeneFilter = (key: keyof GeneFilterState, value: any) => {
        setGeneFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //stylized header for main rank table columns
    const MainColHeader = ({ tableName, onClick }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {tableName}
            <IconButton
                size="small"
                onClick={onClick}
            >
                <ExpandCircleDownIcon
                    fontSize="inherit"
                    color={shownTable === tableName.toLowerCase() ? "primary" : "inherit"}
                />
            </IconButton>
        </div>
    );

    //stylized title for the sequence,element, and gene data tables
    const SubTableTitle = ({ title }) => (
        <Stack direction={"row"} alignItems={"center"} spacing={1}>
            <IconButton onClick={() => setShownTable(null)} color={"primary"}>
                <CancelRounded />
            </IconButton>
            <Typography
                variant="h5"
                noWrap
                component="div"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    fontWeight: 'normal',
                }}>
                {title}
            </Typography>
        </Stack>
    );

    //handle column changes for the main rank table
    const mainColumns: DataTableColumn<any>[] = useMemo(() => {

        const cols: DataTableColumn<any>[] = [
            { header: "Input Region", value: (row) => "N/A" },
            { header: "Aggregate", value: (row) => "N/A" }
        ]
        /**
         * @todo
         * type "rows" state variable properly, and add to type arguments above DataTableColumn<NEW_TYPE>
         * correctly populate input region
         * correctly populate row values
         */
        if (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs) {
            cols.push({ header: "Seqence", HeaderRender: () => <MainColHeader tableName="Sequence" onClick={() => setShownTable("sequence")} />, value: (row) => "N/A" })
        }
        elementFilterVariables.usecCREs && cols.push({ header: "Element", HeaderRender: () => <MainColHeader tableName="Element" onClick={() => setShownTable("element")} />, value: (row) => "N/A" })
        geneFilterVariables.useGenes && cols.push({ header: "Gene", HeaderRender: () => <MainColHeader tableName="Gene" onClick={() => setShownTable("gene")} />, value: (row) => "N/A" })

        return cols

    }, [MainColHeader, setShownTable])

    //handle column changes for the Sequence rank table
    const sequenceColumns: DataTableColumn<any>[] = useMemo(() => {

        const cols: DataTableColumn<any>[] = [
            { header: "Input Region", value: (row) => "N/A" },
        ]
        /**
         * @todo
         * type "rows" state variable properly, and add to type arguments above DataTableColumn<NEW_TYPE>
         * correctly populate input region
         * correctly populate row values
         */

        if (sequenceFilterVariables.useConservation) {
            switch (sequenceFilterVariables.alignment) {
                case "241-mam-phyloP":
                    cols.push({ header: "241-Mammal(phyloP) Score", value: (row) => "N/A" });
                    break;
                case "447-mam-phyloP":
                    cols.push({ header: "447-Mammal(phyloP) Score", value: (row) => "N/A" });
                    break;
                case "241-mam-phastCons":
                    cols.push({ header: "241-Mammal(phastCons) Score", value: (row) => "N/A" });
                    break;
                case "43-prim-phyloP":
                    cols.push({ header: "43-Primate(phyloP) Score", value: (row) => "N/A" });
                    break;
                case "43-prim-phastCons":
                    cols.push({ header: "43-Primate(phastCons) Score", value: (row) => "N/A" });
                    break;
                case "243-prim-phastCons":
                    cols.push({ header: "243-Primate(phastCons) Score", value: (row) => "N/A" });
                    break;
                case "100-vert-phyloP":
                    cols.push({ header: "100-Vertebrate(phyloP) Score", value: (row) => "N/A" });
                    break;
                case "100-vert-phastCons":
                    cols.push({ header: "100-Vertebrate(phastCons) Score", value: (row) => "N/A" });
                    break;
                default:
                    break;
            }
        }
        if (sequenceFilterVariables.useMotifs) {
            sequenceFilterVariables.numOverlappingMotifs && cols.push({ header: "# of Overlapping Motifs", value: (row) => "N/A" })
            sequenceFilterVariables.motifScoreDelta && cols.push({ header: "Motif Score Delta", value: (row) => "N/A" })
            sequenceFilterVariables.overlapsTFPeak && cols.push({ header: "Overlaps TF Peak", value: (row) => "N/A" })
        }

        return cols

    }, [sequenceFilterVariables])

    //handle column changes for the Element rank table
    const elementColumns: DataTableColumn<any>[] = useMemo(() => {

        const cols: DataTableColumn<any>[] = [
            { header: "Input Region", value: (row) => `${row.genomicRegion.chr}:${row.genomicRegion.start}-${row.genomicRegion.end}`, sort: (a, b) => a.genomicRegion.start - b.genomicRegion.start },
        ]
        /**
         * @todo
         * type "rows" state variable properly, and add to type arguments above DataTableColumn<NEW_TYPE>
         * correctly populate input region
         * correctly populate row values
         */
        if (elementFilterVariables.usecCREs) {
            elementFilterVariables.assays.DNase && cols.push({ header: "DNase", value: (row) => row.dnase, render: (row) => row.dnase.toFixed(2) })
            elementFilterVariables.assays.H3K4me3 && cols.push({ header: "H3K4me3", value: (row) => row.h3k4me3, render: (row) => row.h3k4me3.toFixed(2) })
            elementFilterVariables.assays.H3K27ac && cols.push({ header: "H3K27ac", value: (row) => row.h3k27ac, render: (row) => row.h3k27ac.toFixed(2) })
            elementFilterVariables.assays.CTCF && cols.push({ header: "CTCF", value: (row) => row.ctcf, render: (row) => row.ctcf.toFixed(2) })
            elementFilterVariables.assays.ATAC && cols.push({ header: "ATAC", value: (row) => row.atac, render: (row) => row.atac.toFixed(2) })
        }

        return cols

    }, [elementFilterVariables, dataAPI])

    const { loading: loading_scores, error: error_scores } = useQuery(Z_SCORES_QUERY, {
        variables: {
            assembly: elementFilterVariables.cCREAssembly,
            accessions: elementRows.length > 0 ? elementRows.map((s) => s.accession) : dataAPI.map((r) => r[4]),
            cellType: elementFilterVariables.selectedBiosample ? elementFilterVariables.selectedBiosample.name : null
        },
        skip: elementRows.length == 0 && dataAPI.length == 0,
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(d) {
            let data = d['cCRESCREENSearch']
            let result = null
            if (elementFilterVariables.selectedBiosample) {
                // This makes a copy of the existing row and just updates the scores to ctspecific
                result = elementRows.map((obj) => {
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
                if (elementRows.length > 0) {
                    result = elementRows.map(mapFunc)
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

            setElementRows(evaluateRankings(result, elementFilterVariables.assays))
            console.log(dataAPI)
        }
    })

    const handleSearchChange = (event: SelectChangeEvent) => {
        setDataAPI([])
        updateElementFilter('selectedBiosample', null)
        setMainRows([])
        setSequenceRows([])
        setElementRows([])
        setGeneRows([])
        setSelectedSearch(event.target.value)
        setShownTable(null)
    }

    function appletCallBack(data) {
        updateElementFilter('selectedBiosample', null)
        setDataAPI(data)
        setMainRows([])
        setSequenceRows([])
        setElementRows([])
        setGeneRows([])
        configureInputedRegions(data)
        setDrawerOpen(true)
        setShownTable(null)
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
        getIntersect(getOutput, parseDataInput(uploadedData), "GRCh38", appletCallBack, console.error)
    }

    function evaluateRankings(data, available) {
        // This below code is inspired from this link to create a ranking column for each score for every row
        // https://stackoverflow.com/questions/60989105/ranking-numbers-in-an-array-using-javascript
        let scoresToInclude = allScoreNames.filter((s) => available[s])
        scoresToInclude.forEach((scoreName) => {
            let score_column = data.map((r, i) => [i, r[scoreName]])
            score_column.sort((a, b) => b[1] - a[1])
            score_column.forEach((row, i) => {
                data[row[0]][`${scoreName}_rank`] = i + 1
            })
        })
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

    return (
        <Box display="flex" >
            <Filters
                sequenceFilterVariables={sequenceFilterVariables}
                elementFilterVariables={elementFilterVariables}
                geneFilterVariables={geneFilterVariables}
                updateSequenceFilter={updateSequenceFilter}
                updateElementFilter={updateElementFilter}
                updateGeneFilter={updateGeneFilter}
                toggleAssay={toggleAssay}
                toggleClass={toggleClass}
                drawerOpen={drawerOpen}
                toggleDrawer={toggleDrawer}
                rows={elementRows}
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
                            assembly={"GRCh38"}
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
                {dataAPI.length > 0 && (
                    <>
                        <Box mt="20px" id="123456">
                            <DataTable
                                key={Math.random()}
                                columns={mainColumns}
                                rows={mainRows}
                                sortColumn={1}
                                sortDescending
                                itemsPerPage={5}
                                searchable
                                tableTitle="Ranked Regions"
                            />
                        </Box>

                        {(shownTable === "sequence" && (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs)) && (
                            <Box mt="20px">
                                <DataTable
                                    key={Math.random()}
                                    columns={sequenceColumns}
                                    rows={sequenceRows}
                                    sortColumn={0}
                                    sortDescending
                                    itemsPerPage={5}
                                    searchable
                                    tableTitle={<SubTableTitle title="Sequence Details" />}
                                />
                            </Box>
                        )}

                        {(shownTable === "element" && elementFilterVariables.usecCREs) && (
                            <Box mt="20px">
                                {loading_scores ? <CircularProgress /> :
                                    <DataTable
                                        key={Math.random()}
                                        columns={elementColumns}
                                        rows={elementRows}
                                        sortColumn={0}
                                        sortDescending
                                        itemsPerPage={10}
                                        searchable
                                        tableTitle={<SubTableTitle title="Element Details" />}
                                    />
                                }
                            </Box>
                        )}

                        {shownTable === "gene" && (
                            <Box mt="20px">
                                <DataTable
                                    key={Math.random()}
                                    columns={[
                                        {
                                            header: "Accession",
                                            value: (row) => "N/A"
                                        },
                                        {
                                            header: "User ID",
                                            value: (row) => "N/A"
                                        },
                                        {
                                            header: "Aggregate Rank",
                                            value: (row) => "N/A"
                                        },
                                    ]}
                                    rows={geneRows}
                                    sortColumn={1}
                                    sortDescending
                                    itemsPerPage={5}
                                    searchable
                                    tableTitle={<SubTableTitle title="Gene Details" />}
                                />
                            </Box>
                        )}
                    </>
                )}

            </Box>
        </Box>
    )
}