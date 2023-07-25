"use client"
import React from "react"
import {
  Tab,
  Tabs,
  Typography,
  Paper,
  ThemeProvider,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  Stack,
  Button,
  createTheme,
  Box,
} from "@mui/material"
import { GenomicRegion } from "../types"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { StyledTab } from "../ccresearch"
import { InSpecificBiosamples } from "./inspecificbiosample"
import { NearByGenomicFeatures } from "./nearbygenomicfeatures"
import { LinkedGenes } from "./linkedgenes"
import { Ortholog } from "./linkedccres"
import { TfIntersection } from "./tfintersection"
import Rampage from "./rampage"

import MenuIcon from "@mui/icons-material/Menu"
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos"
import Divider from "@mui/material/Divider"
import GeneExpression from "../../applets/gene-expression/page"

type CcreDetailsProps = {
  accession: string
  assembly: string
  region: GenomicRegion
  globals: any
}

export const CcreDetails: React.FC<CcreDetailsProps> = ({ accession, region, globals, assembly }) => {
  const [value, setValue] = React.useState(0)
  const [open, setState] = React.useState<boolean>(true)

  const handleChange = (_, newValue: number) => {
    setValue(newValue)
  }

  const toggleDrawer = (open) => (event) => {
    if (event.type === "keydown" && (event.key === "Tab" || event.key === "Shift")) {
      return
    }
    setState(open)
  }

  // temp theme for toolbar color
  const theme = createTheme({
    palette: {
      mode: "light",
      // primary: {
      //   main: "#nnn",
      // },
      secondary: {
        main: "#nnn",
      },
    },
  })

  const drawerWidth: number = 350

  return (
    <Box sx={{}}>
      <Paper sx={{ ml: open ? `${drawerWidth}px` : 0 }} elevation={2}>
        <Grid2 container spacing={3} sx={{ ml: "1.5rem", mr: "2rem" }}>
          <Grid2>
            <Box sx={{ display: "flex" }}>
              <Drawer
                sx={{
                  width: `${drawerWidth}px`,
                  flexShrink: 0,
                  "& .MuiDrawer-paper": {
                    width: `${drawerWidth}px`,
                    boxSizing: "border-box",
                    mt: 24.18,
                  },
                }}
                PaperProps={{ sx: { mt: 12.5 }, elevation: 2 }}
                anchor="left"
                open={open}
                onClose={toggleDrawer(false)}
                variant="persistent"
              >
                <Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "right",
                      direction: "row",
                      alignItems: "right",
                      mt: 8,
                      mb: 8,
                    }}
                  >
                    <IconButton onClick={toggleDrawer(false)}>
                      <ArrowBackIosIcon />
                    </IconButton>
                  </Box>
                  <Divider sx={{ mb: 4 }} />
                  <Box>
                    <Tabs aria-label="details-tabs" value={value} onChange={handleChange} orientation="vertical" variant="fullWidth">
                      <StyledTab label="In Specific Biosamples" sx={{ alignSelf: "start" }} />
                      <StyledTab label="Linked Genes" sx={{ alignSelf: "start" }} />
                      <StyledTab label="Nearby Genomic Features" sx={{ alignSelf: "start" }} />
                      <StyledTab label="TF and His-mod Intersection" sx={{ alignSelf: "start" }} />
                      <StyledTab label="TF Motifs and Sequence Features" sx={{ alignSelf: "start" }} />
                      <StyledTab label="Linked cCREs in other Assemblies" sx={{ alignSelf: "start" }} />
                      <StyledTab label="Associated RAMPAGE Signal" sx={{ alignSelf: "start" }} />
                      <StyledTab label="Associated Gene Expression" sx={{ alignSelf: "start" }} />
                    </Tabs>
                  </Box>
                </Box>
              </Drawer>
            </Box>
          </Grid2>
          {/* tool bar */}
          <ThemeProvider theme={theme}>
            <AppBar position="static" color="secondary">
              <Toolbar style={{ height: "120px" }}>
                <Grid2 xs={0.5} md={0.5} lg={0.5}>
                  <IconButton
                    edge="start"
                    color="inherit"
                    aria-label="open drawer"
                    onClick={toggleDrawer(true)}
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
                <Grid2 xs={3} lg={3}>
                  <Typography
                    sx={{ ml: 4, mt: 0.5, alignItems: "center", justifyContent: "center", display: "flex" }}
                    variant="h5"
                    fontSize={30}
                  >
                    {accession}
                  </Typography>
                </Grid2>
                <Grid2 xs={20} lg={20} sx={{ alignItems: "right", justifyContent: "right", display: "flex" }}>
                  <Typography
                    lineHeight={5}
                    sx={{ mt: 0.25 }}
                    variant="body1"
                  >{`${region.chrom}:${region.start}-${region.end}`}</Typography>
                </Grid2>
              </Toolbar>
            </AppBar>
          </ThemeProvider>
          <Grid2 xs={12} lg={12}>
            <Grid2 container spacing={3} ml="1rem">
              <Grid2 xs={12} lg={12} md={12}>
                {value === 0 && <InSpecificBiosamples accession={accession} globals={globals} assembly={assembly} />}
                {value === 1 && <LinkedGenes accession={accession} assembly={assembly} />}
                {value === 2 && (
                  <NearByGenomicFeatures
                    accession={accession}
                    assembly={assembly}
                    coordinates={{
                      chromosome: region.chrom,
                      start: +region.start.toString().replace(/\D/g, ""),
                      end: +region.end.toString().replace(/\D/g, ""),
                    }}
                  />
                )}
                {value === 3 && (
                  <TfIntersection
                    assembly={assembly}
                    coordinates={{
                      chromosome: region.chrom,
                      start: +region.start.toString().replace(/\D/g, ""),
                      end: +region.end.toString().replace(/\D/g, ""),
                    }}
                  />
                )}
                {value === 5 && <Ortholog accession={accession} assembly={assembly} />}
                {value === 6 && <Rampage accession={accession} assembly={assembly} chromosome={region.chrom} />}
                {value === 7 && <GeneExpression accession={accession} assembly={assembly} hamburger={open} />}
              </Grid2>
            </Grid2>
          </Grid2>
        </Grid2>
      </Paper>
    </Box>
  )
}
