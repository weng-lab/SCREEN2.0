"use client"

import * as React from "react"
import { Tabs, Tab, Divider, Stack} from "@mui/material"
import Grid from "@mui/material/Grid2"
import { Annotations } from "./annotations"
import { DataMatrices } from "./datamatrices"
import { useState } from "react"
import { DownloadRange } from "./downloadrange"
import NewAnnotations from "./NewAnnotations/NewAnnotations"

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

export default function Downloads() {
  const [page, setPage] = useState(3)
  
  const handleChange = (_, newValue: number) => {    
    setPage(newValue)
  }

  return (
    <Stack sx={{paddingX: '5%'}}>
      <Grid mt={2} container spacing={2}>
        <Grid size={{ xs: 12 }}>
          <Tabs value={page} onChange={handleChange} aria-label="basic tabs example" variant="scrollable" allowScrollButtonsMobile>
            <Tab label="Annotations" {...a11yProps(0)} />
            <Tab label="Data Matrices" {...a11yProps(1)} />
            <Tab label="Download cCREs in Genomic Region" {...a11yProps(2)} />
            <Tab label="New Annotations" {...a11yProps(3)} />
          </Tabs>
          <Divider />
        </Grid>
        <Grid size={12}>
          {page === 0 && <Annotations />}
          {page === 1 && <DataMatrices/>}
          {page === 2 && <DownloadRange />}
          {page === 3 && <NewAnnotations />}
        </Grid>
      </Grid>
    </Stack>
  )
}
