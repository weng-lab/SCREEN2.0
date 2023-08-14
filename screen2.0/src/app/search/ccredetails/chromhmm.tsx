"use client"
import React, { useState, useEffect, cache, Fragment, useCallback } from "react"

import { DataTable } from "@weng-lab/ts-ztable"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import {
  Autocomplete,
  Box,
  Button,
  FormControlLabel,
  FormGroup,
  Slider,
  Switch,
  TextField,
  Typography,
  debounce,
  Popover,
  Alert,
  AlertTitle,
} from "@mui/material"
import { gql, useQuery } from "@apollo/client"
import { client } from "./client"
import { ErrorMessage, LoadingMessage } from "../../../common/lib/utility"

const CYTOBANDS_QUERY = gql`
  query cytobands($assembly: String!, $chromosome: String) {
    cytoband(assembly: $assembly, chromosome: $chromosome) {
      stain
      coordinates {
        chromosome
        start
        end
        __typename
      }
      __typename
    }
  }
`

const GENE_QUERY = gql`
  query Gene($chromosome: String, $assembly: String!, $start: Int, $end: Int) {
    gene(assembly: $assembly, chromosome: $chromosome, start: $start, end: $end) {
        strand
        name
        id
        transcripts {
            coordinates {
                start
                end
            }
            name
            id
            exons {
                coordinates {
                    start
                    end
                }
                UTRs {
                    coordinates {
                        start
                        end
                    }
                }
            }
        }
    }
  }
`

export const ChromHMM = (props: {assembly: string, accession: string}) => {
  const { loading, error, data } = useQuery(GENE_QUERY, {
    variables: {
      assembly: props.assembly === "GRCh38" ? "GRCh38" : "mm10",
      accession: props.accession,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })



  return props.assembly === "GRCh38" ? <></> : loading ? <LoadingMessage /> : error ? <ErrorMessage error={error}/> : (
    <Box>
      <DataTable
        tableTitle={`Linked cCREs in ${props.assembly == "GRCh38" ? "mm10" : "GRCh38"}`}
        rows={data}
        columns={[
          {
            header: "Tissue",
            value: (row: any) => row.accession
          },
          {
            header: "State",
            value: (row: any) => row.chrom
          },
          {
            header: "Start",
            value: (row: any) => row.end
          }
        ]}></DataTable>
    </Box>
  )
}