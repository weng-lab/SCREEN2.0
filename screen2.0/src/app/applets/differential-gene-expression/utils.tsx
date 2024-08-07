import React, { Fragment, useState, Dispatch, SetStateAction } from "react"
import { geneRed, geneBlue, H3K4me3, H3K27ac } from "../../../common/lib/colors"
import { Point2D, Range2D, linearTransform2D } from "jubilant-carnival"
import { ErrorMessage } from "../../../common/lib/utility"
import { Gene, cCREZScore } from "./types"

/**
 * Returns a circle data point colored red for proximal-like and red for enhancer-like
 * @param {cCREZScore} point data point for ccre
 * @param {number} i index
 * @param {Range2D} range x and y range of chart
 * @param {Range2D} dimensions x and y range of svg
 * @returns data point
 */
export const Point = (props: {
  point: cCREZScore
  i: number
  range: Range2D
  dimensions: Range2D
  data_ct2: any
  setRange: Dispatch<SetStateAction<Range2D>>
  ct1: string
  ct2: string
  togglePCT: { TF: boolean; CA: boolean; "CA-CTCF": boolean; "CA-H3K4me3": boolean; dELS: boolean; pELS: boolean }
}) => {
  const [highlighted, setHighlighted] = useState<cCREZScore>(null)
  const [option, setOption] = useState<string>("")
  const [highlightpct, setHighlightpct] = useState<string>("")
  const ct2_genes: any = props.data_ct2.cCRESCREENSearch[props.i]
  const x: number = props.point.start + props.point.len / 2
  const h3k4me3: Point2D = { x: x, y: 0 }
  const h3k27ac: Point2D = { x: x, y: 0 }

  // no cell types
  if (props.ct1 === "" && props.ct2 === "") return <ErrorMessage error={new Error("no cell selected.")} />
  else if (props.ct1 === "") {
    // no cell 1
    h3k4me3.y = ct2_genes.ctspecific.h3k4me3_zscore
    h3k27ac.y = ct2_genes.ctspecific.h3k27ac_zscore
  } else if (props.ct2 === "") {
    // no cell 2
    h3k4me3.y = props.point.ctspecific.h3k4me3_zscore
    h3k27ac.y = props.point.ctspecific.h3k27ac_zscore
  } else if (props.ct1 === props.ct2) {
    // same cell types
    h3k4me3.y = props.point.ctspecific.h3k4me3_zscore
    h3k27ac.y = props.point.ctspecific.h3k27ac_zscore
  } else {
    // take difference
    h3k4me3.y =
      (props.point.ctspecific.h3k4me3_zscore !== null ? props.point.ctspecific.h3k4me3_zscore : 0) -
      (ct2_genes.ctspecific.h3k4me3_zscore !== null ? ct2_genes.ctspecific.h3k4me3_zscore : 0)
    h3k27ac.y =
      (props.point.ctspecific.h3k27ac_zscore !== null ? props.point.ctspecific.h3k27ac_zscore : 0) -
      (ct2_genes.ctspecific.h3k27ac_zscore !== null ? ct2_genes.ctspecific.h3k27ac_zscore : 0)
  }

  // transform
  const t_h3k4me3 = linearTransform2D(props.range, props.dimensions)(h3k4me3)
  const t_h3k27ac = linearTransform2D(props.range, props.dimensions)(h3k27ac)

  return (
    <g key={props.i}>
      {highlighted === props.point && option === "h3k4me3" ? (
        <circle cx={t_h3k4me3.x} cy={t_h3k4me3.y} r="5" fill="black" opacity="100%">
          <title>
            {"pct: " +
              props.point.pct +
              "\nlength: " +
              props.point.len +
              "\nh3k4me3 z-score: " +
              h3k4me3.y.toFixed(2) +
              "\ncoordinates: " +
              x.toLocaleString("en-US")}
          </title>
        </circle>
      ) : (
        <></>
      )}
      {highlighted === props.point && option === "h3k27ac" ? (
        <circle cx={t_h3k27ac.x} cy={t_h3k27ac.y} r="5" fill="black" opacity="100%">
          <title>
            {"pct: " +
              props.point.pct +
              "\nlength: " +
              props.point.len +
              "\nh3k27ac z-score: " +
              h3k27ac.y.toFixed(2) +
              "\ncoordinates: " +
              x.toLocaleString("en-US")}
          </title>
        </circle>
      ) : (
        <></>
      )}
      {option === "h3k4me2" && props.point.pct === highlightpct ? (
        <circle cx={t_h3k4me3.x} cy={t_h3k4me3.y} r="5" fill="black" opacity="100%" />
      ) : (
        <></>
      )}
      {option === "h3k27ac" && props.point.pct === highlightpct ? (
        <circle cx={t_h3k27ac.x} cy={t_h3k27ac.y} r="5" fill="black" opacity="100%" />
      ) : (
        <></>
      )}
      {h3k4me3.y === undefined ||
      h3k4me3.x > props.range.x.end ||
      h3k4me3.x < props.range.x.start ||
      h3k4me3.y > props.range.y.end ||
      h3k4me3.y < props.range.y.start ||
      !props.togglePCT[props.point.pct] ? (
        <></>
      ) : (
        <circle
          cx={t_h3k4me3.x}
          cy={t_h3k4me3.y}
          r="4"
          fill={H3K4me3}
          onMouseEnter={() => {
            setHighlighted(props.point)
            setOption("h3k4me3")
          }}
          onMouseOut={() => {
            setHighlighted(null)
          }}
          onMouseOver={() => {
            setHighlighted(props.point)
            setOption("h3k4me3")
          }}
          onClick={() => {
            if (highlightpct === props.point.pct) setHighlightpct("")
            else setHighlightpct(props.point.pct)
          }}
        >
          <title>
            {"pct: " +
              props.point.pct +
              "\nlength: " +
              props.point.len +
              "\nH3K4me3 z-score: " +
              h3k4me3.y.toFixed(2) +
              "\ncoordinates: " +
              x.toLocaleString("en-US")}
          </title>
        </circle>
      )}
      {h3k27ac.y === undefined ||
      h3k27ac.x > props.range.x.end ||
      h3k27ac.x < props.range.x.start ||
      h3k27ac.y > props.range.y.end ||
      h3k27ac.y < props.range.y.start ||
      !props.togglePCT[props.point.pct] ? (
        <></>
      ) : (
        <circle
          cx={t_h3k27ac.x}
          cy={t_h3k27ac.y}
          r="4"
          fill={H3K27ac}
          onMouseEnter={() => {
            setHighlighted(props.point)
            setOption("h3k27ac")
          }}
          onMouseOut={() => {
            setHighlighted(null)
          }}
          onMouseOver={() => {
            setHighlighted(props.point)
            setOption("h3k27ac")
          }}
          onClick={() => {
            if (highlightpct === props.point.pct) setHighlightpct("")
            else setHighlightpct(props.point.pct)
          }}
        >
          <title>
            {"pct: " +
              props.point.pct +
              "\nlength: " +
              props.point.len +
              "\nH3K27ac z-score: " +
              h3k27ac.y.toFixed(2) +
              "\ncoordinates: " +
              x.toLocaleString("en-US")}
          </title>
        </circle>
      )}
    </g>
  )
}

/**
 * Returns a circle data point colored red for proximal-like and red for enhancer-like
 * @param {Gene} point data point for log2 gene expression fold change
 * @param {number} i index
 * @param {Range2D} range x and y range of chart
 * @param {Range2D} dimensions x and y range of svg
 * @returns data point
 */
export const BarPoint = (props: { point: any; i: number; range: Range2D; dimensions: Range2D }) => {
  let p1: Point2D = { x: 0, y: 0 }
  let p2: Point2D = { x: 0, y: 0 }
  let x1: number = props.point.coordinates.start
  let x2: number = props.point.coordinates.end

  // cut bars off at axis if out of range
  if (props.point.coordinates.start > props.range.x.end || props.point.coordinates.end < props.range.x.start) return <></>
  else if (props.point.coordinates.start < props.range.x.start) x1 = props.range.x.start
  else if (props.point.coordinates.end > props.range.x.end) x2 = props.range.x.end

  // transform
  if (props.point.fc >= 0) {
    p1 = linearTransform2D(props.range, props.dimensions)({ x: x1, y: props.point.fc })
    p2 = linearTransform2D(props.range, props.dimensions)({ x: x2, y: 0 })
  } else {
    p1 = linearTransform2D(props.range, props.dimensions)({ x: x1, y: 0 })
    p2 = linearTransform2D(props.range, props.dimensions)({ x: x2, y: props.point.fc })
  }

  return (
    <g>
      <rect x={p1.x} y={p1.y} width={p2.x - p1.x} height={p2.y - p1.y} fill="#549623" fillOpacity={0.5}>
        <title>
          {"fc: " +
            props.point.fc +
            "\nstart: " +
            props.point.coordinates.start.toLocaleString("en-US") +
            "\nstop: " +
            props.point.coordinates.end.toLocaleString("en-US")}
        </title>
      </rect>
    </g>
  )
}

/**
 * Returns a line the distance of a gene and the gene name
 * @param {any} point data point for gene with name and range
 * @param {number} i index
 * @param {Range2D} range x and y range of chart
 * @param {Range2D} dimensions x and y range of svg
 * @param {boolean} toggleGenes is switch for gene plot on
 * @returns data point
 */
export const GenePoint = (props: { point: Gene; i: number; range: Range2D; dimensions: Range2D; toggleGenes: boolean; size: number }) => {
  let p1: Point2D = { x: 0, y: 0 }
  let p2: Point2D = { x: 0, y: 0 }
  let x1: number = props.point.coordinates.start
  let x2: number = props.point.coordinates.end
  let size: number = 20
  let color: string = props.point.strand === "-" ? geneBlue : geneRed
  let y: number = (props.i + (props.toggleGenes ? 7 : 1.5)) * (props.toggleGenes ? props.size : 20)

  // cut off lines if out of axis range
  if (props.point.coordinates.start > props.range.x.end || props.point.coordinates.end < props.range.x.start) return <></>
  else if (props.point.coordinates.start < props.range.x.start) x1 = props.range.x.start
  else if (props.point.coordinates.end > props.range.x.end) x2 = props.range.x.end

  // transform
  // p1 = linearTransform2D(props.range, props.dimensions)({ x: x1, y: props.i })
  // p2 = linearTransform2D(props.range, props.dimensions)({ x: x2, y: props.i })

  // reduce size for overlay
  if (props.toggleGenes) {
    size = 7
  }
  let tmp: number = (props.range.y.end - props.range.y.start) / props.size

  // transform
  p1 = linearTransform2D(props.range, props.dimensions)({ x: x1, y: (props.i + props.range.y.start) * tmp })
  p2 = linearTransform2D(props.range, props.dimensions)({ x: x2, y: (props.i + props.range.y.start) * tmp })

  // tooltip for mouseover
  const GeneTooltip = () => {
    return (
      <title key={props.point.name}>
        {"gene: " +
          props.point.name +
          "\nstart: " +
          props.point.coordinates.start.toLocaleString("en-US") +
          "\nstop: " +
          props.point.coordinates.end.toLocaleString("en-US")}
      </title>
    )
  }

  // let y: number = (props.i + (props.toggleGenes ? 7 : 1.5)) * (props.toggleGenes ? props.size : 20)
  return (
    <g>
      <line x1={p1.x} x2={p2.x} y1={props.toggleGenes ? p1.y : y} y2={props.toggleGenes ? p1.y : y} stroke={color}>
        <GeneTooltip />
      </line>
      <text
        style={{ fontSize: props.toggleGenes ? 8 : 13, fontStyle: "italic" }}
        x={p2.x + (props.toggleGenes ? size : 20)}
        y={props.toggleGenes ? p2.y + 2.5 : y + (props.toggleGenes ? 2.5 : 5)}
      >
        <GeneTooltip />
        <a href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + props.point.name}>{props.point.name}</a>
      </text>
      {x1 === props.range.x.start ? (
        <text x={p1.x - 15} y={props.toggleGenes ? p1.y + 5 : y + 6} style={{ fill: color }}>
          ◄
        </text>
      ) : x2 === props.range.x.end ? (
        <text x={p2.x - 3} y={props.toggleGenes ? p2.y + 5 : y + 6} style={{ fill: color }}>
          ►
        </text>
      ) : (
        <></>
      )}
    </g>
  )
}

/**
 * Sets and labels the x-axis
 * @param {Range2D} range x and y range of chart
 * @param {Range2D} dimensions x and y range of svg
 * @returns list of labels along the x-axis
 */
export const SetXAxisRange = (props: { range: Range2D; dimensions: Range2D }) => {
  let range_x: number[] = []
  let zeros: string = "00000"

  // change margins of x-axis based on the difference in range
  // if (props.range.x.end - props.range.x.start > 100) {
  //   zeros = ""
  //   let j: number = (props.range.x.end - props.range.x.start).toString().length - 2
  //   console.log(props.range.x.end - props.range.x.start)
  //   while (j > 0){
  //     zeros += "0"
  //     j -= 1
  //   }
  //   console.log(zeros)
  // }

  // round and create list of labels
  let min_x: number = Math.floor(props.range.x.start / parseInt("1" + zeros)) * parseInt("1" + zeros)
  let max_x: number = Math.ceil(props.range.x.end / parseInt("1" + zeros)) * parseInt("1" + zeros)

  while (min_x <= max_x) {
    range_x.push(min_x)
    min_x += parseInt("1" + zeros)
  }

  // transform and return line / label of x axis
  const x_axis = (x: number) => {
    const p: Point2D = { x: x, y: props.range.y.start }
    const t = linearTransform2D(props.range, props.dimensions)(p)

    if ((x / parseInt("1" + zeros)) % 2 === 0 || range_x.length < 7)
      return (
        <Fragment key={t.x}>
          <text x={t.x - 30} y={480} style={{ fontSize: 12 }}>
            {x.toLocaleString("en-US")}
          </text>
          <line x1={t.x} x2={t.x} y1={450} y2={456} stroke="black"></line>
        </Fragment>
      )
    else
      return (
        <Fragment key={t.x}>
          <line x1={t.x} x2={t.x} y1={450} y2={454} stroke="black"></line>
        </Fragment>
      )
  }

  return range_x.map((x: number) => x_axis(x))
}

/**
 * Sets and labels the y-axis
 * @param {number} props.range.y.start min on y-axis
 * @param {number} props.range.y.end max of y-axis
 * @param {Range2D} range x and y range of chart
 * @param {Range2D} dimensions x and y range of svg
 * @param {string} ct1 cell type 1
 * @param {string} ct2 cell type 2
 * @returns list of labels along the y-axis
 */
export const SetYAxisRange = (props: {
  title: { ct1: { name: string; expID: string }; ct2: { name: string; expID: string } }
  range: Range2D
  dimensions: Range2D
  ct1: string
  ct2: string
  data_ct1: any
  data_ct2: any
  setRange: Dispatch<SetStateAction<Range2D>>
}) => {
  let range_y: number[] = []
  let ymin: number = props.range.y.start
  let ymax: number = props.range.y.end

  for (let i in props.data_ct1.cCRESCREENSearch) {
    let h3kme3: number =
      props.data_ct1.cCRESCREENSearch[i].ctspecific.h3k4me3_zscore - props.data_ct2.cCRESCREENSearch[i].ctspecific.h3k4me3_zscore
    let h3k27ac: number =
      props.data_ct1.cCRESCREENSearch[i].ctspecific.h3k27ac_zscore - props.data_ct2.cCRESCREENSearch[i].ctspecific.h3k27ac_zscore
    if (h3kme3 > ymax) ymax = h3kme3
    if (h3kme3 < ymin) ymin = h3kme3
    if (h3k27ac > ymax) ymax = h3k27ac
    if (h3k27ac < ymin) ymin = h3k27ac
  }

  if (ymin < props.range.y.start || ymax > props.range.y.end) {
    ymin = Math.floor(ymin)
    ymax = Math.ceil(ymax)
    props.setRange({ x: { start: props.range.x.start, end: props.range.x.end }, y: { start: ymin, end: ymax } })
  }

  while (ymin <= ymax) {
    range_y.push(ymin)
    ymin += 0.5
  }

  // transform and return labels of y axis
  const y_axis = (y: number, i: number, range_y: number[], ct1: string, ct2: string) => {
    const p: Point2D = { x: props.range.x.start, y: y }
    const t = linearTransform2D(props.range, props.dimensions)(p)
    let r: number = range_y[range_y.length - 1] // last label in list
    let cellTypeLabel: string[] = [
      "translate(39," + t.y.toString() + ") rotate(-90)",
      "translate(39," + (t.y + (props.title.ct1.expID.length === 0 ? 32.5 : 32.5)).toString() + ") rotate(-90)",
    ]
    // console.log(props.title.ct1.name.length)
    // console.log(document.getElementById(props.title.ct1.name).clientWidth)

    // next y-axis label
    if (range_y[i + 1]) r = linearTransform2D(props.range, props.dimensions)({ x: props.range.x.start, y: range_y[i + 1] }).y

    const getName = (name: string) => {
      let cellname: string = ""
      for (let c of name) {
        if (c === "(") break
        else cellname += c
      }
      return (cellname += " ")
    }

    if (y === 0.0)
      return (
        <Fragment key={y}>
          <line x1={100} x2={900} y1={t.y} y2={t.y} stroke="black"></line>
          <line x1={900} x2={906} y1={t.y} y2={t.y} stroke="#549623"></line>
          <text x={65} y={t.y + 4} style={{ fontSize: 12 }}>
            {props.range.y.end - props.range.y.start < 8 ? "0.0" : "0"}
          </text>
          <line x1={94} x2={100} y1={t.y} y2={t.y} stroke="black"></line>
          <text x={925} y={t.y + 4} style={{ fontSize: 12, fill: "#549623" }}>
            {props.range.y.end - props.range.y.start < 8 ? "0.0" : "0"}
          </text>
          <line x1={41} x2={50} y1={t.y} y2={t.y} stroke="black"></line>
          <g transform={cellTypeLabel[1]}>
            <text x={"-" + (getName(props.title.ct1.name).length * 4.0 + 5).toString() + "px"} y={10} style={{ fontSize: 10 }}>
              <a target="_blank" rel="noopener noreferrer" href={"https://www.encodeproject.org/experiments/" + props.title.ct1.expID}>
                ◄ {getName(props.title.ct1.name)}
              </a>
            </text>
          </g>
          <g transform={cellTypeLabel[0]}>
            <text x={10} y={10} style={{ fontSize: 10 }}>
              <a target="_blank" rel="noopener noreferrer" href={"https://www.encodeproject.org/experiments/" + props.title.ct1.expID}>
                {props.title.ct2.name} ►
              </a>
            </text>
          </g>
        </Fragment>
      )
    else
      return (
        <Fragment key={y}>
          <text x={y < 0 ? 60 : 65} y={t.y + 4} style={{ fontSize: 12, textAlign: "right" }}>
            {props.range.y.end - props.range.y.start < 8 && y.toString().split(".").length > 1
              ? y
              : y.toString().split(".").length > 1
              ? ""
              : y % 2 !== 0
              ? ""
              : y.toString()}
          </text>
          <line x1={94} x2={100} y1={t.y} y2={t.y} stroke="black"></line>
          <line x1={900} x2={906} y1={t.y} y2={t.y} stroke="#549623"></line>
          <text x={y < 0 ? 920 : 925} y={t.y + 4} style={{ fontSize: 12, fill: "#549623" }}>
            {props.range.y.end - props.range.y.start < 8 && y.toString().split(".").length > 1
              ? y
              : y.toString().split(".").length > 1
              ? ""
              : y % 2 !== 0
              ? ""
              : y.toString()}
          </text>
        </Fragment>
      )
  }

  return range_y.map((y: number, i: number) => y_axis(y, i, range_y, props.ct1, props.ct2))
}
