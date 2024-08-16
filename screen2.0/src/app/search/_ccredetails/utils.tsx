"use client"
import React, { useState } from "react"
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent
} from "@mui/material"
import { Point2D, Range2D, linearTransform2D } from "jubilant-carnival"
import { Fragment } from "react"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { GeneExpEntry } from "../../applets/gene-expression/types"
import { tissueColors } from "../../../common/lib/colors"
import { RampagePeak } from "./rampage"
import { Stack } from "@mui/material"
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
/**
 * Plots associated RAMPAGE signals
 * @param {RampagePeak[]} data signals to plot
 * @param {Range2D} range size of plot dimensions
 * @param {Range2D} dimensions size of window to plot on
 * @returns plot of RAMPAGE signals
 */
export function PlotActivityProfiles(props: {
  data: RampagePeak[]
  range: Range2D
  dimensions: Range2D
  peakID: string
  sort: "byValue" | "byTissueMax" | "byTissue"
}) {
  let tissues: { [id: string]: { sum: number; values: GeneExpEntry[] } } = {} // dict of ftissues
  let byValueTissues: { [id: string]: { sum: number; values: GeneExpEntry[] } } = {} // dict of ftissues
  let byTissueMaxTissues: { [id: string]: { sum: number; values: GeneExpEntry[] } } = {} // dict of ftissues
  
  let p1: Point2D = { x: 0, y: 0 }
  let max: number = 0

  
  Object.values(props.data).map((biosample) => {
    if (biosample["value"] === 0) return
    else if (biosample["peakId"] === props.peakID) {
      if (!tissues[biosample["tissue"]]) tissues[biosample["tissue"]] = { sum: 0, values: [] }
      tissues[biosample["tissue"]].sum += biosample["value"]
      tissues[biosample["tissue"]].values.push({
        value: biosample["value"],
        biosample_term: biosample["name"].replace("Homo sapiens ",""),
        expID: biosample["expAccession"],
        tissue: biosample["tissue"],
        strand: biosample["strand"],
        color: tissueColors[biosample["tissue"]] ?? tissueColors.missing,
      })
      tissues[biosample["tissue"]].values.sort((a,b)=>b.value-a.value);
      if (props.sort === "byTissueMax" && tissues[biosample["tissue"]].sum > max) max = tissues[biosample["tissue"]].sum
      else if (biosample["value"] > max) max = biosample["value"]
    }
  })



  props.range.x.end = max

  // returns bar plot for a tissue
  const plotGeneExp = (entry,y) => {    
    let info = entry[1]
    let l =  Object.values(info.values)
    return l.map((item: {biosample_term: string, value: number, expID: string, strand: string, color: string}, i: number) => {
      
      p1 = linearTransform2D(props.range, props.dimensions)({ x: Number(item.value.toFixed(2)), y: 0 })

      const bioampleName = item.biosample_term.length > 35 ? item.biosample_term.slice(0,35) + "..." : item.biosample_term
      return (
        <g key={i}>
          <g>
            <title>
              {item.value.toFixed(2) + "\n" + item.biosample_term + " (" + item.strand + ")" + "\n" + "Clicking opens this experiment in a new tab"}
            </title>
            <a href={"https://www.encodeproject.org/experiments/" + item.expID} target="_blank" rel="noopener noreferrer">
              <rect
                x={165}
                y={y + i * 20}
                width={p1.x}
                height={18}
                fill={item.color}
              >
              </rect>
              <text x={p1.x + 0 + 170} y={y + i * 20 + 12.5} style={{ fontSize: 12 }}>
                {item.value.toFixed(2) + ", "}
                {" " + bioampleName}
                {" (" + item.expID + ")"}
                {" (" + item.strand + ")"}
              </text>
            </a>
          </g>
          {(props.sort === 'byValue' || props.sort === 'byTissueMax') &&
            <text
              textAnchor="end"
              x={160}
              y={y + (i * 20 + 15)}
            >
              {entry[0].split("-")[0]}
            </text>
          }
          {props.sort === 'byTissue' && i === Math.floor(Object.values(info.values).length / 2) &&
            <text
              textAnchor="end"
              x={160}
              // If the tissue has an even number of values, bump up a little
              y={y + (i * 20 + 15) - (((Object.values(info.values).length % 2) !== 0) ? 0 : 12)}
            >
              {entry[0].split("-")[0]}
            </text>
          }
          <line x1={165} x2={165} y1={y + i * 20} y2={y + (i * 20 + 18)} stroke="black" />
        </g>
      )
    })
  }


  let byValuesTissues = Object.entries(tissues).map((entry) =>{
    let info = entry[1]
    return info.values.map(r=>{
      return {
        ...r,
        tissue: entry[0]
      }
    })
  }).flat()
  let byValTissues = (byValuesTissues.sort((a,b) => b.value - a.value))
  
  byValTissues.forEach((b,i)=>{
    byValueTissues[b.tissue+"-b"+i] = { sum: b.value, values: [b] }
  })
  
  Object.keys(tissues).forEach((k)=>{
    byTissueMaxTissues[k] = {
      sum: tissues[k].values[0].value,
      values : [tissues[k].values[0]]
    }
  })
  const tissueValues = props.sort === "byValue" ? byValueTissues : props.sort === "byTissueMax" ? byTissueMaxTissues : tissues;
  return (
    Object.keys(tissueValues).length === 0 ?
      <span>{'No Data Available'}</span>
      :
      <Stack>
        {Object.entries(tissueValues).map((entry, index: number) => {
          let info = entry[1]
          let view: string = "0 0 1200 " + (info.values.length * 20 + 10)
          return (
            <svg className="graph" aria-labelledby="title desc" role="img" viewBox={view} key={index}>
              <g className="data" data-setname="gene expression plot">
                {/* Why 5? */}
                {plotGeneExp(entry, 5)}
              </g>
            </svg>
          )
        })}
      </Stack>
  )
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
  ["ylowdnase","Low DNase:#8c8c8c"],
  ["zunclassified","zunclassified:#8c8c8c"]  
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
 * @returns distance to nearest TSS from any point in inputted region. 
 */
export function calcDistToTSS(region: GenomicRegion, transcripts: { id: string, coordinates: Coordinates }[], strand: '+' | '-'): number {
  const distances: number [] = transcripts.map((transcript) => calcDistRegionToPosition(
    region.start,
    region.end,
    "closest",
    strand === "+" ? transcript.coordinates.start : transcript.coordinates.end
  ))
  return Math.min(...distances)
}

/**
 * 
 * @param start Start of Region
 * @param end End of Region
 * @param anchor The anchor of region to be used: start, end, middle, or closest (finds minimum of all anchors)
 * @param point Point to Find Distance to
 * @returns The distance from the anchor specified to the position
 */
export function calcDistRegionToPosition(start: number, end: number, anchor: 'closest' | 'start' | 'end' | 'middle', point: number ): number {
  const distToStart = Math.abs(start - point)
  const distToEnd = Math.abs(end - point)
  const distToMiddle = Math.abs(((start + end) / 2) - point)

  if (start <= point && point <= end) {
    return 0
  }

  switch(anchor) {
    case ('start'): return distToStart
    case ('end'): return distToEnd
    case ('middle'): return distToMiddle
    case ('closest'): return Math.min(distToStart, distToEnd, distToMiddle)
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