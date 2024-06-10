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
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material"
import Config from "../../../config.json"
import { PlotActivityProfiles } from "./utils"
import Image from "next/image"
import InfoIcon from "@mui/icons-material/Info"
import { RampageToolTipInfo } from "./const"
import { ApolloQueryResult, gql, useQuery } from "@apollo/client"
import { client } from "./client"
import ConfigureGBModal from "./configuregbmodal"
import { BIOSAMPLE_Data } from "../../../common/lib/queries"

const GENE_QUERY = gql`
query ($assembly: String!, $name_prefix: [String!], $limit: Int, $version: Int) {
  gene(assembly: $assembly, name_prefix: $name_prefix, limit: $limit, version: $version) {
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
export type RampagePeak = {
  value: number,
  peakId: string,
  biosampleType: string,
  name: string,
  locusType: string,
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
export default function Rampage(props: { genes: { name: string, linkedBy?: string[] }[], biosampleData: ApolloQueryResult<BIOSAMPLE_Data> }) {
  const [currentGene, setCurrentGene] = useState(props.genes[0].name)
  const [loading, setLoading] = useState<boolean>(true)
  const [data, setData] = useState<RampagePeak[]>([])
  const [peak, setPeak] = useState<string>(null)
  const [peaks, setPeaks] = useState<string[]>([])
  const [sort, setSort] = useState<"byValue" | "byTissueMax" | "byTissue">("byValue")
  const [configGBopen, setConfigGBOpen] = useState(false);

  const handleOpenConfigGB = () => {
    data_gene?.gene[0] && setConfigGBOpen(true)
  }

  // fetch rampage data
  useEffect(() => {
    fetch(Config.API.CcreAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        query: TSS_RAMPAGE_QUERY, variables: {
          gene: currentGene
        }
      }),
    })
      .then((x) => x.json())
      .then((x) => {
        if (x.data && x.data.tssrampageQuery.length > 0) {
          const peaks = x.data.tssrampageQuery.map(t => t.peakId)
          const uniquePeaks: string[] = [...new Set(peaks as string[])];
          const d = x.data.tssrampageQuery.map(t => {
            return {
              value: t.value,
              peakId: t.peakId,
              biosampleType: t.biosampleType,
              name: t.biosampleName,
              locusType: t.locusType,
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
        } else if (x.data && x.data.tssrampageQuery.length == 0) {
          setPeak(null)
          setPeaks([])
          setData([])
          setLoading(false)
        }
      })
  }, [currentGene])

  const {
    data: data_gene
  } = useQuery(GENE_QUERY, {
    variables: {
      assembly: "grch38",
      name_prefix: [currentGene],
      version: 40
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  const peakDetails = data && data?.find(d => d.peakId === peak)

  return (
    loading ?
      <LoadingMessage />
      :

      <Grid2 container spacing={2}>
        <Stack width={"100%"} direction="row" mb={1} justifyContent={"space-between"}>
          <Stack direction="row">
            <Typography alignSelf={"flex-end"} variant="h5" display="inline">
              TSS Activity Profiles by RAMPAGE
            </Typography>
            <Tooltip title={RampageToolTipInfo}>
              <IconButton sx={{ alignSelf: "flex-end" }}>
                <InfoIcon />
              </IconButton>
            </Tooltip>
          </Stack>
          <Stack direction="row" spacing={3}>
            <Button
              variant="contained"
              color="secondary"
              sx={{ minWidth: 125, minHeight: 50 }}
              onClick={handleOpenConfigGB}
            >
              <Image style={{ objectFit: "contain" }} src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" fill alt="ucsc-button" />
            </Button>
            <Button
              variant="contained"
              href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + `${currentGene}`}
              color="secondary"
              sx={{ minWidth: 125, minHeight: 50 }}
            >
              <Image style={{ objectFit: "contain" }} src="https://geneanalytics.genecards.org/media/81632/gc.png" fill alt="gene-card-button" />
            </Button>
          </Stack>
        </Stack>
        <Grid2 xs={12} display={"flex"} gap={2}>
          <Stack>
            <InputLabel>Gene</InputLabel>
            <Select
              value={currentGene}
              size="small"
            >
              {props.genes.map((gene) => {
                return (
                  <MenuItem sx={{ display: "block" }} key={gene.name} value={gene.name} onClick={() => setCurrentGene(gene.name)}>
                    <Typography><i>{gene.name}</i></Typography>
                    {gene?.linkedBy && <Typography variant="body2" color={"text.secondary"}>{gene.linkedBy.join(', ')}</Typography>}
                  </MenuItem>
                )
              })}
            </Select>
          </Stack>
          <Stack>
            <InputLabel>Peak</InputLabel>
            <Select
              size="small"
              value={peak}
              onChange={(event: SelectChangeEvent) => {
                setPeak(event.target.value)
              }}
              disabled={peaks.length === 0}
              displayEmpty
              renderValue={(value: string) => {
                if (peaks.length === 0) {
                  return (
                    <Stack>
                      <Typography>N/A</Typography>
                      <Typography variant="body2" color={"text.secondary"}>No Peaks Found</Typography>
                    </Stack>
                  )
                } else {
                  const details = data && data?.find(d => d.peakId === peak)
                  return (
                    <Stack>
                      <Typography>{value}</Typography>
                      <Typography variant="body2" color={"text.secondary"}>{`(${details?.col1} ${details?.col2})`}</Typography>
                    </Stack>
                  )
                }
              }}
            >
              {peaks.length > 0 ? peaks.map((peak: string) => {
                const details = data && data?.find(d => d.peakId === peak)
                return (
                  <MenuItem sx={{ display: "block" }} key={peak} value={peak}>
                    <Typography>{peak}</Typography>
                    <Typography variant="body2" color={"text.secondary"}>{`(${details?.col1} ${details?.col2})`}</Typography>
                  </MenuItem>
                )
              })
                :
                <MenuItem>No Peaks Found</MenuItem>
              }
            </Select>
          </Stack>
          <Stack>
            <InputLabel id="sort-by-label">
              Sort By
            </InputLabel>
            <Select
              size="medium"
              id="sort-by"
              value={sort}
              onChange={(event: SelectChangeEvent) => {
                setSort(event.target.value as "byValue" | "byTissueMax" | "byTissue")
              }}
            >
              <MenuItem value="byTissue">Tissue</MenuItem>
              <MenuItem value="byTissueMax">Tissue Max</MenuItem>
              <MenuItem value="byValue">Value</MenuItem>
            </Select>
          </Stack>
        </Grid2>
        <Grid2 xs={12}>
          <Typography>
            {data_gene?.gene[0] && `Gene ID: ${data_gene.gene[0].id} ${peakDetails ? '(' + peakDetails.locusType + ')' : ''}`}
          </Typography>
          <Typography>
            {peak && `${peak}: ${peakDetails?.chrom + ":" + peakDetails?.start.toLocaleString() + "-" + peakDetails?.end.toLocaleString()}`}
          </Typography>
        </Grid2>
        <Grid2 xs={12}>
          {data && data.length == 0 ? (<Typography>No data available</Typography>) :
            <PlotActivityProfiles
              data={data}
              sort={sort}
              range={{
                x: { start: 0, end: 4 },
                y: { start: 0, end: 0 },
              }}
              dimensions={{
                x: { start: 125, end: 650 },
                y: { start: 4900, end: 100 },
              }}
              peakID={peak}
            />}
        </Grid2>
        {/* Configure Trackhub */}
        <ConfigureGBModal
          biosampleData={props.biosampleData}
          coordinates={{
            assembly: "GRCh38",
            chromosome: data_gene?.gene[0]?.coordinates.chromosome,
            start: data_gene?.gene[0]?.coordinates.start,
            end: data_gene?.gene[0]?.coordinates.end,
          }}
          accession={currentGene}
          open={configGBopen}
          setOpen={setConfigGBOpen}
        />
      </Grid2>
  )
}
