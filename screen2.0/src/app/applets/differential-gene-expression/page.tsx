"use client"
import React, { useState, useEffect, cache, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ReadonlyURLSearchParams, useSearchParams, usePathname } from "next/navigation"

import { fetchServer, LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
import { SetRange_x, SetRange_y, Point, BarPoint, GenePoint } from "./utils"

import { cellTypeInfoArr, QueryResponse, cCREZScore, Gene } from "./types"
import { GENE_AUTOCOMPLETE_QUERY, payload, initialChart, initialGeneList, GENE_SEARCH_QUERY, ZSCORE_QUERY } from "./const"
import { geneRed, geneBlue, promoterRed, enhancerYellow } from "../../../common/lib/colors"
import { Range2D } from "jubilant-carnival"
import { client } from "../../search/ccredetails/client"

import { DataTable } from "@weng-lab/ts-ztable"
import Divider from "@mui/material/Divider"
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
  IconButton,
  debounce,
  Paper,
  Popover,
  Alert,
  AlertTitle,
  Chip,
  Drawer,
  AppBar,
  Toolbar,
} from "@mui/material"
import { ThemeProvider } from "@mui/material/styles"
import { defaultTheme } from "../../../common/lib/themes"
import MenuIcon from "@mui/icons-material/Menu"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"

import { ApolloClient, InMemoryCache, useQuery } from "@apollo/client"
import GeneAutoComplete from "../gene-expression/gene-autocomplete"

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
  const searchParams: ReadonlyURLSearchParams = useSearchParams()!
  const router = useRouter()
  const pathname = usePathname()

  if (!searchParams.get("assembly")) router.replace(pathname + "?assembly=GRCh38&chromosome=chr11")

  const [loading, setLoading] = useState<boolean>(true)
  const [open, setState] = useState<boolean>(true)

  const [options, setOptions] = useState<string[]>([])
  const [assembly, setAssembly] = useState<string>(searchParams.get("assembly") ? searchParams.get("assembly") : "GRCh38")

  const [cellTypes, setCellTypes] = useState<cellTypeInfoArr>()
  const [chromosome, setChromosome] = useState<string>(searchParams.get("chromosome") ? searchParams.get("chromosome") : "chr11")
  const [ct1, setct1] = useState<string>("A172_ENCDO934VEN")
  const [ct2, setct2] = useState<string>("A549_ENCDO000AAZ")

  const [gene, setGene] = useState<string>(searchParams.get("gene") ? searchParams.get("gene") : "")

  const [dr1, setdr1] = useState<number>(4000000)
  const [dr2, setdr2] = useState<number>(5000000)
  const [min, setMin] = useState<number>(4000000)
  const [max, setMax] = useState<number>(5000000)

  const [range, setRange] = useState<Range2D>({
    x: { start: dr1, end: dr2 },
    y: { start: -1, end: 1 },
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
    fetch("https://storage.googleapis.com/gcp.wenglab.org/newV4/" + assembly + ".json")
      .then((response) => {
        if (!response.ok) {
          // throw new Error(response.statusText)
          return <ErrorMessage error={new Error(response.statusText)} />
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
        return <ErrorMessage error={error} />
      })
    setLoading(true)
  }, [assembly])

  // gene search
  const { loading: loading_genes, error: error_genes, data: data_genes } = useQuery(GENE_SEARCH_QUERY, {
    variables: {
      "assembly": assembly,
      "chromosome": "chr11",
      "start": min,
      "end": max
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  // cell type 1
  const { loading: loading_ct1, error: error_ct1, data: data_ct1 } = useQuery(ZSCORE_QUERY, {
    variables: {
      "assembly":assembly,
      "coord_chrom":"chr11", "coord_start":min, "coord_end":max,
      "cellType": ct1,
      "gene_all_start": 0,
      "gene_all_end": 5000000,
      "gene_pc_start": 0,
      "gene_pc_end": 5000000,
      "rank_ctcf_end": 10.0,
      "rank_ctcf_start": -10.0,"rank_dnase_end": 10.0,"rank_dnase_start":-10.0,
      "rank_enhancer_end": 10.0,"rank_enhancer_start": -10.0,"rank_promoter_end": 10.0,
      "rank_promoter_start": -10.0,"element_type": null, "limit":25000
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  
  // cell type 2
  const { loading: loading_ct2, error: error_ct2, data: data_ct2 } = useQuery(ZSCORE_QUERY, {
    variables: {
      "assembly":assembly,
      "coord_chrom":"chr11", "coord_start":min, "coord_end":max,
      "cellType": ct2,
      "gene_all_start": 0,
      "gene_all_end": 5000000,
      "gene_pc_start": 0,
      "gene_pc_end": 5000000,
      "rank_ctcf_end": 10.0,
      "rank_ctcf_start": -10.0,"rank_dnase_end": 10.0,"rank_dnase_start":-10.0,
      "rank_enhancer_end": 10.0,"rank_enhancer_start": -10.0,"rank_promoter_end": 10.0,
      "rank_promoter_start": -10.0,"element_type": null, "limit":25000
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  // server
  // const data1 = await fetchServer("https://screen-beta-api.wenglab.org/dews/search", payload)
  // const cellInfo = await getCellInfo()
  // const cellTypes2 = await getCellTypes()

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setState(open)
  }

  // set drawer height based on screen size
  const drawerWidth: number = 550
  let drawerHeight: number = window.screen.height
  let drawerHeightTab: number = window.screen.height

  // 1080
  if (drawerHeight < 1200) {
    drawerHeight *= 0.85
    drawerHeightTab *= 0.6
  } // 2k
  else if (drawerHeight < 2000) {
    drawerHeight *= 0.9
    drawerHeightTab *= 0.7
  } // 4k

  return loading ? (
    <LoadingMessage />
  ) : (
    <main>
      <Paper sx={{ ml: open ? `${drawerWidth}px` : 0 }} elevation={2}>
        <ThemeProvider theme={defaultTheme}>
      <Grid2 container spacing={3} sx={{ mt: "2rem" }}>
              <Drawer
                sx={{
                  // height: 600,
                  width: `${drawerWidth}px`,
                  display: "flex",
                  flexShrink: 0,
                  "& .MuiDrawer-paper": {
                    height: drawerHeight,
                    width: `${drawerWidth}px`,
                    mt: 12,
                  },
                }}
                PaperProps={{ sx: { mt: 0 }, elevation: 2 }}
                anchor="left"
                open={open}
                onClose={toggleDrawer(false)}
                variant="persistent"
              >
                  <Box
                    sx={{
                      display: "flex",
                      direction: "row",
                      alignItems: "right",
                      justifyContent: "right",
                      mt: 8,
                      mb: 8,
                    }}
                  >
                    <IconButton onClick={toggleDrawer(false)}>
                      <ArrowBackIosIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 2 }} />
        <Grid2 xs={12} md={12} lg={12}>
          {loading ? (
            <></>
          ) : (
            cellTypes &&
            cellTypes["cellTypeInfoArr"] && (
              <Box>
                <Box sx={{ width: 500 }}>
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
                <Box sx={{ width: 500, mt: 1 }}>
                  <DataTable
                    tableTitle="Cell 2"
                    rows={cellTypes["cellTypeInfoArr"]}
                    columns={[
                      { header: "Cell Type", value: (row: any) => row.biosample_summary },
                      { header: "Tissue", value: (row: any) => row.tissue },
                    ]}
                    onRowClick={(row: any) => {
                      setct2(row.value)
                      setRange({ x: { start: range.x.start, end: range.x.end }, y: { start: 0, end: 0 }})
                    }}
                    sortDescending={true}
                    searchable={true}
                  />
                </Box>
              </Box>
            )
          )}
        </Grid2>
              </Drawer>
        <Grid2 xs={12} md={12} lg={12} mb={2}>
            {error_genes ? (
              <ErrorMessage error={new Error("Error loading")} />
            ) : loading_genes ? (
              <LoadingMessage />
            ) : (
              data_ct1 && data_ct2 &&
              data_genes &&
 (
                <Paper elevation={2} sx={{ m: 2 }}>
            <Grid2  xs={12} md={12} lg={12}>
                  <AppBar position="static" color="secondary">
                    <Toolbar style={{  }}>
                    <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="open drawer"
                      onClick={toggleDrawer(true)}
                      sx={{
                        mr: 2,
                        ...(open && { display: "none" }),
                      }}
                    >
                      <MenuIcon />
                    </IconButton>

                    
                  <Grid2 container spacing={2}>
                    <Grid2 xs={1} md={1} lg={1} sx={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
                    <Typography variant="h6" display="inline">
                              Gene:
                            </Typography>
                    </Grid2>
                    <Grid2 xs={2} md={2} lg={2} sx={{ alignItems: "center", justifyContent: "center", display: "flex", mt: 5 }}>
                            <GeneAutoComplete assembly={assembly} gene={gene} pathname={pathname} setGene={setGene} />
                    </Grid2>
                    <Grid2 container xs={7} md={7} lg={7} sx={{ "& > :not(style)": { ml: 1.0, mr: 1.0 }, alignItems: "center", justifyContent: "center", display: "flex" }}>
                        <Typography variant="h6" display="inline">
                          Coordinates:
                        </Typography>
                        <TextField
                          id="outlined-basic"
                          label={dr1.toLocaleString("en-US")}
                          variant="standard"
                          size="small"
                          sx={{ mb: 1.5 }}
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
                              } else return <ErrorMessage error={new Error("invalid range")} />
                            }
                          }}
                        />
                        <Typography display="inline">
                          to
                        </Typography>
                        <TextField
                          id="outlined-basic"
                          label={dr2.toLocaleString("en-US")}
                          variant="standard"
                          size="small"
                          sx={{ mb: 1.5 }}
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
                              } else return <ErrorMessage error={new Error("invalid range")} />
                            }
                          }}
                        />
                    </Grid2>
                    <Grid2 xs={2}>
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
                    </Grid2>
                  </Grid2>
                  </Toolbar>
                  </AppBar>
                  </Grid2>
                  <Grid2 xs={12} md={12} lg={12} mt={2}>
                    <Box mb={3}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        <Chip
                          label={ct1.replace(/_/g, " ")}
                          variant="outlined"
                          sx={{ padding: 2.5, mr: 2, fontSize: 20 }}
                          onDelete={() => setct1("")}
                        />
                        <Typography variant="h5">
                          vs
                        </Typography>
                        <Chip
                          label={ct2.replace(/_/g, " ")}
                          variant="outlined"
                          sx={{ padding: 2.5, ml: 2, fontSize: 20 }}
                          onDelete={() => setct2("")}
                        />
                      </div>
                    </Box>
                    <svg className="graph" aria-labelledby="title desc" role="img" viewBox="0 0 1000 550">
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
                          {chromosome}
                        </text>
                        <text x={400} y={525} style={{ fontSize: 15 }}>
                          Coordinates (base pairs)
                        </text>
                      </g>
                      <g className="labels x-labels">
                        {/* {SetRange_x(range, dimensions)} */}
                        <SetRange_x range={range} dimensions={dimensions} />
                        <line x1="100" y1="450" x2="900" y2="450" stroke="black"></line>
                      </g>
                      <g className="labels y-labels">
                        <SetRange_y range={range} dimensions={dimensions} ct1={ct1} ct2={ct2} data_ct1={data_ct1} data_ct2={data_ct2} setRange={setRange}/>
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
                        {/* {!toggleFC? (
                          <></>
                        ) : (
                          data[data.gene].nearbyDEs.data.map(
                            (point, i: number) => BarPoint(point, i, range, dimensions)
                            <BarPoint point={point} i={i} range={range} dimensions={dimensions} />
                          )
                        )} */}
                        {!toggleccres ? (
                          <></>
                        ) : (
                          data_ct1.cCRESCREENSearch.map(
                            (point: cCREZScore, i: number) => <Point point={point} i={i} range={range} dimensions={dimensions} data_ct2={data_ct2} setRange={setRange} ct1={ct1} ct2={ct2} />
                          )
                        )}
                        {!toggleGenes ? (
                          <></>
                        ) : (
                          data_genes.gene.map(
                            (point: cCREZScore, i: number) => <GenePoint point={point} i={i} range={range} dimensions={dimensions} toggleGenes={toggleGenes} />
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
                    <Box>
                      <svg className="graph" aria-labelledby="title desc" role="img" viewBox="0 0 1000 1500">
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
                          {data_genes.gene.map(
                            (point: Gene, i: number) => <GenePoint point={point} i={i} range={range} dimensions={dimensions} toggleGenes={false} />
                          )}
                        </g>
                      </svg>
                    </Box>
                    </Grid2>
                </Paper>
              )
            )}
        </Grid2>
      </Grid2>
      </ThemeProvider>
      </Paper>
    </main>
  )
}
