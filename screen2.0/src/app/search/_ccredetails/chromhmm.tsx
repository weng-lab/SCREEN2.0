"use client";

import { BIG_QUERY } from "../_gbview/queries";
import React, {
  useMemo,
  useState,
  useRef,
  useCallback,
  useEffect,
} from "react";
import EGeneTracks from "../_gbview/egenetracks";
import { gql, useQuery } from "@apollo/client";
import { Tab, Tabs, CircularProgress, Box } from "@mui/material";
import CytobandView, { GenomicRange } from "../_gbview/cytobandview";
import { client } from "./client";
import Grid from "@mui/material/Grid2";
import { RulerTrack, GenomeBrowser } from "umms-gb";
import Controls from "../_gbview/controls";
import { HumanChromHmmTracks, stateDetails } from "./humanchromhmmtracks";
import { tissueColors } from "../../../common/lib/colors";
import { BigQueryResponse } from "../_gbview/types";
import { BigBedData } from "bigwig-reader";
import { styled } from "@mui/material/styles";
import { DataTable } from "psychscreen-legacy-components";
import config from "../../../config.json";

const StyledTab = styled(Tab)(() => ({
  textTransform: "none",
}));

const GENE_QUERY = gql`
  query s_3($chromosome: String, $start: Int, $end: Int, $assembly: String!) {
    gene(
      chromosome: $chromosome
      start: $start
      end: $end
      assembly: $assembly
    ) {
      name
      strand
      transcripts {
        name
        strand
        exons {
          coordinates {
            chromosome
            start
            end
          }
        }
        coordinates {
          chromosome
          start
          end
        }
      }
    }
  }
`;

export type Transcript = {
  id: string;
  name: string;
  strand: string;
  coordinates: GenomicRange;
};
export type SNPQueryResponse = {
  gene: {
    name: string;
    strand: string;
    transcripts: Transcript[];
  }[];
};
export function expandCoordinates(coordinates, l = 20000) {
  return {
    chromosome: coordinates.chromosome,
    start: coordinates.start - l < 0 ? 0 : coordinates.start - l,
    end: coordinates.end + l,
  };
}

export const ChromHMM = (props: { coordinates; assembly; accession }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const expandedCoordinates = useMemo(
    () => expandCoordinates(props.coordinates),
    [props.coordinates]
  );
  const [coordinates, setCoordinates] =
    useState<GenomicRange>(expandedCoordinates);

  const [page, setPage] = useState(0);
  const [chromhmm, seChromHmm] = useState(null);

  useEffect(() => {
    fetch(config.ChromHMM.HumanChromHMM)
      .then((x) => x.text())
      .then((x) => {
        const lines = x.split("\n");
        let ch = {};
        lines.forEach((e) => {
          let val = e.split("\t");
          if (val[2]) {
            if (ch[val[2]]) {
              let e = ch[val[2]];
              e.push([
                val[0],
                val[3],
                `https://downloads.wenglab.org/ChIP_${val[1]}.bigBed`,
              ]);

              ch[val[2]] = e;
            } else {
              ch[val[2]] = [
                [
                  val[0],
                  val[3],
                  `https://downloads.wenglab.org/ChIP_${val[1]}.bigBed`,
                ],
              ];
            }
          }
        });
        seChromHmm(ch);
      });
  }, []);

  const snpResponse = useQuery<SNPQueryResponse>(GENE_QUERY, {
    variables: { ...coordinates, assembly: props.assembly },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  });
  const groupedTranscripts = useMemo(
    () =>
      snpResponse.data?.gene.map((x) => ({
        ...x,
        transcripts: x.transcripts.map((xx) => ({
          ...xx,
          color: "#aaaaaa",
        })),
      })),
    [snpResponse]
  );
  const chromhmmtrackswithtissue = useMemo(
    () =>
      chromhmm &&
      Object.keys(chromhmm)
        .map((k) => {
          return chromhmm[k].map((c) => {
            return { tissue: k, url: c[2], biosample: c[1] };
          });
        })
        .flat(),
    [chromhmm]
  );

  const { data, loading } = useQuery<BigQueryResponse>(BIG_QUERY, {
    variables: {
      bigRequests:
        chromhmm &&
        Object.keys(chromhmm)
          .map((k) => {
            return chromhmm[k].map((c) => {
              return {
                chr1: props.coordinates.chromosome!,
                start: props.coordinates.start,
                end: props.coordinates.end,
                preRenderedWidth: 1400,
                url: c[2],
              };
            });
          })
          .flat(),
    },
    skip: !chromhmm,
    client,
  });

  const handlePageChange = (_, newValue: number) => {
    setPage(newValue);
  };

  const chromhmmdata =
    data &&
    !loading &&
    data.bigRequests.map((b, i) => {
      let f = b.data[0] as BigBedData;
      return {
        start: f.start,
        end: f.end,
        name:
          stateDetails[f.name].description +
          " (" +
          stateDetails[f.name].stateno +
          ")",
        chr: f.chr,
        color: f.color,
        tissue: chromhmmtrackswithtissue[i].tissue,
        biosample: chromhmmtrackswithtissue[i].biosample,
      };
    });
  const onDomainChanged = useCallback(
    (d: GenomicRange) => {
      const chr =
        d.chromosome === undefined
          ? props.coordinates.chromosome
          : d.chromosome;
      const start = Math.round(d.start);
      const end = Math.round(d.end);
      if (end - start > 10) {
        setCoordinates({ chromosome: chr, start, end });
      }
    },
    [props.coordinates]
  );
  const l = useCallback(
    (c) =>
      ((c - coordinates.start) * 1400) / (coordinates.end - coordinates.start),
    [coordinates]
  );

  return (
    <Grid container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
      <Tabs value={page} onChange={handlePageChange}>
        <StyledTab value={0} label="Genome Browser View" />
        <StyledTab value={1} label="Table View" />
      </Tabs>
      {page == 0 && (
        <Grid
          size={{
            xs: 12,
            lg: 12,
          }}
        >
          <br />
          <CytobandView
            innerWidth={1000}
            height={15}
            chromosome={coordinates.chromosome!}
            assembly={props.assembly !== "mm10" ? "hg38" : "mm10"}
            position={coordinates}
          />
          <br />
          <div style={{ textAlign: "center" }}>
            <Controls
              onDomainChanged={onDomainChanged}
              domain={coordinates || props.coordinates}
            />
          </div>
          <br />
          <br />
          <svg width="100%" viewBox="0 0 1400 60">
            {Object.keys(stateDetails).map((s, i) => (
              <g
                transform={`translate(${250 + 75 * (i % 9)},${
                  i >= 9 ? 30 : 0
                })`}
                key={s}
              >
                <rect
                  y={5}
                  height={15}
                  width={15}
                  fill={stateDetails[s].color}
                />
                <text
                  x={20}
                  y={17}
                  fontSize="12px"
                  color={stateDetails[s].color}
                >
                  {s}
                </text>
              </g>
            ))}
          </svg>
          <br />
          <GenomeBrowser
            svgRef={svgRef}
            domain={coordinates}
            innerWidth={1400}
            width="100%"
            noMargin
            onDomainChanged={(x) => {
              if (Math.ceil(x.end) - Math.floor(x.start) > 10) {
                setCoordinates({
                  chromosome: coordinates.chromosome,
                  start: Math.floor(x.start),
                  end: Math.ceil(x.end),
                });
              }
            }}
          >
            <RulerTrack domain={coordinates} height={30} width={1400} />
            <>
              {props.accession && chromhmm && (
                <rect
                  key={props.accession}
                  fill="#FAA4A4"
                  fillOpacity={0.8}
                  height={3500}
                  x={l(props.coordinates.start)}
                  width={l(props.coordinates.end) - l(props.coordinates.start)}
                />
              )}
            </>
            <EGeneTracks
              genes={groupedTranscripts || []}
              expandedCoordinates={coordinates}
              squish={true}
              hideshortlabel={true}
            />
            {chromhmm &&
              Object.keys(chromhmm).map((k) => {
                return (
                  <HumanChromHmmTracks
                    key={k}
                    assembly={props.assembly}
                    domain={coordinates}
                    tracks={chromhmm[k]}
                    tissue={k}
                    color={tissueColors[k] ?? tissueColors.missing}
                  />
                );
              })}
          </GenomeBrowser>
        </Grid>
      )}
      {loading && (
        <Box
          display="flex"
          height="100%"
          width="100%"
          justifyContent="center"
          alignItems="center"
        >
          {" "}
          <CircularProgress></CircularProgress>{" "}
        </Box>
      )}
      {page == 1 && chromhmmdata && (
        <Grid
          size={{
            xs: 12,
            lg: 12,
          }}
        >
          <DataTable
            tableTitle={`ChromHMM states`}
            columns={[
              {
                header: "Tissue",
                HeaderRender: () => <b>Tissue</b>,
                value: (row) => row.tissue,
              },
              {
                header: "Biosample",
                HeaderRender: () => <b>Biosample</b>,
                value: (row) => row.biosample,
              },
              {
                header: "State",
                HeaderRender: () => <b>States</b>,
                value: (row) => <b style={{ color: row.color }}>{row.name}</b>,
              },
              {
                header: "Chromosome",
                HeaderRender: () => <b>Chromosome</b>,
                value: (row) => row.chr,
              },
              {
                header: "Start",
                HeaderRender: () => <b>Start</b>,
                value: (row) => row.start,
              },
              {
                header: "End",
                HeaderRender: () => <b>End</b>,
                value: (row) => row.end,
              },
            ]}
            rows={chromhmmdata || []}
            sortColumn={0}
            sortDescending
            itemsPerPage={10}
          />
        </Grid>
      )}
    </Grid>
  );
};
