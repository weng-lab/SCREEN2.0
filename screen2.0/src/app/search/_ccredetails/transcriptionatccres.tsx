import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"

type Row = {
    chromosome: string;
    start: number;
    stop: number;
    biosample: string;
    experiment_accession: string;
    sequencing_platform: string;
    number_of_support_reads: number;
    reads_per_million: number;
};

const TranscriptionColumns: DataTableColumn<Row>[] = [
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
];

const DummyData: Row[] = [
    {
        chromosome: "chr1", 
        start: 1000,
        stop: 2000,
        biosample: "brain",
        experiment_accession: "EH38E3018689",
        sequencing_platform: "Illumina",
        number_of_support_reads: 12,
        reads_per_million: 10
    },
    {
        chromosome: "chr1", 
        start: 2000,
        stop: 4000,
        biosample: "liver",
        experiment_accession: "EH38E3018691",
        sequencing_platform: "Illumina",
        number_of_support_reads: 12,
        reads_per_million: 10
    }
];

export const TranscriptionAtcCREs = (props: { coordinates }) => {
    return <>
            <DataTable
                tableTitle={'Transcription start sites on cCREs'}
                rows={DummyData}
                columns={TranscriptionColumns}
                itemsPerPage={5}
                searchable={true}
            />  
    </>
}