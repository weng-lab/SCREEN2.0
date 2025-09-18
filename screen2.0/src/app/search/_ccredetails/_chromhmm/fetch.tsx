import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useLazyQuery } from "@apollo/client";
import { BigQueryResponse } from "../../_gbview/types";
import { BIG_QUERY } from "../../_gbview/queries";
import { ChromTrack, stateDetails } from "./chromhmm";
import { BigBedData } from "bigwig-reader";
import config from "../../../../config.json";

// Shared state for tracks data to avoid duplicate fetches
let sharedTracksCache = null;
let sharedTracksPromise = null;

// Utility to get tracks with shared caching
async function getTracksShared() {
  // Return cached data if available
  if (sharedTracksCache) {
    return sharedTracksCache;
  }

  // Return existing promise if already fetching
  if (sharedTracksPromise) {
    return sharedTracksPromise;
  }

  // Create new promise and cache it
  sharedTracksPromise = getTracks().then((data) => {
    sharedTracksCache = data;
    return data;
  });

  return sharedTracksPromise;
}

// Utility to process tracks into flat structure - ensures consistent ordering
function processTracksToFlat(tracksData) {
  return Object.keys(tracksData)
    .sort() // Ensure consistent tissue ordering
    .map((tissue) => {
      return tracksData[tissue]
        .sort((a, b) => a.url.localeCompare(b.url)) // Ensure consistent track ordering
        .map((track) => ({
          tissue: tissue,
          url: track.url,
          biosample: track.displayName,
        }));
    })
    .flat();
}

// Hook for browser view - uses shared tracks
export function useChromHMMTracks() {
  const [tracks, setTracks] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        const tracksData = await getTracksShared();
        setTracks(tracksData);
      } catch (error) {
        console.error("Error fetching ChromHMM tracks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  return { tracks, loading };
}

// Hook for table view - uses shared tracks data
export function useChromHMMTableData(coordinates) {
  const [chromhmmtrackswithtissue, setChromhmmtrackswithtissue] =
    useState(null);
  const [tracksLoading, setTracksLoading] = useState(true);

  useEffect(() => {
    const fetchAndProcessTracks = async () => {
      try {
        setTracksLoading(true);
        
        // Use shared tracks data
        const tracksData = await getTracksShared();

        // Process tracks into flat structure for BigQuery
        const flatTracks = processTracksToFlat(tracksData);

        setChromhmmtrackswithtissue(flatTracks);
      } catch (error) {
        console.error("Error fetching ChromHMM tracks for table:", error);
      } finally {
        setTracksLoading(false);
      }
    };

    fetchAndProcessTracks();
  }, []);

  // BigQuery for the table data - use cache-first policy to leverage prefetched data
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
      fetchPolicy: "cache-first", // Use cached data if available from prefetch
      nextFetchPolicy: "cache-first",
    });

  // Process the data for the table view
  const processedTableData = useMemo(() => {
    if (!bigQueryData || !chromhmmtrackswithtissue || bigQueryLoading)
      return null;

    return bigQueryData.bigRequests.map((b, i) => {
      const f = b.data[0] as BigBedData;
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
    processedTableData,
    loading: tracksLoading || bigQueryLoading,
  };
}

// Hook to prefetch ChromHMM BigQuery data in the background
export function useChromHMMPrefetch() {
  const [prefetchQuery, { data: prefetchedData, loading: prefetchLoading }] = useLazyQuery<BigQueryResponse>(BIG_QUERY);

  const prefetchChromHMMData = useCallback(async (coordinates) => {
    try {
      // Use shared tracks data - same as table hook
      const tracksData = await getTracksShared();
      
      // Use same processing function to ensure identical cache keys
      const flatTracks = processTracksToFlat(tracksData);

      // Create the exact same bigRequests structure as table hook
      const bigRequests = flatTracks.map((track) => ({
        chr1: coordinates.chromosome!,
        start: coordinates.start,
        end: coordinates.end,
        preRenderedWidth: 1400,
        url: track.url,
      }));

      // Prefetch the BigQuery data
      await prefetchQuery({
        variables: { bigRequests },
      });
    } catch (error) {
      console.error("Error prefetching ChromHMM data:", error);
    }
  }, [prefetchQuery]);

  return { prefetchChromHMMData, prefetchedData, prefetchLoading };
}

// Legacy hook - kept for backwards compatibility if needed
export function useChromHMMData(coordinates) {
  const { tracks, loading: tracksLoading } = useChromHMMTracks();
  const { processedTableData, loading: tableLoading } = useChromHMMTableData(coordinates);
  
  return {
    tracks,
    processedTableData,
    loading: tracksLoading || tableLoading,
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
