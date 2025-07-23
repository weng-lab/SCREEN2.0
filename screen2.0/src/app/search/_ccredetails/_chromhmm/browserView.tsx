import { useState, useEffect, useMemo } from "react";
import {
  Track,
  TrackType,
  DisplayMode,
  TranscriptConfig,
  InitialBrowserState,
  Chromosome,
  BulkBedConfig,
  Browser,
  Rect,
  createBrowserStore,
  createTrackStore,
} from "@weng-lab/genomebrowser";
import { tissueColors } from "../../../../common/lib/colors";
import { ChromTrack, stateDetails } from "./chromhmm";
import GBControls from "../../../../common/GBControls";

export default function ChromHMMBrowser({
  coordinates,
  tracks,
}: {
  tracks: Record<string, ChromTrack[]>;
  coordinates: { chromosome: string; start: number; end: number };
}) {
  const initialState: InitialBrowserState = {
    domain: {
      chromosome: coordinates.chromosome as Chromosome,
      start: coordinates.start - 20000,
      end: coordinates.end + 20000,
    },
    marginWidth: 100,
    trackWidth: 1400,
    multiplier: 3,
    highlights: [
      { id: "feature", color: "#000000", domain: { ...coordinates } },
    ],
  };
  const browserStore = createBrowserStore(initialState);
  const addHighlight = browserStore((state) => state.addHighlight);
  const removeHighlight = browserStore((state) => state.removeHighlight);

  const initialTracks = useMemo(() => {
    if (!tracks) return [];
    const tempTracks: Track[] = [];
    for (const tissue of Object.keys(tracks)) {
      const samples = tracks[tissue];
      const bulkbed: BulkBedConfig = {
        id: `${tissue}-bulkbed`,
        titleSize: 12,
        color: tissueColors[tissue] ?? tissueColors.missing,
        trackType: TrackType.BulkBed,
        displayMode: DisplayMode.Full,
        datasets: samples.map((sample, index) => {
          return {
            name: sample.sample + (index + 1).toString(),
            url: sample.url,
          };
        }),
        title: tissue,
        height: 15 * samples.length,
        tooltip: (rect) => Tooltip(rect, tissue),
        onHover: (rect) => {
          addHighlight({
            color: rect.color,
            domain: { start: rect.start, end: rect.end },
            id: "tmp-bulkbed",
          });
        },
        onLeave: () => {
          removeHighlight("tmp-bulkbed");
        },
      };
      tempTracks.push(bulkbed);
    }
    return tempTracks;
  }, [tracks]);
  const trackStore = createTrackStore(initialTracks);

  if (initialTracks.length === 0) return null;

  return (
    <div>
      <GBControls assembly="GRCh38" browserStore={browserStore} />
      <Legend />
      <Browser browserStore={browserStore} trackStore={trackStore} />
    </div>
  );
}

function Tooltip(rect: Rect, tissue: string) {
  return (
    <g>
      <rect
        width={240}
        height={70}
        fill="white"
        stroke="none"
        filter="drop-shadow(2px 2px 2px rgba(0,0,0,0.2))"
      />
      <rect
        width={15}
        height={15}
        fill={stateDetails[rect.name].color}
        x={10}
        y={10}
      />
      <text x={35} y={22} fontSize={12} fontWeight="bold">
        {stateDetails[rect.name].description}({stateDetails[rect.name].stateno})
      </text>
      <text x={10} y={40} fontSize={12}>
        {rect.name}
      </text>
      <text x={10} y={58} fontSize={12}>
        {tissue}
      </text>
    </g>
  );
}

function Legend() {
  return (
    <div
      style={{
        width: "65%",
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "center",
        gap: "30px",
        padding: "20px 40px",
        borderRadius: "4px",
      }}
    >
      {Object.keys(stateDetails).map((s, i) => (
        <div
          key={s}
          style={{ display: "flex", alignItems: "center", gap: "5px" }}
        >
          <div
            style={{
              width: "15px",
              height: "15px",
              backgroundColor: stateDetails[s].color,
            }}
          />
          <div
            style={{
              fontSize: "12px",
            }}
          >
            {s}
          </div>
        </div>
      ))}
    </div>
  );
}
