import Grid from "@mui/material/Grid2";
import { BrowserActionType, GenomeBrowser, BrowserAction, TrackType, BrowserState, Controls, GQLCytobands, GQLWrapper } from '@weng-lab/genomebrowser';
import { Dispatch, useEffect, useMemo, useRef, useState } from 'react';
import { RegistryBiosample } from '../types';
import { genBiosampleTracks } from './genTracks';
import CCRETooltip from "../_gbview/ccretooltip";
import { gql, useLazyQuery } from "@apollo/client";
import { Button, IconButton, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";

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

    const biosampleIDs = useMemo(() => {
        return state.tracks.filter(track => track.id.startsWith("sample-")).map(track => track.id)
    }, [state.tracks])

    useEffect(() => {
        // if there are biosample tracks, check if the current sample is the same as the biosample
        if (biosampleIDs.length > 0) {
            const currentSample = state.tracks[state.tracks.length - 1].id.split("-")[2]
            // return to avoid adding the same sample twice
            if (biosample && currentSample === biosample.name) {
                return
            }
        }
        // when biosample changes, delete old biosample tracks
        biosampleIDs.forEach(id => {
            dispatch({ type: BrowserActionType.DELETE_TRACK, id: id })
        })

        loadBiosample()
        if (bdata && biosample) {
            const tracks = genBiosampleTracks(biosample, coordinates, bdata)
            tracks.forEach(track => {
                if (track.trackType === TrackType.BIGBED) {
                    let bedTrack = { ...track, onMouseOut: bedMouseOut, onMouseOver: bedMouseOver, onClick: bedClick, tooltipContent: (item: Rect) => CCRETooltip({ biosample, assembly: coordinates.assembly, name: item.name }) }
                    dispatch({ type: BrowserActionType.ADD_TRACK, track: bedTrack })
                } else {
                    dispatch({
                        type: BrowserActionType.ADD_TRACK, track
                    })
                }
            })
        }
    }, [bdata, biosample, coordinates.assembly])

    return (
        <GQLWrapper>
            <Grid container spacing={3} sx={{ mt: "0rem", mb: "1rem" }} ref={containerRef} justifyContent="center" alignItems="center">
                <Grid size={{ xs: 12, lg: 12 }} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", marginTop: "0px" }}>
                    <h3 style={{ marginBottom: "0px", marginTop: "0px" }}>
                        {coordinates.assembly} at {state.domain.chromosome}:{state.domain.start.toLocaleString()}-{state.domain.end.toLocaleString()}
                    </h3>
                    <svg id="cytobands" width={"700px"} height={20}>
                        <GQLCytobands assembly={coordinates.assembly === "GRCh38" ? "hg38" : "mm10"} chromosome={coordinates.chromosome} currentDomain={state.domain} />
                    </svg>
                </Grid>
                <Grid size={{ xs: 12, lg: 12 }}>
                    <div style={{ width: "100%" }}>
                        <Controls
                            inputButtonComponent={
                                <IconButton type="button" sx={{
                                    color: "black",
                                    maxHeight: "100%",
                                    padding: "4px"
                                }}>
                                    <Search fontSize="small" />
                                </IconButton>
                            }
                            inputComponent={SearchInput(state.domain.chromosome + ":" + state.domain.start + "-" + state.domain.end)}
                            buttonComponent={
                                <Button
                                    variant="outlined"
                                    sx={{
                                        minWidth: "0px",
                                        width: { xs: "100%", sm: "80%" },
                                        maxWidth: "120px",
                                        fontSize: "0.8rem",
                                        padding: "4px 8px"
                                    }}
                                />
                            }
                            domain={state.domain}
                            dispatch={dispatch}
                            withInput
                            style={{
                                paddingBottom: "4px",
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "4px",
                                width: "100%"
                            }}
                        />
                    </div>
                    <GenomeBrowser width={"100%"} browserState={state} browserDispatch={dispatch} />
                </Grid>
            </Grid >
        </GQLWrapper>
    )
}

function SearchInput(placeholder: string) {
    return (
        <TextField
            variant="outlined"
            id="region-input"
            label="Enter a genomic region"
            placeholder={placeholder}
            slotProps={{
                inputLabel: {
                    shrink: true,
                    htmlFor: "region-input",
                    style: {
                        color: "#000F9F",
                        fontSize: "0.8rem"
                    },
                },
                input: {
                    style: {
                        color: "#000F9F",
                        fontSize: "0.8rem"
                    }
                }
            }}
            sx={{
                mr: { xs: "0.5rem", sm: "0.5rem" },
                minWidth: { xs: "100%", sm: "14rem" },
                maxWidth: "250px",
                fieldset: { borderColor: "#000F9F" },
                height: "30px",
                mb: "5px"
            }}
            size="small"
        />
    )
}

function linearScale(domain: { start: number, end: number }, start: number, end: number) {
    const left = domain.start + ((start) / (1350)) * (domain.end - domain.start)
    const right = domain.start + ((end) / (1350)) * (domain.end - domain.start)
    return { left, right }
}