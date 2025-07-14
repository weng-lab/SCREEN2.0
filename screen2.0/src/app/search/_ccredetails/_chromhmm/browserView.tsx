import { useState, useEffect } from "react";
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
  useBrowserStore,
} from "track-logic";
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
  const currentDomain = useBrowserStore((state) => state.domain);
  const [initialTracks, setInitialTracks] = useState<Track[]>([
    {
      id: "gene-track",
      title: "GENCODE Genes",
      titleSize: 12,
      height: 50,
      color: "#aaaaaa",
      trackType: TrackType.Transcript,
      assembly: "GRCh38",
      version: 40,
      displayMode: DisplayMode.Squish,
    } as TranscriptConfig,
  ]);
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
  useEffect(() => {
    if (!tracks || initialTracks.length > 1) return;
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
      };
      tempTracks.push(bulkbed);
    }
    setInitialTracks([...initialTracks, ...tempTracks]);
  }, [tracks]);

  if (initialTracks.length === 0) return null;

  return (
    <div>
      <GBControls 
        assembly="GRCh38"
      />
      <Legend />
      <Browser tracks={initialTracks} state={initialState} />
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
