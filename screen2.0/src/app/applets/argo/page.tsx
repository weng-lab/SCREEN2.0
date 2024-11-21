"use client"
import React, { useCallback, useEffect, useMemo } from "react"
import { useState } from "react"
import { Stack, Typography, Box, Alert, CircularProgress, IconButton } from "@mui/material"
import { SelectChangeEvent } from "@mui/material/Select"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { ORTHOLOG_QUERY, Z_SCORES_QUERY, BIG_REQUEST_QUERY, MOTIF_QUERY } from "./queries"
import { QueryResult, useLazyQuery, useQuery } from "@apollo/client"
import { client } from "../../search/_ccredetails/client"
import { CCREAssays, CCREClasses, RankedRegions, ElementFilterState, SequenceFilterState, GeneFilterState, MainTableRow, SequenceTableRow, ElementTableRow, GeneTableRow, AssayRankEntry, CCREs, InputRegions, GenomicRegion, MotifQueryDataOccurrence } from "./types"
import { BED_INTERSECT_QUERY } from "../../_mainsearch/queries"
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import Filters from "./filters"
import { CancelRounded } from "@mui/icons-material"
import ArgoUpload from "./argoUpload"
import { BigRequest, OccurrencesQuery } from "../../../graphql/__generated__/graphql"
import MotifsModal from "./motifModal"

const assayNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"]

export default function Argo() {

    const [getIntersectingCcres, { data: intersectArray }] = useLazyQuery(BED_INTERSECT_QUERY)
    const [getMemeOccurrences] = useLazyQuery(MOTIF_QUERY)
    const [occurrences, setOccurrences] = useState<QueryResult<OccurrencesQuery>[]>([]);

    const [inputRegions, setInputRegions] = useState<InputRegions>([]);
    // const [isOnlySNPs, setIsOnlySNPs] = useState(false)
    const [loadingMainRows, setLoadingMainRows] = useState(true);
    const [loadingElementRanks, setLoadingElementRanks] = useState(true);
    const [loadingSequenceRanks, setLoadingSequenceRanks] = useState(true);

    //UI state variables
    const [selectedSearch, setSelectedSearch] = useState<string>("BED File")
    const [drawerOpen, setDrawerOpen] = useState(true);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const [shownTable, setShownTable] = useState<"sequence" | "element" | "gene">(null);

    // These will be deleted once functionality is implemented
    const [geneRanks, setGeneRanks] = useState<RankedRegions>([]);
    const [geneRows, setGeneRows] = useState<GeneTableRow[]>([]) // Data displayed on the gene table

    // Filter state variables
    const [sequenceFilterVariables, setSequenceFilterVariables] = useState<SequenceFilterState>({
        useConservation: false,
        alignment: "241-mam-phyloP",
        rankBy: "max",
        useMotifs: true,
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
        rankBy: "avg",
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
        useGenes: true,
        idk: "no"
    });

    const [modalData, setModalData] = useState<{
        open: boolean;
        chromosome: string;
        start: number;
        end: number;
        occurrences: MotifQueryDataOccurrence[];
    } | null>(null);

    //update specific variable in sequence filters
    const updateSequenceFilter = (key: keyof SequenceFilterState, value: unknown) => {
        setSequenceFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //update specific variable in element filters
    const updateElementFilter = (key: keyof ElementFilterState, value: unknown) => {
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
    const updateGeneFilter = (key: keyof GeneFilterState, value: unknown) => {
        setGeneFilterVariables((prevState) => ({
            ...prevState,
            [key]: value,
        }));
    };

    //stylized header for main rank table columns
    const MainColHeader = useCallback(({ tableName, onClick }) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ color: shownTable === tableName.toLowerCase() ? '#030f98' : 'inherit', fontWeight: shownTable === tableName.toLowerCase() ? 'bolder' : 'normal' }}>
                {tableName}
            </span>
            <IconButton
                size="small"
                onClick={onClick}
                style={{
                    transform: shownTable === tableName.toLowerCase() ? 'rotate(180deg)' : 'rotate(0deg)',
                }}
            >
                <ExpandCircleDownIcon
                    fontSize="inherit"
                    color={shownTable === tableName.toLowerCase() ? "primary" : "inherit"}
                />
            </IconButton>
        </div>
    ), [shownTable])

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
            { header: "Region ID", value: (row) => row.regionID },
            { header: "Input Region", value: (row) => `${row.inputRegion.chr}: ${row.inputRegion.start}-${row.inputRegion.end}`, sort: (a, b) => a.inputRegion.start - b.inputRegion.start },
            { header: "Aggregate", value: (row) => row.aggregateRank }
        ]
        /**
         * @todo
         * correctly populate row values
         */
        if (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs) {
            cols.push({ header: "Seqence", HeaderRender: () => <MainColHeader tableName="Sequence" onClick={() => shownTable === "sequence" ? setShownTable(null) : setShownTable("sequence")} />, value: (row) => row.sequenceRank })
        }
        if (elementFilterVariables.usecCREs) {
            cols.push({
                header: "Element", HeaderRender: () => <MainColHeader tableName="Elements" onClick={() => shownTable === "element" ? setShownTable(null) : setShownTable("element")} />, value: (row) => row.elementRank === 0 ? "N/A" : row.elementRank,
                sort: (a, b) => {
                    const rankA = a.elementRank
                    const rankB = b.elementRank

                    if (rankA === 0) return 1;
                    if (rankB === 0) return -1;
                    return rankA - rankB;
                }
            })
        }
        if (geneFilterVariables.useGenes) { cols.push({ header: "Gene", HeaderRender: () => <MainColHeader tableName="Genes" onClick={() => shownTable === "gene" ? setShownTable(null) : setShownTable("gene")} />, value: (row) => "N/A" }) }

        return cols

    }, [MainColHeader, elementFilterVariables.usecCREs, geneFilterVariables.useGenes, sequenceFilterVariables.useConservation, sequenceFilterVariables.useMotifs, shownTable])

    //handle column changes for the Sequence rank table
    const sequenceColumns: DataTableColumn<SequenceTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<SequenceTableRow>[] = [
            { header: "Region ID", value: (row) => row.regionID },
        ]
        /**
         * @todo
         * correctly populate row values
         */

        if (sequenceFilterVariables.useConservation) {
            switch (sequenceFilterVariables.alignment) {
                case "241-mam-phyloP":
                    cols.push({ header: "241-Mammal(phyloP) Score", value: (row) => row.conservationScore.toFixed(2) });
                    break;
                case "447-mam-phyloP":
                    cols.push({ header: "447-Mammal(phyloP) Score", value: (row) => row.conservationScore.toFixed(2) });
                    break;
                case "241-mam-phastCons":
                    cols.push({ header: "241-Mammal(phastCons) Score", value: (row) => row.conservationScore.toFixed(2) });
                    break;
                case "43-prim-phyloP":
                    cols.push({ header: "43-Primate(phyloP) Score", value: (row) => row.conservationScore.toFixed(2) });
                    break;
                case "43-prim-phastCons":
                    cols.push({ header: "43-Primate(phastCons) Score", value: (row) => row.conservationScore.toFixed(2) });
                    break;
                case "243-prim-phastCons":
                    cols.push({ header: "243-Primate(phastCons) Score", value: (row) => row.conservationScore.toFixed(2) });
                    break;
                case "100-vert-phyloP":
                    cols.push({ header: "100-Vertebrate(phyloP) Score", value: (row) => row.conservationScore.toFixed(2) });
                    break;
                case "100-vert-phastCons":
                    cols.push({ header: "100-Vertebrate(phastCons) Score", value: (row) => row.conservationScore.toFixed(2) });
                    break;
                default:
                    break;
            }
        }
        if (sequenceFilterVariables.useMotifs) {
            if (sequenceFilterVariables.numOverlappingMotifs) {
                cols.push({
                    header: "# of Overlapping Motifs", value: (row) => row.numOverlappingMotifs,
                    render: (row) => (
                        <button
                            style={{
                                background: "none",
                                border: "none",
                                padding: 0,
                                fontFamily: "arial, sans-serif",
                                color: "#030f98",
                                cursor: "pointer",
                                outline: "none",
                            }}
                            onClick={() =>
                                setModalData({
                                    open: true,
                                    chromosome: row.inputRegion.chr,
                                    start: row.inputRegion.start,
                                    end: row.inputRegion.end,
                                    occurrences: row.occurrences,
                                })
                            }
                        >
                            {row.numOverlappingMotifs}
                        </button>
                    )
                })
            }
            if (sequenceFilterVariables.motifScoreDelta) { cols.push({ header: "Motif Score Delta", value: (row) => "N/A" }) }
            if (sequenceFilterVariables.overlapsTFPeak) { cols.push({ header: "Overlaps TF Peak", value: (row) => "N/A" }) }
        }

        return cols

    }, [sequenceFilterVariables])

    //handle column changes for the Element rank table
    const elementColumns: DataTableColumn<ElementTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<ElementTableRow>[] = [
            { header: "Region ID", value: (row) => row.regionID },
            { header: "Class", value: (row) => row.class === "PLS" ? "Promoter" : row.class === "pELS" ? "Proximal Enhancer" : row.class === "dELS" ? "Distal Enhancer" : row.class },
            { header: "Accession", value: (row) => row.accession },
        ]

        if (elementFilterVariables.usecCREs) {
            if (elementFilterVariables.mustHaveOrtholog && elementFilterVariables.cCREAssembly !== "mm10") { cols.push({ header: "Orthologous Accesion", value: (row) => row.ortholog }) }
            if (elementFilterVariables.assays.dnase) { cols.push({ header: "DNase", value: (row) => row.dnase !== null ? row.dnase.toFixed(2) : null }) }
            if (elementFilterVariables.assays.h3k4me3) { cols.push({ header: "H3K4me3", value: (row) => row.h3k4me3 !== null ? row.h3k4me3.toFixed(2) : null }) }
            if (elementFilterVariables.assays.h3k27ac) { cols.push({ header: "H3K27ac", value: (row) => row.h3k27ac !== null ? row.h3k27ac.toFixed(2) : null }) }
            if (elementFilterVariables.assays.ctcf) { cols.push({ header: "CTCF", value: (row) => row.ctcf !== null ? row.ctcf.toFixed(2) : null }) }
            if (elementFilterVariables.assays.atac) { cols.push({ header: "ATAC", value: (row) => row.atac !== null ? row.atac.toFixed(2) : null }) }
        }

        return cols

    }, [elementFilterVariables])

    const handleSearchChange = (event: SelectChangeEvent) => {
        setLoadingMainRows(true)
        setLoadingSequenceRanks(true)
        setLoadingElementRanks(true)
        updateElementFilter('selectedBiosample', null)
        if (event) {
            setSelectedSearch(event.target.value)
        }
        setShownTable(null)
    }

    // This function will receive the regions from ArgoUpload and find the intersecting cCREs
    const handleRegionsConfigured = (regions: InputRegions) => {
        //check for total base pair count cannot exceed 10,000
        const totalBasePairs = regions.reduce(
            (sum, region) => sum + (region.end - region.start),
            0
        );
        if (totalBasePairs > 10000) {
            alert("The total base pairs in the input regions must not exceed 10,000.");
            return;
        }

        setInputRegions(regions);
        const user_ccres = regions.map(region => [
            region.chr,
            region.start.toString(),
            region.end.toString(),
        ]);
        getIntersectingCcres({
            variables: {
                user_ccres: user_ccres,
                assembly: "GRCh38",
            },
            client: client,
            fetchPolicy: 'cache-and-network',
        })
    };

    /*------------------------------------------ Sequence Stuff ------------------------------------------*/

    //build payload for bigRequest query
    const bigRequests: BigRequest[] = useMemo(() => {
        if (inputRegions.length === 0) { return [] }
        const urlMapping: { [key: string]: string } = {
            "241-mam-phyloP": "https://downloads.wenglab.org/241-mammalian-2020v2.bigWig",
            "241-mam-phastCons": "https://downloads.wenglab.org/241Mammals-PhastCons.bigWig",
            "447-mam-phyloP": "https://downloads.wenglab.org/mammals_phyloP-447.bigWig",
            "100-vert-phyloP": "https://downloads.wenglab.org/hg38.phyloP100way.bw",
            "100-vert-phastCons": "https://downloads.wenglab.org/hg38.phastCons100way.bw",
            "243-prim-phastCons": "https://downloads.wenglab.org/primates_PhastCons-243.bigWig",
            "43-prim-phyloP": "https://downloads.wenglab.org/PhyloP-43.bw",
            "43-prim-phastCons": "https://downloads.wenglab.org/hg38_43primates_phastCons.bw",
        };

        const selectedUrl = urlMapping[sequenceFilterVariables.alignment] || "";

        return inputRegions.map(({ chr, start, end }) => ({
            chr1: chr,
            start,
            end,
            url: selectedUrl,
        }));
    }, [inputRegions, sequenceFilterVariables.alignment]);

    //query to get conservation scores based on selected url
    const { loading: loading_conservation_scores, error: error_conservation_scores, data: conservationScores } = useQuery(BIG_REQUEST_QUERY, {
        variables: {
            requests: bigRequests
        },
        skip: !sequenceFilterVariables.useConservation || bigRequests.length === 0,
        client: client,
        fetchPolicy: 'cache-first',
        onError() {
            setLoadingSequenceRanks(false)
        }
    });

    //function to batch the input regions together to call smaller queries
    function batchRegions(regions: GenomicRegion[], maxBasePairs: number): GenomicRegion[][] {
        const result: GenomicRegion[][] = [];
        let currentBatch: GenomicRegion[] = [];
        let currentBatchLength = 0;

        for (const region of regions) {
            let regionStart = region.start;

            // If the region is larger than maxBasePairs, split it into chunks
            while (regionStart < region.end) {
                const chunkEnd = Math.min(regionStart + maxBasePairs, region.end);
                const chunk = { chr: region.chr, start: regionStart, end: chunkEnd };
                const chunkLength = chunk.end - chunk.start;

                // If adding this chunk exceeds the max base pairs for the current batch
                if (currentBatchLength + chunkLength > maxBasePairs) {
                    result.push(currentBatch);
                    currentBatch = [];
                    currentBatchLength = 0;
                }

                // Add the chunk to the current batch
                currentBatch.push(chunk);
                currentBatchLength += chunkLength;

                // Move the start pointer forward
                regionStart = chunkEnd;
            }
        }

        // Push any remaining regions in the final batch
        if (currentBatch.length > 0) {
            result.push(currentBatch);
        }

        return result;
    }

    //query the motif occurences fron the input regions
    useEffect(() => {
        if (inputRegions.length === 0 || !sequenceFilterVariables.useMotifs) {
            return;
        }

        const fetchAllOccurrences = async () => {
            try {
                //batch the input regions
                const batchedRegions = batchRegions(inputRegions, 200);

                //query all batches in parrallel
                const fetchPromises = batchedRegions.map((batch) =>
                    getMemeOccurrences({
                        variables: {
                            limit: 30,
                            range: batch.map((region) => ({
                                chromosome: region.chr,
                                start: region.start,
                                end: region.end,
                            })),
                        },
                        fetchPolicy: "cache-first",
                    })
                );

                //wait for queries to resolve
                const results = await Promise.all(fetchPromises);
                // Filter results with non-empty meme_occurrences
                const filteredResults = results.filter(result => result.data.meme_occurrences.length > 0)
                setOccurrences(filteredResults);
            } catch (error) {
                console.error("Error fetching occurrences:", error);
            }
        };

        fetchAllOccurrences();
    }, [inputRegions, getMemeOccurrences, sequenceFilterVariables.useMotifs]);

    const numOverlappingMotifs: SequenceTableRow[] = useMemo(() => {
        if (occurrences.length === 0 || inputRegions.length === 0) return [];
        return inputRegions.map(inputRegion => {
            const overlappingMotifs = occurrences.flatMap(occurrence =>
                occurrence.data.meme_occurrences.filter(motif =>
                    motif.genomic_region.chromosome === inputRegion.chr &&
                    motif.genomic_region.start < inputRegion.end &&
                    motif.genomic_region.end > inputRegion.start
                )
            );

            return {
                regionID: inputRegion.regionID,
                inputRegion: inputRegion,
                numOverlappingMotifs: overlappingMotifs.length,
                occurrences: overlappingMotifs as MotifQueryDataOccurrence[]
            };
        });
    }, [occurrences, inputRegions]);

    function calculateConservationScores(scores, rankBy): SequenceTableRow[] {
        return scores.map((request) => {
            const data = request.data;

            // Extract the shared information for chr, start, and end
            //query's first item is one base pair back so we use the end of the first item for the start
            //and the end of the last item for the end
            const chr = data[0]?.chr || '';
            const start = data[0]?.end || 0;
            const end = data[data.length - 1]?.end || 0;

            let score;
            // calculate the score based on selected rank by
            if (rankBy === "max") {
                score = Math.max(...data.map(item => item.value));
            } else if (rankBy === "min") {
                score = Math.min(...data.map(item => item.value));
            } else {
                const sum = data.reduce((total, item) => total + item.value, 0);
                score = data.length > 0 ? sum / data.length : 0;
            }

            // Find matching input region with the same chromosome, start, and end
            const matchingRegion = inputRegions.find(
                region => region.chr === chr &&
                    region.start === start &&
                    region.end === end
            );

            return {
                regionID: matchingRegion?.regionID,
                inputRegion: { chr, start, end },
                conservationScore: score
            } as SequenceTableRow;
        });
    }

    const sequenceRows: SequenceTableRow[] = useMemo(() => {
        if ((!conservationScores && numOverlappingMotifs.length === 0) || inputRegions.length === 0) {
            return []
        }

        let calculatedConservationScores: SequenceTableRow[] = []
        if (conservationScores) {
            calculatedConservationScores = calculateConservationScores(
                conservationScores.bigRequests,
                sequenceFilterVariables.rankBy
            )
        }

        // Merge conservation scores and overlapping motifs
        const mergedRows = inputRegions.map(region => {
            const conservationRow = calculatedConservationScores.find(
                row => row.regionID === region.regionID
            )

            const overlappingMotifsRow = numOverlappingMotifs.find(
                row => row.regionID === region.regionID
            )

            return {
                regionID: region.regionID,
                inputRegion: region,
                conservationScore: conservationRow?.conservationScore,
                numOverlappingMotifs: overlappingMotifsRow?.numOverlappingMotifs,
                occurrences: overlappingMotifsRow?.occurrences
            }
        })

        return mergedRows
    }, [conservationScores, inputRegions, sequenceFilterVariables.rankBy, numOverlappingMotifs])

    const sequenceRanks: RankedRegions = useMemo(() => {
        if (sequenceRows.length === 0) {
            setLoadingSequenceRanks(false);
            return [];
        }
    
        setLoadingSequenceRanks(true);

        // Assign ranks based on conservationScore
        const conservationRankedRows = (() => {
            const sortedRows = [...sequenceRows].sort((a, b) => b.conservationScore - a.conservationScore);
            let rank = 1;
            return sortedRows.map((row, index) => {
                if (index > 0 && sortedRows[index].conservationScore !== sortedRows[index - 1].conservationScore) {
                    rank = index + 1;
                }
                return {
                    ...row,
                    conservationRank: rank,
                };
            });
        })();

        // Assign ranks based on numOverlappingMotifs
        const motifRankedRows = (() => {
            const sortedRows = [...sequenceRows].sort((a, b) => b.numOverlappingMotifs! - a.numOverlappingMotifs!);
            let rank = 1;
            return sortedRows.map((row, index) => {
                if (index > 0 && sortedRows[index].numOverlappingMotifs !== sortedRows[index - 1].numOverlappingMotifs) {
                    rank = index + 1; 
                }
                return {
                    ...row,
                    motifRank: rank,
                };
            });
        })();

        // Merge ranks and calculate total rank
        const combinedRanks = conservationRankedRows.map((row) => {
            const motifRank = motifRankedRows.find(
                (motifRow) => motifRow.regionID === row.regionID
            )?.motifRank;

            return {
                ...row,
                totalRank: row.conservationRank + (motifRank ?? sequenceRows.length), // Sum of ranks
            };
        });

        // Sort by total rank and assign final ranks 
        const rankedRegions: RankedRegions = (() => {
            const sortedByTotalRank = [...combinedRanks].sort((a, b) => a.totalRank - b.totalRank);
            let rank = 1;
            return sortedByTotalRank.map((row, index) => {
                if (index > 0 && sortedByTotalRank[index].totalRank !== sortedByTotalRank[index - 1].totalRank) {
                    rank = index + 1;
                }
                return {
                    chr: row.inputRegion.chr,
                    start: row.inputRegion.start,
                    end: row.inputRegion.end,
                    rank, 
                };
            });
        })();

    
        setLoadingSequenceRanks(false);
        return rankedRegions;
    }, [sequenceRows]);
    

    /*------------------------------------------ Element Stuff ------------------------------------------*/

    //all ccres intersecting the user inputted regions
    const intersectingCcres: CCREs = useMemo(() => {
        if (intersectArray) {
            const transformedData: CCREs = intersectArray.intersection.map(ccre => {
                // Find the matching input region by chr, start, and end
                const matchingRegion = inputRegions.find(region =>
                    region.chr === ccre[6] &&
                    region.start === parseInt(ccre[7]) &&
                    region.end === parseInt(ccre[8])
                );

                return {
                    chr: ccre[0],
                    start: parseInt(ccre[1]),
                    end: parseInt(ccre[2]),
                    accession: ccre[4],
                    inputRegion: {
                        chr: ccre[6],
                        start: parseInt(ccre[7]),
                        end: parseInt(ccre[8])
                    },
                    regionID: matchingRegion ? matchingRegion.regionID : undefined // Add ID if a match is found
                };
            });

            return transformedData;
        }
    }, [inputRegions, intersectArray]);

    //query to get orthologous cCREs of the intersecting cCREs
    const { loading: loading_ortho, data: orthoData } = useQuery(ORTHOLOG_QUERY, {
        variables: {
            assembly: "GRCh38",
            accessions: intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
        },
        skip: (!elementFilterVariables.mustHaveOrtholog && elementFilterVariables.cCREAssembly !== "mm10") || !intersectingCcres,
        client: client,
        fetchPolicy: 'cache-first',
    })

    const mouseAccessions = useMemo(() => {
        if (elementFilterVariables.cCREAssembly === "mm10") {
            return orthoData?.orthologQuery
                .flatMap(entry => entry.ortholog)
                .map(orthologEntry => orthologEntry.accession);
        }
    }, [elementFilterVariables.cCREAssembly, orthoData?.orthologQuery]);

    //Query to get the assay zscores of the intersecting ccres
    const { loading: loading_scores, error: error_scores, data: zScoreData } = useQuery(Z_SCORES_QUERY, {
        variables: {
            assembly: elementFilterVariables.cCREAssembly,
            accessions: elementFilterVariables.cCREAssembly === "mm10" ? mouseAccessions : intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
            cellType: elementFilterVariables.selectedBiosample ? elementFilterVariables.selectedBiosample.name : null
        },
        skip: !intersectingCcres || (elementFilterVariables.cCREAssembly === "mm10" && !mouseAccessions),
        client: client,
        fetchPolicy: 'cache-first',
    });

    const mapScores = (obj, data) => {
        const matchingObj = data.find((e) => obj.accession === e.info.accession);
        if (!matchingObj) return obj;
        return {
            ...obj,
            dnase: matchingObj.dnase_zscore,
            h3k4me3: matchingObj.promoter_zscore,
            h3k27ac: matchingObj.enhancer_zscore,
            ctcf: matchingObj.ctcf_zscore,
            atac: matchingObj.atac_zscore,
            class: matchingObj.pct
        };
    };

    const mapScoresCTSpecific = (obj, data) => {
        const matchingObj = data.find((e) => obj.accession === e.info.accession);
        if (!matchingObj) return obj;
        return {
            ...obj,
            dnase: matchingObj.ctspecific.dnase_zscore,
            h3k4me3: matchingObj.ctspecific.h3k4me3_zscore,
            h3k27ac: matchingObj.ctspecific.h3k4me3_zscore,
            ctcf: matchingObj.ctspecific.ctcf_zscore,
            atac: matchingObj.ctspecific.atac_zscore,
            class: matchingObj.pct
        };
    };

    //all data pertaining to the element table
    const allElementData: ElementTableRow[] = useMemo(() => {
        if (!zScoreData) return [];
        const data = zScoreData['cCRESCREENSearch'];
        let mapObj = intersectingCcres;

        //use mouse accesion instead if mm10 selected
        if (elementFilterVariables.cCREAssembly === "mm10") {
            const orthologMapping: { [accession: string]: string | undefined } = {};

            orthoData.orthologQuery.forEach((entry: { accession: string; ortholog: Array<{ accession: string }> }) => {
                if (entry.ortholog.length > 0) {
                    orthologMapping[entry.accession] = entry.ortholog[0].accession;
                }
            });

            mapObj = intersectingCcres
                .map((ccre) => ({
                    ...ccre,
                    accession: orthologMapping[ccre.accession]
                }))
                .filter((ccre) => ccre.accession !== undefined);
        }

        //map assay scores bsed on selected biosample
        if (elementFilterVariables.selectedBiosample) {
            return mapObj.map(obj => mapScoresCTSpecific(obj, data));
        } else {
            return mapObj.map(obj => mapScores(obj, data));
        }
    }, [zScoreData, intersectingCcres, elementFilterVariables.cCREAssembly, elementFilterVariables.selectedBiosample, orthoData]);

    // Filter cCREs based on class and ortholog
    const elementRows: ElementTableRow[] = useMemo(() => {
        if (allElementData.length === 0 || !elementFilterVariables.usecCREs) return [];
        let data = allElementData;
        //filter through ortholog
        if (elementFilterVariables.mustHaveOrtholog && orthoData && elementFilterVariables.cCREAssembly !== "mm10") {
            const orthologMapping: { [accession: string]: string | undefined } = {};

            orthoData.orthologQuery.forEach((entry: { accession: string; ortholog: Array<{ accession: string }> }) => {
                if (entry.ortholog.length > 0) {
                    orthologMapping[entry.accession] = entry.ortholog[0].accession;
                }
            });

            data = allElementData
                .map((row) => ({
                    ...row,
                    ortholog: orthologMapping[row.accession]
                }))
                .filter((row) => row.ortholog !== undefined);
        }

        //filter through classes
        const filteredClasses = data.filter(row => elementFilterVariables.classes[row.class] !== false);
        return filteredClasses;

    }, [allElementData, elementFilterVariables.cCREAssembly, elementFilterVariables.classes, elementFilterVariables.mustHaveOrtholog, elementFilterVariables.usecCREs, orthoData]);

    // Generate element ranks
    const elementRanks = useMemo<RankedRegions>(() => {
        if (elementRows.length === 0 || !elementFilterVariables.usecCREs) return [];
        setLoadingElementRanks(true);

        //Group by `inputRegion` and calculate average or max scores
        const groupedData = elementRows.reduce((acc, row) => {
            const key = `${row.inputRegion.chr}-${row.inputRegion.start}-${row.inputRegion.end}`;

            if (!acc[key]) {
                acc[key] = {
                    ...row, // Start with the first entry's properties to retain the structure
                    dnase: elementFilterVariables.rankBy === "max" ? row.dnase : 0,
                    atac: elementFilterVariables.rankBy === "max" ? row.atac : 0,
                    h3k4me3: elementFilterVariables.rankBy === "max" ? row.h3k4me3 : 0,
                    h3k27ac: elementFilterVariables.rankBy === "max" ? row.h3k27ac : 0,
                    ctcf: elementFilterVariables.rankBy === "max" ? row.ctcf : 0,
                    count: 0 // Only increment count if averaging
                };
            }

            // Sum assay scores for averaging
            if (elementFilterVariables.rankBy === "avg") {
                assayNames.forEach(assay => {
                    acc[key][assay] += row[assay] || 0;
                });
                acc[key].count += 1;
            } else if (elementFilterVariables.rankBy === "max") {
                assayNames.forEach(assay => {
                    acc[key][assay] = Math.max(acc[key][assay], row[assay] || 0);
                });
            }

            return acc;
        }, {} as { [key: string]: ElementTableRow & { count: number } });

        //Compute averages if necesarry and create `ElementTableRow` entries
        const processedRows: ElementTableRow[] = Object.values(groupedData).map(region => {
            const processedAssays: Partial<ElementTableRow> = {};
            assayNames.forEach(assay => {
                if (elementFilterVariables.rankBy === "avg") {
                    processedAssays[assay] = region.count > 0 ? region[assay] / region.count : 0;
                } else {
                    processedAssays[assay] = region[assay]; // Already max in reduce step if rankBy is "max"
                }
            });

            return {
                ...region,
                ...processedAssays,
                count: undefined // Remove the helper count property
            };
        });

        const assayRanks: { [key: number]: AssayRankEntry } = {};

        //assign a rank to each assay
        assayNames.forEach(assay => {
            const sortedRows = processedRows
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
        setLoadingElementRanks(false);
        return rankedRegions;

    }, [elementFilterVariables, elementRows]);

    //open ccre details on ccre click
    const handlecCREClick = (row) => {
        window.open(`/search?assembly=${elementFilterVariables.cCREAssembly}&chromosome=${row.chr}&start=${row.start}&end=${row.end}&accessions=${row.accession}&page=2`, "_blank", "noopener,noreferrer")
    }

    /*------------------------------------------ Gene Stuff ------------------------------------------*/
    //TODO

    /*------------------------------------------ Main Table Stuff ------------------------------------------*/

    //find the matching ranks for each input region and update the rows of the main table
    const mainRows: MainTableRow[] = useMemo(() => {
        if (loadingElementRanks || loadingSequenceRanks) return;
        setLoadingMainRows(true)
        if ((sequenceRanks.length === 0 && elementRanks.length === 0 && geneRanks.length === 0) || inputRegions.length === 0) return [];
        const totalRanks = inputRegions.map(row => {
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

            // Calculate the total rank, using 0 if no matching rank is found for any
            const totalRank = (matchingSequence?.rank || 0) +
                (matchingElement?.rank || 0) +
                (matchingGene?.rank || 0);

            return {
                ...row,
                rank: totalRank
            };
        });

        // Assign aggregate ranks, accounting for ties
        let currentRank = 1;
        let prevTotalRank = null;

        const aggregateRanks = totalRanks
            .sort((a, b) => a.rank - b.rank) // Sort by rank
            .map((region, index) => {
                // Update current rank only if rank is different from the previous
                if (region.rank !== prevTotalRank) {
                    currentRank = index + 1;
                    prevTotalRank = region.rank;
                }

                return {
                    chr: region.chr,
                    start: region.start,
                    end: region.end,
                    rank: region.rank === 0 ? 0 : currentRank, // Assign 0 for unranked regions
                };
            });

        const updatedMainRows = inputRegions.map(row => {
            // Find the matching rank for this `inputRegion`
            const matchingElement = elementRanks.find(
                element =>
                    element.chr == row.chr &&
                    element.start == row.start &&
                    element.end == row.end
            );

            const elementRank = matchingElement ? matchingElement.rank : 0;

            const matchingSequence = sequenceRanks.find(
                sequence =>
                    sequence.chr == row.chr &&
                    sequence.start == row.start &&
                    sequence.end == row.end
            );

            const sequenceRank = matchingSequence ? matchingSequence.rank : 0;

            //TODO add other ranks (Gene)

            const matchingAggregateRank = aggregateRanks.find(
                mainRank =>
                    mainRank.chr == row.chr &&
                    mainRank.start == row.start &&
                    mainRank.end == row.end
            );

            const aggregateRank = (matchingAggregateRank ? matchingAggregateRank.rank : 0);

            return {
                regionID: row.regionID,
                inputRegion: { chr: row.chr, start: row.start, end: row.end },
                sequenceRank,
                elementRank,
                aggregateRank
            };
        }).filter(row => row.aggregateRank !== 0);
        setLoadingMainRows(false)
        return updatedMainRows;
    }, [elementRanks, geneRanks, inputRegions, loadingElementRanks, loadingSequenceRanks, sequenceRanks]);

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
                <ArgoUpload
                    selectedSearch={selectedSearch}
                    handleSearchChange={handleSearchChange}
                    onRegionsConfigured={handleRegionsConfigured}
                />
                {inputRegions.length > 0 && (
                    <>
                        <Box mt="20px" id="123456">
                            {!mainRows || loadingMainRows ? <CircularProgress /> :
                                <DataTable
                                    key={Math.random()}
                                    columns={mainColumns}
                                    rows={mainRows}
                                    sortDescending
                                    itemsPerPage={5}
                                    searchable
                                    tableTitle="Ranked Regions"
                                />
                            }
                        </Box>

                        {(shownTable === "sequence" && (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs)) && (
                            <Box mt="20px">
                                {error_conservation_scores && (
                                    <Alert variant="filled" severity="error">
                                        {error_conservation_scores.message}
                                    </Alert>
                                )}
                                {loading_conservation_scores ? <CircularProgress /> :
                                    <DataTable
                                        key={Math.random()}
                                        columns={sequenceColumns}
                                        rows={sequenceRows}
                                        sortDescending
                                        itemsPerPage={10}
                                        searchable
                                        tableTitle={<SubTableTitle title="Sequence Details" />}
                                    />
                                }
                            </Box>
                        )}

                        {(shownTable === "element" && elementFilterVariables.usecCREs) && (
                            <Box mt="20px">
                                {error_scores && (
                                    <Alert variant="filled" severity="error">
                                        {error_scores.message}
                                    </Alert>
                                )}
                                {loading_scores || loading_ortho ? <CircularProgress /> :
                                    <DataTable
                                        key={Math.random()}
                                        columns={elementColumns}
                                        rows={elementRows}
                                        sortDescending
                                        itemsPerPage={10}
                                        searchable
                                        tableTitle={<SubTableTitle title="Element Details (Overlapping cCREs)" />}
                                        onRowClick={handlecCREClick}
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
            {modalData && (
                <MotifsModal
                    key={`${modalData?.chromosome}-${modalData?.start}-${modalData?.end}`}
                    open={modalData?.open || false}
                    setOpen={(isOpen) =>
                        setModalData((prev) => (prev ? { ...prev, open: isOpen } : null))
                    }
                    chromosome={modalData?.chromosome || ""}
                    start={modalData?.start || 0}
                    end={modalData?.end || 0}
                    occurrences={modalData?.occurrences || []}
                />
            )}
        </Box>
    )
}