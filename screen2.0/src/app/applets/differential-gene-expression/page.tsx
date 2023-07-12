"use client"
import React, { useState, useEffect, cache, Fragment, useCallback } from "react"

import { fetchServer, LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
import { SetRange_x, SetRange_y, Point, BarPoint, GenePoint } from "./utils"

import { gene, cellTypeInfoArr, QueryResponse } from "./types"
import { GENE_AUTOCOMPLETE_QUERY, payload, initialChart, initialGeneList } from "./const"
import { geneRed, geneBlue, promoterRed, enhancerYellow } from "../../../common/lib/colors"
import { Range2D } from "jubilant-carnival"

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
  const [loading, setLoading] = useState<boolean>(true)
  const [loadingChart, setLoadingChart] = useState<boolean>(true)
  const [errorLoading, setError] = useState<boolean>(false)
  const [data, setData] = useState(initialChart)

  const [options, setOptions] = useState<string[]>([])

  const [cellTypes, setCellTypes] = useState<cellTypeInfoArr>()
  const [ct1, setct1] = useState<string>("C57BL/6_limb_embryo_11.5_days")
  const [ct2, setct2] = useState<string>("C57BL/6_limb_embryo_15.5_days")

  const [genes, setGenes] = useState<gene[]>([])
  const [geneIDs, setGeneIDs] = useState<{ label: string; id: number }[]>([])
  const [geneID, setGeneID] = useState<string>("Gm25142")
  const [gene, setGene] = useState<gene>(initialGeneList)
  const [geneDesc, setgeneDesc] = useState<{ name: string; desc: string }[]>()
  const [geneList, setGeneList] = useState<gene[]>([])

  const [dr1, setdr1] = useState<number>(0)
  const [dr2, setdr2] = useState<number>(0)
  const [min, setMin] = useState<number>(0)
  const [max, setMax] = useState<number>(0)

  const [range, setRange] = useState<Range2D>({
    x: { start: dr1, end: dr2 },
    y: { start: 0, end: 0 },
  })
  const [dimensions, setDimensions] = useState<Range2D>({
    x: { start: 100, end: 900 },
    y: { start: 450, end: 50 },
  })

  const [toggleGenes, setToggleGenes] = useState<boolean>(false)
  const [toggleFC, setToggleFC] = useState<boolean>(true)
  const [toggleccres, settoggleccres] = useState<boolean>(true)
  const [slider, setSlider] = useState<number[]>([0, 0])

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
        gene: gene.name,
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

        // set domain range
        setdr1(data[data.gene].nearbyDEs.xdomain[0])
        setdr2(data[data.gene].nearbyDEs.xdomain[1])

        // round x1, x2
        let min_x: number = Math.floor(data[data.gene].nearbyDEs.xdomain[0] / parseInt("100000")) * 100000
        let max_x: number = Math.ceil(data[data.gene].nearbyDEs.xdomain[1] / parseInt("100000")) * 100000

        // round y1, y2
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

  // gene descriptions
  useEffect(() => {
    const fetchData = async () => {
      let f = await Promise.all(
        options.map((gene) =>
          fetch("https://clinicaltables.nlm.nih.gov/api/ncbi_genes/v3/search?authenticity_token=&terms=" + gene.toUpperCase())
            .then((x) => x && x.json())
            .then((x) => {
              const matches = (x as QueryResponse)[3] && (x as QueryResponse)[3].filter((x) => x[3] === gene.toUpperCase())
              return {
                desc: matches && matches.length >= 1 ? matches[0][4] : "(no description available)",
                name: gene,
              }
            })
            .catch(() => {
              return { desc: "(no description available)", name: gene }
            })
        )
      )
      setgeneDesc(f)
    }

    options && fetchData()
  }, [options])

  // gene list
  const onSearchChange = async (value: string) => {
    setOptions([])
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
    })
    const genesSuggestion = (await response.json()).data?.gene
    if (genesSuggestion && genesSuggestion.length > 0) {
      const r = genesSuggestion.map((g) => g.name)
      const g = genesSuggestion.map((g) => {
        return {
          chrom: g.coordinates.chromosome,
          start: g.coordinates.start,
          end: g.coordinates.end,
          id: g.id,
          name: g.name,
        }
      })
      setOptions(r)
      setGeneList(g)
    } else if (genesSuggestion && genesSuggestion.length === 0) {
      setOptions([])
      setGeneList([])
    }
  }

  const debounceFn = useCallback(debounce(onSearchChange, 500), [])

  // server
  // const data1 = await fetchServer("https://screen-beta-api.wenglab.org/dews/search", payload)
  // const cellInfo = await getCellInfo()
  // const cellTypes2 = await getCellTypes()

  return loading ? (
    LoadingMessage()
  ) : (
    <main>
      <Grid2 container spacing={3} sx={{ mt: "2rem" }}>
        <Grid2 xs={3}>
          {loading ? (
            <></>
          ) : (
            cellTypes &&
            cellTypes["cellTypeInfoArr"] && (
              <Box>
                <Box ml={0}>
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
                </Box>
                <Box ml={0} mt={1}>
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
                </Box>
              </Box>
            )
          )}
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
                data[data.gene].xdomain &&
                data[data.gene].nearbyDEs.genes && (
                  <Fragment>
                    <Grid2 container spacing={3} sx={{ mt: "2rem" }}>
                      <Grid2 xs={3}>
                        <Box sx={{ "& > :not(style)": { m: 1.5, width: "20ch" } }}>
                          <Grid2 container spacing={3} sx={{ mt: "2rem" }}>
                            <Grid2 xs={4}>
                              <Typography variant="h6" display="inline" lineHeight={2.5}>
                                Gene:
                              </Typography>
                            </Grid2>
                            <Grid2 xs={8}>
                              <Autocomplete
                                disablePortal
                                freeSolo={true}
                                id="gene-ids"
                                noOptionsText="e.g. Gm25142"
                                options={options}
                                sx={{ width: 200 }}
                                ListboxProps={{
                                  style: {
                                    maxHeight: "180px",
                                  },
                                }}
                                onChange={(event: React.ChangeEvent<HTMLInputElement>, value: string) => {
                                  if (value != "") debounceFn(value)
                                  setGeneID(value)
                                }}
                                onInputChange={(event: React.ChangeEvent<HTMLInputElement>, value: string) => {
                                  if (value != "") debounceFn(value)
                                  setGeneID(value)
                                }}
                                onKeyDown={(e) => {
                                  if (e.key == "Enter") {
                                    for (let g of geneList) {
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
                                renderInput={(props) => <TextField {...props} label={geneID} />}
                                renderOption={(props, opt) => {
                                  return (
                                    <li {...props} key={props.id}>
                                      <Grid2 container alignItems="center">
                                        <Grid2 sx={{ width: "calc(100% - 44px)" }}>
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
                                  )
                                }}
                              />
                              <Button
                                variant="text"
                                onClick={() => {
                                  for (let g of geneList) {
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
                              >
                                Search
                              </Button>
                            </Grid2>
                          </Grid2>
                        </Box>
                      </Grid2>
                      <Grid2 xs={7}>
                        <Box sx={{ "& > :not(style)": { m: 1.0, width: "15ch", mt: 2.5 } }} ml={10}>
                          <Typography variant="h6" display="inline" lineHeight={5}>
                            Domain Range:
                          </Typography>
                          <TextField
                            id="outlined-basic"
                            label={dr1.toLocaleString("en-US")}
                            variant="standard"
                            size="small"
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
                              }
                            }}
                          />
                          <Typography display="inline" lineHeight={5}>
                            to
                          </Typography>
                          <TextField
                            id="outlined-basic"
                            label={dr2.toLocaleString("en-US")}
                            variant="standard"
                            size="small"
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
                              }
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
                            }}
                          >
                            <Box mt={0}>
                              <FormGroup>
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={toggleccres}
                                      onChange={() => {
                                        if (toggleccres === true) settoggleccres(false)
                                        else settoggleccres(true)
                                      }}
                                    />
                                  }
                                  label="cCREs"
                                />
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={toggleFC}
                                      onChange={() => {
                                        if (toggleFC === true) setToggleFC(false)
                                        else setToggleFC(true)
                                      }}
                                    />
                                  }
                                  label="log2 fold change"
                                />
                                <FormControlLabel
                                  control={
                                    <Switch
                                      checked={toggleGenes}
                                      onChange={() => {
                                        if (toggleGenes === true) setToggleGenes(false)
                                        else setToggleGenes(true)
                                      }}
                                    />
                                  }
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
                            {ct1.replace(/_/g, " ")} vs {ct2.replace(/_/g, " ")}
                          </Typography>
                        </div>
                      </Box>
                      <svg className="graph" aria-labelledby="title desc" role="img" viewBox="0 0 1000 550">
                        {/* <title id="title"> */}
                        {/* {ct1} vs {ct2} */}
                        {/* </title> */}
                        {/* <desc id="desc">
                          {ct1} vs {ct2}
                        </desc> */}
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
                          {SetRange_x(range, dimensions)}
                          {/* <SetRange_x range={range} dimensions={dimensions} /> */}
                          <line x1="100" y1="450" x2="900" y2="450" stroke="black"></line>
                        </g>
                        <g className="labels y-labels">
                          {SetRange_y(data[data.gene].nearbyDEs.ymin, data[data.gene].nearbyDEs.ymax, range, dimensions, ct1, ct2)}
                          {/* <SetRange_y ymin={data[data.gene].nearbyDEs.ymin} ymax={data[data.gene].nearbyDEs.ymax} range={range} dimensions={dimensions} ct1={ct1} ct2={ct2} /> */}
                          <line x1="100" y1="50" x2="100" y2="450" stroke="black"></line>
                          <line x1="900" y1="50" x2="900" y2="450" stroke="#549623"></line>
                          {!toggleFC ? (
                            <></>
                          ) : (
                            <g transform="translate(890,240) rotate(-90)">
                              <text style={{ fontSize: 12, fill: "#549623" }}>log2 gene expression fold change</text>
                            </g>
                          )}
                          {!toggleccres ? (
                            <></>
                          ) : (
                            <text x="110" y="50" style={{ fontSize: 12, writingMode: "vertical-lr" }}>
                              change in cCRE Z-score
                            </text>
                          )}
                        </g>
                        <g className="data" data-setname="de plot">
                          {!toggleFC ? (
                            <></>
                          ) : (
                            data[data.gene].nearbyDEs.data.map((point, i: number) =>
                              BarPoint(point, i, range, dimensions)
                              // <BarPoint point={point} i={i} range={range} dimensions={dimensions} />
                            )
                          )}
                          {!toggleccres ? (
                            <></>
                          ) : (
                            data[data.gene].diffCREs.data.map((point, i: number) =>
                              Point(point, i, range, dimensions)
                              // <Point point={point} i={i} range={range} dimensions={dimensions} />
                            )
                          )}
                          {!toggleGenes ? (
                            <></>
                          ) : (
                            data[data.gene].nearbyDEs.genes.map((point, i: number) =>
                              GenePoint(point, i, range, dimensions, toggleGenes)
                              // <GenePoint point={point} i={i} range={range} dimensions={dimensions} toggleGenes={toggleGenes} />
                            )
                          )}
                        </g>
                      </svg>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Box width={400} mb={1}>
                          <Slider
                            value={slider}
                            step={100000}
                            marks
                            min={min}
                            max={max}
                            valueLabelDisplay="auto"
                            onChange={(event: Event, value: number | number[]) => {
                              let n: number = 0
                              if (value[0] > value[1]) return <></>
                              if (value[0] !== slider[0]) {
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
                              } else {
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
                            }}
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
                            {data[data.gene].nearbyDEs.genes.map((point, i: number) =>
                              GenePoint(point, i, range, dimensions, false)
                              // <GenePoint point={point} i={i} range={range} dimensions={dimensions} toggleGenes={false} />
                            )}
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
