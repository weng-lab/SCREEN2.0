"use client"
import React, { useState, useEffect } from "react"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { LoadingMessage } from "../../../common/lib/utility"
import {
  AppBar,
  Box,
  Button,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material"
import Config from "../../../config.json"
import { PlotActivityProfiles } from "./utils"
import Image from "next/image"
import InfoIcon from "@mui/icons-material/Info"
import { RampageToolTipInfo } from "./const"
import { gql, useQuery } from "@apollo/client"
import { client } from "./client"

const GENE_QUERY = gql`
query ($assembly: String!, $name_prefix: [String!], $limit: Int) {
  gene(assembly: $assembly, name_prefix: $name_prefix, limit: $limit) {
    name
    id
    coordinates {
      start
      chromosome
      end
    }
  }
} `
const TSS_RAMPAGE_QUERY = `
  query tssRampage($gene: String!) {
  tssrampageQuery(genename: $gene) {
    start
    geneName
    organ
    locusType
    strand
    peakId
    biosampleName
    biosampleType
    biosampleSummary
    col1
    col2
    expAccession
    value
    start
    end 
    chrom 
  }
}
`
export type RampagePeak ={
  value: number,
  peakId: string,
  biosampleType: string,
  name: string,         
  locusType:  string,
  expAccession: string,
  start: string,
  end: string,
  chrom: string,
  col1: string,
  col2: string,
  organ: string,
  strand: string,
  tissue: string
}
export default function Rampage(props: { gene: string; }) {
  const [loading, setLoading] = useState<boolean>(true)  
  const [data, setData] = useState<RampagePeak[]>([])
  const [peak, setPeak] = useState<string>("")
  const [peaks, setPeaks] = useState<string[]>([""])
  // fetch rampage data
  useEffect(() => {
    
      fetch( Config.API.CcreAPI, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query: TSS_RAMPAGE_QUERY, variables: {
          gene: props.gene
        } }),
      })
        .then((x) => x.json())
        .then((x) => {        
            if(x.data && x.data.tssrampageQuery.length>0)
            {
              const peaks =   x.data.tssrampageQuery.map(t=>t.peakId)
              const uniquePeaks: string[] = [...new Set(peaks as string[])];
              const d = x.data.tssrampageQuery.map(t=>{
                return {
                  value: t.value,
                  peakId: t.peakId,
                  biosampleType: t.biosampleType,
                  name: t.biosampleName,         
                  locusType:  t.locusType,
                  expAccession: t.expAccession,
                  start: t.start,
                  end: t.end,
                  chrom: t.chrom,
                  col1: t.col1,
                  col2: t.col2,
                  organ: t.organ,
                  strand: t.strand,
                  tissue: t.organ
                }
              })
              setPeak(uniquePeaks[0])
              setPeaks(uniquePeaks)
              setData(d)
              setLoading(false)
            } else if(x.data && x.data.tssrampageQuery.length==0){
              setLoading(false)
            }
        })
  }, [props.gene])

  

  const {
    data: data_gene,
  } = useQuery(GENE_QUERY, {
    variables: {
      assembly: "grch38",
      name_prefix: [props.gene]
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  const peakDetails = data && data?.find(d=>d.peakId===peak)
 
  return loading ? (
    <LoadingMessage />
  ) :  data && data.length==0 ? (<>{'No data available'}</>):  (
    
    data && data.length>0 && (
      <Grid2 container spacing={3}>
          <AppBar position="static" color="secondary">
            <Toolbar>
              <Grid2 xs={9} md={9} lg={9}>
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="h5" fontSize={30} display="inline">
                    TSS Activity Profiles by RAMPAGE
                  </Typography>
                  <Tooltip title={RampageToolTipInfo} sx={{ mb: 2, ml: 2 }}>
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
                <Box mt={2} ml={0.5}>
                  <Typography variant="h5">{props.gene}</Typography>
                  {<Typography>
                    {data_gene && data_gene.gene[0].id+" ("+peakDetails?.locusType+")"}
                  </Typography>}
                </Box>
                <Box mt={2} ml={0.5}>
                  <Typography display="inline" lineHeight={2.5}>
                    {"Peaks: "}{" "}
                  </Typography>
                  <FormControl>
                    <InputLabel id="peaks-select-label"></InputLabel>
                    <Select
                      sx={{ height: 30, mt: 0.5 }}
                      defaultValue={peak}
                      labelId="peaks-select-label"
                      id="peaks-select"
                      value={peak}
                      size="small"
                      onChange={(event: SelectChangeEvent) => {
                        setPeak(event.target.value)
                      }}
                    >
                      {peaks.map((t: string) => {
                        return (
                          <MenuItem key={t} value={t}>
                            {t}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                  <Typography>
                    { peakDetails?.chrom+":"+peakDetails?.start.toLocaleString()+"-"+peakDetails?.end.toLocaleString()+" ("+peakDetails?.col1+" "+peakDetails?.col2+")"}
                  </Typography>
                </Box>
              </Grid2>
              <Grid2 xs={1.5} sx={{ mt: 2, height: 100, width: 190, mb: 18 }}>
                <Button variant="contained" href="https://genome.ucsc.edu/" color="secondary">
                  <Image src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" width={150} height={100} alt="ucsc-button" />
                </Button>
              </Grid2>
              <Grid2 xs={1.5} sx={{ mt: 2, height: 100, width: 214, mb: 18 }}>
                <Button
                  variant="contained"
                  href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + props.gene}
                  color="secondary"
                >
                  <Image src="https://geneanalytics.genecards.org/media/81632/gc.png" width={150} height={100} alt="gene-card-button" />
                </Button>
              </Grid2>
            </Toolbar>
          </AppBar>
          <Grid2 xs={12}>
            <PlotActivityProfiles
              data={data}
              range={{
                x: { start: 0, end: 4 },
                y: { start: 0, end: 0 },
              }}
              dimensions={{
                x: { start: 125, end: 650 },
                y: { start: 4900, end: 100 },
              }}
              peakID={peak}           
              />
          </Grid2>
      </Grid2>
    )
  )
}
