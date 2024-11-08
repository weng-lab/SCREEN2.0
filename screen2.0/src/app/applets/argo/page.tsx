"use client"
import React, { useCallback, useMemo } from "react"
import { useState } from "react"
import { Stack, Typography, Box, Alert, CircularProgress, IconButton } from "@mui/material"
import { SelectChangeEvent } from "@mui/material/Select"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { ORTHOLOG_QUERY, Z_SCORES_QUERY } from "./queries"
import { useLazyQuery, useQuery } from "@apollo/client"
import { client } from "../../search/_ccredetails/client"
import { GenomicRegion, CCREAssays, CCREClasses, RankedRegions, ElementFilterState, SequenceFilterState, GeneFilterState, MainTableRow, SequenceTableRow, ElementTableRow, GeneTableRow, AssayRankEntry, CCREs } from "./types"
import { BED_INTERSECT_QUERY } from "../../_mainsearch/queries"
import ExpandCircleDownIcon from '@mui/icons-material/ExpandCircleDown';
import Filters from "./filters"
import { CancelRounded } from "@mui/icons-material"
import ArgoUpload from "./argoUpload"

const assayNames = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"]

export default function Argo() {
    const [getIntersectingCcres, { data: intersectArray }] = useLazyQuery(BED_INTERSECT_QUERY)
    const [inputRegions, setInputRegions] = useState<GenomicRegion[]>([]);
    const [loadingMainRows, setLoadingMainRows] = useState(true);

    //UI state variables
    const [selectedSearch, setSelectedSearch] = useState<string>("BED File")
    const [drawerOpen, setDrawerOpen] = useState(true);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const [shownTable, setShownTable] = useState<"sequence" | "element" | "gene">(null);

    // These will be deleted once functionality is implemented
    const [sequenceRanks, setSequenceRanks] = useState<RankedRegions>([]);
    const [geneRanks, setGeneRanks] = useState<RankedRegions>([]);
    const [sequenceRows, setSequenceRows] = useState<SequenceTableRow[]>([]) // Data displayed on the sequence table
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
        useGenes: true,
        idk: "no"
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
            { header: "Input Region", value: (row) => `${row.inputRegion.chr}:${row.inputRegion.start}-${row.inputRegion.end}`, sort: (a, b) => a.inputRegion.start - b.inputRegion.start },
            { header: "Aggregate", value: (row) => row.aggregateRank }
        ]
        /**
         * @todo
         * correctly populate row values
         */
        if (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs) {
            cols.push({ header: "Seqence", HeaderRender: () => <MainColHeader tableName="Sequence" onClick={() => shownTable === "sequence" ? setShownTable(null) : setShownTable("sequence")} />, value: (row) => "N/A" })
        }
        if (elementFilterVariables.usecCREs) { cols.push({ header: "Element", HeaderRender: () => <MainColHeader tableName="Element" onClick={() => shownTable === "element" ? setShownTable(null) : setShownTable("element")} />, value: (row) => row.elementRank }) }
        if (geneFilterVariables.useGenes) { cols.push({ header: "Gene", HeaderRender: () => <MainColHeader tableName="Gene" onClick={() => shownTable === "gene" ? setShownTable(null) : setShownTable("gene")} />, value: (row) => "N/A" }) }

        return cols

    }, [MainColHeader, elementFilterVariables.usecCREs, geneFilterVariables.useGenes, sequenceFilterVariables.useConservation, sequenceFilterVariables.useMotifs, shownTable])

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
            if (sequenceFilterVariables.numOverlappingMotifs) { cols.push({ header: "# of Overlapping Motifs", value: (row) => "N/A" }) }
            if (sequenceFilterVariables.motifScoreDelta) { cols.push({ header: "Motif Score Delta", value: (row) => "N/A" }) }
            if (sequenceFilterVariables.overlapsTFPeak) { cols.push({ header: "Overlaps TF Peak", value: (row) => "N/A" }) }
        }

        return cols

    }, [sequenceFilterVariables])

    //handle column changes for the Element rank table
    const elementColumns: DataTableColumn<ElementTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<ElementTableRow>[] = [
            { header: "Genomic Region", value: (row) => `${row.chr}:${row.start}-${row.end}`, sort: (a, b) => a.start - b.start },
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
        updateElementFilter('selectedBiosample', null)
        if (event) {
            setSelectedSearch(event.target.value)
        }
        setShownTable(null)
    }

    // This function will receive the regions from ArgoUpload and find the intersecting cCREs
    const handleRegionsConfigured = (regions: GenomicRegion[]) => {
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
                maxOutputLength: 1000 // Not required technically as server side defaults to 1000, here if it needs to be changed in the future
            },
            client: client,
            fetchPolicy: 'cache-and-network',
        })
    };

    //all ccres intersecting the user inputted regions
    const intersectingCcres: CCREs = useMemo(() => {
        if (intersectArray) {
            const transformedData: CCREs = intersectArray.intersection.map(ccre => ({
                chr: ccre[0],
                start: parseInt(ccre[1]),
                end: parseInt(ccre[2]),
                accession: ccre[4],
                inputRegion: { chr: ccre[6], start: ccre[7], end: ccre[8] }
            }));
            return transformedData
        }
    }, [intersectArray]);

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
        if (!elementRows || !elementFilterVariables.usecCREs) return [];

        //Group by `inputRegion` and calculate average scores
        const groupedData = elementRows.reduce((acc, row) => {
            const key = `${row.inputRegion.chr}-${row.inputRegion.start}-${row.inputRegion.end}`;

            if (!acc[key]) {
                acc[key] = {
                    ...row, // Start with the first entry's properties to retain the structure
                    dnase: 0,
                    atac: 0,
                    h3k4me3: 0,
                    h3k27ac: 0,
                    ctcf: 0,
                    count: 0
                };
            }

            // Sum assay scores for averaging
            assayNames.forEach(assay => {
                acc[key][assay] += row[assay] || 0;
            });
            acc[key].count += 1;

            return acc;
        }, {} as { [key: string]: ElementTableRow & { count: number } });

        //Compute averages and create `ElementTableRow` entries
        const averagedRows: ElementTableRow[] = Object.values(groupedData).map(region => {
            const averagedAssays: Partial<ElementTableRow> = {};
            assayNames.forEach(assay => {
                averagedAssays[assay] = region.count > 0 ? region[assay] / region.count : 0;
            });

            return {
                ...region,
                ...averagedAssays,
                count: undefined // Remove the helper count property
            };
        });

        const assayRanks: { [key: number]: AssayRankEntry } = {};

        //assign a rank to each assay
        assayNames.forEach(assay => {
            const sortedRows = averagedRows
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

    }, [elementFilterVariables, elementRows]);

    //update aggregate rank
    const aggregateRanks = useMemo<RankedRegions>(() => {
        if ((sequenceRanks.length === 0 && elementRanks.length === 0 && geneRanks.length === 0) || inputRegions.length === 0) return [];

        const updatedMainRanks = inputRegions.map(row => {
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
            //TODO sort the added ranks to one aggregate rank
            const aggregateRank = (matchingSequence?.rank || 0) +
                (matchingElement?.rank || 0) +
                (matchingGene?.rank || 0);

            return {
                ...row,
                rank: aggregateRank
            };
        });

        return updatedMainRanks;
    }, [sequenceRanks, elementRanks, geneRanks, inputRegions]);

    //find the matching ranks for each input region and update the rows of the main table
    const mainRows: MainTableRow[] = useMemo(() => {
        if ((sequenceRanks.length === 0 && elementRanks.length === 0 && geneRanks.length === 0) || inputRegions.length === 0) return [];
        setLoadingMainRows(true)
        const updatedMainRows = inputRegions.map(row => {
            // Find the matching rank for this `inputRegion`
            const matchingElement = elementRanks.find(
                element =>
                    element.chr == row.chr &&
                    element.start == row.start &&
                    element.end == row.end
            );

            const elementRank = matchingElement ? matchingElement.rank : 0;

            //TODO add other ranks (sequence and Gene)

            const matchingAggregateRank = aggregateRanks.find(
                mainRank =>
                    mainRank.chr == row.chr &&
                    mainRank.start == row.start &&
                    mainRank.end == row.end
            );

            const aggregateRank = (matchingAggregateRank ? matchingAggregateRank.rank : 0);

            return {
                inputRegion: { chr: row.chr, start: row.start, end: row.end },
                elementRank,
                aggregateRank
            };
        }).filter(row => row.aggregateRank !== 0);
        setLoadingMainRows(false)

        return updatedMainRows;
    }, [aggregateRanks, elementRanks, geneRanks, inputRegions, sequenceRanks]);

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

                {error_scores && (
                    <Alert variant="filled" severity="error">
                        {error_scores.message}
                    </Alert>
                )}
                <ArgoUpload
                    selectedSearch={selectedSearch}
                    handleSearchChange={handleSearchChange}
                    onRegionsConfigured={handleRegionsConfigured}
                />
                {inputRegions.length > 0 && (
                    <>
                        <Box mt="20px" id="123456">
                            {loadingMainRows ? <CircularProgress /> :
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