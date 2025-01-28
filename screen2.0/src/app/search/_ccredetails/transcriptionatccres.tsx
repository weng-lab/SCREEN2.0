import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { useQuery } from "@apollo/client"
import { Typography } from "@mui/material";
import { ProCapPeaks_QUERY, TRANSCRIPTION_QUERY } from "./queries";
import { CreateLink } from "../../../common/lib/utility";

type Row = { 
    chromosome: string;
    start: number;
    stop: number;
    stringency?: string | null;
    celltype?: string | null;
    file_accession?: string | null;
    experiment_accession?: string | null;
}
  
function confidenceTooltip() {
    return (
      <div>
        {"Confidence about the peak pair. Can be: \nStringent(qval), which means the two peaks on both forward and reverse strands are significant based on their q-values; \nStringent(pval), which means one peak is significant according to q-value while the other one is significant according to p-value; \nRelaxed, which means only one peak is significant in the pair.\nWorld"}
      </div>
    );
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
      render: (row) => <Typography variant="body2" minWidth={'200px'} maxWidth={'400px'}>{ row.celltype.replaceAll('_', ' ').replaceAll('Homo sapiens', ' ').replace(/\w+[.!?]?$/, '')}</Typography>
    
    },
    {
      header: 'Confidence',
      value: (row) => row.stringency,
      tooltip:  <> Confidence about the peak pair. Can be: <br />
      - Stringent(qval), which means the two peaks on both forward and reverse strands are significant based on their q-values;<br /> 
      - Stringent(pval), which means one peak is significant according to q-value while the other one is significant according to p-value; <br />
      - Relaxed, which means only one peak is significant in the pair. <br />
      <CreateLink linkPrefix="https://github.com/hyulab/PINTS" label="https://github.com/hyulab/PINTS"></CreateLink>
      </>,
      
    },
    {
        header: 'Experiment Accession',
        value: (row) => row.experiment_accession,
        render: (row) => <CreateLink linkPrefix="https://www.encodeproject.org/experiments/" linkArg={row.experiment_accession} label={row.experiment_accession} showExternalIcon underline="hover" />
    },
];
  

export const TranscriptionAtcCREs = (props: { assembly: string, coordinates: { chromosome: string; start: number; end: number; } }) => {

    const { data: proCapData, loading, error} = useQuery(ProCapPeaks_QUERY, {
        variables: { chromosome: props.coordinates.chromosome, start: props.coordinates.start, stop: props.coordinates.end},
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first"
    })
  
    const { data: transcriptionData, loading: loadingTR, error: errorTR } = useQuery(TRANSCRIPTION_QUERY, {
        variables: { assembly: props.assembly,
                     chromosome: props.coordinates.chromosome, 
                     start: props.coordinates.start, 
                     stop: props.coordinates.end },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
    })
    if (loading || loadingTR) return 'Loading...';
    if (error || errorTR) return `Error! ${error.message}`;
    const tableTitle = props.assembly == "GRCh38" ? `Transcription Start Sites on Human cCREs` : `Transcription Start Sites on Mouse cCREs`;

    return <>
        <DataTable
            rows={proCapData?.proCapPeaksQuery || []}
            columns={ProCapPeaksColumns}
            tableTitle="Pro Cap Peaks"
            itemsPerPage={5}
            searchable={true}
        />
        <br></br>
        <DataTable
            tableTitle={tableTitle}
            columns={[
                    {
                        header: "Chromosome",
                        value: (row) => row.chromosome,
                    },
                    {
                        header: "Start",
                        value:  (row) => row.start.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ","),
                    },
                    {
                        header: "End",
                        value: (row) => row.stop.toString().replaceAll(/\B(?=(\d{3})+(?!\d))/g, ","),
                    },
                    {
                        header: "Biosample",
                        value: (row) => row.biosample.replaceAll('Homo sapiens', ' '),
                    },
                    {
                        header: "Accession",
                        value: (row) => row.experiment_accession,
                        render: (row) => <CreateLink linkPrefix="https://www.encodeproject.org/experiments/${row.experiment_accession}/" linkArg={row.experiment_accession} label={row.experiment_accession} showExternalIcon underline="hover" />
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
                        value: (row) => row.reads_per_million.toFixed(2),
                    }
                ]}
            rows={transcriptionData?.ccreTranscriptionQuery || []}
            itemsPerPage={5}
            searchable={true}
        />
    </>
}