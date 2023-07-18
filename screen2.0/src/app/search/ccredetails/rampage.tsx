"use client"
import React, { useState, useEffect }from "react"
import { client } from "./client"
import { gql, useQuery } from "@apollo/client"
import { ORTHOLOG_QUERY } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { createLink, LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
import { Box, Typography } from "@mui/material"
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

    return error ? ErrorMessage(new Error("Error loading data")) : loading ? LoadingMessage() : data && data[payload.accession] &&
        (   
            <Grid2 container spacing={3} sx={{ mt: "1rem", mb: "2rem", mr: "1rem" }}>
                <Grid2 xs={9} lg={9} md={7}>
                    <Typography variant="h5">TSS Activity Profiles by RAMPAGE</Typography>
                    <Typography>{"Transcript: " + data[payload.accession]["sortedTranscripts"][0]} </Typography>
                    <Typography>{payload.chromosome + ": " + data[payload.accession]["gene"]["start"] + " - " + data[payload.accession]["gene"]["stop"] + " unprocessed pseudogene"}</Typography>
                </Grid2>
                <Grid2 xs={3} lg={3}>
                    <Typography variant="h6">{data[payload.accession]["gene"]["name"]}</Typography>
                    <Typography>{data[payload.accession]["gene"]["ensemblid_ver"] + "(" + data[payload.accession]["gene"]["distance"] + " bases from cCRE)"}</Typography>
                </Grid2>
                <Grid2 xs={12} lg={12} md={12}>
                    <Box width="1200px">
                    <svg className="graph" aria-labelledby="title desc" role="img" viewBox="0 0 1200 5000">
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