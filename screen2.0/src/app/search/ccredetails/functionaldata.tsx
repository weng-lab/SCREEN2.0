"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { FUNCTIONAL_DATA_QUERY } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { LoadingMessage, ErrorMessage } from "../../../common/lib/utility"

export const FunctionData = ({ coordinates , assembly }) => {
  const { loading, error, data } = useQuery(FUNCTIONAL_DATA_QUERY, {
    variables: {
      assembly: assembly === "GRCh38" ? "grch38" : "mm10",
      coordinates,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

 
  return loading ? (
    <LoadingMessage />
  ) : error ? (
    <ErrorMessage error={error} />
  ) : (
    <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
      <Grid2 xs={12} md={12} lg={12}>
        <DataTable
          tableTitle={`Mouse transgenic enhancer assays`}
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
              header: "Stop",
              value: (row) => row.stop,
            },
            {
              header: "Element Id",
              value: (row) => row.element_id,
            },
            {
              header: "Assay Result",
              value: (row) => row.assay_result,
            },
            {
                header: "Tissues [number of embryos positive/number of embryos negative]",
                value: (row) => row.tissues,
            }
          ]}
          rows={data.functionalCharacterizationQuery || []}
          sortColumn={3}
          itemsPerPage={5}
        />
      </Grid2>
    </Grid2>
  )
}
