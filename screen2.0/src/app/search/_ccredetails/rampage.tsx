"use client"
import React, { useState, useEffect, useMemo } from "react"
import Grid from "@mui/material/Grid2"
import { LoadingMessage } from "../../../common/lib/utility"
import {  
  Box,
  Button,  
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import { PlotActivityProfiles } from "./utils"
import Image from "next/image"
import InfoIcon from "@mui/icons-material/Info"
import { RampageToolTipInfo } from "./const"
import { useQuery } from "@apollo/client"
import { client } from "./client"
import ConfigureGBModal from "./configuregbmodal"
import { TSS_RAMPAGE_QUERY, GENE_QUERY } from "./queries"
 
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
  peakType: string,  
  organ: string,
  strand: string,
  tissue: string,
}
export default function Rampage(props: { genes: { name: string, linkedBy?: string[] }[]}) {
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

  const { loading: queryLoading, error, data: rampageData } = useQuery(
    TSS_RAMPAGE_QUERY,
    {
      variables: { gene: currentGene || "" },
      skip: !currentGene, // Skip the query if currentGene is not available
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    }
  );

  const processedData = useMemo(() => {
    if (!rampageData) return [];

    const peaks = rampageData.tssrampageQuery.map(t => t.peakId);
    const uniquePeaks: string[] = [...new Set(peaks as string[])];

    const formattedData = rampageData.tssrampageQuery.map(t => ({
      value: t.value,
      peakId: t.peakId,
      biosampleType: t.biosampleType,
      name: t.biosampleName,
      locusType: t.genes[0].locusType,
      expAccession: t.expAccession,
      start: String(t.start),
      end: String(t.end),
      chrom: t.chrom,
      peakType: t.peakType,
      organ: t.organ,
      strand: t.strand,
      tissue: t.organ,
    }));

    setPeak(uniquePeaks[0]); // Set first unique peak
    setPeaks(uniquePeaks); // Set all unique peaks
    setLoading(false);
    setData(formattedData);
    return formattedData;
  }, [rampageData]);

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

  return (loading ? <LoadingMessage /> : <Grid container spacing={2}>
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
    <Grid display={"flex"} gap={2} size={12}>
      <Stack>
        <InputLabel>Gene</InputLabel>
        <Select
          value={currentGene}
          size="small"
          MenuProps={{sx: {maxHeight: '600px'}}}
        >
          {props.genes.map((gene) => {
            return (
              <MenuItem sx={{ display: "block" }} key={gene.name} value={gene.name} onClick={() => setCurrentGene(gene.name)}>
                <Typography><i>{gene.name}</i></Typography>
                {gene?.linkedBy && <Typography variant="body2" color={"text.secondary"}>Linked By: {gene.linkedBy.join(', ')}</Typography>}
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
                  <Typography variant="body2" color={"text.secondary"}>{`(${details?.peakType})`}</Typography>
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
                <Typography variant="body2" color={"text.secondary"}>{`(${details?.peakType})`}</Typography>
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
    </Grid>
    <Grid size={12}>
      <Typography>
        {data_gene?.gene[0] && `Gene ID: ${data_gene.gene[0].id} ${peakDetails ? '(' + peakDetails.locusType + ')' : ''}`}
      </Typography>
      <Typography>
        {peak && `${peak}: ${peakDetails?.chrom + ":" + peakDetails?.start.toLocaleString() + "-" + peakDetails?.end.toLocaleString()}`}
      </Typography>
    </Grid>
    <Grid size={12}>
      {data && data.length == 0 ? (<Typography>No data available</Typography>) :
        <Box maxWidth={{ xl: '75%', xs: '100%' }}>
          <PlotActivityProfiles
            data={data}
            sort={sort}
            range={{
              x: { start: 0, end: 4 },
              y: { start: 0, end: 0 },
            }}
            dimensions={{
              x: { start: 0, end: 650 },
              y: { start: 200, end: 0 },
            }}
            peakID={peak}
          />
        </Box>
      }
    </Grid>
    {/* Configure Trackhub */}
    <ConfigureGBModal
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
  </Grid>);
}
