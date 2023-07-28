"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { ORTHOLOG_QUERY } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { createLink, LoadingMessage, ErrorMessage } from "../../../common/lib/utility"

type orthologRow = {
  accession: string
  chrom: string
  start: number
  stop: number
}

export const Ortholog = ({ accession, assembly }) => {
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
          tableTitle={`Linked cCREs in ${assembly == "GRCh38" ? "mm10" : "GRCh38"}`}
          columns={[
            {
              header: "Accession",
              value: (row: orthologRow) => row.accession,
            },
            {
              header: "Chromosome",
              value: (row: orthologRow) => row.chrom,
            },
            {
              header: "Start",
              value: (row: orthologRow) => row.start,
            },
            {
              header: "Stop",
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
