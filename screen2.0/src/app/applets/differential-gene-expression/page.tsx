"use client"
import { Box, TextField, Typography } from "@mui/material"
import React, { useState, useEffect, cache, Fragment, DO_NOT_USE_OR_YOU_WILL_BE_FIRED_EXPERIMENTAL_FORM_ACTIONS } from "react"
import { fetchServer } from "../../../common/lib/utility"
import { DataTable } from "@weng-lab/ts-ztable"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { ErrorMessage, LoadingMessage } from "../../../common/lib/utility"
import { payload, initialCellTypes, initialChart } from "./types"

type ccre = {
  accession: string,
  center: number,
  len: number,
  start: number,
  stop: number,
  typ: string,
  value: number,
  width: number
}

const geneRed = "#FF0000"
const geneBlue = "#1E90FF"

const SetRange_x = ({dr1, dr2}) => {
  let range: number[] = []
  let min_x: number = parseInt(dr1.toString()[0] + dr1.toString()[0] + "00000")
  let max_x: number = parseInt(dr2.toString()[0] + dr2.toString()[0] + "00000")
  max_x += 200000
  while (min_x < max_x){
    range.push(min_x)
    min_x += 200000
  }

  // const x_loc = (index: number) => {
  //   return index * 100
  // }

  return (
      range.map((x, i) => (<text key={x} x={i * 100} y="400">{x}</text>))
  )
}

const SetRange_y = ({ymin, ymax}) => {
  let range: number[] = []
  let min_y: number = parseInt(ymin.toString()[0]) - 0.5
  let max_y: number = parseInt(ymax.toString()[0]) + 0.5
  while (min_y < max_y){
    range.push(min_y)
    min_y += 0.5
  }

  return (
      range.map((y, i) => (<text x="80" y={i * 10}>{y}</text>))
  )
}

 /**
   * Returns a circle data point colored red for proximal-like and red for enhancer-like
   * @param point data point for ccre
   * @param typ proximal-like signature or enhancer-like signature
   * @returns data point
   */
 const Point = ({point}) => {
  let color: string = ""
  if (point.typ === "proximal-like signature") color = "red"
  else color = "yellow"
  
  return <circle key={point} cx={point.value} cy={point.center} data-value={point.value} r="4" stroke={color}></circle>
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
  const [ loading, setLoading ] = useState<boolean>(true)
  const [ loadingChart, setLoadingChart ] = useState<boolean>(true)
  const [ data, setData ] = useState(initialChart)
  const [ cellTypes, setCellTypes ] = useState(initialCellTypes)

  const [ ct1, setct1 ] = useState<string>("C57BL/6_limb_embryo_11.5_days")
  const [ ct2, setct2 ] = useState<string>("C57BL/6_limb_embryo_15.5_days")

  const [ dr1, setdr1 ] = useState<number>(0)
  const [ dr2, setdr2 ] = useState<number>(0)

  // TODO: not fetching correctly
  // fetch list of cell types
  useEffect(() => {
    fetch("https://storage.googleapis.com/gcp.wenglab.org/newV4/GRCh38.json")
      .then((response) => {
        if (!response.ok) {
          // throw new Error(response.statusText)
          return ErrorMessage(new Error(response.statusText))
        }
        return response.json()
      })
      .then((data) => {
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
        console.log(data)
        setData(data)
        // set domain range
        setdr1(data[data.gene].nearbyDEs.xdomain[0])
        setdr2(data[data.gene].nearbyDEs.xdomain[1])
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
      <Grid2 container spacing={3} sx={{mt: "2rem"}}>
        <Grid2 xs={4}>
          <Box ml={1}>
            {loading 
            ? LoadingMessage() 
            : cellTypes && 
              cellTypes["cellTypeInfoArr"] && (
              <DataTable
                tableTitle="Cell types"
                rows={cellTypes["cellTypeInfoArr"]}
                columns={[
                  { header: "Cell Type", value: (row: any) => row.biosample_summary },
                  { header: "Tissue", value: (row: any) => row.tissue }
                ]}
                onRowClick={(row: any) => {
                  setct1(row.value)
                }}
                sortDescending={true}
                searchable={true}
              />
            )}
          </Box>
          <Box ml={1} mt={1}>
            {loading 
            ? LoadingMessage() 
            : cellTypes && 
              cellTypes["cellTypesInfoArr"] && (
              <DataTable
                tableTitle="Cell types 2"
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
            {loadingChart 
            ? LoadingMessage() 
            : data && data.gene && data[data.gene] && data[data.gene].xdomain &&
            (
              <Fragment>
                <Box
                component="form"
                sx={{
                  '& > :not(style)': { m: 1, width: '25ch' },
                }}
                noValidate
                autoComplete="off"
                >
                  <Typography variant="h5">Domain Range</Typography>
                  <TextField 
                  id="outlined-basic" 
                  label={dr1} 
                  variant="outlined"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setdr1(parseInt(event.target.value));
                  }} 
                  />
                  <Typography display="inline">to</Typography>
                  <TextField 
                  id="outlined-basic" 
                  label={dr1} 
                  variant="outlined"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setdr2(parseInt(event.target.value));
                  }}
                  />
                </Box>
                <Box mt={1}>
                  {/* <div> */}
                  <svg className="chart" width={420} height={150} aria-labelledby="title desc" role="img">
                    <title id="title">this is a chart</title>
                    <desc id="desc">some description</desc>
                    <g className="grid x-grid" id="xGrid">
                      <line x1="90" x2="90" y1="5" y2="371"></line>
                    </g>
                    <g className="grid y-grid" id="yGrid">
                      <line x1="90" x2="705" y1="370" y2="370"></line>
                    </g>
                    <g className="labels x-labels">
                      {/* {setRange_x(dr1, dr2)} */}
                      <SetRange_x dr1={dr1} dr2={dr2}/>
                    </g>
                    <g className="labels y-labels">
                      <SetRange_y ymin={data[data.gene].nearbyDEs.ymin} ymax={data[data.gene].nearbyDEs.ymax} />
                      {/* <text x="50" y="200" className="label-title">log2 gene expression fold change</text> */}
                    </g>
                    <g className="data" data-setname="Our first data set">
                      <circle cx={data[data.gene].diffCREs.data.value} cy={data[data.gene].diffCREs.data.center} data-value={data[data.gene].diffCREs.data.value} r="4" stroke="red"></circle>
                      {/* {data[data.gene].diffCREs.data.map((point) => (
                        "proximal-like signature" === point.typ 
                        ? <circle key={point} cx={point.value} cy={point.center} data-value={point.value} r="4" stroke="red"></circle> 
                        : <circle key={point} cx={point.value} cy={point.center} data-value={point.value} r="4" stroke="yellow"></circle>
                        <circle key={point} cx={point.value} cy={point.center} data-value={point.value} r="4" stroke="red"></circle>
                        <Point point={point} />
                      ))} */}
                    </g>
                  </svg>
                  {/* </div> */}
                </Box>
              </Fragment>
            )}
          </Box>
        </Grid2>
      </Grid2>
    </main>
  )
}