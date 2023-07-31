"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ReadonlyURLSearchParams, useSearchParams, usePathname } from "next/navigation"
import { LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
import { client } from "../../search/ccredetails/client"

import { DataTable } from "@weng-lab/ts-ztable"
import Divider from "@mui/material/Divider"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import MenuIcon from "@mui/icons-material/Menu"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import { ThemeProvider } from "@mui/material/styles"
import { defaultTheme } from "../../../common/lib/themes"
import {
  Box,
  FormGroup,
  Slider,
  Typography,
  IconButton,
  Paper,
  Chip,
  Drawer,
  AppBar,
  Toolbar,
} from "@mui/material"

import { ApolloClient, InMemoryCache, useQuery } from "@apollo/client"
import { GENE_SEARCH_QUERY, ZSCORE_QUERY } from "./const"
import GeneAutoComplete from "../gene-expression/gene-autocomplete"
import { CoordinateRangeField, TogglePlot } from "./options"
import { PlotDifferentialExpression, PlotGenes } from "./plot"
import { cellTypeInfoArr } from "./types"
import { Range2D } from "jubilant-carnival"
import { gene } from "../gene-expression/types"

// /**
//  * server fetch for list of cell types
//  */
// const getCellTypes = cache(async () => {
//   const cellTypes = await fetch("https://storage.googleapis.com/gcp.wenglab.org/newV4/GRCh38.json")
//   return cellTypes
// })

// /**
//  * server fetch for cell info
//  */
// const getCellInfo = cache(async () => {
//   const cellInfo = await fetchServer("https://screen-beta-api.wenglab.org/dews/search", payload)
//   return cellInfo
// })

/**
 * This is the differential gene expression app.
 * It plots the difference in z-score of cres and gene expression (log2 fold change) between 2 cell types. 
 * Additionally, it plots the genes occupational coordinates and their strand.
 * @returns differential gene expression app
 */
export default function DifferentialGeneExpression() {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()!
  const router = useRouter()
  const pathname = usePathname()

  if (!searchParams.get("assembly")) router.replace(pathname + "?assembly=GRCh38&chromosome=chr11")

  const [loading, setLoading] = useState<boolean>(true)
  const [open, setState] = useState<boolean>(true)

  const [assembly, setAssembly] = useState<string>(searchParams.get("assembly") ? searchParams.get("assembly") : "GRCh38")
  const [chromosome, setChromosome] = useState<string>(searchParams.get("chromosome") ? searchParams.get("chromosome") : "chr11")
  const [gene, setGene] = useState<gene>(null)

  const [ct1, setct1] = useState<string>("A172_ENCDO934VENA549_treated_with_0.02%_ethanol_for_1_hour_ENCDO000AAZ")
  const [ct2, setct2] = useState<string>("A673_ENCDO027VXA")
  const [cellTypes, setCellTypes] = useState<cellTypeInfoArr>()

  const [dr, setdr] = useState<number[]>([4000000, 5000000])
  const [range, setRange] = useState<Range2D>({
    x: { start: dr[0], end: dr[1] },
    y: { start: -1, end: 1 },
  })
  const [dimensions, setDimensions] = useState<Range2D>({
    x: { start: 100, end: 900 },
    y: { start: 450, end: 50 },
  })

  const [toggleGenes, setToggleGenes] = useState<boolean>(false)
  const [toggleFC, setToggleFC] = useState<boolean>(true)
  const [toggleccres, setTogglecCREs] = useState<boolean>(true)
  const [slider, setSlider] = useState<{ x1: number; x2: number; min: number; max: number }>({
    x1: 4000000,
    x2: 5000000,
    min: 4000000,
    max: 5000000,
  })

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
  const {
    loading: loading_genes,
    error: error_genes,
    data: data_genes,
  } = useQuery(GENE_SEARCH_QUERY, {
    variables: {
      assembly: assembly,
      chromosome: "chr11",
      start: slider.min,
      end: slider.max,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  // cell type 1
  const {
    loading: loading_ct1,
    error: error_ct1,
    data: data_ct1,
  } = useQuery(ZSCORE_QUERY, {
    variables: {
      assembly: assembly,
      coord_chrom: "chr11",
      coord_start: slider.min,
      coord_end: slider.max,
      cellType: ct1,
      gene_all_start: 0,
      gene_all_end: 5000000,
      gene_pc_start: 0,
      gene_pc_end: 5000000,
      rank_ctcf_end: 10.0,
      rank_ctcf_start: -10.0,
      rank_dnase_end: 10.0,
      rank_dnase_start: -10.0,
      rank_enhancer_end: 10.0,
      rank_enhancer_start: -10.0,
      rank_promoter_end: 10.0,
      rank_promoter_start: -10.0,
      element_type: null,
      limit: 25000,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  // cell type 2
  const {
    loading: loading_ct2,
    error: error_ct2,
    data: data_ct2,
  } = useQuery(ZSCORE_QUERY, {
    variables: {
      assembly: assembly,
      coord_chrom: "chr11",
      coord_start: slider.min,
      coord_end: slider.max,
      cellType: ct2,
      gene_all_start: 0,
      gene_all_end: 5000000,
      gene_pc_start: 0,
      gene_pc_end: 5000000,
      rank_ctcf_end: 10.0,
      rank_ctcf_start: -10.0,
      rank_dnase_end: 10.0,
      rank_dnase_start: -10.0,
      rank_enhancer_end: 10.0,
      rank_enhancer_start: -10.0,
      rank_promoter_end: 10.0,
      rank_promoter_start: -10.0,
      element_type: null,
      limit: 25000,
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

  useEffect(() => {
    if(gene){
    const start: number = Math.floor(gene.start / parseInt("1" + "00000")) * parseInt("1" + "00000")
    const end: number = Math.ceil(gene.end / parseInt("1" + "00000")) * parseInt("1" + "00000")
    setdr([gene.start, gene.end])
    setRange({
      x: {
        start: start,
        end: end,
      },
      y: {
        start: range.y.start,
        end: range.y.end,
      },
    })
    setSlider({
      x1: start,
      x2: end,
      min: start,
      max: end,
    })
  }
  }, [gene])

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
                            setRange({ x: { start: range.x.start, end: range.x.end }, y: { start: 0, end: 0 } })
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
                data_ct1 &&
                data_ct2 &&
                data_genes && (
                  <Paper elevation={2} sx={{ m: 2 }}>
                    <Grid2 xs={12} md={12} lg={12}>
                      <AppBar position="static" color="secondary">
                        <Toolbar style={{}}>
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
                              <GeneAutoComplete
                                assembly={assembly}
                                gene={gene ? gene.name : ""}
                                pathname={pathname + "?assembly=" + assembly + "&chromosome=" + chromosome}
                                setGene={setGene}
                              />
                            </Grid2>
                            <Grid2 xs={7} md={7} lg={7} sx={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
                              <CoordinateRangeField
                                dr={dr}
                                range={range}
                                slider={slider}
                                setdr={setdr}
                                setRange={setRange}
                                setSlider={setSlider}
                              />
                            </Grid2>
                            <Grid2 xs={2}>
                              <FormGroup>
                                <TogglePlot label="cCREs" toggle={toggleccres} setToggle={setTogglecCREs} />
                                <TogglePlot label="log2 fold change" toggle={toggleFC} setToggle={setToggleFC} />
                                <TogglePlot label="genes" toggle={toggleGenes} setToggle={setToggleGenes} />
                              </FormGroup>
                            </Grid2>
                          </Grid2>
                        </Toolbar>
                      </AppBar>
                    </Grid2>
                    <Grid2 xs={12} md={12} lg={12} mt={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mb: 3,
                        }}
                      >
                        <Chip
                          label={ct1.replace(/_/g, " ")}
                          variant="outlined"
                          sx={{ padding: 2.5, mr: 2, fontSize: 20 }}
                          onDelete={() => setct1("")}
                        />
                        <Typography variant="h5">vs</Typography>
                        <Chip
                          label={ct2.replace(/_/g, " ")}
                          variant="outlined"
                          sx={{ padding: 2.5, ml: 2, fontSize: 20 }}
                          onDelete={() => setct2("")}
                        />
                      </Box>
                      <PlotDifferentialExpression
                        chromosome={chromosome}
                        range={range}
                        dimensions={dimensions}
                        ct1={ct1}
                        ct2={ct2}
                        data_ct1={data_ct1}
                        data_ct2={data_ct2}
                        data_genes={data_genes}
                        toggleFC={toggleFC}
                        toggleccres={toggleccres}
                        toggleGenes={toggleGenes}
                        setRange={setRange}
                      />
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          mb: 1,
                          width: 400
                        }}
                      >
                        <Slider
                          value={[slider.x1, slider.x2]}
                          step={100000}
                          marks
                          min={slider.min}
                          max={slider.max}
                          valueLabelDisplay="auto"
                          onChange={(event: Event, value: number | number[]) => {
                            let n: number = 0
                            if (value[0] > value[1]) return <></>
                            if (value[0] !== slider.x1) {
                              setSlider({
                                x1: value[0],
                                x2: slider.x2,
                                min: slider.min,
                                max: slider.max,
                              })
                              setdr([value[0], dr[1]])
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
                              setSlider({
                                x1: slider.x1,
                                x2: value[1],
                                min: slider.min,
                                max: slider.max,
                              })
                              setdr([dr[0], value[1]])
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
                      <Box>
                        <PlotGenes data_genes={data_genes} range={range} dimensions={dimensions} />
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
