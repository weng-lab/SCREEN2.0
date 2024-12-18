import Grid from "@mui/material/Grid2";
import { BrowserActionType, GenomeBrowser, useBrowserState, BigBedTrackProps, TrackType, BigBedTrack, DefaultBigBed, DisplayMode } from '@weng-lab/genomebrowser';
import { useEffect, useMemo, useRef } from 'react';
import { expandCoordinates } from '../_gbview/genomebrowserview';
import { RegistryBiosample } from '../types';
import { getDefaultTracks } from './genTracks';

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
}
interface Rect {
    start: number;
    end: number;
    color?: string;
    name?: string;
    score?: number;
};

export const Browser = ({ cCREClick, coordinates, gene, biosample }: BrowserProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const startDomain = useMemo(() => expandCoordinates(coordinates), [coordinates]);
    const defaultTracks = useMemo(() => getDefaultTracks(coordinates), [coordinates])
    const [browserState, browserDispatch] = useBrowserState({
        domain: startDomain,
        width: 1500,
        tracks: defaultTracks
    });

    const bedMouseOver = (item: Rect) => {
        const highlight = { domain: { start: item.start + 150, end: item.end + 150 }, color: item.color || "red", id: item.name || item.start + "-" + item.end }
        browserDispatch({ type: BrowserActionType.ADD_HIGHLIGHT, highlight })
    }
    const bedMouseOut = () => {
        browserDispatch({ type: BrowserActionType.REMOVE_LAST_HIGHLIGHT })
    }
    const bedClick = (item: Rect) => {
        cCREClick(item)
    }
    const initialLoad = useRef(true)
    useEffect(() => {
        if (initialLoad.current) {
            const bigbeds = browserState.tracks.filter(track => track.trackType === TrackType.BIGBED)
            bigbeds.forEach(track => {
                browserDispatch({
                    type: BrowserActionType.UPDATE_TRACK, id: track.id, track: {
                        ...track,
                        onMouseOut: bedMouseOut,
                        onMouseOver: bedMouseOver,
                        onClick: bedClick,
                        tooltipContent: tooltip
                    }
                })
            })
            initialLoad.current = false
        }
    }, [])

    return (
        <Grid container spacing={3} sx={{ mt: "1rem", mb: "1rem" }} ref={containerRef}>
            <Grid size={{ xs: 12, lg: 12 }}>
                <GenomeBrowser width={"100%"} browserState={browserState} browserDispatch={browserDispatch} />
            </Grid>
        </Grid>
    )
}

function tooltip(item: Rect) {
    return (
        <div style={{ position: "absolute", top: 0, left: 0, backgroundColor: "white", zIndex: 1000 }}>Hovering over {item.name}</div>
    )
}
