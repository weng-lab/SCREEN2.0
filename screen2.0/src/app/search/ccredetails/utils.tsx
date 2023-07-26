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
import { RIDItemList, GeneExpEntry } from "../../applets/gene-expression/types"

/**
 * Plots associated RAMPAGE signals
 * @param {any} data signals to plot
 * @param {Range2D} range size of plot dimensions
 * @param {Range2D} dimensions size of window to plot on
 * @returns plot of RAMPAGE signals
 */
export function PlotActivityProfiles(props: { data: any; range: Range2D; dimensions: Range2D }) {
  const [sort, setSort] = useState<string>("byValue")
  const [zeros, setZeros] = useState<boolean>(false)
  const [collapse, setCollapse] = useState<{ [id: string]: { expand: boolean } }>({})

  let transcripts: string[] = props.data["sortedTranscripts"]
  let itemsRID: RIDItemList = props.data["tsss"][transcripts[0]]["itemsByID"]
  let tissues: { [id: string]: { sum: number; values: GeneExpEntry[] } } = {} // dict of ftissues
  let p1: Point2D = { x: 0, y: 0 }
  let max: number = 0

  Object.values(props.data["tsss"][transcripts[0]]["itemsGrouped"][sort]).map((biosample) => {
    Object.values(biosample["items"]).map((id: string) => {
      if (!zeros && itemsRID[id]["counts"] === 0) return
      if (!tissues[biosample["tissue"]]) tissues[biosample["tissue"]] = { sum: 0, values: [] }
      tissues[biosample["tissue"]].sum += itemsRID[id]["counts"]
      tissues[biosample["tissue"]].values.push({
        value: itemsRID[id]["counts"],
        biosample_term: itemsRID[id]["biosample_term_name"],
        expID: itemsRID[id]["expid"],
        tissue: biosample["tissue"],
        strand: itemsRID[id]["strand"],
        color: biosample["color"],
      })

      if (sort === "byTissueMax" && tissues[biosample["tissue"]].sum > max) max = tissues[biosample["tissue"]].sum
      else if (itemsRID[id]["counts"] > max) max = itemsRID[id]["counts"]
    })
  })

  props.range.x.end = max

  // returns bar plot for a tissue
  const plotGeneExp = (entry: any, index: number, y: number) => {
    let tissue: string = entry[0]
    let info: any = entry[1]

    return Object.values(info.values).map((item: any, i: number) => {
      p1 = linearTransform2D(props.range, props.dimensions)({ x: item.value, y: 0 })
      return (
        <Fragment key={i}>
          <rect
            x={125}
            width={p1.x + 125}
            y={y + i * 20}
            height={18}
            fill={item["color"]}
            onMouseOver={() => {
              {
                ;<rect x={125} width={p1.x + 125} y={y + i * 20} height={18} fill="white" />
              }
            }}
          >
            <title>
              <rect x={125} width={p1.x + 125} y={y + i * 20} height={18} fill="white" />
              {item.value}
            </title>
          </rect>
          <text x={p1.x + 125 + 150} y={y + i * 20 + 12.5} style={{ fontSize: 12 }}>
            {Number(item.value.toFixed(3)) + " "}
            <a href={"https://www.encodeproject.org/experiments/" + item.expID}>{item.expID}</a>
            {" " + item.biosample_term}
            {" (" + item.strand + ")"}
          </text>
          <line x1={125} x2={125} y1={y + i * 20} y2={y + (i * 20 + 18)} stroke="black" />
        </Fragment>
      )
    })
  }

  let y: number = 0
  return (
    <>
      {/* sort */}
      <Grid2 xs={8} md={8} lg={8} sx={{ ml: 6, mt: 2, display: "flex" }}>
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
      <Grid2 xs={3} sx={{ alignItems: "right", justifyContent: "right", display: "flex", ml: 8, mr: 0, mt: 2 }}>
        <Box>
          <Button
            onClick={() => {
              let c: { [id: string]: { expand: boolean } } = {}
              let uncollapse: boolean = true
              if (Object.keys(collapse).length !== 0) {
                Object.keys(collapse).map((b: string) => {
                  if (collapse[b].expand) uncollapse = false
                  c[b] = { expand: false }
                })

                if (uncollapse) {
                  Object.keys(collapse).map((b: string) => {
                    c[b].expand = true
                  })
                }
              } else
                Object.keys(tissues).map((b: string) => {
                  c[b] = { expand: false }
                })
              setCollapse(c)
            }}
          >
            Collapse All
          </Button>
        </Box>
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
      <Grid2 xs={12} lg={12} md={12}>
        <Box sx={{ width: `1500px` }}>
          {Object.entries(tissues).map((entry, index: number) => {
            let info: any = entry[1]
            y += info.values.length * 20 + 20 + 25
            let view: string = "0 0 1200 " + (info.values.length * 20 + 20)
            return (
              <Accordion
                key={index}
                expanded={collapse[entry[0]] ? collapse[entry[0]].expand : true}
                disableGutters={true}
                sx={{ padding: 0, mr: 4 }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{ padding: 0, margin: 0 }}
                  onClick={() => {
                    let tmp: { [id: string]: { expand: boolean } } = {}
                    Object.entries(tissues).map((x) => {
                      if (x[0] === entry[0]) {
                        if (collapse[entry[0]] === undefined || collapse[entry[0]].expand) tmp[entry[0]] = { expand: false }
                        else tmp[entry[0]] = { expand: true }
                      } else {
                        tmp[x[0]] = { expand: collapse[x[0]] !== undefined ? collapse[x[0]].expand : true }
                      }
                    })
                    setCollapse(tmp)
                  }}
                >
                  <Typography variant="h5">{entry[0]}</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ padding: 0 }}>
                  <svg className="graph" aria-labelledby="title desc" role="img" viewBox={view}>
                    <g className="data" data-setname="gene expression plot">
                      <line x1={0} x2={900} y1={1} y2={1} stroke="black" />
                      {plotGeneExp(entry, index, 5)}
                    </g>
                  </svg>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      </Grid2>
    </>
  )
}

export const z_score = (d: any) => (d === -11.0 || d === "--" || d === undefined ? "--" : d.toFixed(2))

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
