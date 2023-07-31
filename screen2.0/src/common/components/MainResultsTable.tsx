"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { DataTable, DataTableProps, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import React from "react"
import { Box, Button, Typography } from "@mui/material"
import Link from "next/link"
import { ObjectFlags } from "typescript"

let COLUMNS = (rows) => {
  // can prob just use link instead here
  const router = useRouter()
  const pathname = usePathname()
  const searchParams: any = useSearchParams()!

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )

  let col: DataTableColumn<any>[] = [
    {
      header: "Accession",
      value: (row: { accession: string }) => row.accession,
    },
    {
      header: "Class",
      value: (row: { class: string }) => row.class,
    },
    {
      header: "Chr",
      value: (row: { chromosome: any }) => row.chromosome,
    },
    {
      header: "Start",
      value: (row: { start: number }) => row.start,
    },
    {
      header: "End",
      value: (row: { end: number }) => row.end,
    },
    {
      header: "ATAC",
      value: (row: { atac: number }) => row.atac,
    },
  ]

  if (rows[0] && rows[0].dnase !== null) {
    col.push({
      header: "DNase",
      value: (row) => (row.dnase && row.dnase.toFixed(2)) || 0,
    })
  }
  if (rows[0] && rows[0].ctcf !== null) {
    col.push({
      header: "CTCF",
      value: (row) => (row.ctcf && row.ctcf.toFixed(2)) || 0,
    })
  }
  if (rows[0] && rows[0].h3k27ac != null) {
    col.push({
      header: "H3K27ac",
      value: (row) => (row.h3k27ac && row.h3k27ac.toFixed(2)) || 0,
    })
  }
  if (rows[0] && rows[0].h3k4me3 != null) {
    col.push({
      header: "H3K4me3",
      value: (row) => (row.h3k4me3 && row.h3k4me3.toFixed(2)) || 0,
    })
  }

  //Is there a good way to sort linked genes? Set to "" because I'm not sure
  col.push({
    header: "Linked\u00A0Genes\u00A0(Distance)",
    value: (row) => "",
    render: (row) => (
      <Box>
        <Typography variant="body2" display="inline">
          {`PC: `}
        </Typography>
        <Typography variant="body2" color="primary" display="inline">
          {Object.values(row.linkedGenes.pc).map((gene: { name: string; __typename: string }, i: number) => (
            <a key={i} target="_blank" rel="noopener noreferrer" href={`/applets/gene-expression?gene=${gene.name}`}>
              {i < row.linkedGenes.all.length - 1 ? `\u00A0${gene.name}, ` : `\u00A0${gene.name}`}
            </a>
          ))}
        </Typography>
        <Typography></Typography>
        <Typography variant="body2" display="inline">
          {`All: `}
        </Typography>
        <Typography variant="body2" color="primary" display="inline">
          {Object.values(row.linkedGenes.all).map((gene: { name: string; __typename: string }, i: number) => (
            <a key={i} target="_blank" rel="noopener noreferrer" href={`/applets/gene-expression?gene=${gene.name}`}>
              {i < row.linkedGenes.all.length - 1 ? `\u00A0${gene.name}, ` : `\u00A0${gene.name}`}
            </a>
          ))}
        </Typography>
      </Box>
    ),
  })

  return col
}

function MainResultsTable(props: Partial<DataTableProps<any>>) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams: any = useSearchParams()!

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    },
    [searchParams]
  )
  console.log(props.rows)

  return (
    <DataTable
      key={props.rows[0] && props.rows[0].dnase + props.rows[0].ctcf + props.rows[0].h3k27ac + props.rows[0].h3k4me3}
      rows={props.rows || []}
      columns={COLUMNS(props.rows)}
      itemsPerPage={props.itemsPerPage}
      searchable
      onRowClick={(r) => {
        router.push(pathname + "?" + createQueryString("accession", r.accession))
      }}
      tableTitle={props.tableTitle}
      sortColumn={6}
    />
  )
}

export default MainResultsTable
