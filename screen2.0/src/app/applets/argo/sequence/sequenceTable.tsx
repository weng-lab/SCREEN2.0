import React, { useMemo, useState } from "react";
import { DataScource, MotifQuality, MotifQueryDataOccurrence, MotifRanking, SequenceTableProps, SequenceTableRow } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";
import MotifsModal from "./motifModal";
import { Skeleton, Tooltip, Typography, useTheme } from "@mui/material";
import { useQuery } from "@apollo/client";
import { BigRequest } from "umms-gb/dist/components/tracks/trackset/types";
import { client } from "../../../search/_ccredetails/client";
import { BIG_REQUEST_QUERY, MOTIF_RANKING_QUERY } from "../queries";
import { calculateConservationScores, calculateMotifScores, getNumOverlappingMotifs } from "./sequenceHelpers";
import { MotifRankingQueryQuery } from "../../../../graphql/__generated__/graphql";

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

    const {loading: loading_motif_ranking, data: motifRankingScores } = useQuery(MOTIF_RANKING_QUERY, {
        variables: {
            motifinputs:
            inputRegions.map(region => ({
                regionid: region.regionID.toString(),
                start: region.start,
                end: region.end,
                chrom: region.chr,
                alt: region.alt,
                ref: region.ref
            }))
        },
        skip: !sequenceFilterVariables.useMotifs,
        client: client,
        fetchPolicy: 'cache-first',
        onCompleted: (d) => {
            console.log(d)
        }
    })

    const sequenceRows: SequenceTableRow[] = useMemo(() => {
        if (!conservationScores || inputRegions.length === 0 || loading_conservation_scores || !motifRankingScores || loading_motif_ranking) {
            return []
        }

        let calculatedConservationScores: SequenceTableRow[] = []
        if (conservationScores) {
            calculatedConservationScores = calculateConservationScores(conservationScores.bigRequests, sequenceFilterVariables.rankBy, inputRegions)
        }
        let calculatedMotifScores: SequenceTableRow[] = []
        let filteredMotifs: MotifRanking = []
        if (motifRankingScores) {
            //filter through qualities and data sources
            filteredMotifs =  motifRankingScores.motifranking.filter(motif => {
                const motifQuality = motif.motif.split(".").pop();
                const motifDataSource = motif.motif.split(".")[3]
                return sequenceFilterVariables.motifQuality[motifQuality.toLowerCase() as keyof MotifQuality] && motifDataSource.split("").some(letter => sequenceFilterVariables.dataSource[letter.toLowerCase() as keyof DataScource]);
            });

            calculatedMotifScores = calculateMotifScores(inputRegions, filteredMotifs)
        }
        let numOverlappingMotifs: SequenceTableRow[] = []
        if (motifRankingScores && sequenceFilterVariables.numOverlappingMotifs) {
            numOverlappingMotifs = getNumOverlappingMotifs(inputRegions, filteredMotifs)
        }
        // Merge conservation scores and overlapping motifs
        const mergedRows = inputRegions.map(region => {
            const conservationRow = calculatedConservationScores.find(
                row => row.regionID === region.regionID
            )

            const motifScoresRow = calculatedMotifScores.find(
                row => row.regionID === region.regionID
            )

            const numOverlappingMotifsRow = numOverlappingMotifs.find(
                row => row.regionID === region.regionID
            )

            return {
                regionID: region.regionID,
                inputRegion: region,
                conservationScore: conservationRow?.conservationScore,
                motifScoreDelta: motifScoresRow?.motifScoreDelta,
                referenceAllele: motifScoresRow ? motifScoresRow.referenceAllele : {sequence: region.ref},
                alt: motifScoresRow ? motifScoresRow.alt : {sequence: region.alt},
                motifID: motifScoresRow?.motifID,
                numOverlappingMotifs: numOverlappingMotifsRow?.numOverlappingMotifs
            }
        })

        console.log(mergedRows)

        return mergedRows
        
    }, [conservationScores, inputRegions, loading_conservation_scores, motifRankingScores, sequenceFilterVariables])

    updateSequenceRows(sequenceRows)
    const loadingRows = loading_conservation_scores || loading_motif_ranking;
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
            cols.push({
                header: sequenceFilterVariables.motifScoreDelta ? "Reference Score" : "Reference",
                value: (row) => row.referenceAllele ? sequenceFilterVariables.motifScoreDelta ? row.referenceAllele.score : "N/A" : row.referenceAllele.sequence,
                render: (row) => sequenceFilterVariables.motifScoreDelta ? (
                    row.referenceAllele ? (
                        <Tooltip
                            title={
                                <span>
                                    {row.referenceAllele.sequence && (
                                        <>
                                            <strong>Allele:</strong> {row.referenceAllele.sequence}
                                        </>
                                    )}
                                </span>
                            }
                            arrow
                            placement="left"
                        >
                            <Typography fontSize={"14px"}>
                                {row.referenceAllele.score ? row.referenceAllele.score.toFixed(2) : "N/A"}
                            </Typography>
                        </Tooltip>
                    ) : "N/A") : (
                    row.referenceAllele.sequence
                )
            })
            cols.push({
                header: sequenceFilterVariables.motifScoreDelta ? "Alternate Score" : "Alternate",
                value: (row) => row.alt ? sequenceFilterVariables.motifScoreDelta ? row.alt.score : "N/A" : row.alt.sequence,
                render: (row) =>  sequenceFilterVariables.motifScoreDelta ? (
                    row.alt ? (
                    <Tooltip
                        title={
                            <span>
                                {row.alt.sequence && (
                                    <>
                                        <strong>Allele:</strong> {row.alt.sequence}
                                    </>
                                )}
                            </span>
                        }
                        arrow
                        placement="left"
                    >
                        <Typography fontSize={"14px"}>
                            {row.alt.score ? row.alt.score?.toFixed(2) : "N/A"}
                        </Typography>
                    </Tooltip>
                ) : "N/A") : (
                    row.alt.sequence
                )
            })
            if (sequenceFilterVariables.motifScoreDelta) { 
                cols.push({ header: "Difference", value: (row) => row.motifScoreDelta ? row.motifScoreDelta.toFixed(2) : "N/A" }) 
                cols.push({
                    header: "Motif ID",
                    value: (row) => row.motifID ? row.motifID : "None"
                })
            }
            // if (sequenceFilterVariables.overlapsTFPeak) { cols.push({ header: "Overlaps TF Peak", value: (row) => "N/A" }) }

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