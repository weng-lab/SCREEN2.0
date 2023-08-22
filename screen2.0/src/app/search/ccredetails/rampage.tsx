"use client"
import React, { useState, useEffect } from "react"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
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
  ThemeProvider,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material"

import { Range2D } from "jubilant-carnival"
import { PlotActivityProfiles } from "./utils"
import Image from "next/image"
import { defaultTheme } from "../../../common/lib/themes"
import InfoIcon from "@mui/icons-material/Info"
import { RampageToolTipInfo } from "./const"
import { gql, useQuery } from "@apollo/client"
import { client } from "./client"

const RAMPAGE_QUERY = gql`
  query rampageQuery($transcript_ids: [String!]) {
    rampageQuery(transcript_ids: $transcript_ids) {
      value
      type
      geneId
      transcriptId
      biosampleType
      name
      lifeStage
      expAccession
      fileAccession
      start
      organ
      strand
      tissue
    }
  }
`

export default function Rampage(props: { accession: string; assembly: string; chromosome: string }) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState()
  const [transcript, setTranscript] = useState<string>("")
  const [transcripts, setTranscripts] = useState<string[]>([""])

  const [payload, setPayload] = useState<{ accession: string; assembly: string; chromosome: string }>({
    accession: props.accession,
    assembly: props.assembly,
    chromosome: props.chromosome,
  })

  const [range, setRange] = useState<Range2D>({
    x: { start: 0, end: 4 },
    y: { start: 0, end: 0 },
  })

  const [dimensions, setDimensions] = useState<Range2D>({
    x: { start: 125, end: 650 },
    y: { start: 4900, end: 100 },
  })

  // fetch rampage data
  useEffect(() => {
    fetch("https://screen-beta-api.wenglab.org/dataws/re_detail/rampage", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        accession: payload.accession,
        assembly: payload.assembly,
        chromosome: payload.chromosome,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          setError(true)
          return <ErrorMessage error={new Error(response.statusText)} />
        }
        return response.json()
      })
      .then((data) => {
        setData(data)
        setTranscript(data[payload.accession]["sortedTranscripts"][0])
        setTranscripts(data[payload.accession]["sortedTranscripts"])
        setLoading(false)
      })
      .catch((error: Error) => {
        return <ErrorMessage error={error} />
      })
    setLoading(true)
  }, [payload])

  const {
    loading: loading_rampage,
    error: error_rampage,
    data: data_rampage,
  } = useQuery(RAMPAGE_QUERY, {
    variables: {
      transcript_ids: transcripts,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  function transcriptItems(transcripts: string[]) {
    return Object.values(transcripts).map((t: string) => {
      return (
        <MenuItem key={t} value={t}>
          {t}
        </MenuItem>
      )
    })
  }

  return error || error_rampage ? (
    <ErrorMessage error={new Error("Error loading data")} />
  ) : loading || loading_rampage ? (
    <LoadingMessage />
  ) : (
    data &&
    data[payload.accession] &&
    data_rampage && (
      <Grid2 container spacing={3}>
        <ThemeProvider theme={defaultTheme}>
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
                  <Typography variant="h5">{data[payload.accession]["gene"]["name"]}</Typography>
                  <Typography>
                    {data[payload.accession]["gene"]["ensemblid_ver"] +
                      " (" +
                      parseInt(data[payload.accession]["gene"]["distance"]).toLocaleString("en-US") +
                      " bases from cCRE)"}
                  </Typography>
                </Box>
                <Box mt={2} ml={0.5}>
                  <Typography display="inline" lineHeight={2.5}>
                    {"Transcript: "}{" "}
                  </Typography>
                  <FormControl>
                    <InputLabel id="transcription-select-label"></InputLabel>
                    <Select
                      sx={{ height: 30, mt: 0.5 }}
                      defaultValue={transcript}
                      labelId="transcription-select-label"
                      id="transcription-select"
                      value={transcript}
                      size="small"
                      onChange={(event: SelectChangeEvent) => {
                        setTranscript(event.target.value)
                      }}
                    >
                      {transcriptItems(data[payload.accession]["sortedTranscripts"])}
                    </Select>
                  </FormControl>
                  <Typography>
                    {payload.chromosome +
                      ":" +
                      parseInt(data[payload.accession]["gene"]["start"]).toLocaleString("en-US") +
                      "-" +
                      parseInt(data[payload.accession]["gene"]["stop"]).toLocaleString("en-US") +
                      " unprocessed pseudogene"}
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
                  href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + data[payload.accession]["gene"]["name"]}
                  color="secondary"
                >
                  <Image src="https://geneanalytics.genecards.org/media/81632/gc.png" width={150} height={100} alt="gene-card-button" />
                </Button>
              </Grid2>
            </Toolbar>
          </AppBar>
          <Grid2 xs={12}>
            <PlotActivityProfiles
              data={data_rampage["rampageQuery"]}
              range={range}
              dimensions={dimensions}
              transcriptID={transcript}
              transcripts={transcripts}
            />
          </Grid2>
          {/* <PlotActivityProfiles data={data[payload.accession]} range={range} dimensions={dimensions} /> */}
        </ThemeProvider>
      </Grid2>
    )
  )
}
