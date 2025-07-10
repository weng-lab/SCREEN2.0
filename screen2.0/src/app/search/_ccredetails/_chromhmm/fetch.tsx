import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@apollo/client";
import { BigQueryResponse } from "../../_gbview/types";
import { BIG_QUERY } from "../../_gbview/queries";
import { ChromTrack, stateDetails } from "./chromhmm";
import { BigBedData } from "bigwig-reader";
import config from "../../../../config.json";

export function useChromHMMData(coordinates) {
  const [tracks, setTracks] = useState(null);
  const [chromhmmtrackswithtissue, setChromhmmtrackswithtissue] =
    useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessData = async () => {
      try {
        setLoading(true);

        // Fetch tracks
        const tracksData = await getTracks();
        setTracks(tracksData);

        // Process tracks into flat structure
        const flatTracks = Object.keys(tracksData)
          .map((tissue) => {
            return tracksData[tissue].map((track) => ({
              tissue: tissue,
              url: track.url,
              biosample: track.sample,
            }));
          })
          .flat();

        setChromhmmtrackswithtissue(flatTracks);
      } catch (error) {
        console.error("Error fetching ChromHMM data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAndProcessData();
  }, []);

  // BigQuery for the table data
  const { data: bigQueryData, loading: bigQueryLoading } =
    useQuery<BigQueryResponse>(BIG_QUERY, {
      variables: {
        bigRequests:
          chromhmmtrackswithtissue?.map((track) => ({
            chr1: coordinates.chromosome!,
            start: coordinates.start,
            end: coordinates.end,
            preRenderedWidth: 1400,
            url: track.url,
          })) || [],
      },
      skip: !chromhmmtrackswithtissue,
    });

  // Process the data for the table view
  const processedTableData = useMemo(() => {
    if (!bigQueryData || !chromhmmtrackswithtissue || bigQueryLoading)
      return null;

    return bigQueryData.bigRequests.map((b, i) => {
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
  }, [bigQueryData, chromhmmtrackswithtissue, bigQueryLoading]);

  return {
    tracks,
    processedTableData,
    loading: loading || bigQueryLoading,
  };
}

async function getTracks() {
  const response = await fetch(config.ChromHMM.HumanChromHMM);
  const text = await response.text();

  const chromHMMData: Record<string, ChromTrack[]> = {};
  text.split("\n").forEach((line) => {
    const [sample, fileId, tissue, displayName] = line.split("\t");

    if (!tissue) return;

    const trackData: ChromTrack = {
      sample,
      displayName,
      url: `https://downloads.wenglab.org/ChIP_${fileId}.bigBed`,
    };

    if (chromHMMData[tissue]) {
      chromHMMData[tissue].push(trackData);
    } else {
      chromHMMData[tissue] = [trackData];
    }
  });

  return chromHMMData;
}
