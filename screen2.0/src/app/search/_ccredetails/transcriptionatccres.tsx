import { DataTable } from "@weng-lab/psychscreen-ui-components"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { Link } from "@mui/material"
import {TRANSCRIPTION_QUERY} from "./queries"

export const TranscriptionData = (props: { assembly: string, coordinates: {chromosome: string, start: number, end: number} }) => {
    const { data, loading, error } = useQuery(TRANSCRIPTION_QUERY, {
        variables: { assembly: props.assembly,
                     chromosome: props.coordinates.chromosome, 
                     start: props.coordinates.start, 
                     stop: props.coordinates.end },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        client,
    });
    if (loading) return 'Loading...';
    if (error) return 'Error';
    const tableTitle = props.assembly == "GRCh38" ? `Transcription Start Sites on Human cCREs` : `Transcription Start Sites on Mouse cCREs`;
    return <>
        <DataTable
            tableTitle={tableTitle}
            columns={[
                {
                    header: "Chromosome",
                    value: (row) => row.chromosome,
                },
                {
                    header: "Start",
                    value: (row) => row.start,
                },
                {
                    header: "End",
                    value: (row) => row.stop,
                },
                {
                    header: "Biosample",
                    value: (row) => row.biosample,
                },
                {
                    header: "Accession",
                    value: (row) => row.experiment_accession,
                    render: (row) => <Link href={`https://www.encodeproject.org/experiments/${row.experiment_accession}`}> {row.experiment_accession} </Link>
                },
                {
                    header: "Sequencing platform",
                    value: (row) => row.sequencing_platform,
                },
                {
                    header: "Number of support reads",
                    value: (row) => row.number_of_support_reads,
                },
                {
                    header: "Reads per million",
                    value: (row) => row.reads_per_million,
                }
            ]}
            rows={data?.ccreTranscriptionQuery || []}
            itemsPerPage={5}
            searchable={true}
        />
    </>
}