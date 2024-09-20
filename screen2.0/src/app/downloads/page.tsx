"use client"

import * as React from "react"
import { Tabs, Tab, Box, Container, Divider} from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Annotations } from "./annotations"
import { DataMatrices } from "./datamatrices"
import { useState } from "react"
import { DownloadRange } from "./downloadrange"

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

export default function Downloads() {
  const [page, setPage] = useState(0)
  
  const handleChange = (_, newValue: number) => {    
    setPage(newValue)
  }

  return (
    <Container>
      <Grid2 mt={2} container spacing={2}>
        <Grid2 xs={12}>
          <Tabs value={page} onChange={handleChange} aria-label="basic tabs example" variant="scrollable" allowScrollButtonsMobile>
            <Tab label="Annotations" sx={{ textTransform: "none" }} {...a11yProps(0)} />
            <Tab label="Data Matrices" sx={{ textTransform: "none" }} {...a11yProps(1)} />
            <Tab label="Download cCREs in Genomic Region" sx={{ textTransform: "none" }} {...a11yProps(2)} />
          </Tabs>
          <Divider />
        </Grid2>
        <Grid2 xs={12}>
          {page === 0 && <Annotations />}
          {page === 1 && <DataMatrices/>}
          {page === 2 && <DownloadRange />}
        </Grid2>
      </Grid2>
    </Container>
  )
}
