"use client"
import React, { useState, useEffect }from "react"
import { client } from "./client"
import { gql, useQuery } from "@apollo/client"
import { ORTHOLOG_QUERY } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { createLink, LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
import { Box, Button, FormControl, FormControlLabel, InputLabel, Link, MenuItem, Select, SelectChangeEvent, Switch, Typography } from "@mui/material"
import { Range2D } from "jubilant-carnival"
import { PlotActivityProfiles } from "./utils"

export default function Rampage({accession, assembly, chromosome}){
    const [ loading, setLoading ] = useState<boolean>(true)
    const [ error, setError ] = useState<boolean>(false)
    const [ data, setData ] = useState()
    const [ options, setOptions ] = useState<string[]>([])
    const [ sort, setSort ] = useState<string>("byValue")
    const [ zeros, setZeros ] = useState<boolean>(false)

    const [ transcript, setTranscript ] = useState<string>("")

    const [ payload, setPayload ] = useState<{accession: string, assembly: string, chromosome: string}>({
        accession: accession,
        assembly: assembly,
        chromosome: chromosome
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
                chromosome: payload.chromosome 
            })
          })
        .then((response) => {
            if (!response.ok) {
            setError(true)
            return ErrorMessage(new Error(response.statusText))
            }
            return response.json()
        })
        .then((data) => {
            setData(data)
            setLoading(false)
        })
        .catch((error: Error) => {
            return ErrorMessage(error)
        })
        setLoading(true)
    }, [ payload ])

    function transcriptItems(transcripts: string[]){
        return Object.values(transcripts).map((t: string) => {
            return (
                <MenuItem value={t}>{t}</MenuItem>
            )
        })
    }

    return error ? ErrorMessage(new Error("Error loading data")) : loading ? LoadingMessage() : data && data[payload.accession] &&
        (   
            <Grid2 container spacing={3} sx={{ mt: "1rem", mb: "2rem", mr: "1rem" }}>
                <Grid2 xs={4} lg={5} md={5}>
                    <Box>
                        <Typography variant="h4">TSS Activity Profiles by RAMPAGE</Typography>
                    </Box>
                    <Box mt={2}>
                        <Typography variant="h5">{data[payload.accession]["gene"]["name"]}</Typography>
                        <Typography>{data[payload.accession]["gene"]["ensemblid_ver"] + " (" + parseInt(data[payload.accession]["gene"]["distance"]).toLocaleString("en-US") + " bases from cCRE)"}</Typography>
                    </Box>
                    <Box mt={2}>
                        <Typography display="inline" lineHeight={2.5}>{"Transcript: "} </Typography>
                        <FormControl>
                            <InputLabel id="transcription-select-label"></InputLabel>
                            <Select
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
                        <Typography lineHeight={3}>{payload.chromosome + ": " + parseInt(data[payload.accession]["gene"]["start"]).toLocaleString("en-US") + " - " + parseInt(data[payload.accession]["gene"]["stop"]).toLocaleString("en-US") + " unprocessed pseudogene"}</Typography>
                    </Box>
                </Grid2>
                <Grid2 xs={1} mt={0}>
                <Box mt={0} sx={{ height: 100, width: 150 }}>
                    <Link href={"https://genome.ucsc.edu/"}>
                        <Button variant="contained">
                            <img src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" width={150}/>
                        </Button>
                    </Link>
                </Box>
            </Grid2>
            <Grid2 xs={3} ml={2} mt={0}>
                <Box mt={0} sx={{ height: 100, width: 165 }}>
                    <Link href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + data[payload.accession]["gene"]["name"]}>
                        <Button variant="contained">
                            <img src="https://geneanalytics.genecards.org/media/81632/gc.png" width={150}/>
                        </Button>
                    </Link>
                </Box>
            </Grid2>
                <Grid2 xs={2} lg={2} md={2}>
                    <Box mt={5} ml={30}>
                        <FormControl key={sort}>
                            <InputLabel id="sort-by-label">Sort By</InputLabel>
                            <Select
                                labelId="sort-by-label"
                                id="sort-by"
                                value={sort}
                                onChange={(event: SelectChangeEvent) => {
                                    setSort(event.target.value)
                                }}
                            >
                                <MenuItem value="byTissue">Tissue</MenuItem>
                                <MenuItem value="byTissueMax">Tissue Max</MenuItem>
                                <MenuItem value="byValue">Value</MenuItem>
                            </Select>
                            <FormControlLabel 
                                control={
                                    <Switch 
                                    checked={zeros} 
                                    onChange={() => {
                                        if (zeros) setZeros(false)
                                        else setZeros(true)
                                    }}/>
                                } 
                                label="zeros"
                            />
                        </FormControl>
                    </Box>
                </Grid2>
                <Grid2 xs={12} lg={12} md={12}>
                    <Box width="1200px">
                    <svg className="graph" aria-labelledby="title desc" role="img" viewBox="0 0 1200 12000">
                            <g className="x-grid grid" id="xGrid">
                                <line x1="100" x2="1100" y1="4900" y2="5900"></line>
                            </g>
                            <g className="y-grid grid" id="yGrid">
                                <line x1="900" x2="1100" y1="100" y2="4900"></line>
                            </g>
                            <g className="data" data-setname="gene expression plot">
                                {PlotActivityProfiles(data[payload.accession], sort, zeros, range, dimensions)}
                            </g>
                        </svg>
                    </Box>
                </Grid2>
            </Grid2>
        )
}