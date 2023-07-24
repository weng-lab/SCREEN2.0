"use client"
import React, { useState, useEffect } from "react"
import { client } from "./client"
import { gql, useQuery } from "@apollo/client"
import { ORTHOLOG_QUERY } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { createLink, LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
import {
  AppBar,
  Box,
  Button,
  Drawer,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  Link,
  MenuItem,
  Select,
  SelectChangeEvent,
  Stack,
  Switch,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material"

import MenuIcon from "@mui/icons-material/Menu"
import CloseIcon from "@mui/icons-material/Close"
import Divider from "@mui/material/Divider"

import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

import { Range2D } from "jubilant-carnival"
import { PlotActivityProfiles } from "./utils"

export default function Rampage({ accession, assembly, chromosome }) {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<boolean>(false)
  const [data, setData] = useState()
  const [transcript, setTranscript] = useState<string>("")

  const [payload, setPayload] = useState<{ accession: string; assembly: string; chromosome: string }>({
    accession: accession,
    assembly: assembly,
    chromosome: chromosome,
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
        setLoading(false)
      })
      .catch((error: Error) => {
        return <ErrorMessage error={error} />
      })
    setLoading(true)
  }, [payload])

  function transcriptItems(transcripts: string[]) {
    return Object.values(transcripts).map((t: string) => {
      return <MenuItem value={t}>{t}</MenuItem>
    })
  }

  // temp theme for toolbar color
  const theme = createTheme({
    palette: {
      mode: "light",
      // primary: {
      //   main: "#nnn",
      // },
      secondary: {
        main: "#nnn",
      },
    },
    components: {
      MuiAccordion: {
        defaultProps: {
          elevation: 0,
        },
      },
    },
  })

  return error ? (
    <ErrorMessage error={new Error("Error loading data")} />
  ) : loading ? (
    <LoadingMessage />
  ) : (
    data &&
    data[payload.accession] && (
      <Grid2 container spacing={3} sx={{ mt: "1rem", mb: "2rem", mr: "2rem", width: `100%` }}>
        {/* tool bar */}
        <ThemeProvider theme={theme}>
          <AppBar position="static" color="secondary">
            <Toolbar style={{}}>
              {/* description */}
              <Grid2 xs={9} md={9} lg={9}>
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="h5" fontSize={30}>
                    TSS Activity Profiles by RAMPAGE
                  </Typography>
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
              {/* ucsc */}
              <Grid2 xs={1.5} sx={{ mt: 2, height: 100, width: 190, mb: 18 }}>
                <Link href={"https://genome.ucsc.edu/"}>
                  <Button variant="contained">
                    <img src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" width={150} />
                  </Button>
                </Link>
              </Grid2>
              {/* gene card */}
              <Grid2 xs={1.5} sx={{ mt: 2, height: 100, width: 214, mb: 18 }}>
                <Link href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + data[payload.accession]["gene"]["name"]}>
                  <Button variant="contained">
                    <img src="https://geneanalytics.genecards.org/media/81632/gc.png" width={150} />
                  </Button>
                </Link>
              </Grid2>
            </Toolbar>
          </AppBar>
          <PlotActivityProfiles data={data[payload.accession]} range={range} dimensions={dimensions} />
        </ThemeProvider>
      </Grid2>
    )
  )
}
