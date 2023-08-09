"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ReadonlyURLSearchParams, useSearchParams, usePathname } from "next/navigation"
import { LoadingMessage, ErrorMessage } from "../../../common/lib/utility"

import { PlotGeneExpression } from "./utils"
import { GeneExpressions, gene } from "./types"
import { Range2D } from "jubilant-carnival"

import { Box, Button, Typography, IconButton, Drawer, Toolbar, AppBar, Stack, Paper, Switch, Tooltip } from "@mui/material"

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Divider from "@mui/material/Divider"
import { ThemeProvider } from "@mui/material/styles"
import { defaultTheme } from "../../../common/lib/themes"
import MenuIcon from "@mui/icons-material/Menu"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import InfoIcon from '@mui/icons-material/Info';

import Image from "next/image"
import GeneAutoComplete from "./gene-autocomplete"
import {
  OptionsBiosampleTypes,
  OptionsCellularComponents,
  OptionsGroupBy,
  OptionsRNAType,
  OptionsReplicates,
  OptionsScale,
} from "./options"
import { GeneExpressionInfoTooltip } from "./const"

export default function GeneExpression() {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()!
  const router = useRouter()
  const pathname = usePathname()

  if (!pathname.split("/").includes("search") && !searchParams.get("gene")) router.push(pathname + "?gene=OR51AB1P")

  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<GeneExpressions>()
  const [open, setState] = useState<boolean>(true)

  const [current_assembly, setAssembly] = useState<string>("GRCh38")
  const [current_gene, setGene] = useState<gene>(
    searchParams.get("gene")
      ? {
          chrom: "",
          start: 0,
          end: 0,
          id: "",
          name: searchParams.get("gene"),
        }
      : {
          chrom: "",
          start: 0,
          end: 0,
          id: "",
          name: "OR51AB1P",
        }
  )

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
        gene: current_gene.name,
      }),
    })
      .then((response) => {
        if (!response.ok) {
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
  }, [current_assembly, current_gene, biosamples, cell_components])

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setState(open)
  }

  // set drawer height based on screen size
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
      <Paper sx={{ ml: open ? `${drawerWidth}px` : 0 }} elevation={2}>
        <ThemeProvider theme={defaultTheme}>
          <Grid2 container spacing={3} sx={{ mt: "2rem", ml: "1.5rem", mr: "2rem" }}>
            <Box sx={{ display: "flex" }}>
              <Drawer
                sx={{
                  // height: 600,
                  width: `${drawerWidth}px`,
                  display: "flex",
                  flexShrink: 0,
                  "& .MuiDrawer-paper": {
                    height: pathname.split("/").includes("search") ? drawerHeightTab : drawerHeight,
                    width: `${drawerWidth}px`,
                    mt: pathname.split("/").includes("search") ? 47.5 : 12.6,
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
                      direction: "row",
                      alignItems: "right",
                      justifyContent: "right",
                      mt: 6,
                      mb: 6,
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
            <Grid2 xs={12} md={12} lg={12}>
              <AppBar position="static" color="secondary">
                {/* <Container maxWidth="lg"> */}
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
                        {current_gene.name}
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
                      href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + current_gene.name}
                      color="secondary"
                    >
                      <Image src="https://geneanalytics.genecards.org/media/81632/gc.png" width={150} height={100} alt="gene-card-button" />
                    </Button>
                  </Grid2>
                </Toolbar>
                {/* </Container> */}
              </AppBar>
            </Grid2>
          </Grid2>
          <Grid2 container spacing={3}>
            <Grid2 xs={1} md={1} lg={1} sx={{ mt: 2, ml: 8 }}>
              <GeneAutoComplete assembly={current_assembly} gene={current_gene.name} pathname={pathname} setGene={setGene} />
            </Grid2>
            {/* mouse switch - info? */}
            <Grid2 xs={1} md={1} lg={1} sx={{ mt: 2, ml: 12 }}>
              <Switch
                checked={current_assembly === "mm10" ? true : false}
                onClick={() => {
                  if (current_assembly === "mm10") setAssembly("GRCh38")
                  else setAssembly("mm10")
                  setGene({ chrom: "", start: 0, end: 0, id: "", name: "OR51AB1P" })
                }}
              />
              <Typography>mm10</Typography>
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
