"use client"
import React, { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ReadonlyURLSearchParams, useSearchParams, usePathname } from "next/navigation"
import { LoadingMessage, ErrorMessage } from "../../../common/lib/utility"

// import { PlotGeneExpression } from "./utils"
import { PlotGeneExpression } from "../../applets/gene-expression/utils"
import { gene, BiosampleList, CellComponents, GeneExpressions } from "../../applets/gene-expression/types"
import { Range2D } from "jubilant-carnival"
// import { QueryResponse } from "../differential-gene-expression/types"
import { QueryResponse } from "../../applets/differential-gene-expression/types"

import {
  Autocomplete,
  TextField,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  debounce,
  Checkbox,
  FormControlLabel,
  FormGroup,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Container,
  IconButton,
  Drawer,
  Toolbar,
  AppBar,
  Stack,
  Paper,
} from "@mui/material"

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { ThemeProvider } from "@mui/material/styles"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import MenuIcon from "@mui/icons-material/Menu"
import Divider from "@mui/material/Divider"
import { CheckBox, ExpandMore } from "@mui/icons-material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Image from "next/image"
import { gql } from "@apollo/client"
import { defaultTheme } from "../../../common/lib/themes"

const GENE_AUTOCOMPLETE_QUERY = gql`
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
`

export function GeneExpression(props: { accession: string, assembly: string, gene: string, hamburger: boolean }) {
  // const searchParams: ReadonlyURLSearchParams = useSearchParams()!
  const router = useRouter()
  const pathname = usePathname()

  // if (!pathname.split("/").includes("search") && !searchParams.get("gene")) router.push(pathname + "?gene=OR51AB1P")

  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<GeneExpressions>()
  const [options, setOptions] = useState<string[]>([])
  const [open, setState] = useState<boolean>(true)

  const [current_assembly, setAssembly] = useState<string>(props.assembly ? props.assembly : "GRCh38")
  const [current_gene, setGene] = useState<string>(props.gene ? props.gene : "OR51AB1P")
  const [geneID, setGeneID] = useState<string>(props.gene ? props.gene : "OR51AB1P")
  const [geneDesc, setgeneDesc] = useState<{ name: string; desc: string }[]>()
  const [geneList, setGeneList] = useState<gene[]>([])

  const [group, setGroup] = useState<string>("byTissueMaxFPKM") // experiment, tissue, tissue max
  const [RNAtype, setRNAType] = useState<string>("all") // any, polyA RNA-seq, total RNA-seq
  const [scale, setScale] = useState<string>("rawFPKM") // linear or log2
  const [replicates, setReplicates] = useState<string>("mean") // single or mean

  const [biosamples_list, setBiosamplesList] = useState<string[]>(["cell line", "in vitro differentiated cells", "primary cell", "tissue"])
  const [biosamples, setBiosamples] = useState<BiosampleList>({
    cell_line: true,
    in_vitro: true,
    primary_cell: true,
    tissue: true,
  })

  const [cell_components_list, setCellComponentsList] = useState<string[]>(["cell"])
  const [cell_components, setCellComponents] = useState<CellComponents>({
    cell: true,
    chromatin: false,
    cytosol: false,
    membrane: false,
    nucleolus: false,
    nucleoplasm: false,
    nucleus: false,
  })

  const [range, setRange] = useState<Range2D>({
    x: { start: 0, end: 4 },
    y: { start: 0, end: 0 },
  })

  const [dimensions, setDimensions] = useState<Range2D>({
    x: { start: 125, end: 650 },
    y: { start: 250, end: 0 },
  })

  // fetch gene expression data
  useEffect(() => {
    fetch("https://screen-beta-api.wenglab.org/gews/search", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        assembly: current_assembly,
        biosample_types_selected: biosamples_list,
        compartments_selected: cell_components_list,
        gene: current_gene,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          setError(true)
          return <ErrorMessage error={new Error(response.statusText)} />
        }
        return response.json()
      })
      .then((data) => {
        setData(data)
        setLoading(false)
      })
      .catch((error: Error) => {
        return <ErrorMessage error={error} />
      })
    setLoading(true)
  }, [current_assembly, current_gene, biosamples_list, cell_components_list, biosamples, cell_components])

  // remove or add list of checked items
  const toggleList = (checkList: string[], option: string) => {
    if (checkList.includes(option)) {
      const index = checkList.indexOf(option, 0)
      if (index > -1) {
        checkList.splice(index, 1)
      }
    } else {
      checkList.push(option)
    }

    return checkList
  }

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
          assembly: "GRCh38",
          name_prefix: value,
          limit: 100,
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

  // delay fetch
  const debounceFn = useCallback(debounce(onSearchChange, 500), [])

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setState(open)
  }

  // set drawer height based on window size
  const drawerWidth: number = 350
  let drawerHeight: number = window.screen.height
  let drawerHeightTab: number = window.screen.height

  // 1080
  if (drawerHeight < 1200) {
    drawerHeight *= 0.85 
    drawerHeightTab *= 0.60
  } // 2k
  else if (drawerHeight < 2000) {
    drawerHeight *= 0.90 
    drawerHeightTab *= 0.70
  } // 4k

  return (
    <main>
      <Paper sx={{ ml: open ? `${drawerWidth}px` : 0 }} elevation={2}>
        <ThemeProvider theme={defaultTheme}>
          <Grid2 container spacing={3} sx={{ mt: "2rem", ml: "1.5rem", mr: "2rem" }}>
            {/* hamburger with options for plot */}
            <Grid2>
              <Box sx={{ display: "flex" }}>
                <Drawer
                  sx={{
                    width: `${drawerWidth}px`,
                    // height: 600,
                    display: "flex",
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                      width: `${drawerWidth}px`,
                    height: pathname.split("/").includes("search") ? drawerHeightTab : drawerHeight,
                    display: "flex",
                    boxSizing: "border-box",
                      mt: pathname.split("/").includes("search") ? 47.5 : 12.6,
                      // ml: pathname.split("/").includes("search") ? `${drawerWidth+96}px` : props.hamburger ? 96 : 0
                      ml: pathname.split("/").includes("search") && props.hamburger ? `${drawerWidth+96}px` : pathname.split("/").includes("search") ? `${96}px` : 0
                    },
                  }}
                  PaperProps={{ sx: { mt: 12.5 }, elevation: 2 }}
                  anchor="left"
                  open={open}
                  onClose={toggleDrawer(false)}
                  variant="persistent"
                >
                  <Paper>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "right",
                        direction: "row",
                        alignItems: "right",
                        mt: 10,
                        mb: 10,
                      }}
                    >
                      <IconButton onClick={toggleDrawer(false)}>
                        <ArrowBackIosIcon />
                      </IconButton>
                    </Box>
                    <Divider sx={{ mb: 2 }} />
                    <Stack sx={{ mb: "2rem" }}>
                      {/* biosample types */}
                      <Accordion disableGutters={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Biosample Types</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <FormGroup>
                            <FormControlLabel
                              label="cell line"
                              control={
                                <Checkbox
                                  checked={biosamples["cell_line"]}
                                  onClick={() => {
                                    setBiosamplesList(toggleList(biosamples_list, "cell line"))
                                    setBiosamples({
                                      cell_line: biosamples.cell_line ? false : true,
                                      in_vitro: biosamples.in_vitro,
                                      primary_cell: biosamples.primary_cell,
                                      tissue: biosamples.tissue,
                                    })
                                  }}
                                />
                              }
                            />
                            <FormControlLabel
                              label="in vitro differentiated cells"
                              control={
                                <Checkbox
                                  checked={biosamples["in_vitro"]}
                                  onClick={() => {
                                    setBiosamplesList(toggleList(biosamples_list, "in vitro differentiated cells"))
                                    setBiosamples({
                                      cell_line: biosamples.cell_line,
                                      in_vitro: biosamples.in_vitro ? false : true,
                                      primary_cell: biosamples.primary_cell,
                                      tissue: biosamples.tissue,
                                    })
                                  }}
                                />
                              }
                            />
                            <FormControlLabel
                              label="primary cell"
                              control={
                                <Checkbox
                                  checked={biosamples["primary_cell"]}
                                  onClick={() => {
                                    setBiosamplesList(toggleList(biosamples_list, "primary cell"))
                                    setBiosamples({
                                      cell_line: biosamples.cell_line,
                                      in_vitro: biosamples.in_vitro,
                                      primary_cell: biosamples.primary_cell ? false : true,
                                      tissue: biosamples.tissue,
                                    })
                                  }}
                                />
                              }
                            />
                            <FormControlLabel
                              label="tissue"
                              control={
                                <Checkbox
                                  checked={biosamples["tissue"]}
                                  onClick={() => {
                                    setBiosamplesList(toggleList(biosamples_list, "tissue"))
                                    setBiosamples({
                                      cell_line: biosamples.cell_line,
                                      in_vitro: biosamples.in_vitro,
                                      primary_cell: biosamples.primary_cell,
                                      tissue: biosamples.tissue ? false : true,
                                    })
                                  }}
                                />
                              }
                            />
                          </FormGroup>
                        </AccordionDetails>
                      </Accordion>
                      {/* cellular components */}
                      <Accordion disableGutters={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Cellular Compartments</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <FormGroup>
                            <FormControlLabel
                              label="cell"
                              control={
                                <Checkbox
                                  checked={cell_components["cell"]}
                                  onClick={() => {
                                    setCellComponentsList(toggleList(cell_components_list, "cell"))
                                    setCellComponents({
                                      cell: cell_components.cell ? false : true,
                                      chromatin: cell_components.chromatin,
                                      cytosol: cell_components.cytosol,
                                      membrane: cell_components.membrane,
                                      nucleolus: cell_components.nucleolus,
                                      nucleoplasm: cell_components.nucleoplasm,
                                      nucleus: cell_components.nucleus,
                                    })
                                  }}
                                />
                              }
                            />
                            <FormControlLabel
                              label="chromatin"
                              control={
                                <Checkbox
                                  checked={cell_components["chromatin"]}
                                  onClick={() => {
                                    setCellComponentsList(toggleList(cell_components_list, "chromatin"))
                                    setCellComponents({
                                      cell: cell_components.cell,
                                      chromatin: cell_components.chromatin ? false : true,
                                      cytosol: cell_components.cytosol,
                                      membrane: cell_components.membrane,
                                      nucleolus: cell_components.nucleolus,
                                      nucleoplasm: cell_components.nucleoplasm,
                                      nucleus: cell_components.nucleus,
                                    })
                                  }}
                                />
                              }
                            />
                            <FormControlLabel
                              label="cytosol"
                              control={
                                <Checkbox
                                  checked={cell_components["cytosol"]}
                                  onClick={() => {
                                    setCellComponentsList(toggleList(cell_components_list, "cytosol"))
                                    setCellComponents({
                                      cell: cell_components.cell,
                                      chromatin: cell_components.chromatin,
                                      cytosol: cell_components.cytosol ? false : true,
                                      membrane: cell_components.membrane,
                                      nucleolus: cell_components.nucleolus,
                                      nucleoplasm: cell_components.nucleoplasm,
                                      nucleus: cell_components.nucleus,
                                    })
                                  }}
                                />
                              }
                            />
                            <FormControlLabel
                              label="membrane"
                              control={
                                <Checkbox
                                  checked={cell_components["membrane"]}
                                  onClick={() => {
                                    setCellComponentsList(toggleList(cell_components_list, "membrane"))
                                    setCellComponents({
                                      cell: cell_components.cell,
                                      chromatin: cell_components.chromatin,
                                      cytosol: cell_components.cytosol,
                                      membrane: cell_components.membrane ? false : true,
                                      nucleolus: cell_components.nucleolus,
                                      nucleoplasm: cell_components.nucleoplasm,
                                      nucleus: cell_components.nucleus,
                                    })
                                  }}
                                />
                              }
                            />
                            <FormControlLabel
                              label="nucleolus"
                              control={
                                <Checkbox
                                  checked={cell_components["nucleoplus"]}
                                  onClick={() => {
                                    setCellComponentsList(toggleList(cell_components_list, "nucleoplus"))
                                    setCellComponents({
                                      cell: cell_components.cell,
                                      chromatin: cell_components.chromatin,
                                      cytosol: cell_components.cytosol,
                                      membrane: cell_components.membrane,
                                      nucleolus: cell_components.nucleolus ? false : true,
                                      nucleoplasm: cell_components.nucleoplasm,
                                      nucleus: cell_components.nucleus,
                                    })
                                  }}
                                />
                              }
                            />
                            <FormControlLabel
                              label="nucleoplasm"
                              control={
                                <Checkbox
                                  checked={cell_components["nucleoplasm"]}
                                  onClick={() => {
                                    setCellComponentsList(toggleList(cell_components_list, "nucleoplasm"))
                                    setCellComponents({
                                      cell: cell_components.cell,
                                      chromatin: cell_components.chromatin,
                                      cytosol: cell_components.cytosol,
                                      membrane: cell_components.membrane,
                                      nucleolus: cell_components.nucleolus,
                                      nucleoplasm: cell_components.nucleoplasm ? false : true,
                                      nucleus: cell_components.nucleus,
                                    })
                                  }}
                                />
                              }
                            />
                            <FormControlLabel
                              label="nucleus"
                              control={
                                <Checkbox
                                  checked={cell_components["nucleus"]}
                                  onClick={() => {
                                    setCellComponentsList(toggleList(cell_components_list, "nucleus"))
                                    setCellComponents({
                                      cell: true,
                                      chromatin: false,
                                      cytosol: false,
                                      membrane: false,
                                      nucleolus: false,
                                      nucleoplasm: false,
                                      nucleus: cell_components.nucleus ? false : true,
                                    })
                                  }}
                                />
                              }
                            />
                          </FormGroup>
                        </AccordionDetails>
                      </Accordion>
                      {/* group by */}
                      <Accordion disableGutters={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Group By</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <ToggleButtonGroup
                            color="primary"
                            value={group}
                            exclusive
                            size="small"
                            onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
                              if (value !== group) setGroup(value)
                            }}
                            aria-label="Platform"
                          >
                            <ToggleButton value="byExpressionFPKM">Experiment</ToggleButton>
                            <ToggleButton value="byTissueFPKM">Tissue</ToggleButton>
                            <ToggleButton value="byTissueMaxFPKM">Tissue Max</ToggleButton>
                          </ToggleButtonGroup>
                        </AccordionDetails>
                      </Accordion>
                      {/* RNA type */}
                      <Accordion disableGutters={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>RNA Type</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <ToggleButtonGroup
                            color="primary"
                            value={RNAtype}
                            exclusive
                            size="small"
                            onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
                              if (value !== RNAtype) setRNAType(value)
                            }}
                            aria-label="Platform"
                          >
                            <ToggleButton value="total RNA-seq">Total RNA-seq</ToggleButton>
                            <ToggleButton value="polyA RNA-seq">PolyA RNA-seq</ToggleButton>
                            <ToggleButton value="all">Any</ToggleButton>
                          </ToggleButtonGroup>
                        </AccordionDetails>
                      </Accordion>
                      {/* scale */}
                      <Accordion disableGutters={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Scale</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <ToggleButtonGroup
                            color="primary"
                            value={scale}
                            exclusive
                            onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
                              if (value !== scale) setScale(value)
                            }}
                            aria-label="Platform"
                          >
                            <ToggleButton value="rawFPKM">Linear</ToggleButton>
                            <ToggleButton value="logFPKM">Log2</ToggleButton>
                          </ToggleButtonGroup>
                        </AccordionDetails>
                      </Accordion>
                      {/* replicates */}
                      <Accordion disableGutters={true}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography>Replicates</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          {/* <ToggleButton color="secondary" selected={replicates === "mean"} value="linear" onClick={() => {
                                    if (replicates === "mean") setReplicates("single")
                                    else setReplicates("mean")
                                }}>
                                    Mean
                                </ToggleButton> */}
                          <ToggleButtonGroup
                            color="primary"
                            value={replicates}
                            exclusive
                            onChange={(event: React.MouseEvent<HTMLElement>, value: string) => {
                              setReplicates(value)
                            }}
                            aria-label="Platform"
                          >
                            <ToggleButton value="mean">Average</ToggleButton>
                            <ToggleButton value="single">Individual</ToggleButton>
                          </ToggleButtonGroup>
                        </AccordionDetails>
                      </Accordion>
                    </Stack>
                  </Paper>
                </Drawer>
              </Box>
            </Grid2>
            {/* toolbar w/ title & search */}
            <Grid2 xs={12} md={12} lg={12}>
              {/* <ThemeProvider theme={theme}> */}
              <AppBar position="static" color="secondary">
                {/* <Container maxWidth="lg"> */}
                <Toolbar style={{ height: "120px" }}>
                  <Grid2 xs={0.5} md={0.5} lg={0.5}>
                    <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="open drawer"
                      onClick={() => {
                        if (open) toggleDrawer(false)
                        else toggleDrawer(true)
                        toggleDrawer(true)

                        if (open) {
                          setState(false)
                        } else {
                          setState(true)
                        }
                      }}
                      sx={{
                        mr: 1,
                        xs: 0.5,
                        display: {
                          xs: "block",
                        },
                        ...(open && { display: "none" }),
                      }}
                    >
                      <MenuIcon />
                    </IconButton>
                  </Grid2>
                  <Grid2 xs={5} md={8} lg={9}>
                    <Box mt={0.5}>
                      <Typography variant="h4" sx={{ fontSize: 28 }}>
                        {current_gene} Gene Expression Profiles by RNA-seq
                      </Typography>
                    </Box>
                  </Grid2>
                  {/* ucsc */}
                  <Grid2 xs={1.5} sx={{ mt: 2, height: 100, width: 190 }}>
                      <Button variant="contained" href={"https://genome.ucsc.edu/"} color="secondary">
                        <Image src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" width={150} height={100} alt="ucsc-button"/>
                      </Button>
                  </Grid2>
                  {/* gene card */}
                  <Grid2 xs={1.5} sx={{ mt: 2, height: 100, width: 214 }}>
                      <Button variant="contained" href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + current_gene} color="secondary">
                        <Image src="https://geneanalytics.genecards.org/media/81632/gc.png" width={150} height={100} alt="gene-card-button"/>
                        
                      </Button>
                  </Grid2>
                </Toolbar>
                {/* </Container> */}
              </AppBar>
              {/* </ThemeProvider> */}
            </Grid2>
          </Grid2>
          <Grid2 container spacing={3}>
            <Grid2 xs={1} md={1} lg={1} sx={{ mt: 2, ml: 8 }}>
              <Autocomplete
                disablePortal
                freeSolo={true}
                id="gene-ids"
                noOptionsText="e.g. Gm25142"
                options={options}
                size="small"
                sx={{ width: 200 }}
                ListboxProps={{
                  style: {
                    maxHeight: "120px",
                  },
                }}
                onChange={(event: React.ChangeEvent<HTMLInputElement>, value: string) => {
                  if (value != "") debounceFn(value)
                  setGeneID(value)
                  router.push
                }}
                onInputChange={(event: React.ChangeEvent<HTMLInputElement>, value: string) => {
                  if (value != "") debounceFn(value)
                  setGeneID(value)
                }}
                onKeyDown={(e) => {
                  if (e.key == "Enter") {
                    for (let g of geneList) {
                      if (g.name === geneID && g.end - g.start > 0) {
                        setGene(g.name)
                        if (!pathname.split("/").includes("search")) router.replace(pathname + "?gene=" + g.name)
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
                      setGene(g.name)
                      if (!pathname.split("/").includes("search")) router.replace(pathname + "?gene=" + g.name)
                      break
                    }
                  }
                }}
                color="primary"
              >
                Search
              </Button>
            </Grid2>
            {error || cell_components_list.length === 0 ? (
              <ErrorMessage error={new Error("Error loading data")} />
            ) : loading ? (
              <Grid2 xs={12} md={12} lg={12}>
                <LoadingMessage />
              </Grid2>
            ) : (
              data &&
              data["all"] &&
              data["polyA RNA-seq"] &&
              data["total RNA-seq"] && (
                <PlotGeneExpression
                  data={data}
                  range={range}
                  dimensions={dimensions}
                  RNAtype={RNAtype}
                  group={group}
                  scale={scale}
                  replicates={replicates}
                />
              )
            )}
          </Grid2>
        </ThemeProvider>
      </Paper>
    </main>
  )
}
