"use client"
import { Autocomplete, Box, Button, FormControlLabel, FormGroup, Slider, Switch, TextField, Typography, debounce } from "@mui/material"
import React, { useState, useEffect, cache, Fragment, useRef, useCallback } from "react"
import { createLink, fetchServer } from "../../../common/lib/utility"
import { DataTable } from "@weng-lab/ts-ztable"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { ErrorMessage, LoadingMessage } from "../../../common/lib/utility"
import { payload, initialCellTypes, initialChart } from "./types"
import { Point2D, Range2D, linearTransform2D } from "jubilant-carnival"
import { parse } from "path"
import { stringify } from "querystring"
import Tooltip from "@mui/material"

type ccre = {
  accession: string
  center: number
  len: number
  start: number
  stop: number
  typ: string
  value: number
  width: number
}

type gene = {
  chrom: string,
  start: number,
  end: number,
  id: string,
  name: string
}

type QueryResponse = [
  number,
  string[],
  any,
  [string, string, string, string, string, string][],
  string[]
];

const geneRed = "#FF0000"
const geneBlue = "#1E90FF"

const promoterRed = "red"
const enhancerYellow = "#E9D31C"

/**
 * Sets and labels the x-axis
 * @param {Range2D, Range2D} // x axis range for graph and y axis range for the dimensions
 * @returns list of labels along the x-axis
 */
const SetRange_x = ({ dr1, dr2, range, dimensions }) => {
  let range_x: number[] = []
  let zeros: string = "00000"

  // change margins of x-axis based on the difference in range
  // if (range.x.end - range.x.start > 100) {
  //   zeros = ""
  //   let j: number = (range.x.end - range.x.start).toString().length - 2
  //   console.log(range.x.end - range.x.start)
  //   while (j > 0){
  //     zeros += "0"
  //     j -= 1
  //   }
  //   console.log(zeros)
  // }

  // round and create list of labels
  let min_x: number = Math.floor(range.x.start / parseInt("1" + zeros)) * parseInt("1" + zeros)
  let max_x: number = Math.ceil(range.x.end / parseInt("1" + zeros)) * parseInt("1" + zeros)

  while (min_x <= max_x) {
    range_x.push(min_x)
    min_x += parseInt("1" + zeros)
  }

  // line and label
  const Axis_name = ({ x, label, zeros }) => {
    if ((label / parseInt("1" + zeros)) % 2 === 0 || range_x.length < 7)
      return (
        <Fragment>
          <text x={x - 30} y="490" style={{ fontSize: 12.5 }}>
            {label.toLocaleString("en-US")}
          </text>
          <line x1={x} x2={x} y1={450} y2={465} stroke="black"></line>
        </Fragment>
      )
    else
      return (
        <Fragment>
          <line x1={x} x2={x} y1={450} y2={460} stroke="black"></line>
        </Fragment>
      )
  }

  // transform and return label of x axis
  const x_axis = (x: number) => {
    const p: Point2D = { x: x, y: range.y.start }
    const t = linearTransform2D(range, dimensions)(p)

    return <Axis_name x={t.x} label={x} zeros={zeros} />
  }

  return range_x.map((x: number, i: number) => x_axis(x))
}

/**
 * Sets and labels the y-axis
 * @param {Range2D, Range2D} // y axis range for graph and y axis range for the dimensions
 * @returns list of labels along the y-axis
 */
const SetRange_y = ({ ymin, ymax, range, dimensions, ct1, ct2 }) => {
  let range_y: number[] = []
  let min_y: number = 0
  if (ymin < 0) min_y = parseInt(ymin.toString()[0] + (ymin - 0.5).toString()[1]) - 0.5
  else min_y = parseInt((ymin - 0.5).toString()[0]) - 0.5
  let max_y: number = parseInt((ymax + 0.5).toString()[0]) + 0.5

  if (max_y > 0.5 + ymax) max_y -= 0.5
  if (min_y < ymin - 0.5) min_y += 0.5

  while (min_y <= max_y) {
    range_y.push(min_y)
    min_y += 0.5
  }

  // transform and return labels of y axis
  const y_axis = (y: number, i: number, range_y: number[], ct1: string, ct2: string) => {
    const p: Point2D = { x: range.x.start, y: y }
    const t = linearTransform2D(range, dimensions)(p)
    let r: number = range_y[range_y.length]
    if (range_y[i + 1]) r = linearTransform2D(range, dimensions)({ x: range.x.start, y: range_y[i + 1] }).y
    let cellTypeLabel: string[] = ["translate(15," + (t.y).toString() + ") rotate(-90)", "translate(15," + (t.y + 197).toString() + ") rotate(-90)"] 

    if (y === 0.0)
      return (
        <Fragment>
          <text x={50} y={t.y + 5} style={{ fontSize: 13 }}>
            {y}
          </text>
          <line x1={90} x2={100} y1={t.y} y2={t.y} stroke="black"></line>
          <line x1={100} x2={900} y1={t.y} y2={t.y} stroke="black"></line>
          <line x1={900} x2={910} y1={t.y} y2={t.y} stroke="#6B854C"></line>
          <text x={925} y={t.y + 5} style={{ fontSize: 13 }}>
            {y}
          </text>
          <line x1={15} x2={28} y1={t.y} y2={t.y} stroke="black"></line>
          <g transform={cellTypeLabel[1]}>
            <text x={10} y={10} style={{ fontSize: 11 }}>
            ◄{ct1.replace(/_/g," ")}
            </text>
          </g>
          <g transform={cellTypeLabel[0]}>
            <text x={10} y={10} style={{ fontSize: 11 }}>
              {ct2.replace(/_/g," ")}►
            </text>
          </g>
        </Fragment>
      )
    else
      return (
        <Fragment>
          <text x={50} y={t.y + 5} style={{ fontSize: 13 }}>
            {y}
          </text>
            <line x1={90} x2={100} y1={t.y} y2={t.y} stroke="black"></line>
            <line x1={900} x2={910} y1={t.y} y2={t.y} stroke="#6B854C"></line>
          <text x={925} y={t.y + 5} style={{ fontSize: 13 }}>
            {y}
          </text>
        </Fragment>
      )
  }

  return range_y.map((y: number, i: number) => y_axis(y, i, range_y, ct1, ct2))
}

/**
 * Returns a circle data point colored red for proximal-like and red for enhancer-like
 * @param point data point for ccre
 * @param i index
 * @param range x and y range of chart
 * @param dimensions x and y range of svg
 * @returns data point
 */
const Point = ({ point, i, range, dimensions }) => {
  const p: Point2D = { x: point.center, y: point.value }
  if (p.x > range.x.end || p.x < range.x.start || p.y > range.y.end || p.y < range.y.start) return <></>
  const t = linearTransform2D(range, dimensions)(p)

  // promotor or enhancer
  let color: string = ""
  if (point.typ[3] === "m") color = promoterRed
  else color = enhancerYellow

  return (
    <Fragment>
      <circle key={i} cx={t.x} cy={t.y} r="4" fill={color} >
        <title>{"coordinates: " + point.center.toLocaleString("en-US") + "\nz-score: " + point.value}</title>
      </circle>
    </Fragment>
  )
}

/**
 * Returns a circle data point colored red for proximal-like and red for enhancer-like
 * @param point data point for log2 gene expression fold change
 * @param i index
 * @param range x and y range of chart
 * @param dimensions x and y range of svg
 * @returns data point
 */
const BarPoint = ({ point, i, range, dimensions }) => {
  let p1: Point2D = { x: 0, y: 0 }
  let p2: Point2D = { x: 0, y: 0 }
  let x1: number = point.start
  let x2: number = point.stop

  // cut bars off at axis if out of range
  if (point.start > range.x.end || point.stop < range.x.start) return <></>
  else if (point.start < range.x.start) x1 = range.x.start
  else if (point.stop > range.x.end) x2 = range.x.end

  if (point.fc >= 0) {
    p1 = linearTransform2D(range, dimensions)({ x: x1, y: point.fc })
    p2 = linearTransform2D(range, dimensions)({ x: x2, y: 0 })
  } else {
    p1 = linearTransform2D(range, dimensions)({ x: x1, y: 0 })
    p2 = linearTransform2D(range, dimensions)({ x: x2, y: point.fc })
  }

  return <rect 
            key={i} 
            x={p1.x} 
            y={p1.y} 
            width={p2.x - p1.x} 
            height={p2.y - p1.y} 
            fill="#6B854C" 
            fillOpacity={0.5}
          >
              <title>
                {"fc: " + point.fc + "\nstart: " + point.start.toLocaleString("en-US") + "\nstop: " + point.stop.toLocaleString("en-US")}
              </title>
          </rect>
}

/**
 * Returns a line the distance of a gene and the gene name
 * @param point data point for gene with name and range
 * @param i index
 * @param range x and y range of chart
 * @param dimensions x and y range of svg
 * @returns data point
 */
const GenePoint = ({ point, i, range, dimensions, toggleGenes }) => {
  let p1: Point2D = { x: 0, y: 0 }
  let p2: Point2D = { x: 0, y: 0 }
  let x1: number = point.start
  let x2: number = point.stop
  let size: number = 20

  // cut off lines if out of axis range
  if (point.start > range.x.end || point.stop < range.x.start) return <></>
  else if (point.start < range.x.start) x1 = range.x.start
  else if (point.stop > range.x.end) x2 = range.x.end

  p1 = linearTransform2D(range, dimensions)({ x: x1, y: 0 })
  p2 = linearTransform2D(range, dimensions)({ x: x2, y: 0 })

  let color: string = geneRed
  if (point.strand === "-") color = geneBlue

  if (toggleGenes){
    size = 12
  }

  const GeneTooltip = ({point}) => {
    return <title>{"gene: " + point.gene + "\nstart: " + point.start.toLocaleString("en-US") + "\nstop: " + point.stop.toLocaleString("en-US")}</title>
  }

  return (
    <Fragment>
      <line key={i} x1={p1.x} x2={p2.x} y1={(i + 4) * size} y2={(i + 4) * size} stroke={color}>
        <GeneTooltip point={point} />
      </line>
      <text style={{ fontSize: 13, fontStyle: "italic" }} x={p2.x + size} y={(i + 4) * size + 5}>
        <GeneTooltip point={point} />
        <a href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + point.gene}>{point.gene}</a>
      </text>
      {
      x1 === range.x.start ? <text x={p1.x - 15} y={(i + 4) * size + 5} style={{ fill: color }}>◄</text> 
      : x2 === range.x.end ? <text x={p2.x - 3} y={(i + 4) * size + 5} style={{ fill: color }}>►</text> 
      : <></>}
    </Fragment>
  )
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

const GENE_AUTOCOMPLETE_QUERY = `
query ($assembly: String!, $name_prefix: [String!], $limit: Int) {
    gene(assembly: $assembly, name_prefix: $name_prefix, limit: $limit) {
      name
      id
      coordinates {
        start
        chromosome
        end
      }
    }
  }  
 `;

export default function DifferentialGeneExpression() {
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingChart, setLoadingChart] = useState<boolean>(true)
  const [errorLoading, setError] = useState<boolean>(false)
  const [data, setData] = useState(initialChart)
  const [option, setOption ] = useState<string>("range")
  const [options, setOptions] = useState<string[]>([])

  const [geneDesc, setgeneDesc] = useState<{ name: string; desc: string }[]>()
  const [cellTypes, setCellTypes] = useState(initialCellTypes)
  // const [geneList, setGeneList ] = useState<{name: string, id: string, coordinates: {start: number, chromosome: string, end: number}}[]>([{
  //   coordinates: {
  //       start: 108107280, 
  //       chromosome: 'chr3', 
  //       end: 108146146
  //     },
  //   id: "ENSMUSG00000000001.4",
  //   name: "Gnai3"
  // }])

  const [geneList, setGeneList ] = useState<{chrom: string, start: number, end: number, id: string, name: string}[]>([{
    chrom: 'chr3', 
    start: 108107280, 
    end: 108146146,
    id: "ENSMUSG00000000001.4",
    name: "Gnai3"
  }])

  const [toggleGenes, setToggleGenes] = useState<boolean>(false)
  const [toggleFC, setToggleFC] = useState<boolean>(true)
  const [toggleccres, settoggleccres] = useState<boolean>(true)
  const [slider, setSlider] = useState<number[]>([0, 0])

  const [ct1, setct1] = useState<string>("C57BL/6_limb_embryo_11.5_days")
  const [ct2, setct2] = useState<string>("C57BL/6_limb_embryo_15.5_days")

  const [ genes, setGenes ] = useState<gene[]>([])
  const [ geneIDs, setGeneIDs ] = useState<{label: string, id: number}[]>([])
  const [ geneID, setGeneID ] = useState<string>("Gm25142")
  const [ gene, setGene ] = useState<gene>()

  const [dr1, setdr1] = useState<number>(0)
  const [dr2, setdr2] = useState<number>(0)
  const [min, setMin] = useState<number>(0)
  const [max, setMax] = useState<number>(0)

  const [range, setRange] = useState<Range2D>({ x: { start: dr1, end: dr2 }, y: { start: 0, end: 0 } })
  const [dimensions, setDimensions] = useState<Range2D>({ x: { start: 100, end: 900 }, y: { start: 450, end: 50 } })

  // fetch list of cell types
  useEffect(() => {
    fetch("https://storage.googleapis.com/gcp.wenglab.org/v3_mm10.json")
      .then((response) => {
        if (!response.ok) {
          // throw new Error(response.statusText)
          setError(true)
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
        gene: geneID,
        uuid: "62ba8f8c-8335-4404-8c48-b569cf401664",
        ct1: ct1,
        ct2: ct2,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          // throw new Error(response.statusText)
          setError(true)
          return ErrorMessage(new Error(response.statusText))
        }
        return response.json()
      })
      .then((data) => {
        setData(data)
        // console.log(data)

        // set domain range
        setdr1(data[data.gene].nearbyDEs.xdomain[0])
        setdr2(data[data.gene].nearbyDEs.xdomain[1])

        let min_x: number = Math.floor(data[data.gene].nearbyDEs.xdomain[0] / parseInt("100000")) * 100000
        let max_x: number = Math.ceil(data[data.gene].nearbyDEs.xdomain[1] / parseInt("100000")) * 100000

        let ymin: number = data[data.gene].nearbyDEs.ymin
        let ymax: number = data[data.gene].nearbyDEs.ymax
        let min_y: number = 0.0
        if (ymin < 0) min_y = parseInt(ymin.toString()[0] + (ymin - 0.5).toString()[1]) - 0.5
        else min_y = parseInt((ymin - 0.5).toString()[0]) - 0.5
        let max_y: number = parseInt((ymax + 0.5).toString()[0]) + 0.5

        if (max_y > 0.5 + ymax) max_y -= 0.5
        if (min_y < ymin - 0.5) min_y += 0.5

        setMin(min_x)
        setMax(max_x)
        setSlider([min_x, max_x])
        setRange({
          x: {
            start: min_x,
            end: max_x,
          },
          y: {
            start: min_y,
            end: max_y,
          },
        })

        setLoadingChart(false)
      })
      .catch((error: Error) => {
        // logging
        // throw error
        return ErrorMessage(error)
      })
    setLoadingChart(true)
  }, [ct1, ct2, gene])

  useEffect(() => {
    const fetchData = async () => {
      let f = await Promise.all(
        options.map((gene) =>
          fetch(
            "https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search?authenticity_token=&terms=" +
              gene.toUpperCase()
          )
            .then((x) => x && x.json())
            .then((x) => {
              const matches =
                (x as QueryResponse)[3] &&
                (x as QueryResponse)[3].filter(
                  (x) => x[3] === gene.toUpperCase()
                );
              return {
                desc:
                  matches && matches.length >= 1
                    ? matches[0][4]
                    : "(no description available)",
                name: gene,
              };
            })
            .catch(() => {
              return { desc: "(no description available)", name: gene };
            })
        )
      );
      setgeneDesc(f);
    };

    options && fetchData();
  }, [options])

  const onSearchChange = async (value: string) => {
    setOptions([]);
    const response = await fetch("https://ga.staging.wenglab.org/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: GENE_AUTOCOMPLETE_QUERY,
        variables: {
          assembly: "mm10",
          name_prefix: value,
          limit: 1000,
        },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const genesSuggestion = (await response.json()).data?.gene;
    if (genesSuggestion && genesSuggestion.length > 0) {
      const r = genesSuggestion.map((g) => g.name);
      const g = genesSuggestion.map((g) => {
        return {
          chrom: g.coordinates.chromosome,
          start: g.coordinates.start,
          end: g.coordinates.end,
          id: g.id,
          name: g.name,
        };
      });
      setOptions(r);
      setGeneList(g);
    } else if (genesSuggestion && genesSuggestion.length === 0) {
      setOptions([]);
      setGeneList([]);
    }
  }

  // console.log(geneData)

  // server
  // const data1 = await fetchServer("https://screen-beta-api.wenglab.org/dews/search", payload)
  // const cellInfo = await getCellInfo()
  // const cellTypes2 = await getCellTypes()

  // create list of gene labels
  const geneLabels = (g: gene[]) => {
    let ids: {label: string, id: number}[] = []
    // console.log(g)
    for (let i in g){
      ids.push({label: g[i].gene, id: parseInt(i)})
    }
    return ids
  }

  // create list of gene labels (all genes)
  const geneLabels2 = (g: any) => {
    let ids: {label: string, id: number}[] = []
    // console.log(g)
    for (let i in g){
      ids.push({label: g[i].name, id: parseInt(i)})
    }
    return ids
  }

  const debounceFn = useCallback(debounce(onSearchChange, 120), [])

  return (
    <main>
      <Grid2 container spacing={3} sx={{ mt: "2rem" }}>
        <Grid2 xs={3}>
          <Box ml={0}>
            {loading
              ? LoadingMessage()
              : cellTypes &&
                cellTypes["cellTypeInfoArr"] && (
                  <DataTable
                    tableTitle="Cell 1"
                    rows={cellTypes["cellTypeInfoArr"]}
                    columns={[
                      { header: "Cell Type", value: (row: any) => row.biosample_summary },
                      { header: "Tissue", value: (row: any) => row.tissue },
                    ]}
                    onRowClick={(row: any) => {
                      setct1(row.value)
                    }}
                    sortDescending={true}
                    searchable={true}
                  />
                )}
          </Box>
          <Box ml={0} mt={1}>
            {loading
              ? LoadingMessage()
              : cellTypes &&
                cellTypes["cellTypeInfoArr"] && (
                  <DataTable
                    tableTitle="Cell 2"
                    rows={cellTypes["cellTypeInfoArr"]}
                    columns={[
                      { header: "Cell Type", value: (row: any) => row.biosample_summary },
                      { header: "Tissue", value: (row: any) => row.tissue },
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
        <Grid2 xs={9}>
          <Box mb={1}>
            {errorLoading
              ? ErrorMessage(new Error("Error loading data"))
              : loadingChart
              ? LoadingMessage()
              : data &&
                data.gene &&
                data[data.gene] &&
                data[data.gene].xdomain && geneList && data[data.gene].nearbyDEs.genes && (
                  <Fragment>
                    <Grid2 container spacing={3} sx={{ mt: "2rem" }}>
                    <Grid2 xs={3}>
                    <Box
                      component="form"
                      sx={{
                        "& > :not(style)": { m: 1.5, width: "25ch" },
                        
                      }}
                    > 
                      <Grid2 container spacing={3} sx={{ mt: "2rem" }}>
                      <Grid2 xs={4}>
                        <Typography variant="h6" display="inline" lineHeight={2.5}>Gene:</Typography>
                      </Grid2>
                      <Grid2 xs={0}>
                      <Autocomplete
                        disablePortal
                        freeSolo={true}
                        id="gene-ids"
                        // options={geneLabels2(geneList)}
                        // options={geneLabels(data[data.gene].nearbyDEs.genes)}
                        noOptionsText="e.g. Gm25142"
                        options={options}
                        sx={{ width: 200 }}
                        ListboxProps={{
                          style: {
                            maxHeight: "180px",
                          },
                        }}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>, value: string) => {
                          // if (value != "") 
                          //   debounceFn(value)
                          setGeneID(value)
                        }}
                        // value={geneID}
                        // inputValue={geneID}
                        onInputChange={(event: React.ChangeEvent<HTMLInputElement>, value: string) => {
                          if (value != "") 
                            debounceFn(value)
                          setGeneID(value)
                        }}
                        onKeyDown={(e) => {
                          if (e.key == "Enter"){
                            for (let g of geneList){
                              if (g.name === geneID && g.end - g.start > 0) {
                                setdr1(g.start)
                                setdr2(g.end)
                                setGene(g)
                                setRange({
                                  x: {
                                    start: g.start,
                                    end: g.end,
                                  },
                                  y: {
                                    start: range.y.start,
                                    end: range.y.end,
                                  },
                                })
                                break
                              }
                            }
                          }
                        }}
                        renderInput={ (props) => <TextField {...props} label={geneID}/> }
                        renderOption={(props, opt) => {
                          return (
                            <li {...props} key={props.id}>
                              <Grid2 container alignItems="center">
                                <Grid2
                                  sx={{ width: "calc(100% - 44px)", wordWrap: "break-word" }}
                                >
                                  <Box component="span" sx={{ fontWeight: "regular" }}>
                                    {opt}
                                  </Box>
                                  {geneDesc && geneDesc.find((g) => g.name === opt) && (
                                    <Typography variant="body2" color="text.secondary">
                                      {geneDesc.find((g) => g.name === opt)?.desc}
                                    </Typography>
                                  )}
                                </Grid2>
                              </Grid2>
                            </li>
                          );
                        }}
                    />
                    <Grid2 xs={0}>
                      <Button 
                        variant="text"
                        onClick={() => {
                          for (let g of geneList){
                            if (g.name === geneID && g.end - g.start > 0) {
                              setdr1(g.start)
                              setdr2(g.end)
                              setGene(g)
                              setRange({
                                x: {
                                  start: g.start,
                                  end: g.end,
                                },
                                y: {
                                  start: range.y.start,
                                  end: range.y.end,
                                },
                              })
                              break
                            }
                          }
                        }}
                      >Search</Button>
                    </Grid2>
                    </Grid2>
                    </Grid2>
                    </Box>
                    </Grid2>
                    <Grid2 xs={7}>
                    <Box
                      component="form"
                      sx={{
                        "& > :not(style)": { m: 2.5, width: "20ch" },
                        
                      }}
                    >
                      <Typography variant="h6" display="inline" lineHeight={4.75}>Domain Range:</Typography>
                      <TextField
                        id="outlined-basic"
                        label={dr1.toLocaleString("en-US")}
                        variant="outlined"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          setdr1(parseInt(event.target.value))
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (range.x.end - dr1 > 100000) {
                              setRange({
                                x: {
                                  start: dr1,
                                  end: range.x.end,
                                },
                                y: {
                                  start: range.y.start,
                                  end: range.y.end,
                                },
                              })
                              setSlider([dr1, range.x.end + 1200000])
                              setMin(dr1)
                            } else ErrorMessage(new Error("invalid range"))
                          } else ErrorMessage(new Error("invalid range"))
                        }}
                      />
                      <Typography display="inline" sx={{lineHeight: 4}}>to</Typography>
                      <TextField
                        id="outlined-basic"
                        label={dr2.toLocaleString("en-US")}
                        variant="outlined"
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                          setdr2(parseInt(event.target.value))
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            if (dr2 - range.x.start >= 100000) {
                              setRange({
                                x: {
                                  start: range.x.start,
                                  end: dr2,
                                },
                                y: {
                                  start: range.y.start,
                                  end: range.y.end,
                                },
                              })
                              setSlider([range.x.start - 1200000, dr2])
                              setMax(dr2)
                            } else ErrorMessage(new Error("invalid range"))
                          } else ErrorMessage(new Error("invalid range"))
                        }}
                      />
                    </Box>
                    </Grid2>
                    <Grid2 xs={2}>
                    <Box alignContent="right">
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "right",
                            alignItems: "right",
                          }}>
                        <Box mt={4}>
                          <FormGroup>
                        <FormControlLabel control={
                          <Switch 
                            defaultChecked
                            checked={toggleccres}
                            onChange={(()=> {
                              if (toggleccres === true) settoggleccres(false) 
                              else settoggleccres(true)
                            })} 
                          />} 
                            label="cCREs" 
                        />
                        <FormControlLabel control={
                          <Switch 
                            defaultChecked
                            checked={toggleFC}
                            onChange={(()=> {
                              if (toggleFC === true) setToggleFC(false) 
                              else setToggleFC(true)
                            })} 
                          />} 
                            label="log2 fold change" 
                        />
                        <FormControlLabel control={
                          <Switch 
                            checked={toggleGenes}
                            onChange={(()=> {
                              if (toggleGenes === true) setToggleGenes(false) 
                              else setToggleGenes(true)
                            })} 
                          />} 
                            label="genes" 
                        />
                      </FormGroup>
                      </Box>
                        </div>
                      </Box>
                    </Grid2>
                    </Grid2>
                    <Box>
                      <Box mb={3}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Typography variant="h5">
                          {ct1.replace(/_/g," ")} vs {ct2.replace(/_/g," ")}
                        </Typography>
                      </div>
                      </Box>
                      <svg className="graph" aria-labelledby="title desc" role="img" viewBox="0 0 1000 520">
                        {/* <title id="title"> */}
                        {/* {ct1} vs {ct2} */}
                        {/* </title> */}
                        <desc id="desc">{ct1} vs {ct2}</desc>
                        <g className="x-grid grid" id="xGrid">
                          <line x1="100" x2="900" y1="450" y2="450"></line>
                        </g>
                        <g className="y-grid grid" id="yGrid">
                          <line x1="900" x2="900" y1="50" y2="450"></line>
                        </g>
                        <g className="legend" transform="translate(0,0)">
                          <circle cx={735} cy={20} r="8" fill={enhancerYellow}></circle>
                          <text style={{ fontSize: 11 }} x={750} y={24}>
                            Enhancer-like Signature
                          </text>
                          <circle cx={535} cy={20} r="8" fill={promoterRed}></circle>
                          <text style={{ fontSize: 11 }} x={550} y={24}>
                            Promoter-like Signature
                          </text>
                          <text x="50" y="24" style={{ fontSize: 12, fontStyle: "italic" }}>
                            {data[data.gene].nearbyDEs.names[1]}
                          </text>
                        </g>
                        <g className="labels x-labels">
                          <SetRange_x dr1={dr1} dr2={dr2} range={range} dimensions={dimensions} />
                          <line x1="100" y1="450" x2="900" y2="450" stroke="black"></line>
                        </g>
                        <g className="labels y-labels">
                          <SetRange_y
                            ymin={data[data.gene].nearbyDEs.ymin}
                            ymax={data[data.gene].nearbyDEs.ymax}
                            range={range}
                            dimensions={dimensions}
                            ct1={ct1}
                            ct2={ct2}
                          />
                          <line x1="100" y1="50" x2="100" y2="450" stroke="black"></line>
                          <line x1="900" y1="50" x2="900" y2="450" stroke="#6B854C"></line>
                          {!toggleFC ? <></> : <text x="890" y="50" style={{ fontSize: 12, writingMode: "vertical-rl", fill: "#6B854C" }}>
                            log2 gene expression fold change
                          </text>}
                          {!toggleccres ? <></> : <text x="110" y="50" style={{ fontSize: 12, writingMode: "vertical-lr" }}>
                            change in cCRE Z-score
                          </text>}
                        </g>
                        <g className="data" data-setname="Our first data set">
                          {!toggleFC ? <></> : data[data.gene].nearbyDEs.data.map((point, i: number) => (
                            <BarPoint point={point} i={i} range={range} dimensions={dimensions} />
                          ))}
                          {!toggleccres ? <></> : data[data.gene].diffCREs.data.map((point, i: number) => (
                            <Point point={point} i={i} range={range} dimensions={dimensions} />
                          ))}
                          {!toggleGenes ? <></> : data[data.gene].nearbyDEs.genes.map((point, i: number) => (
                              <GenePoint point={point} i={i} range={range} dimensions={dimensions} toggleGenes={toggleGenes}/>
                            ))}
                        </g>
                      </svg>
                      <div
                          style={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}>
                      <Box width={400} mb={1}>
                              <Slider value={slider} step={100000} marks min={min} max={max} valueLabelDisplay="auto"
                                onChange={((event: Event, value: number | number[]) => {
                                  let n: number = 0
                                  if (value[0] > value[1]) return <></>
                                  if (value[0] !== slider[0]){
                                    setSlider([value[0], slider[1]])
                                    setdr1(value[0])
                                    setRange({
                                      x: {
                                        start: value[0],
                                        end: range.x.end,
                                      },
                                      y: {
                                        start: range.y.start,
                                        end: range.y.end,
                                      },
                                    })
                                  } 
                                  else {
                                    setSlider([slider[0], value[1]])
                                    setdr2(value[1])
                                    setRange({
                                      x: {
                                        start: range.x.start,
                                        end: value[1],
                                      },
                                      y: {
                                        start: range.y.start,
                                        end: range.y.end,
                                      },
                                    })
                                  }
                                })}
                              />
                            </Box>
                            </div>
                      <Box mt={2}>
                        <svg className="graph" aria-labelledby="title desc" role="img" viewBox="0 0 1000 1000">
                          <title id="genes"></title>
                          <desc id="desc">genes</desc>
                          <g className="legend" transform="translate(0,0)">
                            <circle cx={535} cy={10} r="8" fill={geneRed}></circle>
                            <text style={{ fontSize: 11, fill: geneRed }} x={550} y={14}>
                              Watson (+) strand
                            </text>
                            <circle cx={735} cy={10} r="8" fill={geneBlue}></circle>
                            <text style={{ fontSize: 11, fill: geneBlue }} x={750} y={14}>
                              Crick (-) strand
                            </text>
                          </g>
                          <g className="data">
                            {data[data.gene].nearbyDEs.genes.map((point, i: number) => (
                              <GenePoint point={point} i={i} range={range} dimensions={dimensions} toggleGenes={false}/>
                            ))}
                          </g>
                        </svg>
                      </Box>
                    </Box>
                  </Fragment>
                )}
          </Box>
        </Grid2>
      </Grid2>
    </main>
  )
}
