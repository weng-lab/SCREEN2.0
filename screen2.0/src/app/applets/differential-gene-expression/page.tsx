"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ReadonlyURLSearchParams, useSearchParams, usePathname } from "next/navigation"
import { LoadingMessage, ErrorMessage, createLink } from "../../../common/lib/utility"
import { client } from "../../search/ccredetails/client"

import { DataTable } from "@weng-lab/psychscreen-ui-components"
import Divider from "@mui/material/Divider"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import MenuIcon from "@mui/icons-material/Menu"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
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
  AccordionSummary,
  AccordionDetails,
  Accordion,
} from "@mui/material"

import { useQuery } from "@apollo/client"
import { GENE_SEARCH_QUERY, ZSCORE_QUERY } from "./queries"
import GeneAutoComplete from "../gene-expression/gene-autocomplete"
import { CoordinateRangeField, TogglePCT, TogglePlot } from "./options"
import { PlotDifferentialExpression, PlotGenes } from "./plot"
import { cellTypeInfoArr } from "./types"
import { Range2D } from "jubilant-carnival"
import { gene } from "../gene-expression/types"
import { initialhighlight } from "./const"

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
  const [title, setTitle] = useState<{ ct1: { name: string; expID: string }; ct2: { name: string; expID: string } }>({
    ct1: { name: "A549 (treated)", expID: "ENCSR000ASH" },
    ct2: { name: "A673", expID: "ENCSR346JWH" },
  })
  const [cellTypes, setCellTypes] = useState<cellTypeInfoArr>()

  const [dr, setdr] = useState<number[]>([2500000, 3000000])
  const [range, setRange] = useState<Range2D>({
    x: { start: dr[0], end: dr[1] },
    y: { start: -1, end: 1 },
  })
  const [dimensions, setDimensions] = useState<Range2D>({
    x: { start: 100, end: 900 },
    y: { start: 450, end: 50 },
  })

  const [rowHighlight, setRowHighlight] = useState<{}[]>(initialhighlight)
  const [toggleGenes, setToggleGenes] = useState<boolean>(false)
  const [toggleFC, setToggleFC] = useState<boolean>(true)
  const [toggleccres, setTogglecCREs] = useState<boolean>(true)
  const [togglePCT, setPCT] = useState<{
    TF: boolean
    CA: boolean
    "CA-CTCF": boolean
    "CA-H3K4me3": boolean
    dELS: boolean
    pELS: boolean
  }>({
    TF: true,
    CA: true,
    "CA-CTCF": true,
    "CA-H3K4me3": true,
    dELS: true,
    pELS: true,
  })

  const [slider, setSlider] = useState<{ x1: number; x2: number; min: number; max: number }>({
    x1: 2500000,
    x2: 3000000,
    min: 2500000,
    max: 3000000,
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
      chromosome: chromosome,
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
      coord_chrom: chromosome,
      coord_start: slider.min,
      coord_end: slider.max,
      cellType: ct1,
      gene_all_start: 0,
      gene_all_end: 5000000,
      gene_pc_start: 0,
      gene_pc_end: 5000000,
      rank_atac_end: 10.0,
      rank_atac_start: -10.0,
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
      coord_chrom: chromosome,
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

  // set range of gene
  useEffect(() => {
    if (gene) {
      const start: number = Math.floor(gene.start / parseInt("1" + "00000")) * parseInt("1" + "00000")
      const end: number = Math.ceil(gene.end / parseInt("1" + "00000")) * parseInt("1" + "00000")
      setdr([gene.start, gene.end])
      setRange({
        x: {
          start: start - (start > 20000 ? 20000 : 0),
          end: end + 20000,
        },
        y: {
          start: range.y.start,
          end: range.y.end,
        },
      })
      setSlider({
        x1: start - (start > 20000 ? 20000 : 0),
        x2: end + 20000,
        min: start - (start > 20000 ? 20000 : 0),
        max: end + 20000,
      })
    }
  }, [gene])

  // chip title
  const PlotTitle = () => {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          mt: 3,
          mb: 3,
        }}
      >
        <Chip
          label={createLink("https://www.encodeproject.org/experiments/", title.ct1.expID, title.ct1.name + " " + title.ct1.expID)}
          // label={ct1.replace(/_/g, " ")}
          variant="filled"
          // color="primary"
          sx={{ padding: 2.5, mr: 2, fontSize: 20, display: "flex" }}
          onDelete={() => {
            setct1("")
            setTitle({ ct1: { name: "", expID: "" }, ct2: title.ct2 })
          }}
        />
        <Typography variant="h5">vs</Typography>
        <Chip
          label={createLink("https://www.encodeproject.org/experiments/", title.ct2.expID, title.ct2.name + " " + title.ct2.expID)}
          // label={ct2.replace(/_/g, " ")}
          variant="filled"
          // color="primary"
          sx={{ padding: 2.5, ml: 2, fontSize: 20, display: "flex" }}
          onDelete={() => {
            setct2("")
            setTitle({ ct1: title.ct1, ct2: { name: "", expID: "" } })
          }}
        />
      </Box>
    )
  }

  return loading ? (
    <LoadingMessage />
  ) : (
    <main>
      {/* <ThemeProvider theme={defaultTheme}> */}
        <Paper sx={{ ml: open ? `${drawerWidth}px` : 0, mt: 4 }} elevation={2}>
          <AppBar position="static" color="secondary" sx={{}}>
            <Grid2 container>
              <Grid2 xs={0.5} md={0.5} lg={0.5} sx={{ alignItems: "center", justifyContent: "center", display: "flex", ml: 2 }}>
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  onClick={toggleDrawer(true)}
                  sx={{
                    mr: 0,
                    ...(open && { display: "none" }),
                  }}
                >
                  <MenuIcon />
                </IconButton>
              </Grid2>
              <Grid2 xs={0.5} md={0.5} lg={0.5} sx={{ alignItems: "center", justifyContent: "center", display: "flex", mr: 1 }}>
                <Typography variant="h6" display="inline">
                  Gene:
                </Typography>
              </Grid2>
              <Grid2 xs={3} md={3} lg={3} sx={{ display: "flex", mt: 5 }}>
                <GeneAutoComplete
                  assembly={((assembly === "GRCh38") || (assembly === "mm10")) ? assembly : "GRCh38"}
                  gene={gene ? gene.name : ""}
                  setGene={setGene}
                />
              </Grid2>
              <Grid2 xs={7} md={7} lg={7} sx={{ alignItems: "right", justifyContent: "right", display: "flex" }}>
                <CoordinateRangeField dr={dr} range={range} slider={slider} setdr={setdr} setRange={setRange} setSlider={setSlider} />
              </Grid2>
            </Grid2>
          </AppBar>
          {error_ct1 || error_ct2 || error_genes ? (
            <ErrorMessage error={new Error("Error loading")} />
          ) : loading_ct1 || loading_ct2 || loading_genes ? (
            <LoadingMessage />
          ) : (
            data_ct1 &&
            data_ct2 &&
            data_genes && (
              <Grid2 container spacing={3} sx={{ alignItems: "center", justifyContent: "center", display: "flex" }}>
                <Paper elevation={0} sx={{ m: 4, width: open ? "100%" : "75%" }}>
                  <PlotTitle />
                  <PlotDifferentialExpression
                    title={title}
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
                    togglePCT={togglePCT}
                    setRange={setRange}
                  />
                  <PlotGenes data_genes={data_genes} range={range} dimensions={dimensions} />
                </Paper>
              </Grid2>
            )
          )}
        </Paper>
        <Drawer
          sx={{
            width: `${drawerWidth}px`,
            display: "flex",
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              height: drawerHeight,
              width: `${drawerWidth}px`,
              mt: 12.5,
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
              mt: 5,
              mb: 5,
            }}
          >
            <IconButton onClick={toggleDrawer(false)}>
              <ArrowBackIosIcon />
            </IconButton>
          </Box>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <></>
          ) : (
            cellTypes &&
            cellTypes["cellTypeInfoArr"] && (
              <Grid2 container spacing={2}>
                <Grid2 xs={12} md={12} lg={12} ml={1} mr={1}>
                  <Box>
                    <Accordion defaultExpanded={true}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h5">Cell Type 1</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <DataTable
                          highlighted={rowHighlight ? rowHighlight[0] : false}
                          page={1}
                          rows={cellTypes["cellTypeInfoArr"]}
                          columns={[
                            { header: "Cell Type", value: (row: any) => row.biosample_summary },
                            {
                              header: "Experiment",
                              value: (row: any) => row.expID,
                              render: (row: any) => createLink("https://encodeproject.org/experiments/", row.expID),
                            },
                            { header: "Tissue", value: (row: any) => row.tissue },
                          ]}
                          onRowClick={(row: any) => {
                            setct1(row.value)
                            setTitle({
                              ct1: {
                                name: row.name,
                                expID: row.expID,
                              },
                              ct2: title.ct2,
                            })
                            if (rowHighlight) setRowHighlight([row, rowHighlight[1]])
                            else setRowHighlight([row])
                          }}
                          sortDescending={true}
                          searchable={true}
                          dense={true}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                  <Divider sx={{ mb: 2, mt: 2 }} />
                  <Box>
                    <Accordion defaultExpanded={true}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="h5">Cell Type 2</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        <DataTable
                          highlighted={rowHighlight ? rowHighlight[1] : false}
                          page={1}
                          rows={cellTypes["cellTypeInfoArr"]}
                          columns={[
                            { header: "Cell Type", value: (row: any) => row.biosample_summary },
                            {
                              header: "Experiment",
                              value: (row: any) => row.expID,
                              render: (row: any) => createLink("https://encodeproject.org/experiments/", row.expID),
                            },
                            { header: "Tissue", value: (row: any) => row.tissue },
                          ]}
                          onRowClick={(row: any) => {
                            setct2(row.value)
                            setTitle({
                              ct1: title.ct1,
                              ct2: {
                                name: row.name,
                                expID: row.expID,
                              },
                            })
                            if (rowHighlight) setRowHighlight([rowHighlight[0], row])
                            else setRowHighlight([row])
                          }}
                          sortDescending={true}
                          searchable={true}
                          dense={true}
                        />
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                  <Divider sx={{ mb: 2, mt: 2 }} />
                  <Grid2 xs={12} md={12} lg={12} ml={1} mr={1}>
                    <Typography>Filters</Typography>
                    <Divider sx={{ mb: 2, mt: 2 }} />
                    <FormGroup>
                      <TogglePlot label="cCREs" toggle={toggleccres} setToggle={setTogglecCREs} />
                      <TogglePlot label="log2 fold change" toggle={toggleFC} setToggle={setToggleFC} />
                      <TogglePlot label="genes" toggle={toggleGenes} setToggle={setToggleGenes} />
                    </FormGroup>
                    <Divider sx={{ mb: 2, mt: 2 }} />
                    <Divider sx={{ mb: 2, mt: 2 }} />
                    <FormGroup>
                      <TogglePCT togglePCT={togglePCT} setPCT={setPCT} />
                    </FormGroup>
                    <Divider sx={{ mb: 2, mt: 2 }} />
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Typography display="inline">Coordinate Range:</Typography>
                      <Slider
                        sx={{
                          mr: 8,
                          ml: 4,
                        }}
                        value={[slider.x1, slider.x2]}
                        step={100000}
                        marks
                        min={slider.min}
                        max={slider.max}
                        valueLabelDisplay="auto"
                        onChange={(event: Event, value: number | number[]) => {
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
                    <Divider sx={{ mb: 2, mt: 2 }} />
                  </Grid2>
                </Grid2>
              </Grid2>
            )
          )}
        </Drawer>
      {/* </ThemeProvider> */}
    </main>
  )
}
