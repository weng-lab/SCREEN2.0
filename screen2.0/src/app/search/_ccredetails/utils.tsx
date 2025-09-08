"use client"
import { GenomicRegion } from "../types"

export const stringToColour = (str: string) => {
  let hash = 0;
  str.split('').forEach(char => {
    hash = char.charCodeAt(0) + ((hash << 5) - hash)
  })
  let colour = '#'
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff
    colour += value.toString(16).padStart(2, '0')
  }
  return colour
}

export const z_score = (d) => (d === -11.0 || d === "--" || d === undefined || d === 0 ? "NA" : d ? d.toFixed(2): 0)
export const z_score_render = (d) => (d === -11.0 || d === "--" || d === undefined || d === "NA" || d === 0 ? "--" : d ? d.toFixed(2): 0)

export const GROUP_COLOR_MAP: Map<string, string> = new Map([
  ["CA-CTCF", "Chromatin Accessible with CTCF:#00B0F0"],
  ["CA-TF", "Chromatin Accessible with TF:#be28e5"],
  ["CA-H3K4me3", "Chromatin Accessible with H3K4me3:#ffaaaa"],
  ["TF", "TF:#d876ec"],
  ["CA", "Chromatin Accessible Only:#06DA93"],
  ["pELS","Proximal Enhancer:#FFA700"],
  ["dELS","Distal Enhancer:#FFCD00"],
  ["PLS","Promoter:#ff0000"],    
  ["noclass","Unclassified:#8c8c8c"],
  ["InActive","Inactive:#e1e1e1"]  
])

type Coordinates = {
  chromosome: string
  start: number
  end: number
}

/**
 *
 * @param region {chrom, start, end}
 * @param transcripts
 * @returns distance to nearest TSS from the center of cCRE body.
 */
export function calcDistCcreToTSS(
  region: Coordinates,
  transcripts: { id: string; coordinates: Coordinates }[],
  strand: "+" | "-"
): number {
  const distances: number[] = transcripts.map((transcript) =>
    calcDistRegionToPosition(
      region.start,
      region.end,
      "middle",
      strand === "+" ? transcript.coordinates.start : transcript.coordinates.end
    )
  );
  return Math.min(...distances);
}

export function ccreOverlapsTSS(
  region: Coordinates,
  transcripts: { id: string; coordinates: Coordinates }[],
  strand: "+" | "-"
): boolean {
  const distances: number[] = transcripts.map((transcript) => {
    const tss = strand === "+" ? transcript.coordinates.start : transcript.coordinates.end
    return calcDistRegionToRegion(region, {start: tss, end: tss})
  })
  
  return distances.includes(0);
}

/**
 *
 * @param start Start of Region
 * @param end End of Region
 * @param anchor The anchor of region to be used: start, end, middle, or closest (finds minimum of all anchors)
 * @param point Point to Find Distance to
 * @returns The distance from the anchor specified to the position
 */
export function calcDistRegionToPosition(
  start: number,
  end: number,
  anchor: "closest" | "start" | "end" | "middle",
  point: number
): number {
  const distToStart = Math.abs(start - point);
  const distToEnd = Math.abs(end - point);
  const distToMiddle = Math.abs(Math.floor((start + end) / 2) - point);

  if (start <= point && point <= end) {
    return 0;
  }

  switch (anchor) {
    case "start":
      return distToStart;
    case "end":
      return distToEnd;
    case "middle":
      return distToMiddle;
    case "closest":
      return Math.min(distToStart, distToEnd, distToMiddle);
  }
}

/**
 * 
 * @param coord1 
 * @param coord2 
 * @returns the smallest distance from any point in either region
 */
export function calcDistRegionToRegion(coord1: { start: number, end: number }, coord2: { start: number, end: number }): number {
  if (coord1.end < coord2.start) {
    return coord2.start - coord1.end;
  } else if (coord2.end < coord1.start) {
    return coord1.start - coord2.end;
  } else {
    return 0;
  }
}

export function capitalizeWords(input: string): string {
  return input.replace(/\b\w/g, char => char.toUpperCase());
}

export function truncateWithEllipsis(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.slice(0, maxLength - 3) + "...";
}