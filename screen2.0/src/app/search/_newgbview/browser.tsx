import { GenomeBrowser, TranscriptTrack, TranscriptHumanVersion, DisplayMode, DefaultTranscript } from '@weng-lab/genomebrowser';
import { useBrowserState } from '@weng-lab/genomebrowser';
import { StrictMode, useEffect, useMemo, useState } from 'react';
import { RegistryBiosample } from '../types';
import { defaultTracks } from './genTracks';
import { expandCoordinates } from '../_gbview/genomebrowserview';

function randomId() {
    return Math.random().toString(36).substring(2, 6)
}

export type BrowserProps = {
    coordinates: {
        assembly: "GRCh38" | "mm10"
        chromosome: string | null
        start: number | null
        end: number | null
    }
    gene: string | null
    biosample: RegistryBiosample
}
export const Browser = ({ coordinates, gene, biosample }: BrowserProps) => {
    const startDomain = useMemo(() => expandCoordinates(coordinates), [coordinates])
    const [browserState, browserDispatch] = useBrowserState({
        domain: startDomain,
        width: 2000,
        tracks: [...defaultTracks(coordinates)]
    });

    return (<>
        <StrictMode>
            <GenomeBrowser browserState={browserState} browserDispatch={browserDispatch} />
        </StrictMode>
    </>)
}