"use client"
import React, { useEffect, useMemo } from "react"
import { useState } from "react"
import { Stack, Typography, Box, TextField, Button, Alert, CircularProgress, IconButton } from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import BedUpload, { getIntersect, parseDataInput } from "../../_mainsearch/bedupload"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { GENE_EXP_QUERY, LINKED_GENES, ORTHOLOG_QUERY, Z_SCORES_QUERY } from "./queries"
import { ApolloQueryResult, useLazyQuery, useQuery } from "@apollo/client"
import { client } from "../../search/_ccredetails/client"
import { ZScores, LinkedGenes, GenomicRegion, CCREAssays, CCREClasses, RankedRegions, ElementFilterState, SequenceFilterState, GeneFilterState, MainTableRow, SequenceTableRow, ElementTableRow, GeneTableRow, AssayRankEntry } from "./types"
import { BED_INTERSECT_QUERY } from "../../_mainsearch/queries"
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import Filters from "./filters"
import { CancelRounded } from "@mui/icons-material"

const assayNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"]
const conservationNames = ["vertebrates", "mammals", "primates"]
const linkedGenesMethods = ["Intact-HiC", "CTCF-ChIAPET", "RNAPII-ChIAPET", "CRISPRi-FlowFISH", "eQTLs"]
const allScoreNames = assayNames.concat(conservationNames).concat(linkedGenesMethods)

export default function Argo(props: { header?: false, optionalFunction?: Function }) {
    //Old state variables
    const [intersectData, setIntersectData] = useState<[]>([]) // The intersection data returned from BedUpload component
    const [getOutput] = useLazyQuery(BED_INTERSECT_QUERY)

    //UI state variables
    const [selectedSearch, setSelectedSearch] = useState<string>("BED File")
    const [drawerOpen, setDrawerOpen] = useState(true);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const [shownTable, setShownTable] = useState<"sequence" | "element" | "gene">(null);

    // Table variables
    const [inputRegions, setInputRegions] = useState<GenomicRegion[]>([]);
    const [mainRanks, setMainRanks] = useState<RankedRegions>([]);
    const [sequenceRanks, setSequenceRanks] = useState<RankedRegions>([]);
    // const [elementRanks, setElementRanks] = useState<RankedRegions>([]);
    const [geneRanks, setGeneRanks] = useState<RankedRegions>([]);
    const [mainRows, setMainRows] = useState<MainTableRow[]>([]) // Data displayed on the main table
    const [allMainRows, setAllMainRows] = useState<MainTableRow[]>([]) // All main rows recieved from bedupload
    const [sequenceRows, setSequenceRows] = useState<SequenceTableRow[]>([]) // Data displayed on the sequence table
    const [allElementRows, setAllElementRows] = useState<ElementTableRow[]>([]) // All element rows recieved from query
    const [elementRows, setElementRows] = useState<ElementTableRow[]>([]) // Data displayed on the element table
    const [orthoFlag, setOrthoFlag] = useState(false) // remember if otholog has been switched
    const [biosampleFlag, setBiosampleFlag] = useState(false) // remember if biosamples have been switched
    const [geneRows, setGeneRows] = useState<GeneTableRow[]>([]) // Data displayed on the gene table

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
            dnase: true,
            atac: true,
            ctcf: true,
            h3k4me3: true,
            h3k27ac: true,
        },
        availableAssays: {
            dnase: true,
            atac: true,
            ctcf: true,
            h3k4me3: true,
            h3k27ac: true,
        },
        classes: {
            CA: true,
            "CA-CTCF": true,
            "CA-H3K4me3": true,
            "CA-TF": true,
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
            <span style={{ color: shownTable === tableName.toLowerCase() ? '#030f98' : 'inherit', fontWeight: shownTable === tableName.toLowerCase() ? 'bolder' : 'normal' }}>
                {tableName}
            </span>
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
    const mainColumns: DataTableColumn<MainTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<MainTableRow>[] = [
            { header: "Input Region", value: (row) => `${row.inputRegion.chr}:${row.inputRegion.start}-${row.inputRegion.end}`, sort: (a, b) => a.inputRegion.start - b.inputRegion.start },
            { header: "Aggregate", value: (row) => row.aggregateRank }
        ]
        /**
         * @todo
         * correctly populate row values
         */
        if (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs) {
            cols.push({ header: "Seqence", HeaderRender: () => <MainColHeader tableName="Sequence" onClick={() => setShownTable("sequence")} />, value: (row) => "N/A" })
        }
        elementFilterVariables.usecCREs && cols.push({ header: "Element", HeaderRender: () => <MainColHeader tableName="Element" onClick={() => setShownTable("element")} />, value: (row) => row.elementRank })
        geneFilterVariables.useGenes && cols.push({ header: "Gene", HeaderRender: () => <MainColHeader tableName="Gene" onClick={() => setShownTable("gene")} />, value: (row) => "N/A" })

        return cols

    }, [MainColHeader, setShownTable])

    //handle column changes for the Sequence rank table
    const sequenceColumns: DataTableColumn<SequenceTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<SequenceTableRow>[] = [
            { header: "Input Region", value: (row) => "N/A" },
        ]
        /**
         * @todo
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
    const elementColumns: DataTableColumn<ElementTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<ElementTableRow>[] = [
            { header: "Genomic Region", value: (row) => `${row.region.chr}:${row.region.start}-${row.region.end}`, sort: (a, b) => a.region.start - b.region.start },
            { header: "Class", value: (row) => row.class === "PLS" ? "Promoter" : row.class === "pELS" ? "Proximal Enhancer" : row.class === "dELS" ? "Distal Enhancer" : row.class },
            { header: "Accession", value: (row) => row.accession },
        ]

        if (elementFilterVariables.usecCREs) {
            elementFilterVariables.mustHaveOrtholog && cols.push({ header: "Orthologous Accesion", value: (row) => row.ortholog })
            elementFilterVariables.assays.dnase && cols.push({ header: "DNase", value: (row) => row.dnase !== null ? row.dnase.toFixed(2) : null })
            elementFilterVariables.assays.h3k4me3 && cols.push({ header: "H3K4me3", value: (row) => row.h3k4me3 !== null ? row.h3k4me3.toFixed(2) : null })
            elementFilterVariables.assays.h3k27ac && cols.push({ header: "H3K27ac", value: (row) => row.h3k27ac !== null ? row.h3k27ac.toFixed(2) : null })
            elementFilterVariables.assays.ctcf && cols.push({ header: "CTCF", value: (row) => row.ctcf !== null ? row.ctcf.toFixed(2) : null })
            elementFilterVariables.assays.atac && cols.push({ header: "ATAC", value: (row) => row.atac !== null ? row.atac.toFixed(2) : null })
        }

        return cols

    }, [elementFilterVariables])

    const { loading: loading_scores, error: error_scores, refetch } = useQuery(Z_SCORES_QUERY, {
        variables: {
            assembly: elementFilterVariables.cCREAssembly,
            accessions: intersectData.map((r) => r[4]),
            cellType: elementFilterVariables.selectedBiosample ? elementFilterVariables.selectedBiosample.name : null
        },
        skip: intersectData.length == 0,
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(d) {
            setBiosampleFlag(true)
            let data = d['cCRESCREENSearch']
            let result = null
            let mapFunc = (obj) => {
                let o = { ...obj }
                let matchingObj = data.find((e) => o.accession == e.info.accession)
                o.dnase = matchingObj.dnase_zscore
                o.h3k4me3 = matchingObj.promoter_zscore
                o.h3k27ac = matchingObj.enhancer_zscore
                o.ctcf = matchingObj.ctcf_zscore
                o.atac = matchingObj.atac_zscore
                o.class = matchingObj.pct
                return o
            }
            let allDataResult = intersectData
                .map((e) => {
                    return {
                        // This is annoying because currently an array of objects is not being returned
                        // The order of the array is the same as the order of the ccre file
                        // Index 4 is accessions, 6 is chr, 7 is start, 8 is stop 
                        // chr, start, stop should be of user uploaded file and not of our files hence not index 0,1,2

                        accession: e[4],
                        linked_genes: [],
                        region: {
                            chr: e[0],
                            start: e[1],
                            end: e[2]
                        },
                        inputRegion: {
                            chr: e[6],
                            start: e[7],
                            end: e[8]
                        }
                    }
                })
                .map(mapFunc)
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
                })
                //handle logic for if there is a biosample selected and switch from ortho to all
                if (!elementFilterVariables.mustHaveOrtholog && orthoFlag === true) {
                    //refilter classes when unchecking ortholog
                    const filteredClasses = allDataResult.filter(row => {
                        return elementFilterVariables.classes[row.class] !== false;
                    });
                    //find ctspecific scores
                    result = filteredClasses.map((obj) => {
                        let o = { ...obj }
                        let matchingObj = data.find((e) => o.accession == e.info.accession)
                        o.dnase = matchingObj.ctspecific.dnase_zscore
                        o.h3k4me3 = matchingObj.ctspecific.h3k4me3_zscore
                        o.h3k27ac = matchingObj.ctspecific.h3k27ac_zscore
                        o.ctcf = matchingObj.ctspecific.ctcf_zscore
                        o.atac = matchingObj.ctspecific.atac_zscore
                        return o
                    })
                    setAllElementRows(allDataResult.map((obj) => {
                        let o = { ...obj }
                        let matchingObj = data.find((e) => o.accession == e.info.accession)
                        o.dnase = matchingObj.ctspecific.dnase_zscore
                        o.h3k4me3 = matchingObj.ctspecific.h3k4me3_zscore
                        o.h3k27ac = matchingObj.ctspecific.h3k27ac_zscore
                        o.ctcf = matchingObj.ctspecific.ctcf_zscore
                        o.atac = matchingObj.ctspecific.atac_zscore
                        return o
                    }))
                }
                if (elementRows.length == 0) {
                    setAllElementRows(allDataResult)
                }
                setElementRows(result)
            }
            else {
                if (!elementFilterVariables.mustHaveOrtholog) {
                    //going from ortho view back to main view
                    if (elementRows.length > 0) {
                        //refilter classes when unchecking ortholog
                        if (orthoFlag === true) {
                            const filteredClasses = allDataResult.filter(row => {
                                return elementFilterVariables.classes[row.class] !== false;
                            });
                            result = filteredClasses
                            setOrthoFlag(false);
                        } else {
                            result = elementRows.map(mapFunc)
                        }
                    }
                    else {
                        result = allDataResult
                    }
                    setAllElementRows(allDataResult)
                    setElementRows(result)
                } else {
                    //in ortho view and deselect biosample
                    if (biosampleFlag === true) {
                        result = elementRows.map(mapFunc)
                        setElementRows(result)
                        setBiosampleFlag(false)
                    }
                }
            }

        }
    })

    useEffect(() => {
        // Trigger refetch whenever mustHaveOrtholog changes
        if (!elementFilterVariables.mustHaveOrtholog && intersectData.length > 0) {
            refetch();
        }
    }, [elementFilterVariables.mustHaveOrtholog, refetch]);

    const { loading: loading_ortho, error: error_ortho } = useQuery(ORTHOLOG_QUERY, {
        variables: {
            assembly: elementFilterVariables.cCREAssembly,
            accessions: intersectData.map((r) => r[4]),
        },
        skip: !elementFilterVariables.mustHaveOrtholog,
        client: client,
        fetchPolicy: 'cache-and-network',
        onCompleted(data) {
            setOrthoFlag(true);
            const orthologMapping: { [accession: string]: string | undefined } = {};

            data.orthologQuery.forEach((entry: { accession: string; ortholog: Array<{ accession: string }> }) => {
                if (entry.ortholog.length > 0) {
                    orthologMapping[entry.accession] = entry.ortholog[0].accession;
                }
            });

            // Update elementRows with ortholog information
            const updatedElementRows = elementRows
                .map((row) => ({
                    ...row,
                    ortholog: orthologMapping[row.accession]
                }))
                .filter((row) => row.ortholog !== undefined);

            const updatedAllElementRows = allElementRows
                .map((row) => ({
                    ...row,
                    ortholog: orthologMapping[row.accession]
                }))
                .filter((row) => row.ortholog !== undefined);

            setElementRows(updatedElementRows);
            setAllElementRows(updatedAllElementRows);
        }
    })

    const handleSearchChange = (event: SelectChangeEvent) => {
        setIntersectData([])
        updateElementFilter('selectedBiosample', null)
        setMainRows([])
        setAllMainRows([])
        setMainRanks([])
        setAllElementRows([])
        setSequenceRows([])
        setElementRows([])
        setGeneRows([])
        setSelectedSearch(event.target.value)
        setShownTable(null)
    }

    function appletCallBack(data, inputData) {
        updateElementFilter('selectedBiosample', null)
        setIntersectData(data)
        setSequenceRows([])
        setAllElementRows([])
        setElementRows([])
        setGeneRows([])
        setDrawerOpen(true)
        setShownTable(null)
        if (inputData !== undefined) {
            configureInputedRegions(inputData)
            const initialMainRows = inputData.map(item => ({
                inputRegion: {
                    chr: item[0],
                    start: Number(item[1]),
                    end: Number(item[2])
                },
            }));
            setMainRows(initialMainRows);
            setAllMainRows(initialMainRows);
            const initialMainRanks = inputData.map(item => ({
                chr: item[0],
                start: Number(item[1]),
                end: Number(item[2]),
                rank: 0
            }));
            setMainRanks(initialMainRanks);
        }
    }

    function handleTextUpload(event) {
        let uploadedData = event.get("textUploadFile").toString()
        let inputData = parseDataInput(uploadedData)
        if (inputData !== undefined) {
            configureInputedRegions(inputData)
        }
        getIntersect(getOutput, inputData, "GRCh38", appletCallBack, console.error)
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

    // Generate element ranks
    const elementRanks = useMemo<RankedRegions>(() => {
        const assayRanks: { [key: number]: AssayRankEntry } = {};

        //assign a rank to each assay
        assayNames.forEach(assay => {
            const sortedRows = allElementRows
                .sort((a, b) => {
                    if (elementFilterVariables.classes[a.class] && elementFilterVariables.classes[b.class]) {
                        return b[assay] - a[assay];
                    }
                    return 0;
                });

            sortedRows.forEach((row, index) => {
                const isClassEnabled = elementFilterVariables.classes[row.class];
                const score = row[assay];

                if (!assayRanks[row.inputRegion.start]) {
                    assayRanks[row.inputRegion.start] = {
                        chr: row.inputRegion.chr,
                        start: row.inputRegion.start,
                        end: row.inputRegion.end,
                        ranks: {}
                    };
                }

                // Assign rank based on score order if the class is enabled, otherwise assign rank 0
                assayRanks[row.inputRegion.start].ranks[assay] = isClassEnabled && score !== null ? index + 1 : 0;
            });
        });

        // add up all assay ranks
        const totalAssayRanks = Object.values(assayRanks).map((row) => {
            const totalRank = assayNames.reduce((sum, assay) => {
                return elementFilterVariables.assays[assay] ? sum + (row.ranks[assay] || 0) : sum;
            }, 0);

            return {
                chr: row.chr,
                start: row.start,
                end: row.end,
                totalRank: totalRank,
            };
        });

        // Sort by total rank score in ascending order
        const rankedRegions = [];
        totalAssayRanks.sort((a, b) => a.totalRank - b.totalRank);

        // Assign ranks, accounting for ties
        let currentRank = 1;
        let prevTotalRank = null;

        totalAssayRanks.forEach((region, index) => {
            if (region.totalRank !== prevTotalRank) {
                currentRank = index + 1;
                prevTotalRank = region.totalRank;
            }
            rankedRegions.push({
                chr: region.chr,
                start: region.start,
                end: region.end,
                rank: region.totalRank === 0 ? 0 : currentRank,
            });
        });
        return rankedRegions;

    }, [elementRows, elementFilterVariables, allElementRows]);


    // Remove filtered classes from element table
    useMemo(() => {
        const filteredClasses = allElementRows.filter(row => {
            return elementFilterVariables.classes[row.class] !== false;
        });
        setElementRows(filteredClasses);
    }, [elementFilterVariables.classes]);

    //update aggregate rank
    useMemo(() => {
        if (sequenceRanks.length === 0 && elementRanks.length === 0 && geneRanks.length === 0) return;
        const updatedMainRanks = mainRanks.map(row => {
            // Find matching ranks based on inputRegion coordinates
            const matchingSequence = sequenceRanks.find(seq =>
                seq.chr == row.chr &&
                seq.start == row.start &&
                seq.end == row.end
            );

            const matchingElement = elementRanks.find(ele =>
                ele.chr == row.chr &&
                ele.start == row.start &&
                ele.end == row.end
            );

            const matchingGene = geneRanks.find(gene =>
                gene.chr == row.chr &&
                gene.start == row.start &&
                gene.end == row.end
            );

            // Calculate the aggregate rank, using 0 if no matching rank is found for any
            const aggregateRank = (matchingSequence?.rank || 0) +
                (matchingElement?.rank || 0) +
                (matchingGene?.rank || 0);

            return {
                ...row,
                rank: aggregateRank
            };
        });

        setMainRanks(updatedMainRanks);
    }, [sequenceRanks, elementRanks, geneRanks]);

    //update main table ranks
    useMemo(() => {
        if (elementRanks.length === 0) return;
        const updatedMainRows = allMainRows.map(row => {
            // Find the matching rank for this `inputRegion`
            const matchingElement = elementRanks.find(
                element =>
                    element.chr == row.inputRegion.chr &&
                    element.start == row.inputRegion.start &&
                    element.end == row.inputRegion.end
            );

            const elementRank = matchingElement ? matchingElement.rank : 0;

            const matchingMainRank = mainRanks.find(
                mainRank =>
                    mainRank.chr == row.inputRegion.chr &&
                    mainRank.start == row.inputRegion.start &&
                    mainRank.end == row.inputRegion.end
            );

            const updatedAggregateRank = (matchingMainRank ? matchingMainRank.rank : 0);

            return {
                ...row,
                elementRank,
                aggregateRank: updatedAggregateRank, // Update the aggregateRank
            };
        }).filter(row => row.aggregateRank !== 0);

        setMainRows(updatedMainRows);
    }, [mainRanks]);


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
                {intersectData.length > 0 && (
                    <>
                        <Box mt="20px" id="123456">
                            <DataTable
                                key={Math.random()}
                                columns={mainColumns}
                                rows={mainRows}
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
                                    sortDescending
                                    itemsPerPage={5}
                                    searchable
                                    tableTitle={<SubTableTitle title="Sequence Details" />}
                                />
                            </Box>
                        )}

                        {(shownTable === "element" && elementFilterVariables.usecCREs) && (
                            <Box mt="20px">
                                {loading_scores || loading_ortho ? <CircularProgress /> :
                                    <DataTable
                                        key={Math.random()}
                                        columns={elementColumns}
                                        rows={elementRows}
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
                                    sortDescending
                                    itemsPerPage={10}
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