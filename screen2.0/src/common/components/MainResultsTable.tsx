"use client"

import { DataTable, DataTableProps } from "@weng-lab/psychscreen-ui-components"

const COLUMNS = [{
  header: "Accession",
  value: (row: { accession: string; }) => row.accession
}, {
  header: "Class",
  value: (row: { class: string; }) => row.class
}, {
  header: "Chr",
  value: (row: { chromosome: any; }) => row.chromosome,
},
{
  header: "Start",
  value: (row: { start: number; }) => row.start
},
{
  header: "End",
  value: (row: { end: number; }) => row.end
},
{
  header: "DNase",
  value: (row: { dnase: number; }) => row.dnase
},
{
  header: "ATAC",
  value: (row: { atac: number; }) => row.atac
},
{
  header: "H3K4me3",
  value: (row: { h3k4me3: number; }) => row.h3k4me3
},
{
  header: "H3K27ac",
  value: (row: { h3k27ac: number; }) => row.h3k27ac
},
{
  header: "CTCF",
  value: (row: { ctcf: number; }) => row.ctcf
},
];

function MainResultsTable(props: Partial<DataTableProps<any>>) {
  return (
    <DataTable
      rows={props.rows || [{}]}
      columns={COLUMNS}
      itemsPerPage={props.itemsPerPage}
      searchable
      tableTitle={props.tableTitle}
      sortColumn={5}
    />
  )
}

export default MainResultsTable