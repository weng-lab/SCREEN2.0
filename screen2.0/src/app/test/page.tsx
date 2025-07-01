"use client";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

import {
  Browser,
  DisplayMode,
  Track,
  TrackType,
  Transcript,
  Vibrant,
  useBrowserStore,
  InitialBrowserState,
} from "track-logic";

const client = new ApolloClient({
  uri: "https://ga.staging.wenglab.org/graphql",
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export default function TestPage() {
  const addHighlight = useBrowserStore((state) => state.addHighlight);
  const removeHighlight = useBrowserStore((state) => state.removeHighlight);

  const tracks: Track[] = [
    {
      id: "1",
      title: "bigWig",
      titleSize: 12,
      height: 100,
      color: Vibrant[6],
      trackType: TrackType.BigWig,
      displayMode: DisplayMode.Full,
      url: "https://downloads.wenglab.org/DNAse_All_ENCODE_MAR20_2024_merged.bw",
    },
    {
      id: "2",
      title: "bigBed",
      titleSize: 12,
      height: 20,
      color: Vibrant[7],
      trackType: TrackType.BigBed,
      displayMode: DisplayMode.Dense,
      url: "https://downloads.wenglab.org/GRCh38-cCREs.DCC.bigBed",
      onClick: (rect) => {
        const id = (rect.name || "ihqoviun") + "-clicked";
        addHighlight({
          id,
          domain: { start: rect.start, end: rect.end },
          color: rect.color || "blue",
        });
      },
      onHover: (rect) => {
        addHighlight({
          id: rect.name || "ihqoviun",
          domain: { start: rect.start, end: rect.end },
          color: rect.color || "blue",
        });
      },
      onLeave: (rect) => {
        removeHighlight(rect.name || "ihqoviun");
      },
    },
    {
      id: "3",
      title: "genes",
      titleSize: 12,
      height: 50,
      color: Vibrant[8],
      trackType: TrackType.Transcript,
      assembly: "GRCh38",
      version: 47,
      displayMode: DisplayMode.Squish,
      onHover: (item: Transcript) => {
        addHighlight({
          id: item.name || "dsadsfd",
          domain: { start: item.coordinates.start, end: item.coordinates.end },
          color: item.color || "blue",
        });
      },
      onLeave: (item: Transcript) => {
        removeHighlight(item.name || "dsadsfd");
      },
    },
    {
      id: "4",
      title: "motif",
      titleSize: 12,
      height: 100,
      color: Vibrant[1],
      peakColor: Vibrant[3],
      trackType: TrackType.Motif,
      displayMode: DisplayMode.Squish,
      assembly: "GRCh38",
      consensusRegex: "gcca[cg][ct]ag[ag]gggcgc",
      peaksAccession: "ENCFF992CTF",
      onHover: (rect) => {
        console.log(rect);
      },
      onLeave: (rect) => {
        console.log(rect);
      },
    },
  ];

  const initialState: InitialBrowserState = {
    domain: { chromosome: "chr6", start: 21592768, end: 21598619 },
    marginWidth: 150,
    trackWidth: 1350,
    multiplier: 3,
    highlights: [
      {
        id: "1",
        color: "#ffaabb",
        domain: { chromosome: "chr18", start: 35496000, end: 35502000 },
      },
      {
        id: "2",
        color: "#aaffbb",
        domain: { chromosome: "chr18", start: 35494852, end: 35514000 },
      },
    ],
  };

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <ApolloProvider client={client}>
        <div style={{ width: "90%" }}>
          <Browser state={initialState} tracks={tracks} />
        </div>
      </ApolloProvider>
    </div>
  );
}
