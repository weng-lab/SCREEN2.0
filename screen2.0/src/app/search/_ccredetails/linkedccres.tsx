"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { ORTHOLOG_QUERY } from "./queries"
import Grid from "@mui/material/Grid2"
import { DataTable } from "psychscreen-legacy-components"
import { LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
import { Typography } from "@mui/material"

type orthologRow = {
  accession: string
  chrom: string
  start: number
  stop: number
}

type OrthologTabProps = {
  accession: string,
  assembly: "GRCh38" | "mm10"
}

export const Ortholog = ({ accession, assembly }: OrthologTabProps) => {
  const { loading, error, data } = useQuery(ORTHOLOG_QUERY, {
    variables: {
      assembly: assembly === "GRCh38" ? "grch38" : "mm10",
      accession: accession,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  const ortholog: orthologRow[] = []
  if (data && data.orthologQuery.length > 0) {
    for (const ccre of data.orthologQuery[0].ortholog) {
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
    <Grid container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
      <Grid
        size={{
          xs: 12,
          md: 12,
          lg: 12
        }}>
        <DataTable
          tableTitle={`Linked cCREs in ${assembly == "GRCh38" ? "mm10" : "GRCh38"}`}
          columns={[
            {
              header: "Accession",
              value: (row: orthologRow) => row.accession,
              render: (row: orthologRow) => <Typography variant="body2" color="primary" display="inline">
              
                <a key={row.accession} target="_blank" rel="noopener noreferrer" href={`/search?assembly=${assembly == "GRCh38" ? "mm10" : "GRCh38"}&chromosome=${row.chrom}&start=${row.start}&end=${row.stop}&accession=${row.accession}`}>
                  {row.accession}
                  
                </a>
              
            </Typography>
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
      </Grid>
    </Grid>
  );
}
