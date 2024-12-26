import React, { useMemo, useState } from "react";
import { MotifQueryDataOccurrence, SequenceTableProps, SequenceTableRow } from "../types";
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components";
import MotifsModal from "../motifModal";

const SequenceTable: React.FC<SequenceTableProps> = ({
    sequenceFilterVariables,
    SubTableTitle,
    sequenceRows
}) => {
    const [modalData, setModalData] = useState<{
        open: boolean;
        chromosome: string;
        start: number;
        end: number;
        occurrences: MotifQueryDataOccurrence[];
    } | null>(null);

    //handle column changes for the Sequence rank table
    const sequenceColumns: DataTableColumn<SequenceTableRow>[] = useMemo(() => {

        const cols: DataTableColumn<SequenceTableRow>[] = [
            { header: "Region ID", value: (row) => row.regionID },
        ]

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
    
    return (
        <>
            <DataTable
                columns={sequenceColumns}
                rows={sequenceRows}
                sortDescending
                itemsPerPage={10}
                searchable
                tableTitle={<SubTableTitle title="Sequence Details" />}
            />
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