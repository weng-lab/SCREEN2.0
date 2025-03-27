"use client"
import React, { useMemo } from "react"
import { useState } from "react"
import { Stack, Typography, Box, CircularProgress, IconButton, Tooltip, Skeleton } from "@mui/material"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { useLazyQuery } from "@apollo/client"
import { client } from "../../search/_ccredetails/client"
import { RankedRegions, ElementFilterState, SequenceFilterState, GeneFilterState, MainTableRow, CCREs, InputRegions, SubTableTitleProps, IsolatedRow, GeneTableRow, ElementTableRow, SequenceTableRow } from "./types"
import { BED_INTERSECT_QUERY } from "../../_mainsearch/queries"
import Filters from "./filters"
import { VerticalAlignTop, Cancel, InfoOutlined } from "@mui/icons-material"
import ArgoUpload from "./argoUpload"
import { calculateAggregateRanks, matchRanks } from "./helpers"
import { generateSequenceRanks } from "./sequence/sequenceHelpers"
import { generateElementRanks, handleSameInputRegion } from "./elements/elementHelpers"
import SequenceTable from "./sequence/sequenceTable"
import ElementTable from "./elements/elementTable"
import GeneTable from "./genes/geneTable"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { generateGeneRanks } from "./genes/geneHelpers"

export default function Argo() {

    const [inputRegions, setInputRegions] = useState<InputRegions>([]);
    const [getIntersectingCcres, { data: intersectArray, loading: loadingIntersect }] = useLazyQuery(BED_INTERSECT_QUERY)

    //UI state variables
    const [selectedSearch, setSelectedSearch] = useState<string>("TSV File")
    const [drawerOpen, setDrawerOpen] = useState(true);
    const toggleDrawer = () => setDrawerOpen(!drawerOpen);
    const [tableOrder, setTableOrder] = useState<("sequence" | "elements" | "genes")[]>([
        "sequence",
        "elements",
        "genes",
    ]);

    const [sequenceRows, setSequenceRows] = useState<SequenceTableRow[]>([])
    const [elementRows, setElementRows] = useState<ElementTableRow[]>([])
    const [geneRows, setGeneRows] = useState<GeneTableRow[]>([])
    const [isolatedRowID, setIsolatedRowID] = useState<number | string>(null);

    const [loadingSequenceRows, setLoadingSequenceRows] = useState<boolean>(true);
    const [loadingElementRows, setLoadingElementRows] = useState<boolean>(true);
    const [loadingGeneRows, setLoadingGeneRows] = useState<boolean>(true);

    const [page, setPage] = useState<number>(0);

    // Filter state variables
    const [sequenceFilterVariables, setSequenceFilterVariables] = useState<SequenceFilterState>({
        useConservation: true,
        alignment: "241-mam-phyloP",
        rankBy: "max",
        useMotifs: true,
        motifCatalog: "hocomoco",
        motifQuality: {
            a: true,
            b: true,
            c: true,
            d: true
        },
        dataSource: {
            p: true,
            s: true,
            m: true,
            g: true,
            i: true,
            b: true
        },
        numOverlappingMotifs: true,
        motifScoreDelta: true,
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
        rankExpSpecBy: "max",
        rankGeneExpBy: "max",
        selectedBiosample: null,
    });

    //update all rows and loading states
    const updateSequenceRows = (rows: SequenceTableRow[]) => {
        setSequenceRows(rows)
    }

    const updateLoadingSequenceRows = (loading: boolean) => {
        setLoadingSequenceRows(loading)
    }

    const updateElementRows = (rows: ElementTableRow[]) => {
        setElementRows(rows)
    }

    const updateLoadingElementRows = (loading: boolean) => {
        setLoadingElementRows(loading)
    }

    const updateGeneRows = (rows: GeneTableRow[]) => {
        setGeneRows(rows)
    }

    const updateLoadingGeneRows = (loading: boolean) => {
        setLoadingGeneRows(loading)
    }

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

    //drag functionality for the tables, reorders the table order array
    const onDragEnd = (result) => {
        if (!result.destination) return; // If dropped outside the list, do nothing

        const newOrder = [...tableOrder];
        const [movedTable] = newOrder.splice(result.source.index, 1); // Remove dragged item
        newOrder.splice(result.destination.index, 0, movedTable); // Insert at new position

        setTableOrder(newOrder);
    };

    // snap sub table to top of the page
    const bringTableToTop = (table: "sequence" | "elements" | "genes") => {
        setTableOrder((prevOrder) => {
            // Remove the table from its current position
            const newOrder = prevOrder.filter((t) => t !== table);
            // Prepend the table to the beginning of the array
            return [table, ...newOrder];
        });
    };

    //isolate a specific rowID
    const isolateRow = (row: MainTableRow) => {
        setIsolatedRowID(row.regionID)
    }

    //stylized title for the sequence,element, and gene data tables
    const SubTableTitle: React.FC<SubTableTitleProps> = ({ title, table }) => (
        <Stack direction={"row"} alignItems={"center"} justifyContent={"space-between"} width={"100%"}>
            <Stack direction={"row"} alignItems={"center"} spacing={1}>
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
            <IconButton
                onClick={() => bringTableToTop(table as "sequence" | "elements" | "genes")}
                color="inherit"
            >
                <VerticalAlignTop color="inherit" />
            </IconButton>
        </Stack>
    );

    //reset variables when switching btwn TSV and txt, or when you remove a file
    const handleSearchChange = (search: string) => {
        updateElementFilter('selectedBiosample', null)
        if (search) {
            setSelectedSearch(search)
        }
        handleRegionsConfigured([])
        setIsolatedRowID(null)
    }

    // This function will receive the regions from ArgoUpload and find the intersecting cCREs
    const handleRegionsConfigured = (regions: InputRegions) => {
        console.log(regions)
        setInputRegions(regions);
        if (regions.length > 0) {
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
        }
    };

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

    //sequence ranks for main table
    const sequenceRanks: RankedRegions = useMemo(() => {
        if (sequenceRows === null || (!sequenceFilterVariables.useConservation && !sequenceFilterVariables.useMotifs)) {
            return inputRegions.map((row) => ({
                chr: row.chr,
                start: row.start,
                end: row.end,
                rank: 0, // Add rank of 0 to each row
            }));
        } else if (sequenceRows.length === 0) {
            return [];
        }

        const rankedRegions = generateSequenceRanks(sequenceRows)

        return rankedRegions;
    }, [inputRegions, sequenceFilterVariables.useConservation, sequenceFilterVariables.useMotifs, sequenceRows]);

    // element ranks for main table
    const elementRanks = useMemo<RankedRegions>(() => {
        if (elementRows === null || !elementFilterVariables.usecCREs) {
            return inputRegions.map((row) => ({
                chr: row.chr,
                start: row.start,
                end: row.end,
                rank: 0, // Add rank of 0 to each row
            }));
        } else if (elementRows.length === 0) {
            return [];
        }

        //find ccres with same input region and combine them based on users rank by selected
        const processedRows = handleSameInputRegion(elementFilterVariables.rankBy, elementRows)
        const rankedRegions = generateElementRanks(processedRows, elementFilterVariables.classes, elementFilterVariables.assays)

        return rankedRegions;

    }, [elementFilterVariables.assays, elementFilterVariables.classes, elementFilterVariables.rankBy, elementFilterVariables.usecCREs, elementRows, inputRegions]);

    //gene ranks for main table
    const geneRanks = useMemo<RankedRegions>(() => {
        if (geneRows === null || !geneFilterVariables.useGenes) {
            return inputRegions.map((row) => ({
                chr: row.chr,
                start: row.start,
                end: row.end,
                rank: -1, // Add rank of 0 to each row
            }));
        } else if (geneRows.length === 0) {
            return [];
        }

        const rankedRegions = generateGeneRanks(geneRows)

        return rankedRegions

    }, [geneFilterVariables.useGenes, geneRows, inputRegions]);

    // All loading states for main table columns
    const loadingSequenceRanks = (sequenceRanks.length === 0 || loadingSequenceRows) && (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs);
    const loadingElementRanks = (elementRanks.length === 0 || loadingElementRows) && (elementFilterVariables.usecCREs);
    const loadingGeneRanks = (geneRanks.length === 0 || loadingGeneRows) && (geneFilterVariables.useGenes);
    const loadingMainRows = loadingSequenceRanks || loadingElementRanks || loadingGeneRanks;

    //find the matching ranks for each input region and update the rows of the main table
    const mainRows: MainTableRow[] = useMemo(() => {
        if ((sequenceRanks.length === 0 && elementRanks.length === 0 && geneRanks.length === 0) || inputRegions.length === 0) return [];

        const aggregateRanks = calculateAggregateRanks(inputRegions, sequenceRanks, elementRanks, geneRanks)
        const updatedMainRows = matchRanks(inputRegions, sequenceRanks, elementRanks, geneRanks, aggregateRanks)

        return updatedMainRows;
    }, [elementRanks, geneRanks, inputRegions, sequenceRanks]);

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
                value: (row) => row.sequenceRank,
                render: (row) => loadingSequenceRanks ? <CircularProgress size={10} /> : row.sequenceRank
            })
        }
        if (elementFilterVariables.usecCREs) {
            cols.push({
                header: "Element",
                value: (row) => row.elementRank === 0 ? "N/A" : row.elementRank,
                sort: (a, b) => {
                    const rankA = a.elementRank
                    const rankB = b.elementRank

                    if (rankA === 0) return 1;
                    if (rankB === 0) return -1;
                    return rankA - rankB;
                },
                render: (row) => loadingElementRanks ? <CircularProgress size={10} /> : row.elementRank === 0 ? "N/A" : row.elementRank
            })
        }
        if (geneFilterVariables.useGenes) {
            cols.push({
                header: "Gene",
                value: (row) => row.geneRank === 0 ? "N/A" : row.geneRank,
                sort: (a, b) => {
                    const rankA = a.geneRank
                    const rankB = b.geneRank

                    if (rankA === 0) return 1;
                    if (rankB === 0) return -1;
                    return rankA - rankB;
                },
                render: (row) => loadingGeneRanks ? <CircularProgress size={10} /> : row.geneRank === 0 ? "N/A" : row.geneRank
            })
        }

        return cols

    }, [elementFilterVariables.usecCREs, geneFilterVariables.useGenes, loadingElementRanks, loadingGeneRanks, loadingMainRows, loadingSequenceRanks, sequenceFilterVariables.useConservation, sequenceFilterVariables.useMotifs])

    //find all the region id's of the isolated row and pass them to the other tables
    const isolatedRows: IsolatedRow = useMemo(() => {
        if (isolatedRowID === null) return null;
        const mainIsolate = mainRows.filter((row) => row.regionID === isolatedRowID)
        const sequenceIsolate = sequenceRows?.filter((row) => row.regionID === isolatedRowID)
        const elementIsolate = elementRows?.filter((row) => row.regionID === isolatedRowID)
        const geneIsolate = geneRows?.filter((row) => row.regionID === isolatedRowID)

        return {
            main: mainIsolate,
            sequence: sequenceIsolate,
            element: elementIsolate,
            gene: geneIsolate,
        };
    }, [isolatedRowID, sequenceRows, elementRows, geneRows, mainRows])

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
                zIndex={1}
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
                            {mainRows.length === 0 ? <Skeleton width={"auto"} height={"440px"} variant="rounded"/> :
                                <DataTable
                                    key={JSON.stringify(inputRegions) + JSON.stringify(elementRanks) + JSON.stringify(sequenceRanks) + JSON.stringify(geneRanks)}
                                    columns={mainColumns}
                                    rows={mainRows}
                                    sortDescending
                                    sortColumn={2}
                                    itemsPerPage={5}
                                    page={page}
                                    searchable
                                    onDisplayedRowsChange={(newPage) => {
                                        setPage(newPage)
                                      }}
                                    tableTitle={
                                        <Stack direction={"row"} justifyContent={"space-between"} alignItems={"center"} width={"100%"}>
                                            <Stack direction={"row"} spacing={1} alignItems={"center"}>
                                                <Tooltip title="Select a row to isolate it" arrow placement="top-start">
                                                    <InfoOutlined fontSize="small" sx={{ cursor: "pointer" }} color="inherit" />
                                                </Tooltip>
                                                <Typography variant="h5">Ranked Regions</Typography>
                                                {isolatedRowID &&
                                                    <Stack
                                                        borderRadius={1}
                                                        direction={"row"}
                                                        spacing={1}
                                                        sx={{ backgroundColor: theme => theme.palette.secondary.main, padding: 1 }}
                                                        alignItems={"center"}
                                                        justifyContent={"space-between"}
                                                    >
                                                        <Typography>Isolated RegionID: {" "} {isolatedRowID}</Typography>
                                                        <IconButton color="primary" onClick={() => setIsolatedRowID(null)}>
                                                            <Cancel />
                                                        </IconButton>
                                                    </Stack>
                                                }
                                            </Stack>
                                        </Stack>
                                    }
                                    onRowClick={isolateRow}
                                    highlighted={isolatedRowID ? isolatedRows.main : []}
                                    downloadFileName="AggregateRanks.tsv"
                                />
                            }
                        </Box>

                        <DragDropContext onDragEnd={onDragEnd}>
                            <Droppable droppableId="tables">
                                {(provided) => (
                                    <Box ref={provided.innerRef} {...provided.droppableProps}>
                                        {tableOrder.map((table, index) => (
                                            <Draggable key={table} draggableId={table} index={index}>
                                                {(provided) => (
                                                    <Box
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        sx={{
                                                            cursor: 'grab',
                                                            mt: '20px',
                                                        }}
                                                    >
                                                        {table === "sequence" && (sequenceFilterVariables.useConservation || sequenceFilterVariables.useMotifs) && (
                                                            <SequenceTable
                                                                sequenceFilterVariables={sequenceFilterVariables}
                                                                SubTableTitle={SubTableTitle}
                                                                inputRegions={inputRegions}
                                                                isolatedRows={isolatedRows}
                                                                updateSequenceRows={updateSequenceRows}
                                                                updateLoadingSequenceRows={updateLoadingSequenceRows}
                                                            />
                                                        )}

                                                        {table === "elements" && elementFilterVariables.usecCREs && (
                                                            <ElementTable
                                                                elementFilterVariables={elementFilterVariables}
                                                                SubTableTitle={SubTableTitle}
                                                                intersectingCcres={intersectingCcres}
                                                                loadingIntersect={loadingIntersect}
                                                                isolatedRows={isolatedRows}
                                                                updateElementRows={updateElementRows}
                                                                updateLoadingElementRows={updateLoadingElementRows}
                                                            />
                                                        )}

                                                        {table === "genes" && geneFilterVariables.useGenes && (
                                                            <GeneTable
                                                                geneFilterVariables={geneFilterVariables}
                                                                SubTableTitle={SubTableTitle}
                                                                intersectingCcres={intersectingCcres}
                                                                loadingIntersect={loadingIntersect}
                                                                isolatedRows={isolatedRows}
                                                                updateGeneRows={updateGeneRows}
                                                                updateLoadingGeneRows={updateLoadingGeneRows}
                                                            />
                                                        )}
                                                    </Box>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </Box>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </>
                )}
            </Box>
        </Box>
    )
}