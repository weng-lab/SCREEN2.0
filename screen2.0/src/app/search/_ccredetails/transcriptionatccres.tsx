import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { useQuery } from "@apollo/client"
import { Link, Typography } from "@mui/material";
import { ProCapPeaks_QUERY, TRANSCRIPTION_QUERY } from "./queries";

   type Row = { 
    chromosome: string;
    start: number;
    stop: number;
    stringency?: string | null;
    celltype?: string | null;
    file_accession?: string | null;
    experiment_accession?: string | null;
}
  
  const ProCapPeaksColumns: DataTableColumn<Row>[] = [
    {
      header: 'Chromosome',
      value: (row) => row.chromosome,
    },
    {
      header: 'Start',
      value: (row) => row.start.toLocaleString(),
    },
    {
      header: 'End',
      value: (row) => row.stop.toLocaleString(),
    },
    {
      header: 'Cell Type',
      value: (row) => row.celltype.replaceAll('_', ' ').replaceAll('Homo sapiens', ' '),
      render: (row) => <Typography variant="body2" minWidth={'200px'} maxWidth={'400px'}>{ row.celltype.replaceAll('_', ' ').replaceAll('Homo sapiens', ' ')}</Typography>
    
    },
    {
      header: 'Stringency',
      value: (row) => row.stringency,
    },
    {
        header: 'Experiment Accession',
        value: (row) => row.experiment_accession,
        render: (row) => <Link href={`https://www.encodeproject.org/experiments/${row.experiment_accession}/`}> {row.experiment_accession} </Link>
    },
  ];
  

export const TranscriptionAtcCREs = (props: { assembly: string, coordinates: { chromosome: string; start: number; end: number; } }) => {

    const { proCapData, loadingPR, errorPR} = useQuery(ProCapPeaks_QUERY, {
        variables: { chromosome: props.coordinates.chromosome, start: props.coordinates.start, stop: props.coordinates.end},
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first"
    })

  
    const { transcriptionData, loadingTR, errorTR } = useQuery(TRANSCRIPTION_QUERY, {
        variables: { assembly: props.assembly,
                     chromosome: props.coordinates.chromosome, 
                     start: props.coordinates.start, 
                     stop: props.coordinates.end },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
    });
    if (loadingPR || loadingTR) return 'Loading...';
    if (errorPR || errorTR) return `Error! ${errorPR.message}`;
    const tableTitle = props.assembly == "GRCh38" ? `Transcription Start Sites on Human cCREs` : `Transcription Start Sites on Mouse cCREs`;

    return <>
        <DataTable
              rows={proCapData?.proCapPeaksQuery || []}
              columns={ProCapPeaksColumns}
              tableTitle="Pro Cap Peaks"
              itemsPerPage={5}
              searchable={true}
          />
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
                rows={transcriptionData?.ccreTranscriptionQuery || []}
                itemsPerPage={5}
                searchable={true}
            />

    </>
}