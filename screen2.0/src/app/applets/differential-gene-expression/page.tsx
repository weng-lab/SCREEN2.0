"use client"
import { Box, Typography } from "@mui/material"
import React, { useState, useEffect, cache } from "react"
import { fetchServer } from "../../../common/lib/utility"
import { DataTable } from "@weng-lab/ts-ztable"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { ErrorMessage, LoadingMessage } from "../../../common/lib/utility"

const payload = JSON.stringify({
  "assembly": "mm10",
  "gene": "Gm25142",
  "uuid": "62ba8f8c-8335-4404-8c48-b569cf401664",
  "ct1": "C57BL/6_limb_embryo_11.5_days",
  "ct2": "C57BL/6_limb_embryo_15.5_days"
})

/**
 * define types for list of cell types
 */
const initialCellTypes = {
  "cellTypeInfoArr": [
    {
      "assay": "DNase",
      "cellTypeDesc": "with mild cognitive impairment; head of caudate nucleus tissue female adult (89 years)",
      "cellTypeName": "with_mild_cognitive_impairment_head_of_caudate_nucleus_tissue_female_adult_89_years_ENCDO896WHW",
      "biosample_summary": "with mild cognitive impairment; head of caudate nucleus tissue female adult (89 years)",
      "biosample_type": "tissue",
      "name": "head of caudate nucleus (mild cognitive impairment)",
      "expID": "ENCSR334MDJ",
      "isde": false,
      "fileID": "ENCFF193ZCX",
      "synonyms": null,
      "tissue": "brain",
      "rnaseq": false,
      "checked": false,
      "value": "with_mild_cognitive_impairment_head_of_caudate_nucleus_tissue_female_adult_89_years_ENCDO896WHW"
    },
  ]
}

/**
 * define types for cell info fetch
 */
const initialChart = {
  Gm25142: {
    xdomain: [ 4818163.5, 5818163.5 ],
    coord: { chrom: 'chr11', start: 5251850, end: 5251956 },
    diffCREs: { data: [Array] },
    nearbyDEs: {
      names: [Array],
      data: [Array],
      xdomain: [Array],
      genes: [Array],
      ymin: -1.066,
      ymax: 2.958
    }
  },
  assembly: 'mm10',
  gene: 'Gm25142',
  ct1: 'C57BL/6_limb_embryo_11.5_days',
  ct2: 'C57BL/6_limb_embryo_15.5_days'
}

/**
 * server fetch for list of cell types
 */
const getCellTypes = cache(async () => {
  const cellTypes = await fetch("https://storage.googleapis.com/gcp.wenglab.org/newV4/GRCh38.json")
  return cellTypes
})

/**
 * server fetch for cell info
 */
const getCellInfo = cache(async () => {
  const cellInfo = await fetchServer("https://screen-beta-api.wenglab.org/dews/search", payload)
  return cellInfo
})

export default function DifferentialGeneExpression() {
  const [ loading, setLoading ] = useState(true)
  const [ loadingChart, setLoadingChart ] = useState(true)
  const [ data, setData ] = useState(initialChart)
  const [ cellTypes, setCellTypes ] = useState(initialCellTypes)
  const [ ct1, setct1 ] = useState("C57BL/6_limb_embryo_11.5_days")
  const [ ct2, setct2 ] = useState("C57BL/6_limb_embryo_15.5_days")

  // TODO: not fetching correctly
  // fetch list of cell types
  useEffect(() => {
    fetch("https://storage.googleapis.com/gcp.wenglab.org/newV4/GRCh38.json", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST"
    })
      .then((response) => {
        if (!response.ok) {
          // throw new Error(response.statusText)
          return ErrorMessage(new Error(response.statusText))
        }
        return response.json()
      })
      .then((data) => {
        console.log(data)
        setCellTypes(data)
        setLoading(false)
      })
      .catch((error: Error) => {
        // logging
        // throw error
        return ErrorMessage(error)
      })
    setLoading(true)
  }, [])

  // fetch cell info
  useEffect(() => {
    fetch("https://screen-beta-api.wenglab.org/dews/search", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        assembly: "mm10",
        gene: "Gm25142",
        uuid: "62ba8f8c-8335-4404-8c48-b569cf401664",
        ct1: ct1,
        ct2: ct2
      }),
    })
      .then((response) => {
        if (!response.ok) {
          // throw new Error(response.statusText)
          return ErrorMessage(new Error(response.statusText))
        }
        return response.json()
      })
      .then((data) => {
        setData(data)
        setLoadingChart(false)
      })
      .catch((error: Error) => {
        // logging
        // throw error
        return ErrorMessage(error)
      })
    setLoadingChart(true)
  }, [ ct1, ct2 ])

  // server
  // const data1 = await fetchServer("https://screen-beta-api.wenglab.org/dews/search", payload)
  // const cellInfo = await getCellInfo()
  // const cellTypes2 = await getCellTypes()

  // console.log(cellTypes["cellTypeInfoArr"])
  // console.log(cellInfo)
  // console.log(data1)
  // console.log(data)

  return (
    <main>
      <Grid2 container spacing={2} sx={{mt: "2rem"}}>
        <Grid2 xs={4}>
          <Box ml={1}>
            {loading 
            ? LoadingMessage() 
            : cellTypes && 
              cellTypes["cellTypeInfoArr"] && (
              <DataTable
                rows={cellTypes["cellTypeInfoArr"]}
                columns={[
                  { header: "Cell Type", value: (row: any) => row.biosample_summary },
                  { header: "Tissue", value: (row: any) => row.tissue }
                ]}
                onRowClick={(row: any) => {
                  setct1(row.value)
                }}
              />
            )}
          </Box>
          <Box ml={1} mt={1}>
            {loading 
            ? LoadingMessage() 
            : cellTypes && 
              cellTypes["cellTypesInfoArr"] && (
              <DataTable
                rows={cellTypes["cellTypeInfoArr"]}
                columns={[
                  { header: "Cell Type", value: (row: any) => row.biosample_summary },
                  { header: "Tissue", value: (row: any) => row.tissue }
                ]}
                onRowClick={(row: any) => {
                  setct2(row.value)
                }}
              />
            )}
          </Box>
        </Grid2>
        <Grid2 xs={8}>
          <Box mb={1}>
            {loadingChart ? LoadingMessage() : <Typography>chart</Typography>}
          </Box>
        </Grid2>
      </Grid2>
    </main>
  )
}