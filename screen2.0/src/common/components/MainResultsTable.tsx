"use client"
import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { DataTable, DataTableProps } from "@weng-lab/psychscreen-ui-components"
import React from "react"

let COLUMNS = (rows) => {
  
  let col = [
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
    }
  ]

  if(rows && rows[0].dnase!==null)
  {
    console.log(rows[0].dnase,"dnase")
      col.push({
        header: "DNase",
        value: (row) => (row.dnase && row.dnase.toFixed(2)) || 0,
    })
  }

  if(rows &&  rows[0].ctcf!==null )
  {
    console.log(rows[0].ctcf,"ctcf")
    col.push({
      header: "CTCF",
      value: (row) => (row.ctcf && row.ctcf.toFixed(2)) || 0,
    })
  }
  if(rows &&  rows[0].h3k27ac!=null )
  {
    col.push({
      header: "H3K27ac",
      value: (row) => (row.h3k27ac && row.h3k27ac.toFixed(2)) || 0,
    })
  }
  if(rows &&  rows[0].h3k4me3!=null )
  {
    col.push({
      header: "H3K4me3",
      value: (row) => (row.h3k4me3 && row.h3k4me3.toFixed(2)) || 0,
    })
  }

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
  
 
  return (
    <DataTable
      key={props.rows[0].dnase+props.rows[0].ctcf+props.rows[0].h3k27ac+props.rows[0].h3k4me3}
      rows={props.rows || [{}]}
      columns={COLUMNS(props.rows)}
      itemsPerPage={props.itemsPerPage}
      searchable
      onRowClick={(r) => {
        router.push(pathname + "?" + createQueryString("accession", r.accession))
      }}
      tableTitle={props.tableTitle}
      sortColumn={5}
    />
  )
}

export default MainResultsTable
