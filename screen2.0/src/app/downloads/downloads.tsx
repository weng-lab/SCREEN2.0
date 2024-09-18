"use client"

import * as React from "react"
import { Tabs, Tab, Box, Container, Divider} from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { QuickStart } from "./quickstart"
import { DetailedElements } from "./detailedelements"
import { DataMatrices } from "./datamatrices"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { ApolloQueryResult } from "@apollo/client"
import { DownloadRange } from "./downloadrange"
import { BIOSAMPLE_Data } from "../../common/lib/queries"

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

export const fetchFileSize = async (url: string, setFileSize: React.Dispatch<React.SetStateAction<number>>) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      setFileSize(parseInt(contentLength, 10));
    }
  } catch (error) {
    console.log("error fetching file size for ", url)
  }
}

export default function DownloadsPage(props: {
  biosamples: ApolloQueryResult<BIOSAMPLE_Data>  
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [page, setPage] = useState(props.searchParams.tab ? Number(props.searchParams.tab) : 0)
  const handleChange = (_, newValue: number) => {    
    setPage(newValue)
  }

  return (
    <Container>
      <Grid2 mt={2} container spacing={2}>
        <Grid2 xs={12}>
          <Tabs value={page} onChange={handleChange} aria-label="basic tabs example" variant="scrollable" allowScrollButtonsMobile>
            <Tab label="Quick Start" sx={{ textTransform: "none" }} {...a11yProps(0)} />
            <Tab label="Detailed Elements" sx={{ textTransform: "none" }} {...a11yProps(1)} />
            <Tab label="Data Matrices" sx={{ textTransform: "none" }} {...a11yProps(2)} />
            <Tab label="Download cCREs in Genomic Region" sx={{ textTransform: "none" }} {...a11yProps(3)} />
          </Tabs>
          <Divider />
        </Grid2>
        <Grid2 xs={12}>
          {page === 0 && <QuickStart biosamples={props.biosamples} />}
          {page === 1 && <DetailedElements biosamples={props.biosamples} />}
          {page === 2 && <DataMatrices/>}
          {page === 3 && <DownloadRange />}
        </Grid2>
      </Grid2>
    </Container>
  )
}
