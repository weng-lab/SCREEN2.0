"use client"
import React, { useState } from "react"
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material"
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
  Switch,
  Typography,
} from "@mui/material"
import { Point2D, Range2D, linearTransform2D } from "jubilant-carnival"
import { Fragment } from "react"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { GeneExpEntry } from "../../applets/gene-expression/types"
import { tissueColors } from "../../../common/lib/colors"
import { RampagePeak } from "./rampage"

const stringToColour = (str: string) => {
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
}) {
  const [sort, setSort] = useState<string>("byValue")
  const [zeros, setZeros] = useState<boolean>(false)
  const [collapse, setCollapse] = useState<{ [id: string]: boolean }>({})

  let tissues: { [id: string]: { sum: number; values: GeneExpEntry[] } } = {} // dict of ftissues
  let byValueTissues: { [id: string]: { sum: number; values: GeneExpEntry[] } } = {} // dict of ftissues
  let byTissueMaxTissues: { [id: string]: { sum: number; values: GeneExpEntry[] } } = {} // dict of ftissues
  let p1: Point2D = { x: 0, y: 0 }
  let max: number = 0

  Object.values(props.data).map((biosample) => {
    if (!zeros && biosample["value"] === 0) return
    else if (biosample["peakId"] === props.peakID) {
      if (!tissues[biosample["tissue"]]) tissues[biosample["tissue"]] = { sum: 0, values: [] }
      tissues[biosample["tissue"]].sum += biosample["value"]
      tissues[biosample["tissue"]].values.push({
        value: biosample["value"],
        biosample_term: biosample["name"].replace("Homo sapiens",""),
        expID: biosample["expAccession"],
        tissue: biosample["tissue"],
        strand: biosample["strand"],
        color: tissueColors[biosample["tissue"]] ? tissueColors[biosample["tissue"]] : stringToColour(biosample["tissue"]),
      })
      tissues[biosample["tissue"]].values.sort((a,b)=>b.value-a.value);
      if (sort === "byTissueMax" && tissues[biosample["tissue"]].sum > max) max = tissues[biosample["tissue"]].sum
      else if (biosample["value"] > max) max = biosample["value"]
    }
  })



  props.range.x.end = max

  // returns bar plot for a tissue
  const plotGeneExp = (entry,y) => {    
    let info = entry[1]
    let l =  Object.values(info.values)
    return l.map((item: {biosample_term: string, value: number, expID: string, strand: string, color: string}, i: number) => {
      
      p1 = linearTransform2D(props.range, props.dimensions)({ x: item.value, y: 0 })
      return (
        <Fragment key={i}>
          <rect
            x={90}
            width={p1.x + 90}
            y={y + i * 20}
            height={18}
            fill={item.color}
            onMouseOver={() => {
              {
                ;<rect x={90} width={p1.x + 90} y={y + i * 20} height={18} fill="white" />
              }
            }}
          >
            <title>
              <rect x={90} width={p1.x + 90} y={y + i * 20} height={18} fill="white" />
              {item.value.toFixed(2)} {" " + item.biosample_term} 
            {" (" + item.strand + ")"}
            </title>
          </rect>
          <text x={p1.x + 40 + 150} y={y + i * 20 + 12.5} style={{ fontSize: 12 }}>
            {Number(item.value.toFixed(2)) + " "}
            <a href={"https://www.encodeproject.org/experiments/" + item.expID}>{item.expID}</a>
             {" " + item.biosample_term} 
            {" (" + item.strand + ")"}
          </text>
          <line x1={90} x2={90} y1={y + i * 20} y2={y + (i * 20 + 18)} stroke="black" />
        </Fragment>
      )
    })
  }

  let y: number = 0

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
const tissueValues = sort==="byValue" ? byValueTissues: sort==="byTissueMax" ? byTissueMaxTissues : tissues;
  return (
    <Box>
      <Grid2 xs={1} sx={{ ml: 0, mt: 2, display: "flex" }}>
        <Box>
          <FormControl key={sort}>
            <InputLabel id="sort-by-label" sx={{ mb: 10 }}>
              Sort By
            </InputLabel>
            <Select
              label="Sort By"
              labelId="sort-by-label"
              id="sort-by"
              value={sort}
              onChange={(event: SelectChangeEvent) => {
                setSort(event.target.value)
              }}
              size="small"
            >
              <MenuItem value="byTissue">Tissue</MenuItem>
              <MenuItem value="byTissueMax">Tissue Max</MenuItem>
              <MenuItem value="byValue">Value</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Grid2>
      <Grid2 xs={3} sx={{ alignItems: "right", justifyContent: "right", display: "flex", ml: 0, mr: 0, mt: 2 }}>
        <Button
          onClick={() => {
            let c: { [id: string]: boolean } = {}
            let uncollapse: boolean = true
            if (Object.keys(collapse).length !== 0) {
              Object.keys(collapse).map((b: string) => {
                if (collapse[b]) uncollapse = false
                c[b] = false
              })

              if (uncollapse) {
                Object.keys(collapse).map((b: string) => {
                  c[b] = true
                })
              }
            } else
              Object.keys(tissueValues).map((b: string) => {
                c[b] = false
              })
            setCollapse(c)
          }}
        >
          Collapse All
        </Button>
        <Box ml={5}>
          <FormControl key={sort}>
            <FormControlLabel
              control={
                <Switch
                  checked={zeros}
                  onChange={() => {
                    if (zeros) setZeros(false)
                    else setZeros(true)
                  }}
                />
              }
              label="display 0's"
            />
          </FormControl>
        </Box>
      </Grid2>
      {/* rampage plot */}
      <Grid2 xs={12}>
        <Box>
          {Object.entries(tissueValues).map((entry, index: number) => {
            let info = entry[1]
            y += info.values.length * 20 + 20 + 25
            let view: string = "0 0 1200 " + (info.values.length * 20 + 20)
            return (
              <Accordion
                key={index}
                expanded={Object.keys(collapse).length !== 0 ? collapse[entry[0]] : true}
                disableGutters={true}
                sx={{ padding: 0, mr: 0 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ padding: 0, margin: 0 }}
                  onClick={() => {
                    let tmp: { [id: string]: boolean } = {}
                    Object.entries(tissueValues).map((x) => {
                      if (x[0] === entry[0]) {
                        if (collapse[entry[0]] === undefined || collapse[entry[0]]) tmp[entry[0]] = false
                        else tmp[entry[0]] = true
                      } else {
                        tmp[x[0]] = collapse[x[0]] !== undefined ? collapse[x[0]] : true
                      }
                    })
                    setCollapse(tmp)
                  }}
                >
                  <Typography variant="h5">{entry[0].split("-")[0]}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 0 }}>
                  <svg className="graph" aria-labelledby="title desc" role="img" viewBox={view}>
                    <g className="data" data-setname="gene expression plot">
                      <line x1={0} x2={900} y1={1} y2={1} stroke="black" />
                      {plotGeneExp(entry, 5)}
                    </g>
                  </svg>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      </Grid2>
    </Box>
  )
}

export const z_score = (d) => (d === -11.0 || d === "--" || d === undefined ? "--" : d.toFixed(2))

export const ctgroup = (group: string) => {
  group = group.split(",")[0]
  if (group === "CA-CTCF")
    return (
      <span style={{ color: "#00B0F0" }}>
        <strong>chromatin accessible with ctcf</strong>
      </span>
    )
  if (group === "CA-TF")
    return (
      <span style={{ color: "#be28e5" }}>
        <strong>chromatin accessible with tf</strong>
      </span>
    )
  if (group === "CA-H3K4me3")
    return (
      <span style={{ color: "#ffaaaa" }}>
        <strong>chromatin accessible with H3K4me3</strong>
      </span>
    )
  if (group === "TF")
    return (
      <span style={{ color: "#d876ec" }}>
        <strong>tf only</strong>
      </span>
    )
  if (group === "CA")
    return (
      <span style={{ color: "#06DA93" }}>
        <strong>chromatin accessible only</strong>
      </span>
    )
  if (group === "pELS")
    return (
      <span style={{ color: "#ffcd00" }}>
        <strong>proximal enhancer-like signature</strong>
      </span>
    )
  if (group === "dELS")
    return (
      <span style={{ color: "#ffcd00" }}>
        <strong>distal enhancer-like signature</strong>
      </span>
    )
  if (group === "PLS")
    return (
      <span style={{ color: "#ff0000" }}>
        <strong>promoter-like signature</strong>
      </span>
    )
  if (group === "DNase-H3K4me3")
    return (
      <span style={{ color: "#ffaaaa" }}>
        <strong>DNase-H3K4me3</strong>
      </span>
    )
  if (group === "ctcf")
    return (
      <span style={{ color: "#00b0f0" }}>
        <strong>CTCF bound</strong>
      </span>
    )
  if (group === "ylowdnase")
    return (
      <span style={{ color: "#8c8c8c" }}>
        <strong>low DNase</strong>
      </span>
    )
  if (group === "zunclassified")
    return (
      <span style={{ color: "#8c8c8c" }}>
        <strong>zunclassified</strong>
      </span>
    )
  return (
    <span style={{ color: "#06da93" }}>
      <strong>DNase only</strong>
    </span>
  )
}
