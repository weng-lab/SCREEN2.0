import {
  BigBedTrackProps,
  BigWigTrackProps,
  DefaultBigBed,
  DefaultBigWig,
  DefaultTranscript,
  DisplayMode,
  TranscriptHumanVersion,
  TranscriptMouseVersion,
  TranscriptTrackProps,
} from "@weng-lab/genomebrowser";
import { RegistryBiosample } from "../../_biosampleTables/types";

function randomID() {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

const colors = {
  ccre: "#D05F45",
  dnase: "#06da93",
  h3k4me3: "#ff0000",
  h3k27ac: "#ffcd00",
  ctcf: "#00b0d0",
  atac: "#02c7b9",
};

const titleSize = 16;
export function getDefaultTracks(coordinates: {
  assembly: "GRCh38" | "mm10";
  chromosome: string;
  start: number;
  end: number;
}) {
  const geneTrack = {
    ...DefaultTranscript,
    titleSize: titleSize,
    id: randomID(),
    title: "GENCODE genes",
    height: 100,
    color: "#AAAAAA",
    version:
      coordinates.assembly.toLowerCase() === "mm10"
        ? TranscriptMouseVersion.V25
        : TranscriptHumanVersion.V40,
    assembly: coordinates.assembly,
    queryType: "gene",
  } as TranscriptTrackProps;

  const defaultMouseTracks = [
    {
      ...DefaultBigBed,
      titleSize,
      id: "default-ccre",
      title: "All cCREs colored by group",
      displayMode: DisplayMode.DENSE,
      color: colors.ccre,
      rowHeight: 12,
      height: 50,
      url: "https://downloads.wenglab.org/mm10-cCREs.DCC.bigBed",
    } as BigBedTrackProps,
    {
      ...DefaultBigWig,
      titleSize,
      id: "default-dnase",
      title: "Aggregated DNase-seq signal, all Registry biosamples",
      color: colors.dnase,
      height: 100,
      url: "https://downloads.wenglab.org/DNase_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
    } as BigWigTrackProps,
    {
      ...DefaultBigWig,
      titleSize,
      id: "default-h3k4me3",
      title: "Aggregated H3K4me3 ChIP-seq signal, all Registry biosamples",
      color: colors.h3k4me3,
      height: 100,
      url: "https://downloads.wenglab.org/H3K4me3_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
    } as BigWigTrackProps,
    {
      ...DefaultBigWig,
      titleSize,
      id: "default-h3k27ac",
      title: "Aggregated H3K27ac ChIP-seq signal, all Registry biosamples",
      color: colors.h3k27ac,
      height: 100,
      url: "https://downloads.wenglab.org/H3K27ac_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
    } as BigWigTrackProps,
    {
      ...DefaultBigWig,
      titleSize,
      id: "default-ctcf",
      title: "Aggregated CTCF ChIP-seq signal, all Registry biosamples",
      color: colors.ctcf,
      height: 100,
      url: "https://downloads.wenglab.org/CTCF_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
    } as BigWigTrackProps,
    {
      ...DefaultBigWig,
      titleSize,
      id: "default-atac",
      title: "Aggregated ATAC ChIP-seq signal, all Registry biosamples",
      color: colors.atac,
      height: 100,
      url: "https://downloads.wenglab.org/ATAC_MM10_ENCODE_DEC2024_merged_nanrm.bigWig",
    } as BigWigTrackProps,
  ];

  const defaultHumanTracks = [
    {
      ...DefaultBigBed,
      titleSize,
      id: "default-ccre",
      title: "All cCREs colored by group",
      displayMode: DisplayMode.DENSE,
      color: colors.ccre,
      rowHeight: 12,
      height: 50,
      url: "https://downloads.wenglab.org/GRCh38-cCREs.DCC.bigBed",
    } as BigBedTrackProps,
    {
      ...DefaultBigWig,
      titleSize,
      id: "default-dnase",
      title: "Aggregated DNase-seq signal, all Registry biosamples",
      color: colors.dnase,
      height: 100,
      url: "https://downloads.wenglab.org/DNAse_All_ENCODE_MAR20_2024_merged.bw",
    } as BigWigTrackProps,
    {
      ...DefaultBigWig,
      titleSize,
      id: "default-h3k4me3",
      title: "Aggregated H3K4me3 ChIP-seq signal, all Registry biosamples",
      color: colors.h3k4me3,
      height: 100,
      url: "https://downloads.wenglab.org/H3K4me3_All_ENCODE_MAR20_2024_merged.bw",
    } as BigWigTrackProps,
    {
      ...DefaultBigWig,
      titleSize,
      id: "default-h3k27ac",
      title: "Aggregated H3K27ac ChIP-seq signal, all Registry biosamples",
      color: colors.h3k27ac,
      height: 100,
      url: "https://downloads.wenglab.org/H3K27ac_All_ENCODE_MAR20_2024_merged.bw",
    } as BigWigTrackProps,
    {
      ...DefaultBigWig,
      titleSize,
      id: "default-ctcf",
      title: "Aggregated CTCF ChIP-seq signal, all Registry biosamples",
      color: colors.ctcf,
      height: 100,
      url: "https://downloads.wenglab.org/CTCF_All_ENCODE_MAR20_2024_merged.bw",
    } as BigWigTrackProps,
    {
      ...DefaultBigWig,
      titleSize,
      id: "default-atac",
      title: "Aggregated ATAC ChIP-seq signal, all Registry biosamples",
      color: colors.atac,
      height: 100,
      url: "https://downloads.wenglab.org/ATAC_All_ENCODE_MAR20_2024_merged.bw",
    } as BigWigTrackProps,
  ];

  const tracks = [
    geneTrack,
    ...(coordinates.assembly.toLowerCase() === "mm10"
      ? defaultMouseTracks
      : defaultHumanTracks),
  ];
  return tracks;
}

export function genBiosampleTracks(
  biosample: RegistryBiosample,
  coordinates: {
    assembly: "GRCh38" | "mm10";
    chromosome: string;
    start: number;
    end: number;
  },
  data: any
) {
  const tracks = [];
  const humanBiosamples = data && data.human && data.human.biosamples;
  const mouseBiosamples = data && data.mouse && data.mouse.biosamples;

  const result =
    coordinates.assembly.toLowerCase() === "mm10"
      ? mouseBiosamples.find((m) => m.name === biosample.name)
      : humanBiosamples.find((m) => m.name === biosample.name);
  const r = [
    result.dnase_signal,
    result.h3k4me3_signal,
    result.h3k27ac_signal,
    result.ctcf_signal,
  ].filter((x) => !!x);

  const bigBedUrl = `https://downloads.wenglab.org/Registry-V4/${r.join(
    "_"
  )}.bigBed`;
  tracks.push({
    ...DefaultBigBed,
    titleSize,
    id: "sample-ccre-" + biosample.name,
    title: "All cCREs colored by group",
    displayMode: DisplayMode.DENSE,
    color: colors.ccre,
    rowHeight: 12,
    height: 50,
    url: bigBedUrl,
  } as BigBedTrackProps);
  if (result.dnase_signal)
    tracks.push({
      ...DefaultBigWig,
      titleSize,
      id: "sample-dnase-" + biosample.name,
      title: `DNase-seq signal in ${biosample.displayname}`,
      color: colors.dnase,
      height: 100,
      url: `https://www.encodeproject.org/files/${result.dnase_signal}/@@download/${result.dnase_signal}.bigWig`,
    } as BigWigTrackProps);
  if (result.h3k4me3_signal)
    tracks.push({
      ...DefaultBigWig,
      titleSize,
      id: "sample-h3k4me3-" + biosample.name,
      title: `H3K4me3 ChIP-seq signal in ${biosample.displayname}`,
      color: colors.h3k4me3,
      height: 100,
      url: `https://www.encodeproject.org/files/${result.h3k4me3_signal}/@@download/${result.h3k4me3_signal}.bigWig`,
    } as BigWigTrackProps);
  if (result.h3k27ac_signal)
    tracks.push({
      ...DefaultBigWig,
      titleSize,
      id: "sample-h3k27ac-" + biosample.name,
      title: `H3K27ac ChIP-seq signal in ${biosample.displayname}`,
      color: colors.h3k27ac,
      height: 100,
      url: `https://www.encodeproject.org/files/${result.h3k27ac_signal}/@@download/${result.h3k27ac_signal}.bigWig`,
    } as BigWigTrackProps);
  if (result.ctcf_signal)
    tracks.push({
      ...DefaultBigWig,
      titleSize,
      id: "sample-ctcf-" + biosample.name,
      title: `CTCF ChIP-seq signal in ${biosample.displayname}`,
      color: colors.ctcf,
      height: 100,
      url: `https://www.encodeproject.org/files/${result.ctcf_signal}/@@download/${result.ctcf_signal}.bigWig`,
    } as BigWigTrackProps);
  if (result.atac_signal)
    tracks.push({
      ...DefaultBigWig,
      titleSize,
      id: "sample-atac-" + biosample.name,
      title: `ATAC ChIP-seq signal in ${biosample.displayname}`,
      color: colors.atac,
      height: 100,
      url: `https://www.encodeproject.org/files/${result.atac_signal}/@@download/${result.atac_signal}.bigWig`,
    } as BigWigTrackProps);
  return tracks;
}
