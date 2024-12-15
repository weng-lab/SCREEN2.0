import { BigBedTrackProps, BigWigTrackProps, DefaultBigBed, DefaultBigWig, DefaultTranscript, DisplayMode, TranscriptHumanVersion, TranscriptTrackProps } from "@weng-lab/genomebrowser"

function randomID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function defaultTracks(coordinates: { assembly: "GRCh38" | "mm10", chromosome: string, start: number, end: number }) {
    const titleSize = 24
    const geneTrack = {
        ...DefaultTranscript,
        titleSize: 24,
        id: randomID(),
        title: "GENCODE genes",
        height: 100,
        color: "#AAAAAA",
        version: TranscriptHumanVersion.V47,
        assembly: coordinates.assembly,
        queryType: "gene",
    } as TranscriptTrackProps

    const defaultMouseTracks = [
        { ...DefaultBigWig, titleSize, id: randomID(), title: "All cCREs colored by group", height: 100, url: "https://downloads.wenglab.org/mm10-cCREs.DCC.bigBed" } as BigWigTrackProps,
        { ...DefaultBigWig, titleSize, id: randomID(), title: "Aggregated DNase-seq signal, all Registry biosamples", height: 100, url: "gs://gcp.wenglab.org/dnase.mm10.sum.bigWig" } as BigWigTrackProps,
    ]

    const defaultHumanTracks = [
        { ...DefaultBigBed, titleSize, id: randomID(), title: "All cCREs colored by group", displayMode: DisplayMode.DENSE, color: "#9378BC", rowHeight: 12, height: 100, url: "https://downloads.wenglab.org/GRCh38-cCREs.DCC.bigBed" } as BigBedTrackProps,
        { ...DefaultBigWig, titleSize, id: randomID(), title: "Aggregated DNase-seq signal, all Registry biosamples", color: "#06da93", height: 100, url: "https://downloads.wenglab.org/DNAse_All_ENCODE_MAR20_2024_merged.bw" } as BigWigTrackProps,
        { ...DefaultBigWig, titleSize, id: randomID(), title: "Aggregated H3K4me3 ChIP-seq signal, all Registry biosamples", color: "#ff0000", height: 100, url: "https://downloads.wenglab.org/H3K4me3_All_ENCODE_MAR20_2024_merged.bw" } as BigWigTrackProps,
        { ...DefaultBigWig, titleSize, id: randomID(), title: "Aggregated H3K27ac ChIP-seq signal, all Registry biosamples", color: "#ffcd00", height: 100, url: "https://downloads.wenglab.org/H3K27ac_All_ENCODE_MAR20_2024_merged.bw" } as BigWigTrackProps,
        { ...DefaultBigWig, titleSize, id: randomID(), title: "Aggregated CTCF ChIP-seq signal, all Registry biosamples", color: "#00b0d0", height: 100, url: "https://downloads.wenglab.org/CTCF_All_ENCODE_MAR20_2024_merged.bw" } as BigWigTrackProps,
    ]

    const tracks = [geneTrack, ...(coordinates.assembly.toLowerCase() === "mm10" ? defaultMouseTracks : defaultHumanTracks)]
    return tracks
}