"use client";
import React from "react";
import Grid from "@mui/material/Grid";

import {
  Browser,
  createBrowserStore,
  createTrackStore,
  DisplayMode,
  Domain,
  InitialBrowserState,
  Rect,
  Track,
  TrackType,
} from "@weng-lab/genomebrowser";
import GBControls from "../../../common/GBControls";
import { DNALogo } from "logots-react";
import { MOTIFS } from "./allmotifs";

type TfSequenceFeaturesProps = {
  coordinates: {
    start: number;
    end: number;
    chromosome?: string;
  };
  assembly: string;
};

export default function TfSequenceFeatures(props: TfSequenceFeaturesProps) {
  const initialState: InitialBrowserState = {
    domain: expandCoordinates(props.coordinates) as Domain,
    marginWidth: 150,
    trackWidth: 1350,
    multiplier: 3,
  };
  const browserStore = createBrowserStore(initialState);
  const addHighlight = browserStore((state) => state.addHighlight);
  const removeHighlight = browserStore((state) => state.removeHighlight);
  const initialTracks: Track[] = [
    {
      id: "gene-track",
      trackType: TrackType.Transcript,
      assembly: props.assembly,
      version: props.assembly.toLowerCase() === "grch38" ? 40 : 25,
      displayMode: DisplayMode.Pack,
      title: "Transcripts",
      height: 40,
      titleSize: 12,
      color: "#aaaaaa",
    },
    {
      id: "bigbed-track",
      trackType: TrackType.BigBed,
      displayMode: DisplayMode.Squish,
      title: "Motifs",
      height: 40,
      titleSize: 12,
      color: "#228B22",
      url: "gs://gcp.wenglab.org/SCREEN/all-sites.sorted.formatted.bigBed",
      tooltip: (rect) => MotifTooltip({ rect }),
      onHover: (rect) => {
        addHighlight({
          id: rect.name,
          domain: {
            chromosome: props.coordinates.chromosome,
            start: rect.start,
            end: rect.end,
          },
          color: "#228B22",
        });
      },
      onLeave: (rect) => {
        removeHighlight(rect.name);
      },
    },
    {
      id: "sequence-track",
      trackType: TrackType.Importance,
      displayMode: DisplayMode.Full,
      title: "Sequence",
      height: 100,
      titleSize: 12,
      color: "#8888ff",
      url:
        props.assembly === "GRCh38"
          ? "gs://gcp.wenglab.org/hg38.2bit"
          : "gs://gcp.wenglab.org/mm10.2bit",
      signalURL:
        props.assembly === "GRCh38"
          ? "gs://gcp.wenglab.org/241-mammalian-2020v2.bigWig"
          : "gs://gcp.wenglab.org/mm10.phylop.bigWig",
    },
  ];
  const trackStore = createTrackStore(initialTracks);
  return (
    <Grid container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
      <Grid size={{ xs: 12, lg: 12 }}>
        <GBControls browserStore={browserStore} />
        <Browser browserStore={browserStore} trackStore={trackStore} />
      </Grid>
    </Grid>
  );
}

const MotifTooltip = ({ rect }: { rect: Rect }) => {
  const rc = (x) => [...x].map((xx) => [...xx].reverse()).reverse();
  const motifName = rect.name.split("$")[2];
  const motifData =
    rect.name.split("$")[1] === "-" ? rc(MOTIFS[motifName]) : MOTIFS[motifName];
  const dnaLogoWidth = MOTIFS[motifName].length * 20; // Increased from 15 to 20
  const dnaLogoHeight = 120; // Increased from 90 to 120
  const padding = 15;
  const titleHeight = 35;
  const totalHeight = titleHeight + dnaLogoHeight + padding * 3;
  const totalWidth = Math.max(300, dnaLogoWidth + padding * 2);

  return (
    <g transform={`translate(20, -150)`}>
      {/* Background rectangle */}
      <rect
        width={totalWidth}
        height={totalHeight}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="1"
        rx="4"
      />

      {/* Title text */}
      <text
        x={padding}
        y={padding + 24}
        fontSize="18"
        fontWeight="bold"
        fill="#000000"
      >
        {motifName}
      </text>

      {/* DNALogo positioned below the title */}
      <g transform={`translate(${padding}, ${titleHeight + padding * 2})`}>
        <DNALogo ppm={motifData} width={dnaLogoWidth} height={dnaLogoHeight} />
      </g>
    </g>
  );
};

export function expandCoordinates(coordinates, l = 0) {
  return {
    chromosome: coordinates.chromosome,
    start: coordinates.start - l < 0 ? 0 : coordinates.start - l,
    end: coordinates.end + l,
  };
}
