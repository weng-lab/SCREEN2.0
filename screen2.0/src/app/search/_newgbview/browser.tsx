import Grid from "@mui/material/Grid2";
import { BrowserActionType, GenomeBrowser, useBrowserState, BrowserAction, TrackType, BigBedTrack, DefaultBigBed, DisplayMode, BrowserState } from '@weng-lab/genomebrowser';
import { Dispatch, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { expandCoordinates } from '../_gbview/genomebrowserview';
import { RegistryBiosample } from '../types';
import { getDefaultTracks } from './genTracks';
import CCRETooltip from "../_gbview/ccretooltip";

export type BrowserProps = {
    coordinates: {
        assembly: "GRCh38" | "mm10"
        chromosome: string | null
        start: number | null
        end: number | null
    }
    gene: string | null
    biosample: RegistryBiosample
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
    const startDomain = useMemo(() => expandCoordinates(coordinates), [coordinates]);

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
            initialLoad.current = false
        }
    }, [])

    return (
        <Grid container spacing={3} sx={{ mt: "1rem", mb: "1rem" }} ref={containerRef}>
            <Grid size={{ xs: 12, lg: 12 }}>
                <GenomeBrowser width={"100%"} browserState={state} browserDispatch={dispatch} />
            </Grid>
        </Grid>
    )
}

function linearScale(domain: { start: number, end: number }, start: number, end: number) {
    const left = domain.start + ((start) / (1350)) * (domain.end - domain.start)
    const right = domain.start + ((end) / (1350)) * (domain.end - domain.start)
    return { left, right }
}