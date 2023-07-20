import { Accordion, AccordionDetails, AccordionSummary, Box, ToggleButton, Typography } from "@mui/material"
import { styled } from "@mui/material/styles"
import { GeneExpression } from "./types"
import { Fragment } from "react"
import { Range2D, Point2D, linearTransform2D } from "jubilant-carnival"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { InfoRounded } from "@mui/icons-material"

export type RIDItem = {
  [id: string]: {
    ageTitle: string
    cellType: string
    logFPKM: number
    logTPM: number
    rID: number
    rawFPKM: number
    rawTPM: number
    rep: number
    tissue: string
  }[]
}

export type GeneExpEntry = {
  value: number
  cellType: string
  expID: string
  rep: number
  tissue: string
  color: string
}

export const ToggleButtonMean = styled(ToggleButton)(() => ({
  "&.Mui-selected, &.Mui-selected:hover": {
    color: "white",
    backgroundColor: "blue",
  },
}))

export function PlotGeneExpression(
  data: GeneExpression,
  range: Range2D,
  dimensions: Range2D,
  RNAtype: string,
  group: string,
  scale: string,
  replicates: string,
  biosamples_list: string[],
  cell_components_list: string[]
) {
  console.log(data[RNAtype])
  let itemsRID: any = data[RNAtype]["itemsByRID"]
  let p1: Point2D = { x: 0, y: 0 }
  let max: number = 0

  // let tissues: {[tissue: string]: {
  //   sum: number,
  //   values: {
  //     value: number,
  //     cellType: string,
  //     expID: string,
  //     rep: number,
  //     tissue: string
  //   }[]
  // }} = {}
  let tissues: any = {} // dict of tissues

  Object.values(data[RNAtype][replicates][group]).map((biosample) => {
    Object.values(biosample["items"]).map((id: string) => {
      if (tissues[itemsRID[id]["tissue"]]) {
        tissues[itemsRID[id]["tissue"]].sum += itemsRID[id][scale]
        tissues[itemsRID[id]["tissue"]].values.push({
          value: itemsRID[id][scale],
          cellType: itemsRID[id]["cellType"],
          expID: itemsRID[id]["expID"],
          rep: itemsRID[id]["rep"],
          tissue: itemsRID[id]["tissue"],
          color: biosample["color"],
        })
      } else {
        tissues[itemsRID[id]["tissue"]] = {
          sum: itemsRID[id][scale],
          values: [
            {
              value: itemsRID[id][scale],
              cellType: itemsRID[id]["cellType"],
              expID: itemsRID[id]["expID"],
              rep: itemsRID[id]["rep"],
              tissue: itemsRID[id]["tissue"],
              color: biosample["color"],
            },
          ],
        }
      }
      if (group === "byTissueMaxFPKM" && tissues[itemsRID[id]["tissue"]].sum > max) max = tissues[itemsRID[id]["tissue"]].sum
      else if (itemsRID[id][scale] > max) max = itemsRID[id][scale]
    })
  })

  range.x.end = max
  console.log(range.x.end)

  // returns bar plot for a tissue
  function plotGeneExp(entry: any, index: number, y: number) {
    let tissue: string = entry[0]
    let info: any = entry[1]

    return Object.values(info.values).map((item: GeneExpEntry, i: number) => {
      p1 = linearTransform2D(range, dimensions)({ x: item.value, y: 0 })
      return (
        <Fragment key={i}>
          <rect x={125} width={p1.x + 125} y={y + i * 20} height={18} fill={item["color"]}>
            <title>{item.value}</title>
          </rect>
          <text x={p1.x + 125 + 150} y={y + i * 20 + 12.5} style={{ fontSize: 12 }}>
            {Number(item.value.toFixed(3)) + " "}
            {/* {item.value + " "} */}
            <a href={"https://www.encodeproject.org/experiments/" + item.expID}>{item.expID}</a>
            {" " + item.cellType}
          </text>
          <line x1={125} x2={125} y1={y + i * 20} y2={y + (i * 20 + 18)} stroke="black" />
        </Fragment>
      )
    })
  }

  let y: number = 0
  return Object.entries(tissues).map((entry, index: number) => {
    let info: any = entry[1]
    y = info.values.length + 20 + 10
    let view: string = "0 0 1200 " + (info.values.length * 10 + 20)
    return (
      // <Box>
      <Accordion defaultExpanded={true} disableGutters={true} sx={{ padding: 0, outline: "white" }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ padding: 0, margin: 0 }}>
          <Typography variant="h5">{entry[0]}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ padding: 0 }}>
          <svg className="graph" aria-labelledby="title desc" role="img" viewBox={view}>
            <g className="data" data-setname="gene expression plot">
              <Fragment key={index}>
                {/* <text x={10} y={y - info.values.length * 20 + 20} style={{ fontSize: 20, fontWeight: "bolder" }}>
          {entry[0]}
        </text> */}
                <line x1={0} x2={900} y1={1} y2={1} stroke="black" />
                {plotGeneExp(entry, index, y - info.values.length * 20)}
              </Fragment>
            </g>
          </svg>
        </AccordionDetails>
      </Accordion>
      // </Box>
    )
  })
}
