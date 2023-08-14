"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { usePathname } from "next/navigation"
import { LoadingMessage, ErrorMessage } from "../../../common/lib/utility"

import { PlotGeneExpression } from "../../applets/gene-expression/utils"
import { GeneExpressions } from "../../applets/gene-expression/types"
import { Range2D } from "jubilant-carnival"

import { Box, Button, Typography, IconButton, Drawer, Toolbar, AppBar, Stack, Paper, TextField, MenuItem, Tooltip } from "@mui/material"

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Divider from "@mui/material/Divider"
import { ThemeProvider } from "@mui/material/styles"
import { defaultTheme } from "../../../common/lib/themes"
import MenuIcon from "@mui/icons-material/Menu"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import InfoIcon from "@mui/icons-material/Info"

import Image from "next/image"
import {
  OptionsBiosampleTypes,
  OptionsCellularComponents,
  OptionsGroupBy,
  OptionsRNAType,
  OptionsReplicates,
  OptionsScale,
} from "../../applets/gene-expression/options"
import { GeneExpressionInfoTooltip } from "../../applets/gene-expression/const"

export function GeneExpression(props: {
  accession: string
  assembly: string
  genes: { pc: { name: string; __typename: string }[]; all: { name: string; __typename: string }[] }
  hamburger: boolean
}) {
  const pathname = usePathname()
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState<GeneExpressions>()
  const [options, setOptions] = useState<string[]>([])
  const [open, setState] = useState<boolean>(true)

  const [current_assembly, setAssembly] = useState<string>(props.assembly ? props.assembly : "GRCh38")
  const [current_gene, setGene] = useState<string>(props.genes.pc[0].name)

  const [biosamples, setBiosamples] = useState<string[]>(["cell line", "in vitro differentiated cells", "primary cell", "tissue"])
  const [cell_components, setCellComponents] = useState<string[]>(["cell"])

  const [group, setGroup] = useState<string>("byTissueMaxFPKM") // experiment, tissue, tissue max
  const [RNAtype, setRNAType] = useState<string>("all") // any, polyA RNA-seq, total RNA-seq
  const [scale, setScale] = useState<string>("rawFPKM") // linear or log2
  const [replicates, setReplicates] = useState<string>("mean") // single or mean

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
        biosample_types_selected: biosamples,
        compartments_selected: cell_components,
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
        let geneList: string[] = []
        for (let g of props.genes.pc) if (!geneList.includes(g.name)) geneList.push(g.name)
        for (let g of props.genes.all) if (!geneList.includes(g.name)) geneList.push(g.name)
        setOptions(geneList)
        setLoading(false)
      })
      .catch((error: Error) => {
        return <ErrorMessage error={error} />
      })
    setLoading(true)
  }, [current_assembly, current_gene, biosamples, cell_components])

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
    drawerHeightTab *= 0.6
  } // 2k
  else if (drawerHeight < 2000) {
    drawerHeight *= 0.9
    drawerHeightTab *= 0.7
  } // 4k

  return (
    <main>
      <Paper sx={{ ml: open ? `${drawerWidth + 20}px` : 0 }} elevation={2}>
        <ThemeProvider theme={defaultTheme}>
          <Grid2 container spacing={3} sx={{ ml: 2, mr: 2 }}>
            <Grid2>
              <Box sx={{ display: "flex" }}>
                <Drawer
                  sx={{
                    // height: 600,
                    width: `${drawerWidth}px`,
                    flexShrink: 0,
                    "& .MuiDrawer-paper": {
                      height: pathname.split("/").includes("search") ? drawerHeightTab : drawerHeight,
                      width: `${drawerWidth}px`,
                      mt: 46,
                      ml: props.hamburger ? `${drawerWidth + 94}px` : `${92}px`,
                    },
                  }}
                  PaperProps={{ sx: { mt: 0 }, elevation: 2 }}
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
                      <OptionsBiosampleTypes biosamples={biosamples} setBiosamples={setBiosamples} />
                      <OptionsCellularComponents cell_components={cell_components} setCellComponents={setCellComponents} />
                      <OptionsGroupBy group={group} setGroup={setGroup} />
                      <OptionsRNAType RNAtype={RNAtype} setRNAType={setRNAType} />
                      <OptionsScale scale={scale} setScale={setScale} />
                      <OptionsReplicates replicates={replicates} setReplicates={setReplicates} />
                    </Stack>
                  </Paper>
                </Drawer>
              </Box>
            </Grid2>
            <Grid2 xs={12} md={12} lg={12}>
              <AppBar position="static" color="secondary">
                <Toolbar style={{ height: "120px" }}>
                  <Grid2 xs={0.5} md={0.5} lg={0.5}>
                    <IconButton
                      edge="start"
                      color="inherit"
                      aria-label="open drawer"
                      onClick={toggleDrawer(true)}
                      sx={{
                        ...(open && { display: "none" }),
                      }}
                    >
                      <MenuIcon />
                    </IconButton>
                  </Grid2>
                  <Grid2 xs={5} md={8} lg={9}>
                    <Box mt={0.5}>
                      <Typography variant="h4" sx={{ fontSize: 28, fontStyle: "italic", display: "inline" }}>
                        {current_gene}
                      </Typography>
                      <Typography variant="h4" sx={{ fontSize: 28, display: "inline" }}>
                        {" "}
                        Gene Expression Profiles by RNA-seq
                      </Typography>
                      <Tooltip title={GeneExpressionInfoTooltip}>
                        <IconButton>
                          <InfoIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Grid2>
                  <Grid2 xs={1.5} sx={{ mt: 2, height: 100, width: 190 }}>
                    <Button variant="contained" href={"https://genome.ucsc.edu/"} color="secondary">
                      <Image src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" width={150} height={100} alt="ucsc-button" />
                    </Button>
                  </Grid2>
                  <Grid2 xs={1.5} sx={{ mt: 2, height: 100, width: 214 }}>
                    <Button
                      variant="contained"
                      href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + current_gene}
                      color="secondary"
                    >
                      <Image src="https://geneanalytics.genecards.org/media/81632/gc.png" width={150} height={100} alt="gene-card-button" />
                    </Button>
                  </Grid2>
                </Toolbar>
              </AppBar>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={3}>
            <Grid2 xs={1} md={1} lg={1} sx={{ mt: 2, ml: 8 }}>
              <TextField select value={current_gene}>
                {options.map((option: string) => {
                  return (
                    <MenuItem key={option} value={option} onClick={() => setGene(option)}>
                      {option}
                    </MenuItem>
                  )
                })}
              </TextField>
            </Grid2>
            {biosamples.length === 0 ? (
              <ErrorMessage error={new Error("No biosample type selected")} />
            ) : cell_components.length === 0 ? (
              <ErrorMessage error={new Error("No cellular compartment selected")} />
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
