import {
  Browser,
  InitialBrowserState,
  Track,
  Domain,
  Rect,
  BigWigConfig,
  DisplayMode,
  BigBedConfig,
  TrackType,
  useTrackStore,
  TranscriptConfig,
  useBrowserStore,
} from "track-logic";
import { RegistryBiosample } from "../_biosampleTables/types";
import { useEffect } from "react";

type BrowserViewProps = {
  coordinates: Domain;
  assembly: "GRCh38" | "mm10";
  gene: string | null;
  biosample: RegistryBiosample | null;
  cCREClick: (item: Rect) => void;
};

const colors = {
  ccre: "#D05F45",
  dnase: "#06da93",
  h3k4me3: "#ff0000",
  h3k27ac: "#ffcd00",
  ctcf: "#00b0d0",
  atac: "#02c7b9",
};

const mouseTracks: Track[] = [
  {
    id: "default-gene",
    assembly: "mm10",
    displayMode: DisplayMode.Squish,
    trackType: TrackType.Transcript,
    title: "GENCODE genes",
    color: "#AAAAAA",
    version: 25,
    height: 75,
  } as TranscriptConfig,
  {
    id: "default-ccre",
    title: "All cCREs colored by group",
    trackType: TrackType.BigBed,
    displayMode: DisplayMode.Dense,
    color: colors.ccre,
    rowHeight: 12,
    height: 50,
    url: "https://downloads.wenglab.org/mm10-cCREs.DCC.bigBed",
  } as BigBedConfig,
  {
    id: "default-dnase",
    title: "Aggregated DNase-seq signal, all Registry biosamples",
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: colors.dnase,
    height: 100,
    url: "https://downloads.wenglab.org/DNase_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
  } as BigWigConfig,
  {
    id: "default-h3k4me3",
    title: "Aggregated H3K4me3 ChIP-seq signal, all Registry biosamples",
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: colors.h3k4me3,
    height: 100,
    url: "https://downloads.wenglab.org/H3K4me3_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
  } as BigWigConfig,
  {
    id: "default-h3k27ac",
    title: "Aggregated H3K27ac ChIP-seq signal, all Registry biosamples",
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: colors.h3k27ac,
    height: 100,
    url: "https://downloads.wenglab.org/H3K27ac_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
  } as BigWigConfig,
  {
    id: "default-ctcf",
    title: "Aggregated CTCF ChIP-seq signal, all Registry biosamples",
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: colors.ctcf,
    height: 100,
    url: "https://downloads.wenglab.org/CTCF_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
  } as BigWigConfig,
  {
    id: "default-atac",
    title: "Aggregated ATAC ChIP-seq signal, all Registry biosamples",
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: colors.atac,
    height: 100,
    url: "https://downloads.wenglab.org/ATAC_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
  } as BigWigConfig,
];
const humanTracks: Track[] = [
  {
    id: "default-gene",
    assembly: "GRCh38",
    displayMode: DisplayMode.Squish,
    trackType: TrackType.Transcript,
    title: "GENCODE genes",
    titleSize: 12,
    color: "#AAAAAA",
    version: 40,
    height: 35,
  } as TranscriptConfig,
  {
    id: "default-ccre",
    title: "All cCREs colored by group",
    titleSize: 12,
    trackType: TrackType.BigBed,
    displayMode: DisplayMode.Dense,
    color: colors.ccre,
    rowHeight: 12,
    height: 50,
    url: "https://downloads.wenglab.org/GRCh38-cCREs.DCC.bigBed",
  } as BigBedConfig,
  {
    id: "default-dnase",
    title: "Aggregated DNase-seq signal, all Registry biosamples",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: colors.dnase,
    height: 100,
    url: "https://downloads.wenglab.org/DNAse_All_ENCODE_MAR20_2024_merged.bw",
  } as BigWigConfig,
  {
    id: "default-h3k4me3",
    title: "Aggregated H3K4me3 ChIP-seq signal, all Registry biosamples",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: colors.h3k4me3,
    height: 100,
    url: "https://downloads.wenglab.org/H3K4me3_All_ENCODE_MAR20_2024_merged.bw",
  } as BigWigConfig,
  {
    id: "default-h3k27ac",
    title: "Aggregated H3K27ac ChIP-seq signal, all Registry biosamples",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: colors.h3k27ac,
    height: 100,
    url: "https://downloads.wenglab.org/H3K27ac_All_ENCODE_MAR20_2024_merged.bw",
  } as BigWigConfig,
  {
    id: "default-ctcf",
    title: "Aggregated CTCF ChIP-seq signal, all Registry biosamples",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: colors.ctcf,
    height: 100,
    url: "https://downloads.wenglab.org/CTCF_All_ENCODE_MAR20_2024_merged.bw",
  } as BigWigConfig,
  {
    id: "default-atac",
    title: "Aggregated ATAC ChIP-seq signal, all Registry biosamples",
    titleSize: 12,
    trackType: TrackType.BigWig,
    displayMode: DisplayMode.Full,
    color: colors.atac,
    height: 100,
    url: "https://downloads.wenglab.org/ATAC_All_ENCODE_MAR20_2024_merged.bw",
  } as BigWigConfig,
];

export default function BrowserView({
  coordinates,
  assembly,
  gene,
  biosample,
  cCREClick,
}: BrowserViewProps) {
  const initialTracks: Track[] =
    assembly === "GRCh38" ? humanTracks : mouseTracks;
  const initialState: InitialBrowserState = {
    domain: coordinates,
    marginWidth: 150,
    trackWidth: 1350,
    multiplier: 3,
  };
  const editTrack = useTrackStore((state) => state.editTrack);
  const addHighlight = useBrowserStore((state) => state.addHighlight);
  const removeHighlight = useBrowserStore((state) => state.removeHighlight);

  useEffect(() => {
    editTrack("default-ccre", {
      onHover: (item: Rect) => {
        addHighlight({
          color: item.color || "blue",
          domain: { start: item.start, end: item.end },
          id: "tmp-ccre",
        });
      },
      onLeave: () => {
        removeHighlight("tmp-ccre");
      },
      onClick: (item: Rect) => {
        addHighlight({
          color: item.color || "blue",
          domain: { start: item.start, end: item.end },
          id: item.name || "open-ccre",
        });
        cCREClick(item);
      },
      tooltip: (item: Rect) => {
        return (
          <div>
            <div>{item.name}</div>
          </div>
        );
      },
    });
    if (gene) {
      editTrack("default-gene", { geneName: gene });
    }
  }, [gene, biosample, cCREClick, editTrack]);

  return <Browser tracks={initialTracks} state={initialState} />;
}
