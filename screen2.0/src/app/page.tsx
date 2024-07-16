"use client"

import { Box, Divider, Stack, Typography } from "@mui/material"
import { MainSearch } from "./_mainsearch/mainsearch"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import homeImage from "../../public/homeImage.png"
import Image from "next/image"
import humanIcon from "../../public/humanDark.png"
import mouseIcon from "../../public/mouseDark.png"

export default function Home() {
  return (
    <main>
      <Grid2 container spacing={6} sx={{ mr: "auto", ml: "auto", mt: "3rem", maxWidth: '95%' }}>
        <Grid2 xs={12}>
          <Typography variant="h3">SCREEN</Typography>
          <Typography variant="h5">Search Candidate cis-Regulatory Elements by ENCODE</Typography>
        </Grid2>
        <Grid2 xs={12} lg={6}>
          <MainSearch />
          <Typography variant="h5" mt={4}>
            What is SCREEN?
          </Typography>
          <Typography paragraph>
            SCREEN is a web interface for searching and visualizing the Registry of candidate cis-Regulatory Elements (cCREs) derived from
            ENCODE data. The Registry contains 2,348,854 human cCREs in GRCh38 and 926,843 mouse cCREs in mm10, with homologous cCREs
            cross-referenced across species. SCREEN presents the data that support biochemical activities of the cCREs and the expression of
            nearby genes in specific cell and tissue types.
          </Typography>
          <Typography variant="h5" mt={3} mb={1}>
            Version 4 Annotations:
          </Typography>
          <Grid2 style={{ display: "grid", gridTemplateColumns: 'auto auto auto' }} border={"1px solid LightGray"} maxWidth={'500px'}>
            <Typography p={1} border={"1px solid LightGray"} >Genome Assembly</Typography>
            <Typography p={1} border={"1px solid LightGray"} align="right">cCRE Count</Typography>
            <Typography p={1} border={"1px solid LightGray"} align="right">Cell/Tissue Types Covered</Typography>
            <Stack border={"1px solid LightGray"} direction="row" pl={1} >
              <Box position={"relative"} minWidth={"30px"}>
                <Image style={{ objectFit: "contain" }} src={humanIcon} alt={""} fill />
              </Box>
              <Typography p={1} align="left">Human (hg38)</Typography>
            </Stack>
            <Typography p={1} border={"1px solid LightGray"} align="right">2,348,854</Typography>
            <Typography p={1} border={"1px solid LightGray"} align="right">1,888</Typography>
            <Stack border={"1px solid LightGray"} direction="row" pl={1} >
              <Box position={"relative"} minWidth={"30px"}>
                <Image style={{ objectFit: "contain" }} src={mouseIcon} alt={""} fill />
              </Box>
              <Typography p={1} align="left">Mouse (mm10)</Typography>
            </Stack>
            <Typography p={1} border={"1px solid LightGray"} align="right">926,843</Typography>
            <Typography p={1} border={"1px solid LightGray"} align="right">382</Typography>
          </Grid2>
        </Grid2>
        <Grid2 xs={12} lg={6}>
          <Image src={homeImage} alt={"SCREEN home image"} />
        </Grid2>
      </Grid2>
    </main>
  )
}
