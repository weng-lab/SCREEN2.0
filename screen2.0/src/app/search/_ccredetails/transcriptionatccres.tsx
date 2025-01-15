import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"

type Row = {
    id: number;
    chromosome: string;
    start: number;
    stop: number;
    cellType: string;
    stringency: string;
    experimentAccession: string;
  };
  
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
      header: 'Stop',
      value: (row) => row.stop.toLocaleString(),
    },
    {
      header: 'Cell Type',
      value: (row) => row.cellType,
    },
    {
      header: 'Stringency',
      value: (row) => row.stringency,
    },
    {
        header: 'Experiment Accession',
        value: (row) => row.experimentAccession,
    },
  ];
  

const ProCapPeaksMockData: Row[] = [
    { id: 1, chromosome: 'chr1', start: 100, stop: 200, cellType: 'N/A', stringency: 'N/A', experimentAccession: 'ENCFF560ALK' },
    { id: 2, chromosome: 'chr2', start: 300, stop: 400, cellType: 'N/A', stringency: 'N/A', experimentAccession: 'ENCSR273ORE' },
  ];

export const TranscriptionAtcCREs = (props: { coordinates }) => {
return <>
  <DataTable
      rows={ProCapPeaksMockData}
      columns={ProCapPeaksColumns}
      tableTitle="Pro Cap Peaks Data"
      itemsPerPage={5}
      searchable={true}
    />

</>
}