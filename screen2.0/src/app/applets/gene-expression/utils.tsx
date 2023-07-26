import React, { useState } from "react"
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Stack, ToggleButton, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { RIDItemList, GeneExpEntry, GeneExpressions } from "./types"
import { Fragment } from "react"
import { Range2D, Point2D, linearTransform2D } from "jubilant-carnival"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"

export const ToggleButtonMean = styled(ToggleButton)(() => ({
  "&.Mui-selected, &.Mui-selected:hover": {
    color: "white",
    backgroundColor: "blue",
  },
}))

export function PlotGeneExpression(props: {
  data: GeneExpressions
  range: Range2D
  dimensions: Range2D
  RNAtype: string
  group: string
  scale: string
  replicates: string
}) {
  const [collapse, setCollapse] = useState<{ [id: string]: { expand: boolean } }>({})

  let itemsRID: RIDItemList = props.data[props.RNAtype]["itemsByRID"]
  let tissues: { [id: string]: { sum: number; values: GeneExpEntry[] } } = {} // dict of ftissues
  let p1: Point2D = { x: 0, y: 0 }
  let max: number = 0

  Object.values(props.data[props.RNAtype][props.replicates][props.group]).map((biosample) => {
    Object.values(biosample["items"]).map((id: string) => {
      if (!tissues[itemsRID[id]["tissue"]]) tissues[itemsRID[id]["tissue"]] = { sum: 0, values: [] }
      if (tissues[itemsRID[id]["tissue"]]) {
        tissues[itemsRID[id]["tissue"]].sum += itemsRID[id][props.scale]
        tissues[itemsRID[id]["tissue"]].values.push({
          value: itemsRID[id][props.scale],
          cellType: itemsRID[id]["cellType"],
          expID: itemsRID[id]["expID"],
          rep: itemsRID[id]["rep"],
          tissue: itemsRID[id]["tissue"],
          color: biosample["color"],
        })
      }

      if (props.group === "byTissueMaxFPKM" && tissues[itemsRID[id]["tissue"]].sum > max) max = tissues[itemsRID[id]["tissue"]].sum
      else if (itemsRID[id][props.scale] > max) max = itemsRID[id][props.scale]
    })
  })

  props.range.x.end = max

  // returns bar plot for a tissue
  const plotGeneExp = (entry: any, index: number, y: number) => {
    let tissue: string = entry[0]
    let info: any = entry[1]

    return Object.values(info.values).map((item: GeneExpEntry, i: number) => {
      p1 = linearTransform2D(props.range, props.dimensions)({ x: item.value, y: 0 })
      return (
        <Fragment key={i}>
          <rect x={125} width={p1.x + 125} y={y + i * 20} height="18px" fill={item["color"]}>
            <title>{item.value}</title>
          </rect>
          <text x={p1.x + 125 + 150} y={y + i * 20 + 12.5} style={{ fontSize: 12 }}>
            {Number(item.value.toFixed(3)) + " "}
            <a href={"https://www.encodeproject.org/experiments/" + item.expID}>{item.expID}</a>
            {" " + item.cellType}
          </text>
          <line x1={125} x2={125} y1={y + i * 20} y2={y + (i * 20 + 18)} stroke="black" />
        </Fragment>
      )
    })
  }

  let y: number = 0
  return (
    <>
      <Grid2 xs={10} md={10} lg={10} sx={{ alignItems: "right", justifyContent: "right", display: "flex", mr: 4, mt: 2 }}>
        <Box>
          <Button
            onClick={() => {
              let c: { [id: string]: { expand: boolean } } = {}
              let uncollapse: boolean = true
              if (Object.keys(collapse).length !== 0){
                Object.keys(collapse).map((b: string) => {
                  if (collapse[b].expand) uncollapse = false
                  c[b] = { expand: false }
                })

                if (uncollapse) {
                  Object.keys(collapse).map((b: string) => {
                    c[b].expand = true
                  })
                }
              }
              else Object.keys(tissues).map((b: string) => {c[b] = { expand: false }})
              setCollapse(c)
            }}
          >
            Collapse All
          </Button>
        </Box>
      </Grid2>
      <Grid2 xs={12} md={12} lg={12} mt={1} ml={2} mr={2}>
        <Stack>
          {Object.entries(tissues).map((entry, index: number) => {
            let info: any = entry[1]
            y = info.values.length + 20 + 10
            let view: string = "0 0 1200 " + (info.values.length * 20 + 20)
            return (
              <Accordion
                key={index}
                expanded={collapse[entry[0]] ? collapse[entry[0]].expand : true}
                disableGutters={true}
                sx={{ padding: 0, ml: "2rem", mr: "2rem" }}
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
        </Stack>
      </Grid2>
    </>
  )
}
