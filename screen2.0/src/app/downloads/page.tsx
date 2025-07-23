"use client"

import * as React from "react"
import { Tabs, Tab, Divider, Stack, Box} from "@mui/material"
import { DataMatrices } from "./datamatrices"
import { useState } from "react"
import { DownloadRange } from "./downloadrange"
import Annotations from "./Annotations/Annotations"

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
    <Stack sx={{ marginX: "5%", marginY: 2, height: '100%' }} gap={2}>
      <Box>
        <Tabs
          value={page}
          onChange={handleChange}
          aria-label="basic tabs example"
          variant="scrollable"
          allowScrollButtonsMobile
        >
          <Tab label="Annotations" {...a11yProps(0)} />
          <Tab label="Data Matrices" {...a11yProps(1)} />
          <Tab label="Download cCREs in Genomic Region" {...a11yProps(2)} />
        </Tabs>
        <Divider />
      </Box>
      <Box flexGrow={1}>
        {page === 0 && <Annotations />}
        {page === 1 && <DataMatrices />}
        {page === 2 && <DownloadRange />}
      </Box>
    </Stack>
  );
}
