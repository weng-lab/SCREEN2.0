"use client"
import React, { useState, useMemo, useCallback } from "react"
import Grid from "@mui/material/Grid2"
import { LoadingMessage } from "../../../common/lib/utility"
import {
  Button,
  CircularProgress,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material"
import Image from "next/image"
import InfoIcon from "@mui/icons-material/Info"
import { RampageToolTipInfo } from "./const"
import { useQuery } from "@apollo/client"
import { client } from "./client"
import ConfigureGBModal from "./configuregbmodal"
import { GENE_QUERY, TSS_RAMPAGE_QUERY } from "./queries"
import VerticalBarPlot, { BarData } from "../../_barPlot/BarPlot"
import { tissueColors } from "../../../common/lib/colors"
import { GenomicRegion } from "../types"
import { OpenInNew } from "@mui/icons-material"
import { capitalizeWords } from "./utils"

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

//Pulled from generated types
type RampageData = { __typename?: 'TssRampageResponse', start?: number | null, organ?: string | null, strand?: string | null, peakId?: string | null, biosampleName?: string | null, biosampleType?: string | null, biosampleSummary?: string | null, peakType?: string | null, expAccession?: string | null, value?: number | null, end?: number | null, chrom?: string | null, genes?: Array<{ __typename?: 'TssPeaksGenes', geneName?: string | null, locusType?: string | null } | null> | null }

type PeakInfo = {
  peakID: string,
  peakType: string,
  locusType: string,
  coordinates: GenomicRegion
}

type ViewBy = "Value" | "Tissue" | "TissueMax"

export default function Rampage(props: { genes: { name: string, linkedBy?: string[] }[] }) {
  const [gene, setGene] = useState(props.genes[0].name)
  const [peaks, setPeaks] = useState<PeakInfo[]>([]) //Peaks of current gene available for selection
  const [selectedPeak, setSelectedPeak] = useState<PeakInfo>(null) //current selection
  const [viewBy, setViewBy] = useState<ViewBy>("Value")
  const [configGBopen, setConfigGBOpen] = useState(false);

  const handleOpenConfigGB = () => {
    if (data_gene?.gene[0]) setConfigGBOpen(true)
  }

  const { data: rampageData, loading: loadingRampage, error: errorRampage } = useQuery(
    TSS_RAMPAGE_QUERY, {
    variables: { gene: gene },
    skip: !gene,
    onCompleted(data) {
      const peakInfo: PeakInfo[] = Array.from(
        new Map(data.tssrampageQuery.map((x: RampageData) => [x.peakId, { peakID: x.peakId, peakType: x.peakType, locusType: x.genes[0].locusType, coordinates: { chrom: x.chrom, start: x.start, end: x.end } }])).values()
      ); //extract info of each peak
      setPeaks(peakInfo) //find unique peaks for gene
      setSelectedPeak(peakInfo[0])
    },
  })
  
  const {
    data: data_gene
  } = useQuery(GENE_QUERY, {
    variables: {
      assembly: "grch38",
      name_prefix: [gene],
      version: 40
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  const peakIsAvailable = peaks.length !== 0
  
  const makeLabel = (data: RampageData) => {
    return `${data.value.toFixed(2)}, ${data.biosampleSummary}(${data.expAccession}) (${data.strand})`
  }

  const plotData: BarData<RampageData>[] = useMemo(() => {
    if (rampageData) {
      let data = rampageData.tssrampageQuery.map((x: RampageData) => {
        return {
          category: x.organ,
          label: makeLabel(x),
          value: x.value,
          color: tissueColors[x.organ] || tissueColors.missing,
          metadata: x
        }
      })
      switch (viewBy) {
        case ("Value"): {
          data.sort((a, b) => b.value - a.value)
          break
        }
        case ("Tissue"): {
          //find max value for each tissue
          const maxValuesByTissue: { [key: string]: number } = data.reduce((acc, item) => {
            acc[item.category] = Math.max(acc[item.category] || -Infinity, item.value);
            return acc;
          }, {})
          data.sort((a, b) => {
            const maxDiff = maxValuesByTissue[b.category] - maxValuesByTissue[a.category];
            return maxDiff !== 0 ? maxDiff : b.value - a.value;
          })
          break
        }
        case ("TissueMax"): {
          //find max value for each tissue
          const maxValuesByTissue: { [key: string]: number } = data.reduce((acc, item) => {
            acc[item.category] = Math.max(acc[item.category] || -Infinity, item.value);
            return acc;
          }, {})

          data = data.filter(x => x.value === maxValuesByTissue[x.category])
          data.sort((a, b) => b.value - a.value);
        }
      }      

      return data
    } else return null
  }, [rampageData, viewBy])

  const PlotTooltip = (bar: BarData<RampageData>) => {
    return (
      <>
        <Typography variant="body2">Clicking opens this experiment on ENCODE <OpenInNew fontSize="inherit" /></Typography>
        <br />
        <Typography variant="body2"><b>Accession:</b> {bar.metadata.expAccession}</Typography>
        <Typography variant="body2"><b>Sample:</b> {capitalizeWords(bar.metadata.biosampleSummary)}</Typography>
        <Typography variant="body2"><b>Tissue:</b> {capitalizeWords(bar.metadata.organ)}</Typography>
        <Typography variant="body2"><b>Strand:</b> {capitalizeWords(bar.metadata.strand)}</Typography>
        <Typography variant="body2"><b>Value:</b> {bar.value.toFixed(2)}</Typography>
      </>
    )
  }

  const RampagePlot = useCallback(() => {
    if (loadingRampage) {
      return <CircularProgress />
    }
    if (errorRampage) {
      return <Typography>Something went wrong</Typography>
    }
    if (!peakIsAvailable) {
      return <Typography>No peaks found for {gene}</Typography>
    }
    else return (
      <VerticalBarPlot
        data={plotData}
        topAxisLabel={"Transcipt Expression at " + selectedPeak.peakID + " of " + gene}
        //todo download
        onBarClicked={x => window.open("https://www.encodeproject.org/experiments/" + x.metadata.expAccession, "_blank", "noopener,noreferrer")}
        TooltipContents={(bar) => <PlotTooltip {...bar} />}
      />
    )
  }, [loadingRampage, errorRampage, peakIsAvailable, gene, selectedPeak, plotData])

  return (loadingRampage ? <LoadingMessage /> : <Grid container spacing={2}>
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
          href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + `${gene}`}
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
          value={gene}
          size="small"
          MenuProps={{ sx: { maxHeight: '600px' } }}
        >
          {props.genes.map((gene) => {
            return (
              <MenuItem sx={{ display: "block" }} key={gene.name} value={gene.name} onClick={() => setGene(gene.name)}>
                <Typography><i>{gene.name}</i></Typography>
                {gene?.linkedBy && <Typography variant="body2" color={"text.secondary"}>Linked By: {gene.linkedBy.join(', ')}</Typography>}
              </MenuItem>
            )
          })}
        </Select>
      </Stack>
      <Stack>
        <InputLabel>Peak</InputLabel>
        <Select<string>
          size="small"
          value={selectedPeak?.peakID || ""}
          onChange={(event) => {
            const selectedPeakId = event.target.value;
            setSelectedPeak(peaks.find(peak => peak.peakID === selectedPeakId) || null);
          }}
          disabled={!peakIsAvailable}
          displayEmpty
          renderValue={(value) => {
            const selectedPeak = peaks.find(peak => peak.peakID === value);
            return selectedPeak ? (
              <Stack>
                <Typography>{selectedPeak.peakID}</Typography>
                <Typography variant="body2" color={"text.secondary"}>{`(${selectedPeak.peakType})`}</Typography>
              </Stack>
            ) : (
              <Stack>
                <Typography>N/A</Typography>
                <Typography variant="body2" color={"text.secondary"}>No Peaks Found</Typography>
              </Stack>
            );
          }}
        >
          {peakIsAvailable ? peaks.map((peak: PeakInfo) => (
            <MenuItem key={peak.peakID} value={peak.peakID}>
              <Typography>{peak.peakID}</Typography>
              <Typography variant="body2" color={"text.secondary"}>{`(${peak.peakType})`}</Typography>
            </MenuItem>
          )) : (
            <MenuItem>No Peaks Found</MenuItem>
          )}
        </Select>

      </Stack>
      <Stack>
        <InputLabel id="sort-by-label">
          View By
        </InputLabel>
        <Select
          size="medium"
          id="sort-by"
          value={viewBy}
          onChange={(event: SelectChangeEvent) => {
            setViewBy(event.target.value as ViewBy)
          }}
        >
          <MenuItem value="Value">Value</MenuItem>
          <MenuItem value="Tissue">Tissue</MenuItem>
          <MenuItem value="TissueMax">Tissue Max</MenuItem>
        </Select>
      </Stack>
    </Grid>
    <Grid size={12}>
      <Typography>
        {data_gene?.gene[0] && `Gene ID: ${data_gene.gene[0].id} ${selectedPeak ? '- ' +  selectedPeak.locusType.replace('_', ' ') : ''}`}
      </Typography>
      <Typography>
        {selectedPeak && `Peak: ${selectedPeak.peakID} - ${selectedPeak.coordinates.chrom + ":" + selectedPeak.coordinates.start.toLocaleString() + "-" + selectedPeak.coordinates.end.toLocaleString()}`}
      </Typography>
    </Grid>
    <Grid size={12}>
      <RampagePlot />
    </Grid>
    {/* Configure Trackhub */}
    <ConfigureGBModal
      coordinates={{
        assembly: "GRCh38",
        chromosome: data_gene?.gene[0]?.coordinates.chromosome,
        start: data_gene?.gene[0]?.coordinates.start,
        end: data_gene?.gene[0]?.coordinates.end,
      }}
      accession={gene}
      open={configGBopen}
      setOpen={setConfigGBOpen}
    />
  </Grid>);
}
