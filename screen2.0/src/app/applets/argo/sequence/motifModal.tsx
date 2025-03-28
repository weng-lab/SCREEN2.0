import { IconButton, Modal, Paper, Tooltip, Typography } from '@mui/material';
import { DataTable, DataTableColumn } from '@weng-lab/psychscreen-ui-components';
import React, { useMemo, useState } from 'react';
import { MotifQueryDataOccurrence, MotifQueryDataOccurrenceMotif, TomtomMatchQueryData } from '../types';
import { DNALogo } from 'logots-react';
import { TOMTOM_MATCH_QUERY } from '../queries';
import { useQuery } from '@apollo/client';
import CloseIcon from '@mui/icons-material/Close';
import Link from 'next/link';

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

export type MotifProps = {
    referenceAllele: {
        sequence: string;
        score?: number;
    }
    alt: {
        sequence: string;
        score?: number;
    }
    diff: number;
    motifID: string;
}

type MotifsModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    chromosome: string;
    start: number;
    end: number;
    motifs: MotifProps[]
};

const MotifsModal: React.FC<MotifsModalProps> = ({
    open,
    setOpen,
    chromosome,
    start: peakStart,
    end: peakEnd,
    motifs,
}) => {

    const MOTIFS_COLS: DataTableColumn<MotifProps>[] = [
        {
            header: "Reference Score",
            value: (row) => row.referenceAllele && row.referenceAllele.score ? row.referenceAllele.score : "N/A",
            render: (row) =>
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
                            {row.referenceAllele.score ? Number(row.referenceAllele.score).toFixed(2) : "N/A"}
                        </Typography>
                    </Tooltip>
                ) : "N/A"
        },
        {
            header: "Alternate Score",
            value: (row) => row.alt && row.alt.score ? row.alt.score : "N/A",
            render: (row) =>
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
                ) : "N/A"
        },
        {
            header: "Delta",
            value: (row) => row.diff || row.diff === 0 ? row.diff.toFixed(2) : "N/A"
        },
        {
            header: "Motif ID",
            value: (row) => row.motifID ? row.motifID : "None",
            render: row => row.motifID ? (
                <Tooltip
                    title={"Open Motif In HOCOMOCO"}
                    arrow
                    placement="left"
                >
                    <Link
                        href={`https://hocomoco12.autosome.org/motif/${row.motifID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#007bff", textDecoration: "none" }}
                    >
                        {row.motifID}
                    </Link>
                </Tooltip>
            ) : "None"
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
                    <Typography>
                        <b>Reference Allele: </b>{motifs[0].referenceAllele.sequence}
                    </Typography>
                    <Typography>
                        <b>Alternate Allele: </b>{motifs[0].alt.sequence}
                    </Typography>
                    <br/>
                    {motifs && (
                        <DataTable
                            searchable
                            columns={MOTIFS_COLS}
                            rows={motifs}
                            sortColumn={2}
                            key={"tfpeaks"}
                            itemsPerPage={10}
                        />
                    )}
                </Paper>
            </>
        </Modal>
    );
};

export default MotifsModal;