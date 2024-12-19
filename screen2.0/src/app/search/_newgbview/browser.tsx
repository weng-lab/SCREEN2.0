import Grid from "@mui/material/Grid2";
import { BrowserActionType, GenomeBrowser, BrowserAction, TrackType, BrowserState, Controls, TrackProps, GQLCytobands } from '@weng-lab/genomebrowser';
import { Dispatch, useEffect, useRef, useState } from 'react';
import { RegistryBiosample } from '../types';
import { genBiosampleTracks } from './genTracks';
import CCRETooltip from "../_gbview/ccretooltip";
import { gql, useLazyQuery, useQuery } from "@apollo/client";
import { Button, IconButton, TextField } from "@mui/material";
import { Search, Style } from "@mui/icons-material";

const BIOSAMPLE_QUERY = gql`
  query biosamples_2 {
    human: ccREBiosampleQuery(assembly: "grch38") {
      biosamples {
        name
        dnase: experimentAccession(assay: "DNase")
        h3k4me3: experimentAccession(assay: "H3K4me3")
        h3k27ac: experimentAccession(assay: "H3K27ac")
        ctcf: experimentAccession(assay: "CTCF")        
        atac: experimentAccession(assay: "ATAC")
        dnase_signal: fileAccession(assay: "DNase")
        h3k4me3_signal: fileAccession(assay: "H3K4me3")
        h3k27ac_signal: fileAccession(assay: "H3K27ac")
        ctcf_signal: fileAccession(assay: "CTCF")
        atac_signal: fileAccession(assay: "ATAC")
      }
    }
    mouse: ccREBiosampleQuery(assembly: "mm10") {
      biosamples {
        name
        dnase: experimentAccession(assay: "DNase")
        h3k4me3: experimentAccession(assay: "H3K4me3")
        h3k27ac: experimentAccession(assay: "H3K27ac")
        ctcf: experimentAccession(assay: "CTCF")
        atac: experimentAccession(assay: "ATAC")
        dnase_signal: fileAccession(assay: "DNase")
        h3k4me3_signal: fileAccession(assay: "H3K4me3")
        h3k27ac_signal: fileAccession(assay: "H3K27ac")
        ctcf_signal: fileAccession(assay: "CTCF")
        atac_signal: fileAccession(assay: "ATAC")
      }
    }
  }
`

export type BrowserProps = {
    coordinates: {
        assembly: "GRCh38" | "mm10"
        chromosome: string | null
        start: number | null
        end: number | null
    }
    gene: string | null
    biosample?: RegistryBiosample
    cCREClick: (item: Rect) => void
    state: BrowserState
    dispatch: Dispatch<BrowserAction>
}
interface Rect {
    start: number;
    end: number;
    color?: string;
    name?: string;
    score?: number;
};

export const Browser = ({ cCREClick, state, dispatch, coordinates, gene, biosample }: BrowserProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    const bedMouseOver = (item: Rect) => {
        const newHighlight = { domain: { start: item.start + 150, end: item.end + 150 }, color: item.color || "red", id: item.name }
        dispatch({ type: BrowserActionType.ADD_HIGHLIGHT, highlight: newHighlight })
    }

    const bedMouseOut = () => {
        dispatch({ type: BrowserActionType.REMOVE_LAST_HIGHLIGHT })
    }
    const bedClick = (item: Rect) => {
        dispatch({ type: BrowserActionType.REMOVE_LAST_HIGHLIGHT })
        const { left, right } = linearScale(state.domain, item.start, item.end)
        const ccre = { start: left, end: right, color: item.color, name: item.name, score: item.score, chromosome: state.domain.chromosome }
        cCREClick(ccre)
    }
    const initialLoad = useRef(true)
    useEffect(() => {
        if (initialLoad.current) {
            const bigbeds = state.tracks.filter(track => track.trackType === TrackType.BIGBED)
            bigbeds.forEach(track => {
                dispatch({
                    type: BrowserActionType.UPDATE_TRACK, id: track.id, track: {
                        ...track,
                        onMouseOut: bedMouseOut,
                        onMouseOver: bedMouseOver,
                        onClick: bedClick,
                        tooltipContent: (item: Rect) => CCRETooltip({ biosample, assembly: coordinates.assembly, name: item.name })
                    }
                })
            })
            const transcripts = state.tracks.filter(track => track.trackType === TrackType.TRANSCRIPT)
            transcripts.forEach(track => {
                dispatch({
                    type: BrowserActionType.UPDATE_PROPS, id: track.id,
                    props: {
                        geneName: gene
                    }
                })
            })
            initialLoad.current = false
        }
    }, [])

    const [loadBiosample, { loading: bloading, data: bdata }] = useLazyQuery(BIOSAMPLE_QUERY, {
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
    })

    const [biosampleIDs, setBiosampleIDs] = useState<string[]>([])
    useEffect(() => {
        biosampleIDs.forEach(id => {
            dispatch({ type: BrowserActionType.DELETE_TRACK, id: id })
        }) // when biosample changes, delete old biosample tracks
        setBiosampleIDs([])
        loadBiosample()
        if (bdata && biosample) {
            const tracks = genBiosampleTracks(biosample, coordinates, bdata)
            const ids = []
            tracks.forEach(track => {
                if (track.trackType === TrackType.BIGBED) {
                    let bedTrack = { ...track, onMouseOut: bedMouseOut, onMouseOver: bedMouseOver, onClick: bedClick, tooltipContent: (item: Rect) => CCRETooltip({ biosample, assembly: coordinates.assembly, name: item.name }) }
                    dispatch({ type: BrowserActionType.ADD_TRACK, track: bedTrack })
                } else {
                    dispatch({
                        type: BrowserActionType.ADD_TRACK, track
                    })
                }
                ids.push(track.id)
            })
            setBiosampleIDs(ids)
        }
    }, [bdata, biosample, coordinates.assembly])

    return (
        <Grid container spacing={3} sx={{ mt: "1rem", mb: "1rem" }} ref={containerRef} justifyContent="center" alignItems="center">
            <Grid size={{ xs: 12, lg: 12 }} style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                <svg id="cytobands" width={"700px"} height={20}>
                    <GQLCytobands assembly={coordinates.assembly === "GRCh38" ? "hg38" : "mm10"} chromosome={coordinates.chromosome} currentDomain={state.domain} />
                </svg>
            </Grid>
            <Grid size={{ xs: 12, lg: 12 }}>
                <Controls inputComponent={SearchInput(state.domain.chromosome + ":" + state.domain.start + "-" + state.domain.end)} buttonComponent={<Button variant="outlined" />} domain={state.domain} dispatch={dispatch} withInput style={{ paddingBottom: "4px" }} />
                <GenomeBrowser width={"100%"} browserState={state} browserDispatch={dispatch} />
            </Grid>
        </Grid >
    )
}

function SearchInput(value: string) {
    return (
        <>
            <TextField
                variant="outlined"
                id="region-input"
                label="Enter a genomic region"
                placeholder={`chr12:${(53380176).toLocaleString()}-${(53416446).toLocaleString()}`}
                value={value}
                slotProps={{
                    inputLabel: {
                        shrink: true,
                        htmlFor: "region-input",
                        style: { color: "white" },
                    },
                    input: { style: { color: "white" } }
                }}
                sx={{
                    mr: "1rem",
                    minWidth: "16rem",
                    fieldset: { borderColor: "black" },
                    height: "30px"
                }}
                size="small"
            />
            <IconButton
                aria-label="Search"
                type="submit"
                sx={{ color: "white", maxHeight: "100%" }}
            >
                <Search />
            </IconButton>
        </>

    )
}

function linearScale(domain: { start: number, end: number }, start: number, end: number) {
    const left = domain.start + ((start) / (1350)) * (domain.end - domain.start)
    const right = domain.start + ((end) / (1350)) * (domain.end - domain.start)
    return { left, right }
}