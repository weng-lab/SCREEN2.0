import React, { useEffect, useMemo, useState } from "react";
import { MotifQueryDataOccurrence, SequenceTableProps, SequenceTableRow } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";
import MotifsModal from "./motifModal";
import { Skeleton, useTheme } from "@mui/material";
import { QueryResult, useLazyQuery, useQuery } from "@apollo/client";
import { BigRequest } from "umms-gb/dist/components/tracks/trackset/types";
import { client } from "../../../search/_ccredetails/client";
import { BIG_REQUEST_QUERY, MOTIF_QUERY } from "../queries";
import { batchRegions, calculateConservationScores, getNumOverlappingMotifs } from "./sequenceHelpers";
import { OccurrencesQuery } from "../../../../graphql/__generated__/graphql";

const SequenceTable: React.FC<SequenceTableProps> = ({
    sequenceFilterVariables,
    SubTableTitle,
    inputRegions,
    isolatedRows,
    updateSequenceRows,
    updateLoadingSequenceRows
}) => {
    const [modalData, setModalData] = useState<{
        open: boolean;
        chromosome: string;
        start: number;
        end: number;
        occurrences: MotifQueryDataOccurrence[];
    } | null>(null);

    const theme = useTheme();
    const [getMemeOccurrences] = useLazyQuery(MOTIF_QUERY)
    const [occurrences, setOccurrences] = useState<QueryResult<OccurrencesQuery>[]>([]);

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
    const { loading: loading_conservation_scores, data: conservationScores } = useQuery(BIG_REQUEST_QUERY, {
        variables: {
            requests: bigRequests
        },
        skip: !sequenceFilterVariables.useConservation || bigRequests.length === 0,
        client: client,
        fetchPolicy: 'cache-first',
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
        if ((!conservationScores && !occurrences) || inputRegions.length === 0 || loading_conservation_scores) {
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
    }, [conservationScores, occurrences, inputRegions, loading_conservation_scores, sequenceFilterVariables.rankBy])

    updateSequenceRows(sequenceRows)
    const loadingRows = loading_conservation_scores;
    updateLoadingSequenceRows(loadingRows);

    //handle column changes for the Sequence rank table
    const sequenceColumns: DataTableColumn<SequenceTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<SequenceTableRow>[] = [
            { header: "Region ID", value: (row) => row.regionID },
        ]

        if (sequenceFilterVariables.useConservation) {
            switch (sequenceFilterVariables.alignment) {
                case "241-mam-phyloP":
                    cols.push({ header: "241-Mammal(phyloP) Score", value: (row) => row.conservationScore ? row.conservationScore.toFixed(2) : "N/A" });
                    break;
                case "447-mam-phyloP":
                    cols.push({ header: "447-Mammal(phyloP) Score", value: (row) => row.conservationScore ? row.conservationScore.toFixed(2) : "N/A" });
                    break;
                case "241-mam-phastCons":
                    cols.push({ header: "241-Mammal(phastCons) Score", value: (row) => row.conservationScore ? row.conservationScore.toFixed(2) : "N/A" });
                    break;
                case "43-prim-phyloP":
                    cols.push({ header: "43-Primate(phyloP) Score", value: (row) => row.conservationScore ? row.conservationScore.toFixed(2) : "N/A" });
                    break;
                case "43-prim-phastCons":
                    cols.push({ header: "43-Primate(phastCons) Score", value: (row) => row.conservationScore ? row.conservationScore.toFixed(2) : "N/A" });
                    break;
                case "243-prim-phastCons":
                    cols.push({ header: "243-Primate(phastCons) Score", value: (row) => row.conservationScore ? row.conservationScore.toFixed(2) : "N/A" });
                    break;
                case "100-vert-phyloP":
                    cols.push({ header: "100-Vertebrate(phyloP) Score", value: (row) => row.conservationScore ? row.conservationScore.toFixed(2) : "N/A" });
                    break;
                case "100-vert-phastCons":
                    cols.push({ header: "100-Vertebrate(phastCons) Score", value: (row) => row.conservationScore ? row.conservationScore.toFixed(2) : "N/A" });
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

    return (
        <>
            {loadingRows ? <Skeleton width={"auto"} height={"440px"} variant="rounded" /> :
                <DataTable
                    key={Math.random()}
                    columns={sequenceColumns}
                    rows={isolatedRows ? isolatedRows.sequence : sequenceRows}
                    sortColumn={1}
                    itemsPerPage={5}
                    searchable
                    tableTitle={<SubTableTitle title="Sequence Details" table="sequence" />}
                    headerColor={{ backgroundColor: theme.palette.secondary.main as "#", textColor: "inherit" }}
                />
            }
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
        </>

    )
}

export default SequenceTable