//Home Page

"use client"
import { CssBaseline, Typography } from "@mui/material"
import MainSearch from "../common/components/mainsearch/MainSearch"

// Grid v2 isn't declared stable yet, but using it now as it's what MUI is currently developing out
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import homeImage from "../../public/homeImage.png"
import Image from "next/image"

export default function Home() {
  return (
    <main>
      {/* May need to rethink where these margins are set. Which element should be setting content width? */}
      <Grid2 container spacing={6} sx={{ mr: "auto", ml: "auto", mt: "3rem" }}>
        {/* <CssBaseline /> */}
        <Grid2 xs={12}>
          <Typography variant="h3">SCREEN</Typography>
          <Typography variant="h5">Search Candidate cis-Regulatory Elements by ENCODE</Typography>
        </Grid2>
        <Grid2 xs={12} lg={6}>
          <MainSearch />
          <Typography variant="h5" mt="3rem">
            What is SCREEN?
          </Typography>
          <Typography>
            SCREEN is a web interface for searching and visualizing the Registry of candidate cis-Regulatory Elements (cCREs) derived from
            ENCODE data. The Registry contains 1,063,878 human cCREs in GRCh38 and 313,838 mouse cCREs in mm10, with homologous cCREs
            cross-referenced across species. SCREEN presents the data that support biochemical activities of the cCREs and the expression of
            nearby genes in specific cell and tissue types.
          </Typography>
          <Typography variant="h5" mt="2rem">
            Version 4 Annotations:
          </Typography>
          <Typography>
            Human Genome assembly: hg38
            <br />
            Human cCRE count: 1,063,878
            <br />
            Human cell and tissue types covered: 1,518
            <br />
            Mouse Genome assembly: mm10
            <br />
            Mouse cCRE count: 313,838
            <br />
            Mouse cell and tissue types covered: 169
          </Typography>
        </Grid2>
        <Grid2 xs={12} lg={6}>
          {/* What is a better alt text for this? */}
          {/* This image sizing needs to be adjusted for large screens (>1920px), doesn't fill correctly with fill prop. Or just center contents leaving open margins? */}
          <Image src={homeImage} alt={"SCREEN home image"} />
        </Grid2>
      </Grid2>
    </main>
  )
}
