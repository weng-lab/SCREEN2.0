import { IconButton, Modal, Paper, Typography } from '@mui/material';
import { DataTable, DataTableColumn } from '@weng-lab/psychscreen-ui-components';
import React, { useMemo, useState } from 'react';
import { MotifQueryDataOccurrence, MotifQueryDataOccurrenceMotif, TomtomMatchQueryData } from '../types';
import { DNALogo } from 'logots-react';
import { TOMTOM_MATCH_QUERY } from '../queries';
import { useQuery } from '@apollo/client';
import CloseIcon from '@mui/icons-material/Close';

const PWMCell: React.FC<{
    peaks_accession: string;
    motif: MotifQueryDataOccurrenceMotif;
}> = ({ peaks_accession, motif: { pwm, id } }) => {
    const { data, error, loading } = useQuery<TomtomMatchQueryData>(
        TOMTOM_MATCH_QUERY,
        {
            variables: {
                peaks_accessions: peaks_accession,
                ids: id,
            },
        }
    );
    let matchLine = <></>;
    if (!loading && !error && data) {
        const match = data.target_motifs
            .slice()
            .filter((x) => x.e_value < 1e-5)
            .sort((a, b) => a.e_value - b.e_value)[0];
        if (match === undefined) {
            matchLine = <span>(no external database match)</span>;
        } else {
            const jasparName = match.jaspar_name ? `/${match.jaspar_name}` : "";
            const source = match.target_id.startsWith("MA") ? "JASPAR" : "HOCOMOCO";
            matchLine = <span>{`${match.target_id}${jasparName} (${source})`}</span>;
        }
    }
    return (
        <>
            <DNALogo ppm={pwm} height={50} />
            <br />
            {matchLine}
        </>
    );
};

type MotifsModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    chromosome: string;
    start: number;
    end: number;
    occurrences: MotifQueryDataOccurrence[];
};

const MotifsModal: React.FC<MotifsModalProps> = ({
    open,
    setOpen,
    chromosome,
    start: peakStart,
    end: peakEnd,
    occurrences,
}) => {
    const motifs = useMemo(
        () =>
            occurrences
                .slice()
                .sort((a, b) => a.genomic_region.start - b.genomic_region.start) || [],
        [occurrences]
    );
    const [page, setPage] = useState(1);
    const width = 500;
    const height = 25;
    const start = Math.min(peakStart, motifs[0]?.genomic_region.start || 0);
    const end = Math.max(
        peakEnd,
        motifs[motifs.length - 1]?.genomic_region.end || 0
    );
    const rangeSize = end - start;
    const pageSize = 4;
    const pageStart = Math.min(motifs.length - 1, (page - 1) * pageSize);
    const pageEnd = Math.min(motifs.length, (page - 1 + 1) * pageSize);
    const pageRangeStart = motifs[pageStart]?.genomic_region.start || 0;
    const pageRangeEnd = motifs[pageEnd - 1]?.genomic_region.end || 0;
    const pagePxStart = ((pageRangeStart - start) / rangeSize) * width;
    const pagePxEnd = ((pageRangeEnd - start) / rangeSize) * width;
    const firstY = height * 0.8;
    const secondY = firstY + height * 2;

    const handleDisplayedRowsChange = (newPage: number) => {
        setPage(newPage + 1);
    };

    const MOTIFS_COLS: DataTableColumn<MotifQueryDataOccurrence>[] = [
        {
            header: "Chromosome",
            value: (row) => row.genomic_region.chromosome,
        },
        {
            header: "Start",
            value: (row) => row.genomic_region.start,
            render: (row) => row.genomic_region.start.toLocaleString(),
        },
        {
            header: "Peaks file",
            value: (row) => row.peaks_accession,
        },
        {
            header: "PWM",
            value: () => "",
            render: (row) => (
                <PWMCell peaks_accession={row.peaks_accession} motif={row.motif} />
            ),
        },
        {
            header: "q value",
            value: (row) => row.q_value.toFixed(2),
        },
    ];

    const style = {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        width: 1000,
        p: 4,
    };

    const pageMotifs = motifs.slice(pageStart, pageEnd);
    const overlaps = (
        range: [number, number],
        instance: MotifQueryDataOccurrence
    ) =>
        instance.genomic_region.start < range[1] &&
        instance.genomic_region.end > range[0];
    let groupRange: [number, number] | undefined = undefined;
    const groups: MotifQueryDataOccurrence[][] = [];
    let group: MotifQueryDataOccurrence[] = [];
    for (let i = 0; i < pageMotifs.length; i++) {
        const instance = pageMotifs[i];
        if (groupRange === undefined) {
            groupRange = [instance.genomic_region.start, instance.genomic_region.end];
        }
        if (overlaps(groupRange, instance)) {
            group.push(instance);
            groupRange[1] = instance.genomic_region.end;
        } else {
            groups.push(group);
            group = [instance];
            groupRange = [instance.genomic_region.start, instance.genomic_region.end];
        }
    }
    groups.push(group);
    const peakView = (
        <svg width={width} height={height * 5}>
            <text textAnchor={"start"} dominantBaseline="hanging" x={0} y={0}>
                {start.toLocaleString()}
            </text>
            <text textAnchor={"end"} dominantBaseline="hanging" x={width} y={0}>
                {end.toLocaleString()}
            </text>
            <rect
                width={width}
                height={height}
                y={firstY}
                rx="5"
                style={{
                    fill: "grey",
                    strokeWidth: 3,
                    stroke: "none",
                }}
            />
            <g>
                {motifs.map((instance, i) => {
                    const motifStart = instance.genomic_region.start - start;
                    const motifEnd = instance.genomic_region.end - start;
                    const pxStart = (width * motifStart) / rangeSize;
                    const pxEnd = (width * motifEnd) / rangeSize;
                    return (
                        <rect
                            key={i}
                            width={pxEnd - pxStart}
                            height={height}
                            x={pxStart}
                            y={firstY}
                            style={{ fill: "red", opacity: "50%" }}
                        />
                    );
                })}
            </g>
            <line
                x1={pagePxStart}
                x2={0}
                y1={firstY + height}
                y2={secondY}
                style={{ stroke: "black", strokeWidth: "1px" }}
            />
            <line
                x1={pagePxEnd}
                x2={width}
                y1={firstY + height}
                y2={secondY}
                style={{ stroke: "black", strokeWidth: "1px" }}
            />
            <rect
                width={width}
                height={height}
                y={secondY}
                rx="5"
                style={{
                    fill: "grey",
                    strokeWidth: 3,
                    stroke: "none",
                }}
            />
            <g>
                {groups.flatMap((group, groupi) =>
                    group.map((instance, i) => {
                        const rangeSize = pageRangeEnd - pageRangeStart;
                        const start = instance.genomic_region.start - pageRangeStart;
                        const end = instance.genomic_region.end - pageRangeStart;
                        const pxStart = (width * start) / rangeSize;
                        const pxEnd = (width * end) / rangeSize;
                        return (
                            <rect
                                key={groupi * 100 + i}
                                x={pxStart}
                                width={pxEnd - pxStart}
                                y={secondY + i * (height / group.length)}
                                height={height / group.length}
                                rx={5}
                                style={{
                                    fill: "red",
                                    opacity: "50%",
                                    stroke: "darkred",
                                    strokeWidth: "1px",
                                }}
                            />
                        );
                    })
                )}
            </g>
            <text
                textAnchor={"start"}
                dominantBaseline="baseline"
                x={0}
                y={secondY + height * 1.8}
            >
                {pageRangeStart.toLocaleString()}
            </text>
            <text
                textAnchor={"end"}
                dominantBaseline="baseline"
                x={width}
                y={secondY + height * 1.8}
            >
                {pageRangeEnd.toLocaleString()}
            </text>
        </svg>
    );

    return (
        <Modal open={open} onClose={() => setOpen(false)}>
            <>
                <Paper sx={style}>
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpen(false)}
                        sx={{
                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: (theme) => theme.palette.grey[500],
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h4">
                        Motifs found in {chromosome}:{peakStart.toLocaleString()}-
                        {peakEnd.toLocaleString()}
                    </Typography>
                    <br />
                    <div style={{ display: "flex", justifyContent: "center" }}>
                        {peakView}
                    </div>
                    <br />
                    {motifs && (
                        <DataTable
                            searchable
                            columns={MOTIFS_COLS}
                            rows={motifs}
                            sortColumn={1}
                            key={"tfpeaks" + page}
                            onDisplayedRowsChange={handleDisplayedRowsChange}
                            sortDescending
                            itemsPerPage={pageSize}
                            page={page - 1}
                        />
                    )}
                </Paper>
            </>
        </Modal>
    );
};

export default MotifsModal;