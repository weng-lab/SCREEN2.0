"use client"
import { Box, TextField, Typography } from "@mui/material"
import React, { useState, useEffect, cache, Fragment, useRef } from "react"
import { fetchServer } from "../../../common/lib/utility"
import { DataTable } from "@weng-lab/ts-ztable"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { ErrorMessage, LoadingMessage } from "../../../common/lib/utility"
import { payload, initialCellTypes, initialChart } from "./types"
import { Point2D, Range2D, linearTransform2D } from 'jubilant-carnival'

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

/**
 * Sets and labels the x-axis
 * @param {Range2D, Range2D} // x axis range for graph and y axis range for the dimensions  
 * @returns list of labels along the x-axis
 */
const SetRange_x = ({dr1, dr2, range, dimensions}) => {
  let range_x: number[] = []
  let zeros: string = "00000"

  // change margins of x-axis based on the difference in range
  // if (range.x.end - range.x.start > 100) {
  //   zeros = ""
  //   let j: number = (range.x.end - range.x.start).toString().length - 2
  //   while (j > 0){
  //     zeros += "0"
  //     j -= 1
  //   }
  // }

  // round and create list of labels
  let min_x: number = parseInt(range.x.start.toString()[0] + range.x.start.toString()[1] + zeros)
  let max_x: number = parseInt(range.x.end.toString()[0] + range.x.end.toString()[1] + zeros)
  // max_x += 100000
  // max_x += parseInt("1" + zeros)

  while (min_x <= max_x){
    // if (min_x / 100000 % 2 === 0)
    range_x.push(min_x)
    min_x += parseInt("1" + zeros)
  }

  // line and label
  const Axis_name = ({x, label, zeros}) => {
    if (label / parseInt("1" + zeros) % 2 === 0)
      return (
        <Fragment>
          <text x={x - 35} y="500">{label}</text>
          <line x1={x} x2={x} y1={450} y2={470} stroke="black"></line>
        </Fragment>
      )
    else 
      return (
        <Fragment>
          <line x1={x} x2={x} y1={450} y2={470} stroke="black"></line>
        </Fragment>
      )
  }

  // create point and transform
  const x_axis = (x: number) => {
    const p: Point2D = ({x: x, y: range.y.start})
    const t = linearTransform2D(range, dimensions)(p)
    // return <text x={t.x} y="500">{x}</text>
    return (
      <Axis_name x={t.x} label={x} zeros={zeros}/>
    )
  }

  return (
      range_x.map((x: number, i: number) => (x_axis(x)))
  )
}

/**
 * Sets and labels the y-axis
 * @param {Range2D, Range2D} // y axis range for graph and y axis range for the dimensions  
 * @returns list of labels along the y-axis
 */
const SetRange_y = ({ymin, ymax, range, dimensions}) => {
  let range_y: number[] = []
  let min_y: number = 0
  if (ymin < 0)
    min_y = parseInt(ymin.toString()[0] + (ymin - 0.5).toString()[1]) - 0.5
  else
    min_y= parseInt((ymin - 0.5).toString()[0]) - 0.5
  let max_y: number = parseInt((ymax + 0.5).toString()[0]) + 0.5

  if (max_y > (0.5 + ymax)) max_y -= 0.5
  if (min_y < (ymin - 0.5)) min_y += 0.5

  while (min_y <= max_y){
    range_y.push(min_y)
    min_y += 0.5
  }

  const y_axis = (y: number, i: number, range_y: number[]) => {
    const p: Point2D = ({x: range.x.start, y: y})
    const t = linearTransform2D(range, dimensions)(p)
    let r: number = range_y[range_y.length]
    if (range_y[i+1])
      r = linearTransform2D(range, dimensions)({x: range.x.start, y: range_y[i+1]}).y
    // const y_dim = 500 - t.y

    // dotted line for 0
    const Dotted = ({y}) => {
      let i: number = 0
      let r: number[]  = []
      while (i < 80){
        r.push(i)
        i += 1
      }

      return r.map((i: number) => (
        <line x1={100+i*10} x2={100+i*10+3} y1={y} y2={y} stroke="black"></line>
      ))
    }

    if (y === 0.0)
      return (
        <Fragment>
          <text x="25" y={t.y + 5}>{y}</text>
          <line x1={75} x2={100} y1={t.y} y2={t.y} stroke="black"></line>
          <Dotted y={t.y}/>
          <line x1={900} x2={925} y1={t.y} y2={t.y} stroke="black"></line>
          <text x="950" y={t.y + 5}>{y}</text>
        </Fragment>
      )
    else
      return (
        <Fragment>
          <text x="25" y={t.y + 5}>{y}</text>
          <line x1={75} x2={100} y1={t.y} y2={t.y} stroke="black"></line>
          <rect x={75} y={r} width={20} height={t.y-r} fill="#6A9A17"></rect>
          <line x1={900} x2={925} y1={t.y} y2={t.y} stroke="black"></line>
          <text x="950" y={t.y + 5}>{y}</text>
        </Fragment>
      )
  }

  return (
      range_y.map((y: number, i : number) => (y_axis(y, i, range_y)))
  )
}

 /**
   * Returns a circle data point colored red for proximal-like and red for enhancer-like
   * @param point data point for ccre
   * @param typ proximal-like signature or enhancer-like signature
   * @returns data point
   */
 const Point = ({point, i, range, dimensions}) => {
  const p : Point2D = ({x: point.center, y: point.value})
  if (p.x > range.x.end || p.x < range.x.start || p.y > range.y.end || p.y < range.y.start) return <></>
  const t = linearTransform2D(range,dimensions)(p)
  
  // promotor or enhancer
  let color: string = ""
  if (point.typ[3] === "m") color = "red"
  else color = "#FFC95F"
  // const y_dim = 450 - t.y

  return <circle key={i} cx={t.x} cy={t.y} r="3" fill={color}></circle>
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

  const [ range, setRange ] = useState<Range2D>({x: {start: dr1, end: dr2}, y: {start: 0, end: 0}})
  const [ dimensions, setDimensions ] = useState<Range2D>({x: {start: 100, end: 900}, y: {start: 450, end: 50}})

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
        // console.log(data)
        setData(data)

        // set domain range
        setdr1(data[data.gene].nearbyDEs.xdomain[0])
        setdr2(data[data.gene].nearbyDEs.xdomain[1])

        let min_x: number = parseInt(dr1.toString()[0] + dr1.toString()[1] + "00000")
        let max_x: number = parseInt(dr2.toString()[0] + dr2.toString()[1] + "00000")
        max_x += 100000
        
        let ymin: number = data[data.gene].nearbyDEs.ymin
        let ymax: number = data[data.gene].nearbyDEs.ymax
        let min_y: number = 0.0        
        if (ymin < 0)
          min_y = parseInt(ymin.toString()[0] + (ymin - 0.5).toString()[1]) - 0.5
        else
          min_y= parseInt((ymin - 0.5).toString()[0]) - 0.5
        let max_y: number = parseInt((ymax + 0.5).toString()[0]) + 0.5

        if (max_y > (0.5 + ymax)) max_y -= 0.5
        if (min_y < (ymin - 0.5)) min_y += 0.5

        setRange({
          x:{
            start: min_x,
            end: max_x
          },
          y: {
            start: min_y,
            end: max_y
          }
        })

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
              cellTypes["cellTypeInfoArr"] && (
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
                sortDescending={true}
                searchable={true}
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
                    setdr1(parseInt(event.target.value))
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter"){
                      setRange({
                        x: {
                          start: dr1,
                          end: dr2
                        },
                        y: {
                          start: range.y.start,
                          end: range.y.end
                        }
                      })
                    }
                  }}
                  />
                  <Typography display="inline">to</Typography>
                  <TextField 
                  id="outlined-basic" 
                  label={dr2} 
                  variant="outlined"
                  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                    setdr2(parseInt(event.target.value))
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter"){
                      setRange({
                        x: {
                          start: dr1,
                          end: dr2
                        },
                        y: {
                          start: range.y.start,
                          end: range.y.end
                        }
                      })
                    }
                  }}
                  />
                </Box>
                <Box mt={2}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography>{ct1} vs {ct2}</Typography>
                  </div>
                  <svg className="graph" aria-labelledby="title desc" role="img" viewBox="0 0 1000 500">
                    <title id="title">{ct1} vs {ct2}</title>
                    <desc id="desc">some description</desc>
                    <g className="grid x-grid" id="xGrid">
                      <line x1="100" x2="900" y1="450" y2="450"></line>
                    </g>
                    <g className="grid y-grid" id="yGrid">
                      <line x1="900" x2="900" y1="50" y2="450"></line>
                    </g>
                    <g className="labels x-labels">
                      <SetRange_x dr1={dr1} dr2={dr2} range={range} dimensions={dimensions}/>
                      <line x1="100" y1="450" x2="900" y2="450" stroke="black"></line>
                    </g>
                    <g className="labels y-labels">
                      <SetRange_y ymin={data[data.gene].nearbyDEs.ymin} ymax={data[data.gene].nearbyDEs.ymax} range={range} dimensions={dimensions}/>
                      <line x1="100" y1="50" x2="100" y2="450" stroke="black"></line>
                      <line x1="900" y1="50" x2="900" y2="450" stroke="black"></line>
                      {/* <text x="50" y="200" className="verticaltext">log2 gene expression fold change</text> */}
                    </g>
                    <g className="data" data-setname="Our first data set">
                      {data[data.gene].diffCREs.data.map((point, i: number) => (
                        <Point point={point} i={i} range={range} dimensions={dimensions}/>
                      ))}
                    </g>
                  </svg>
                </Box>
              </Fragment>
            )}
          </Box>
        </Grid2>
      </Grid2>
    </main>
  )
}