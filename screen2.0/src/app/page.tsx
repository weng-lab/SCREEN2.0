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
            ENCODE data. The Registry contains 1,063,878 human cCREs in GRCh38 and 313,838 mouse cCREs in mm10, with homologous cCREs
            cross-referenced across species. SCREEN presents the data that support biochemical activities of the cCREs and the expression of
            nearby genes in specific cell and tissue types.
          </Typography>
          <Typography variant="h5" mt={3} mb={1}>
            Version 4 Annotations:
          </Typography>
          <Grid2 container justifyContent={"flex-start"}>
            <Grid2 direction="column" flexGrow={0} border={"1px solid LightGray"} borderRight={"none"}>
              <Typography p={1} align="left">Genome Assembly</Typography>
              <Divider />
              <Stack direction="row" pl={1} >
                <Box position={"relative"} minWidth={"30px"}>
                  <Image style={{objectFit: "contain"}} src={humanIcon} alt={""} fill />
                </Box>
                <Typography p={1} align="left">Human (hg38)</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" pl={1} >
                <Box position={"relative"} minWidth={"30px"}>
                  <Image style={{objectFit: "contain"}} src={mouseIcon} alt={""} fill />
                </Box>
                <Typography p={1} align="left">Mouse (mm10)</Typography>
              </Stack>
            </Grid2>
            <Grid2>
              <Divider orientation="vertical" />
            </Grid2>
            <Grid2 direction="column" flexGrow={0} border={"1px solid LightGray"} borderLeft={"none"} borderRight={"none"}>
              <Typography p={1} align="right">cCRE Count</Typography>
              <Divider />
              <Typography p={1} align="right">1,063,878</Typography>
              <Divider />
              <Typography p={1} align="right">313,838</Typography>
            </Grid2>
            <Grid2>
              <Divider orientation="vertical" />
            </Grid2>
            <Grid2 direction="column" flexGrow={0} border={"1px solid LightGray"} borderLeft={"none"}>
              <Typography p={1} align="right">Cell/Tissue Types Covered</Typography>
              <Divider />
              <Typography p={1} align="right">1,518</Typography>
              <Divider />
              <Typography p={1} align="right">169</Typography>
            </Grid2>
          </Grid2>
        </Grid2>

        <Grid2 xs={12} lg={6}>
          <Image src={homeImage} alt={"SCREEN home image"} />
        </Grid2>
      </Grid2>
    </main>
  )
}
