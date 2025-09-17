import { useMemo } from "react";
import {
  Browser,
  createBrowserStore,
  createTrackStore,
  Track,
  BigBedConfig,
  BigWigConfig,
  TrackType,
  DisplayMode,
  TranscriptConfig,
  Rect,
  Domain,
  InitialBrowserState,
} from "@weng-lab/genomebrowser";
import { RegistryBiosample } from "../types";
import GBControls from "../../../common/GBControls";
import CCRETooltip from "./ccretooltip";

const colors = {
  ccre: "#D05F45",
  dnase: "#06da93",
  h3k4me3: "#ff0000",
  h3k27ac: "#ffcd00",
  ctcf: "#00b0d0",
  atac: "#02c7b9",
};

type SearchBrowserViewProps = {
  coordinates: {
    assembly: "GRCh38" | "mm10";
    chromosome: string | null;
    start: number | null;
    end: number | null;
  };
  cCREClick: (item: any) => void;
  geneName: string | null;
  biosample: RegistryBiosample | null;
  browserStore?: ReturnType<typeof createBrowserStore>;
};

export default function SearchBrowserView({
  coordinates,
  cCREClick,
  geneName,
  biosample,
  browserStore: providedBrowserStore,
}: SearchBrowserViewProps) {
  const browserStore =
    providedBrowserStore ||
    createBrowserStore({
      domain: expandCoordinates({ ...coordinates }) as Domain,
      marginWidth: 150,
      trackWidth: 1350,
      multiplier: 3,
    } as InitialBrowserState);

  // Local highlight functions for temporary hover effects
  const addTempHighlight = browserStore((state) => state.addHighlight);
  const removeTempHighlight = browserStore((state) => state.removeHighlight);

  const initialTracks = useMemo(() => {
    const tracks =
      coordinates.assembly === "GRCh38" ? humanTracks : mouseTracks;
    const geneTrack: TranscriptConfig = {
      assembly: coordinates.assembly,
      version: coordinates.assembly === "GRCh38" ? 40 : 25,
      id: "gene-track",
      trackType: TrackType.Transcript,
      displayMode: DisplayMode.Squish,
      title: "GENCODE genes",
      titleSize: 12,
      height: 50,
      color: "#AAAAAA",
      geneName: geneName,
    };
    const ccreTrack: BigBedConfig = {
      id: "default-ccre",
      title: "All cCREs colored by group",
      titleSize: 12,
      trackType: TrackType.BigBed,
      displayMode: DisplayMode.Dense,
      color: colors.ccre,
      height: 30,
      url: `https://downloads.wenglab.org/${coordinates.assembly}-cCREs.DCC.bigBed`,
      onHover: (item: Rect) => {
        addTempHighlight({
          color: item.color || "blue",
          domain: { start: item.start, end: item.end },
          id: "tmp-ccre",
        });
      },
      onLeave: () => {
        removeTempHighlight("tmp-ccre");
      },
      onClick: (item: Rect) => {
        cCREClick(item);
        // Highlight management is now handled by the parent component
      },
      tooltip: (rect: Rect) => (
        <CCRETooltip
          assembly={coordinates.assembly}
          name={rect.name || ""}
          {...rect}
        />
      ),
    };
    let biosampleTracks: Track[] = [];
    if (biosample) {
      const onHover = (item: Rect) => {
        addTempHighlight({
          color: item.color || "blue",
          domain: { start: item.start, end: item.end },
          id: "tmp-ccre",
        });
      };

      const onLeave = () => {
        removeTempHighlight("tmp-ccre");
      };

      const onClick = (item: Rect) => {
        cCREClick(item);
      };

      biosampleTracks = generateBiosampleTracks(
        biosample,
        onHover,
        onLeave,
        onClick,
        colors
      );
    }
    return [geneTrack, ccreTrack, ...tracks, ...biosampleTracks];
  }, [
    coordinates.assembly,
    geneName,
    addTempHighlight,
    removeTempHighlight,
    cCREClick,
    biosample,
  ]);

  const trackStore = createTrackStore(initialTracks);
  return (
    <div>
      <GBControls assembly={coordinates.assembly} browserStore={browserStore} />
      <Browser browserStore={browserStore} trackStore={trackStore} />
    </div>
  );
}

export function expandCoordinates(
  coordinates: {
    assembly: "GRCh38" | "mm10";
    chromosome: string | null;
    start: number | null;
    end: number | null;
  },
  l = 20000
) {
  // Handle null values with defaults
  const start = coordinates.start ?? 0;
  const end = coordinates.end ?? 1000000;
  const chromosome = coordinates.chromosome ?? "chr1";

  return {
    chromosome,
    start: start - l < 0 ? 0 : start - l,
    end: end + l,
  };
}

function generateBiosampleTracks(
  biosample: RegistryBiosample,
  onHover: (item: Rect) => void,
  onLeave: (item: Rect) => void,
  onClick: (item: Rect) => void,
  colors: {
    ccre: string;
    dnase: string;
    h3k4me3: string;
    h3k27ac: string;
    ctcf: string;
  }
): Track[] {
  const tracks: Track[] = [];

  // Get available signal accessions (remove null values)
  const signals = [
    biosample.dnase_signal,
    biosample.h3k4me3_signal,
    biosample.h3k27ac_signal,
    biosample.ctcf_signal,
  ].filter((signal): signal is string => !!signal);

  if (signals.length > 0) {
    const bigBedUrl = `https://downloads.wenglab.org/Registry-V4/${signals.join(
      "_"
    )}.bigBed`;
    const ccreTrack: BigBedConfig = {
      id: `biosample-ccre-${biosample.name}`,
      title: `cCREs in ${biosample.displayname}`,
      titleSize: 12,
      trackType: TrackType.BigBed,
      displayMode: DisplayMode.Dense,
      color: colors.ccre,
      height: 50,
      url: bigBedUrl,
      onHover: onHover,
      onLeave: onLeave,
      onClick: onClick,
    };
    tracks.push(ccreTrack);
  }

  if (biosample.dnase_signal) {
    tracks.push({
      id: `biosample-dnase-${biosample.name}`,
      title: `DNase-seq signal in ${biosample.displayname}`,
      titleSize: 12,
      trackType: TrackType.BigWig,
      displayMode: DisplayMode.Full,
      color: colors.dnase,
      height: 100,
      url: `https://www.encodeproject.org/files/${biosample.dnase_signal}/@@download/${biosample.dnase_signal}.bigWig`,
    } as BigWigConfig);
  }

  if (biosample.h3k4me3_signal) {
    tracks.push({
      id: `biosample-h3k4me3-${biosample.name}`,
      title: `H3K4me3 ChIP-seq signal in ${biosample.displayname}`,
      titleSize: 12,
      trackType: TrackType.BigWig,
      displayMode: DisplayMode.Full,
      color: colors.h3k4me3,
      height: 100,
      url: `https://www.encodeproject.org/files/${biosample.h3k4me3_signal}/@@download/${biosample.h3k4me3_signal}.bigWig`,
    } as BigWigConfig);
  }

  if (biosample.h3k27ac_signal) {
    tracks.push({
      id: `biosample-h3k27ac-${biosample.name}`,
      title: `H3K27ac ChIP-seq signal in ${biosample.displayname}`,
      titleSize: 12,
      trackType: TrackType.BigWig,
      displayMode: DisplayMode.Full,
      color: colors.h3k27ac,
      height: 100,
      url: `https://www.encodeproject.org/files/${biosample.h3k27ac_signal}/@@download/${biosample.h3k27ac_signal}.bigWig`,
    } as BigWigConfig);
  }

  if (biosample.ctcf_signal) {
    tracks.push({
      id: `biosample-ctcf-${biosample.name}`,
      title: `CTCF ChIP-seq signal in ${biosample.displayname}`,
      titleSize: 12,
      trackType: TrackType.BigWig,
      displayMode: DisplayMode.Full,
      color: colors.ctcf,
      height: 100,
      url: `https://www.encodeproject.org/files/${biosample.ctcf_signal}/@@download/${biosample.ctcf_signal}.bigWig`,
    } as BigWigConfig);
  }

  return tracks;
}

const humanTracks: Track[] = [
  {
    id: "default-dnase",
    title: "Aggregated DNase-seq signal, all ENCODE biosamples",
    shortLabel: "DNase (avg.)",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: "#06da93",
    height: 50,
    url: "https://downloads.wenglab.org/DNAse_All_ENCODE_MAR20_2024_merged.bw",
  } as BigWigConfig,
  {
    id: "default-h3k4me3",
    title: "Aggregated H3K4me3 ChIP-seq signal, all ENCODE biosamples",
    shortLabel: "H3K4me3 (avg.)",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: "#ff0000",
    height: 50,
    url: "https://downloads.wenglab.org/H3K4me3_All_ENCODE_MAR20_2024_merged.bw",
  } as BigWigConfig,
  {
    id: "default-h3k27ac",
    title: "Aggregated H3K27ac ChIP-seq signal, all ENCODE biosamples",
    shortLabel: "H3K27ac (avg.)",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: "#ffcd00",
    height: 50,
    url: "https://downloads.wenglab.org/H3K27ac_All_ENCODE_MAR20_2024_merged.bw",
  } as BigWigConfig,
  {
    id: "default-ctcf",
    title: "Aggregated CTCF ChIP-seq signal, all ENCODE biosamples",
    shortLabel: "CTCF (avg.)",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: "#00b0d0",
    height: 50,
    url: "https://downloads.wenglab.org/CTCF_All_ENCODE_MAR20_2024_merged.bw",
  } as BigWigConfig,
  {
    id: "default-atac",
    title: "Aggregated ATAC-seq signal, all ENCODE biosamples",
    shortLabel: "ATAC (avg.)",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: "#02c7b9",
    height: 50,
    url: "https://downloads.wenglab.org/ATAC_All_ENCODE_MAR20_2024_merged.bw",
  } as BigWigConfig,
];

const mouseTracks: Track[] = [
  {
    id: "default-dnase",
    title: "Aggregated DNase-seq signal, all ENCODE biosamples",
    shortLabel: "DNase (avg.)",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: "#06da93",
    height: 50,
    url: "https://downloads.wenglab.org/DNase_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
  } as BigWigConfig,
  {
    id: "default-h3k4me3",
    title: "Aggregated H3K4me3 ChIP-seq signal, all ENCODE biosamples",
    shortLabel: "H3K4me3 (avg.)",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: "#ff0000",
    height: 50,
    url: "https://downloads.wenglab.org/H3K4me3_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
  } as BigWigConfig,
  {
    id: "default-h3k27ac",
    title: "Aggregated H3K27ac ChIP-seq signal, all ENCODE biosamples",
    shortLabel: "H3K27ac (avg.)",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: "#ffcd00",
    height: 50,
    url: "https://downloads.wenglab.org/H3K27ac_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
  } as BigWigConfig,
  {
    id: "default-ctcf",
    title: "Aggregated CTCF ChIP-seq signal, all ENCODE biosamples",
    shortLabel: "CTCF (avg.)",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: "#00b0d0",
    height: 50,
    url: "https://downloads.wenglab.org/CTCF_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
  } as BigWigConfig,
  {
    id: "default-atac",
    title: "Aggregated ATAC-seq signal, all ENCODE biosamples",
    shortLabel: "ATAC (avg.)",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: "#02c7b9",
    height: 50,
    url: "https://downloads.wenglab.org/ATAC_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
  } as BigWigConfig,
];
