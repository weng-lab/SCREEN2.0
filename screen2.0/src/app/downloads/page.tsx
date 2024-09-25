"use client"

import * as React from "react"
import { Tabs, Tab, Container, Divider} from "@mui/material"
import Grid from "@mui/material/Grid2"
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
      <Grid mt={2} container spacing={2}>
        <Grid size={12}>
          <Tabs value={page} onChange={handleChange} aria-label="basic tabs example" variant="scrollable" allowScrollButtonsMobile>
            <Tab label="Annotations" sx={{ textTransform: "none" }} {...a11yProps(0)} />
            <Tab label="Data Matrices" sx={{ textTransform: "none" }} {...a11yProps(1)} />
            <Tab label="Download cCREs in Genomic Region" sx={{ textTransform: "none" }} {...a11yProps(2)} />
          </Tabs>
          <Divider />
        </Grid>
        <Grid size={12}>
          {page === 0 && <Annotations />}
          {page === 1 && <DataMatrices/>}
          {page === 2 && <DownloadRange />}
        </Grid>
      </Grid>
    </Container>
  );
}
