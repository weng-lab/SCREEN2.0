import { GenomeBrowser,DefaultBigWig  } from '@weng-lab/genomebrowser';
import { useBrowserState, BrowserState, BrowserActionType, TranscriptTrackProps, DefaultTranscript  } from '@weng-lab/genomebrowser';
import { BigWigTrackProps } from '@weng-lab/genomebrowser';
import { BigBedTrack, BigBedTrackProps, DefaultBigBed } from '@weng-lab/genomebrowser';
import { StrictMode, useEffect } from 'react';
const colors = ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0"]

function randomId() {
    return Math.random().toString(36).substring(2, 6)
}

export const bigWigExample: BigWigTrackProps = {
    ...DefaultBigWig,
    id: randomId(),
    title: "bigwig",
    height: 100,
    url: "https://downloads.wenglab.org/DNAse_All_ENCODE_MAR20_2024_merged.bw",
    color: colors[Math.floor(Math.random() * colors.length)]
}

export const bigBedExample: BigBedTrackProps = {
    ...DefaultBigBed,
    id: randomId(),
    title: "bigbed",
    height: 75,
    rowHeight: 12,
    color: colors[Math.floor(Math.random() * colors.length)],
    url: "https://downloads.wenglab.org/GRCh38-cCREs.DCC.bigBed"
}
export const UpdatedGBView = () => {
    const [browserState, browserDispatch] = useBrowserState({
        domain: { chromosome: "chr11", start: 5220000, end: 5420000 },
        preRenderedWidth: 1350,
        width: 1500,
        zoomLevel: 148,
        delta: 0,
        tracks: [bigWigExample]
      });
      /*useEffect(() => {
        browserDispatch({ type: BrowserActionType.ADD_TRACK, track: transcriptExample })
    }, [])*/
    return (<>
      <StrictMode>
            <GenomeBrowser browserState={browserState} browserDispatch={browserDispatch}>
                <BigBedTrack {...bigBedExample} />
            </GenomeBrowser>
        </StrictMode>
    </>)
}