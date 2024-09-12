"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { ORTHOLOG_QUERY } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
import { Typography } from "@mui/material"

type orthologRow = {
  accession: string
  chrom: string
  start: number
  stop: number
}

export const OverlappingPeaks = ({ accession, assembly }) => {
  const { loading, error, data } = useQuery(ORTHOLOG_QUERY, {
    variables: {
      assembly: assembly === "GRCh38" ? "grch38" : "mm10",
      accession: accession,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  let ortholog: orthologRow[] = []
  if (data) {
    for (let ccre of data.orthologQuery.ortholog) {
      ortholog.push({
        accession: ccre.accession,
        chrom: ccre.chromosome,
        start: ccre.start,
        stop: ccre.stop,
      })
    }
  }

  return loading ? (
    <LoadingMessage />
  ) : error ? (
    <ErrorMessage error={error} />
  ) : (
    <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
      <Grid2 xs={12} md={12} lg={12}>
        <DataTable
          tableTitle="RAMPAGE Peaks Directly Overlapping cCREs"
          columns={[
            {
              header: "RAMPAGE Peak ID",
              value: (row: orthologRow) => row.accession,
              render: (row: orthologRow) => <Typography variant="body2" color="primary" display="inline">
              
                <a key={row.accession} target="_blank" rel="noopener noreferrer" href={`/search?assembly=${assembly == "GRCh38" ? "mm10" : "GRCh38"}&chromosome=${row.chrom}&start=${row.start}&end=${row.stop}&accession=${row.accession}`}>
                  {row.accession}
                  
                </a>
              
            </Typography>
            },
            {
              header: "Type of Peak",
              value: (row: orthologRow) => row.chrom,
            },
            {
              header: "Associated Gene",
              value: (row: orthologRow) => row.start,
            },
            {
              header: "Expression",
              value: (row: orthologRow) => row.stop,
            },
          ]}
          rows={ortholog}
          sortColumn={0}
          itemsPerPage={5}
        />
      </Grid2>
    </Grid2>
  )
}
