"use client"

import { Box, IconButton, Stack, Tooltip, Typography } from "@mui/material"
import { MainSearch } from "./_mainsearch/mainsearch"
import Grid from "@mui/material/Grid2"
import Image from "next/image"
import humanTransparentIcon from "../../public/Transparent_HumanIcon.png"
import mouseTransparentIcon from "../../public/Transparent_MouseIcon.png"
import { Download } from "@mui/icons-material"
import Config from "../config.json"

export default function Home() {
  return (
    <main>
      <Grid container spacing={3} sx={{ mr: "auto", ml: "auto", mt: 5, maxWidth: '95%' }}>
        <Grid size={{ xs: 12, lg: 6 }}>
          <Box position={"relative"} height={{ xs: 150, md: 150 }}>
            <Image priority src={"/SCREEN_logo_light.png"} alt={"SCREEN home image"} fill style={{objectFit: "contain", objectPosition: "left center"}} />
          </Box>  
          <Typography variant="h5" mb={3} mt={2}>Search Candidate cis-Regulatory Elements by ENCODE</Typography>
          <MainSearch />
          <Typography variant="h5" mt={4}>
            What is SCREEN?
          </Typography>
          <Typography>
            SCREEN is a web interface for searching and visualizing the Registry of candidate cis-Regulatory Elements (cCREs) derived from
            ENCODE data. The Registry contains 2,348,854 human cCREs in GRCh38 and 926,843 mouse cCREs in mm10, with homologous cCREs
            cross-referenced across species. SCREEN presents the data that support biochemical activities of the cCREs and the expression of
            nearby genes in specific cell and tissue types.
          </Typography>
          <Typography variant="h5" mt={3} mb={1}>
            Version 4 Annotations:
          </Typography>
          <Grid style={{ display: "grid", gridTemplateColumns: 'auto auto auto' }} border={"1px solid LightGray"} maxWidth={'500px'}>
            <Typography p={1} border={"1px solid LightGray"} >Genome Assembly</Typography>
            <Typography p={1} border={"1px solid LightGray"} align="right">cCRE Count</Typography>
            <Typography p={1} border={"1px solid LightGray"} align="right">Cell/Tissue Types</Typography>
            <Stack border={"1px solid LightGray"} direction="row" pl={1}>
              <Box position={"relative"} minWidth={"30px"}>
                <Image style={{ objectFit: "contain" }} src={humanTransparentIcon} alt={""} fill />
              </Box>
              <Typography p={1} align="left" alignSelf={"center"}>Human (hg38)</Typography>
            </Stack>
            <Stack border={"1px solid LightGray"} direction={"row"} alignItems={"center"} justifyContent={"flex-end"}>
              <Typography py={1} pl={1} pr={0}>2,348,854</Typography>
              <Tooltip title="Download All Human cCREs (129.1 MB)" placement="right" arrow>
                <IconButton href={Config.Downloads.HumanCCREs}>
                  <Download />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography p={1} border={"1px solid LightGray"} align="right">1,888</Typography>
            <Stack border={"1px solid LightGray"} direction="row" pl={1} >
              <Box position={"relative"} minWidth={"30px"}>
                <Image style={{ objectFit: "contain" }} src={mouseTransparentIcon} alt={""} fill />
              </Box>
              <Typography p={1} align="left" alignSelf={"center"}>Mouse (mm10)</Typography>
            </Stack>
            <Stack border={"1px solid LightGray"} direction={"row"} alignItems={"center"} justifyContent={"flex-end"}>
              <Typography py={1} pl={1} pr={0}>926,843</Typography>
              <Tooltip title="Download All Mouse cCREs (50.6 MB)" placement="right" arrow>
                <IconButton href={Config.Downloads.MouseCCREs}>
                  <Download />
                </IconButton>
              </Tooltip>
            </Stack>
            <Typography p={1} border={"1px solid LightGray"} align="right">382</Typography>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, lg: 6 }} position={"relative"} minHeight={400}>
          <Image priority src={"/SCREEN-Landing.png"} alt={"SCREEN home image"} fill style={{objectFit: "contain", objectPosition: "left"}} />
        </Grid>
      </Grid>
    </main>
  );
}
