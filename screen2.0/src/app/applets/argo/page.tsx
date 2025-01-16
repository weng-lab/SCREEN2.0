"use client"
import React, { useCallback, useEffect, useMemo } from "react"
import { useState } from "react"
import { Stack, Typography, Box, Alert, CircularProgress, IconButton } from "@mui/material"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { ORTHOLOG_QUERY, Z_SCORES_QUERY, BIG_REQUEST_QUERY, MOTIF_QUERY, CLOSEST_LINKED_QUERY, SPECIFICITY_QUERY, GENE_ORTHO_QUERY } from "./queries"
import { QueryResult, useLazyQuery, useQuery } from "@apollo/client"
import { client } from "../../search/_ccredetails/client"
import { RankedRegions, ElementFilterState, SequenceFilterState, GeneFilterState, MainTableRow, SequenceTableRow, ElementTableRow, GeneTableRow, CCREs, InputRegions, SubTableTitleProps } from "./types"
import { BED_INTERSECT_QUERY } from "../../_mainsearch/queries"
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import Filters from "./filters"
import { CancelRounded } from "@mui/icons-material"
import ArgoUpload from "./argoUpload"
import { BigRequest, OccurrencesQuery } from "../../../graphql/__generated__/graphql"
import { calculateAggregateRanks, matchRanks } from "./helpers"
import { batchRegions, calculateConservationScores, generateSequenceRanks, getNumOverlappingMotifs } from "./sequence/sequenceHelpers"
import { generateElementRanks, handleSameInputRegion, mapScores, mapScoresCTSpecific } from "./elements/elementHelpers"
import { filterOrthologGenes, generateGeneRanks, getSpecificityScores, parseLinkedGenes, pushClosestGenes } from "./genes/geneHelpers"
import SequenceTable from "./sequence/sequenceTable"
import ElementTable from "./elements/elementTable"
import GeneTable from "./genes/geneTable"

export default function Argo() {

    const [inputRegions, setInputRegions] = useState<InputRegions>([]);
    const [getIntersectingCcres, { data: intersectArray }] = useLazyQuery(BED_INTERSECT_QUERY)
    const [getMemeOccurrences] = useLazyQuery(MOTIF_QUERY)
    const [getGeneSpecificity, { data: geneSpecificity, loading: loading_gene_specificity }] = useLazyQuery(SPECIFICITY_QUERY)
    const [getOrthoGenes, { data: orthoGenes }] = useLazyQuery(GENE_ORTHO_QUERY)
    const [occurrences, setOccurrences] = useState<QueryResult<OccurrencesQuery>[]>([]);
    const [loadingMainRows, setLoadingMainRows] = useState(true);
    const [loadingElementRanks, setLoadingElementRanks] = useState(true);
    const [loadingSequenceRanks, setLoadingSequenceRanks] = useState(true);
    const [loadingGeneRanks, setLoadingGeneRanks] = useState(true);

    //UI state variables
    const [selectedSearch, setSelectedSearch] = useState<string>("TSV File")
    const [drawerOpen, setDrawerOpen] = useState(true);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const [shownTable, setShownTable] = useState<"sequence" | "elements" | "genes">(null);

    // Filter state variables
    const [sequenceFilterVariables, setSequenceFilterVariables] = useState<SequenceFilterState>({
        useConservation: true,
        alignment: "241-mam-phyloP",
        rankBy: "max",
        useMotifs: false,
        motifCatalog: "factorbook",
        numOverlappingMotifs: true,
        motifScoreDelta: false,
        overlapsTFPeak: false,
        tfPeakStrength: false
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
        methodOfLinkage: {
            distance: true,
            eQTLs: true,
            CRISPRi_FlowFISH: true,
            Intact_HiC: true,
            CTCF_ChIAPET: true,
            RNAPII_ChIAPET: true
        },
        mustBeProteinCoding: false,
        mustHaveOrtholog: false,
        rankBy: "max",
    });

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
    const SubTableTitle: React.FC<SubTableTitleProps> = ({ title }) => (
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

    //reset variables when switching btwn TSV and txt, or when you remove a file
    const handleSearchChange = (search: string) => {
        setLoadingMainRows(true)
        setLoadingSequenceRanks(true)
        setLoadingElementRanks(true)
        setLoadingGeneRanks(true)
        updateElementFilter('selectedBiosample', null)
        if (search) {
            setSelectedSearch(search)
        }
        setShownTable(null)
        handleRegionsConfigured([])
    }

    // This function will receive the regions from ArgoUpload and find the intersecting cCREs
    const handleRegionsConfigured = (regions: InputRegions) => {
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

    const sequenceRows: SequenceTableRow[] = useMemo(() => {
        if ((!conservationScores && !occurrences) || inputRegions.length === 0) {
            return []
        }

        let calculatedConservationScores: SequenceTableRow[] = []
        if (conservationScores) {
            calculatedConservationScores = calculateConservationScores(conservationScores.bigRequests, sequenceFilterVariables.rankBy, inputRegions)
        }
        let numOverlappingMotifs: SequenceTableRow[] = []
        if (occurrences) {
            numOverlappingMotifs = getNumOverlappingMotifs(occurrences, inputRegions)
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
    }, [conservationScores, occurrences, inputRegions, sequenceFilterVariables.rankBy])

    const sequenceRanks: RankedRegions = useMemo(() => {
        if (sequenceRows.length === 0) {
            return [];
        }

        setLoadingSequenceRanks(true);

        const rankedRegions = generateSequenceRanks(sequenceRows)

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

    //query to get orthologous cCREs of the intersecting cCREs (also used in gene)
    const { loading: loading_ortho, data: orthoData } = useQuery(ORTHOLOG_QUERY, {
        variables: {
            assembly: "GRCh38",
            accessions: intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
        },
        skip: ((!elementFilterVariables.mustHaveOrtholog && elementFilterVariables.cCREAssembly !== "mm10") &&
            (!geneFilterVariables.mustHaveOrtholog)) ||
            !intersectingCcres,
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
        if (allElementData.length === 0) {
            return [];
        }
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
        //filter through classes return if the data set i fully filtered
        const filteredClasses = data.filter(row => elementFilterVariables.classes[row.class] !== false);
        if (filteredClasses.length === 0) {
            return null
        }
        
        return filteredClasses;

    }, [allElementData, elementFilterVariables.cCREAssembly, elementFilterVariables.classes, elementFilterVariables.mustHaveOrtholog, orthoData]);

    // Generate element ranks
    const elementRanks = useMemo<RankedRegions>(() => {
        if (elementRows === null || !elementFilterVariables.usecCREs) {
            return allElementData.map((row) => ({
                chr: row.inputRegion.chr,
                start: row.inputRegion.start,
                end: row.inputRegion.end,
                rank: 0, // Add rank of 0 to each row
            }));
        } else if (elementRows.length === 0) {
            return [];
        }

        setLoadingElementRanks(true);

        //find ccres with same input region and combine them based on users rank by selected
        const processedRows = handleSameInputRegion(elementFilterVariables.rankBy, elementRows)
        const rankedRegions = generateElementRanks(processedRows, elementFilterVariables.classes, elementFilterVariables.assays)

        return rankedRegions;

    }, [allElementData, elementFilterVariables.assays, elementFilterVariables.classes, elementFilterVariables.rankBy, elementFilterVariables.usecCREs, elementRows]);

    /*------------------------------------------ Gene Stuff ------------------------------------------*/
    //Query to get the closest gene to eah ccre
    const { loading: loading_linked_genes, data: closestAndLinkedGenes } = useQuery(CLOSEST_LINKED_QUERY, {
        variables: {
            accessions: intersectingCcres ? intersectingCcres.map((ccre) => ccre.accession) : [],
        },
        skip: !intersectingCcres,
        client: client,
        fetchPolicy: 'cache-first',
    });

    const geneRows = useMemo<GeneTableRow[]>(() => {
        if (!intersectingCcres || !closestAndLinkedGenes) {
            return [];
        }
        const linkedGenes = parseLinkedGenes(closestAndLinkedGenes.linkedGenesQuery);

        //switch between protein coding and all
        let closestGenes = closestAndLinkedGenes.closestGenetocCRE.filter((gene) => gene.gene.type === "ALL")
        if (geneFilterVariables.mustBeProteinCoding) {
            closestGenes = closestAndLinkedGenes.closestGenetocCRE.filter((gene) => gene.gene.type === "PC")
        }
        const allGenes = pushClosestGenes(closestGenes, linkedGenes);
        const uniqueGeneNames = Array.from(
            new Set(
                allGenes.flatMap((item) => item.genes.map((gene) => gene.name))
            )
        );
        let filteredGenes = allGenes; 
        if (geneFilterVariables.mustHaveOrtholog) {
            getOrthoGenes({
                variables: {
                    name: uniqueGeneNames,
                    assembly: "grch38"
                },
                client: client,
                fetchPolicy: 'cache-and-network',
            })
            if (orthoGenes) {
                filteredGenes = filterOrthologGenes(orthoGenes, allGenes)
            }
        }
        if (filteredGenes.length === 0) {
            return null
        }

        //get all of the geneID's from allGenes
        const geneIds = filteredGenes.flatMap((entry) => 
            entry.genes.map((gene) => gene.geneId)
        );

        //Query to get the gene specificty for each gene id from the previous query
        if (closestAndLinkedGenes.closestGenetocCRE.length > 0) {
            getGeneSpecificity({
                variables: {
                    geneids: geneIds
                },
                client: client,
                fetchPolicy: 'cache-and-network',
            })
        }
        if (geneSpecificity) {
            const specificityRows = getSpecificityScores(filteredGenes, intersectingCcres, geneSpecificity, geneFilterVariables)
            return specificityRows
        } else {
            return []
        }

    }, [closestAndLinkedGenes, geneFilterVariables, geneSpecificity, getGeneSpecificity, getOrthoGenes, intersectingCcres, orthoGenes]);

    const geneRanks = useMemo<RankedRegions>(() => {
        if (geneRows === null || !geneFilterVariables.useGenes) {
            return inputRegions.map((row) => ({
                chr: row.chr,
                start: row.start,
                end: row.end,
                rank: 0, // Add rank of 0 to each row
            }));
        } else if (geneRows.length === 0) {
            return [];
        }
        setLoadingGeneRanks(true);

        const rankedRegions = generateGeneRanks(geneRows)

        return rankedRegions

    }, [geneFilterVariables.useGenes, geneRows, inputRegions]);

    /*------------------------------------------ Main Table Stuff ------------------------------------------*/

    //find the matching ranks for each input region and update the rows of the main table
    const mainRows: MainTableRow[] = useMemo(() => {
        if ((sequenceRanks.length === 0 && elementRanks.length === 0 && geneRanks.length === 0) || inputRegions.length === 0) return [];
        setLoadingMainRows(true)

        const aggregateRanks = calculateAggregateRanks(inputRegions, sequenceRanks, elementRanks, geneRanks)
        //TODO add gene ranks below
        const updatedMainRows = matchRanks(inputRegions, sequenceRanks, elementRanks, geneRanks, aggregateRanks)
        if (sequenceRanks.length > 0 && !loading_conservation_scores) {
            setLoadingSequenceRanks(false)
        }
        if (elementRanks.length > 0) {
            setLoadingElementRanks(false)
        }
        if (geneRanks.length > 0 && !loading_gene_specificity) {
            setLoadingGeneRanks(false)
        }
        if (elementRanks.length > 0 && sequenceRanks.length > 0 && geneRanks.length > 0 && !loading_gene_specificity && !loading_conservation_scores) {
            setLoadingMainRows(false)
        }

        return updatedMainRows;
    }, [elementRanks, geneRanks, inputRegions, loading_conservation_scores, loading_gene_specificity, sequenceRanks]);

    //handle column changes for the main rank table
    const mainColumns: DataTableColumn<MainTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<MainTableRow>[] = [
            { header: "Region ID", value: (row) => row.regionID },
            { header: "Input Region", value: (row) => `${row.inputRegion.chr}: ${row.inputRegion.start}-${row.inputRegion.end}`, sort: (a, b) => a.inputRegion.start - b.inputRegion.start },
            { header: "Aggregate", value: (row) => row.aggregateRank, render: (row) => loadingMainRows ? <CircularProgress size={10} /> : row.aggregateRank }
        ]

        if (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs) {
            cols.push({
                header: "Seqence",
                HeaderRender: () => <MainColHeader tableName="Sequence" onClick={() => shownTable === "sequence" ? setShownTable(null) : setShownTable("sequence")} />,
                value: (row) => row.sequenceRank,
                render: (row) => loadingSequenceRanks ? <CircularProgress size={10} /> : row.sequenceRank
            })
        }
        if (elementFilterVariables.usecCREs) {
            cols.push({
                header: "Element", HeaderRender: () => <MainColHeader tableName="Elements" onClick={() => shownTable === "elements" ? setShownTable(null) : setShownTable("elements")} />, value: (row) => row.elementRank === 0 ? "N/A" : row.elementRank,
                sort: (a, b) => {
                    const rankA = a.elementRank
                    const rankB = b.elementRank

                    if (rankA === 0) return 1;
                    if (rankB === 0) return -1;
                    return rankA - rankB;
                },
                render: (row) => loadingElementRanks || loading_scores || loading_ortho ? <CircularProgress size={10} /> : row.elementRank === 0 ? "N/A" : row.elementRank
            })
        }
        if (geneFilterVariables.useGenes) {
            cols.push({
                header: "Gene", HeaderRender: () => <MainColHeader tableName="Genes" onClick={() => shownTable === "genes" ? setShownTable(null) : setShownTable("genes")} />,
                value: (row) => row.geneRank,
                sort: (a, b) => {
                    const rankA = a.geneRank
                    const rankB = b.geneRank

                    if (rankA === 0) return 1;
                    if (rankB === 0) return -1;
                    return rankA - rankB;
                },
                render: (row) => loading_linked_genes || loading_gene_specificity || loadingGeneRanks ? <CircularProgress size={10} /> : row.geneRank === 0 ? "N/A" : row.geneRank
            })
        }

        return cols

    }, [MainColHeader, elementFilterVariables.usecCREs, geneFilterVariables.useGenes, loadingElementRanks, loadingGeneRanks, loadingMainRows, loadingSequenceRanks, loading_gene_specificity, loading_linked_genes, loading_ortho, loading_scores, sequenceFilterVariables.useConservation, sequenceFilterVariables.useMotifs, shownTable])

    return (
        <Box display="flex" >
            <Filters
                sequenceFilterVariables={sequenceFilterVariables}
                elementFilterVariables={elementFilterVariables}
                geneFilterVariables={geneFilterVariables}
                updateSequenceFilter={updateSequenceFilter}
                updateElementFilter={updateElementFilter}
                updateGeneFilter={updateGeneFilter}
                drawerOpen={drawerOpen}
                toggleDrawer={toggleDrawer}
            />
            <Box
                ml={drawerOpen ? { xs: '300px', sm: '300px', md: '300px', lg: '25vw' } : 0}
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
                            {!mainRows ? <CircularProgress /> :
                                <DataTable
                                    key={Math.random()}
                                    columns={mainColumns}
                                    rows={mainRows}
                                    sortDescending
                                    sortColumn={2}
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
                                    <SequenceTable
                                        sequenceFilterVariables={sequenceFilterVariables}
                                        SubTableTitle={SubTableTitle}
                                        sequenceRows={sequenceRows}
                                    />
                                }
                            </Box>
                        )}

                        {(shownTable === "elements" && elementFilterVariables.usecCREs) && (
                            <Box mt="20px">
                                {error_scores && (
                                    <Alert variant="filled" severity="error">
                                        {error_scores.message}
                                    </Alert>
                                )}
                                {loading_scores || loading_ortho ? <CircularProgress /> :
                                    <ElementTable
                                        elementFilterVariables={elementFilterVariables}
                                        SubTableTitle={SubTableTitle}
                                        elementRows={elementRows}
                                    />
                                }
                            </Box>
                        )}

                        {(shownTable === "genes" && geneFilterVariables.useGenes) && (
                            <Box mt="20px">
                                <GeneTable
                                    geneFilterVariables={geneFilterVariables}
                                    SubTableTitle={SubTableTitle}
                                    geneRows={geneRows}
                                />
                            </Box>
                        )}
                    </>
                )}
            </Box>
        </Box>
    )
}