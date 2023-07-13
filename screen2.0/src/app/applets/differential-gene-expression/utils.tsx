import React, { Fragment } from "react"
import { geneRed, geneBlue, promoterRed, enhancerYellow } from "../../../common/lib/colors"
import { Point2D, Range2D, linearTransform2D } from "jubilant-carnival"

/**
 * Returns a circle data point colored red for proximal-like and red for enhancer-like
 * @param {any} point data point for ccre
 * @param {number} i index
 * @param {Range2D} range x and y range of chart
 * @param {Range2D} dimensions x and y range of svg
 * @returns data point
 */
export const Point = (point: any, i: number, range: Range2D, dimensions: Range2D) => {
  // export const Point = ({point, i, range, dimensions}) => {
  const p: Point2D = { x: point.center, y: point.value }

  // invalid range
  if (p.x > range.x.end || p.x < range.x.start || p.y > range.y.end || p.y < range.y.start) return <></>

  // transform
  const t = linearTransform2D(range, dimensions)(p)

  // promotor or enhancer
  let color: string = ""
  if (point.typ[3] === "m") color = promoterRed
  else color = enhancerYellow

  return (
    <Fragment key={i}>
      <circle cx={t.x} cy={t.y} r="4" fill={color}>
        <title>{"coordinates: " + point.center.toLocaleString("en-US") + "\nz-score: " + point.value}</title>
      </circle>
    </Fragment>
  )
}

/**
 * Returns a circle data point colored red for proximal-like and red for enhancer-like
 * @param {any} point data point for log2 gene expression fold change
 * @param {number} i index
 * @param {Range2D} range x and y range of chart
 * @param {Range2D} dimensions x and y range of svg
 * @returns data point
 */
export const BarPoint = (point: any, i: number, range: Range2D, dimensions: Range2D) => {
  // export const BarPoint = ({point, i, range, dimensions}) => {
  let p1: Point2D = { x: 0, y: 0 }
  let p2: Point2D = { x: 0, y: 0 }
  let x1: number = point.start
  let x2: number = point.stop

  // cut bars off at axis if out of range
  if (point.start > range.x.end || point.stop < range.x.start) return <></>
  else if (point.start < range.x.start) x1 = range.x.start
  else if (point.stop > range.x.end) x2 = range.x.end

  // transform
  if (point.fc >= 0) {
    p1 = linearTransform2D(range, dimensions)({ x: x1, y: point.fc })
    p2 = linearTransform2D(range, dimensions)({ x: x2, y: 0 })
  } else {
    p1 = linearTransform2D(range, dimensions)({ x: x1, y: 0 })
    p2 = linearTransform2D(range, dimensions)({ x: x2, y: point.fc })
  }

  return (
    <Fragment key={i}>
      <rect x={p1.x} y={p1.y} width={p2.x - p1.x} height={p2.y - p1.y} fill="#549623" fillOpacity={0.5}>
        <title>
          {"fc: " + point.fc + "\nstart: " + point.start.toLocaleString("en-US") + "\nstop: " + point.stop.toLocaleString("en-US")}
        </title>
      </rect>
    </Fragment>
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
export const GenePoint = (point: any, i: number, range: Range2D, dimensions: Range2D, toggleGenes: boolean) => {
  // export const GenePoint = ({ point, i, range, dimensions, toggleGenes}) => {
  let p1: Point2D = { x: 0, y: 0 }
  let p2: Point2D = { x: 0, y: 0 }
  let x1: number = point.start
  let x2: number = point.stop
  let size: number = 20
  let color: string = geneRed
  if (point.strand === "-") color = geneBlue

  // cut off lines if out of axis range
  if (point.start > range.x.end || point.stop < range.x.start) return <></>
  else if (point.start < range.x.start) x1 = range.x.start
  else if (point.stop > range.x.end) x2 = range.x.end

  // transform
  p1 = linearTransform2D(range, dimensions)({ x: x1, y: 0 })
  p2 = linearTransform2D(range, dimensions)({ x: x2, y: 0 })

  // reduce size for overlay
  if (toggleGenes) {
    size = 12
  }

  // tooltip for mouseover
  const GeneTooltip = ({ point }) => {
    return (
      <title>
        {"gene: " + point.gene + "\nstart: " + point.start.toLocaleString("en-US") + "\nstop: " + point.stop.toLocaleString("en-US")}
      </title>
    )
  }

  return (
    <Fragment key={i}>
      <line x1={p1.x} x2={p2.x} y1={(i + 4) * size} y2={(i + 4) * size} stroke={color}>
        <GeneTooltip point={point} />
      </line>
      <text style={{ fontSize: 13, fontStyle: "italic" }} x={p2.x + size} y={(i + 4) * size + 5}>
        <GeneTooltip point={point} />
        <a href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + point.gene}>{point.gene}</a>
      </text>
      {x1 === range.x.start ? (
        <text x={p1.x - 15} y={(i + 4) * size + 6} style={{ fill: color }}>
          ◄
        </text>
      ) : x2 === range.x.end ? (
        <text x={p2.x - 3} y={(i + 4) * size + 6} style={{ fill: color }}>
          ►
        </text>
      ) : (
        <></>
      )}
    </Fragment>
  )
}

/**
 * Sets and labels the x-axis
 * @param {Range2D} range x and y range of chart
 * @param {Range2D} dimensions x and y range of svg
 * @returns list of labels along the x-axis
 */
export const SetRange_x = (range: Range2D, dimensions: Range2D) => {
  // export const SetRange_x = ({range, dimensions}) => {
  let range_x: number[] = []
  let zeros: string = "00000"

  // change margins of x-axis based on the difference in range
  // if (range.x.end - range.x.start > 100) {
  //   zeros = ""
  //   let j: number = (range.x.end - range.x.start).toString().length - 2
  //   console.log(range.x.end - range.x.start)
  //   while (j > 0){
  //     zeros += "0"
  //     j -= 1
  //   }
  //   console.log(zeros)
  // }

  // round and create list of labels
  let min_x: number = Math.floor(range.x.start / parseInt("1" + zeros)) * parseInt("1" + zeros)
  let max_x: number = Math.ceil(range.x.end / parseInt("1" + zeros)) * parseInt("1" + zeros)

  while (min_x <= max_x) {
    range_x.push(min_x)
    min_x += parseInt("1" + zeros)
  }

  // line and label
  const Axis_name = (x: number, label: number, zeros: string) => {
    if ((label / parseInt("1" + zeros)) % 2 === 0 || range_x.length < 7)
      return (
        <Fragment key={x}>
          <text x={x - 30} y={480} style={{ fontSize: 12 }}>
            {label.toLocaleString("en-US")}
          </text>
          <line x1={x} x2={x} y1={450} y2={456} stroke="black"></line>
        </Fragment>
      )
    else
      return (
        <Fragment key={x}>
          <line x1={x} x2={x} y1={450} y2={454} stroke="black"></line>
        </Fragment>
      )
  }

  // transform and return label of x axis
  const x_axis = (x: number) => {
    const p: Point2D = { x: x, y: range.y.start }
    const t = linearTransform2D(range, dimensions)(p)

    // return <Axis_name x={t.x} label={x} zeros={zeros} />
    return Axis_name(t.x, x, zeros)
  }

  return range_x.map((x: number, i: number) => x_axis(x))
}

/**
 * Sets and labels the y-axis
 * @param {number} ymin min on y-axis
 * @param {number} ymax max of y-axis
 * @param {Range2D} range x and y range of chart
 * @param {Range2D} dimensions x and y range of svg
 * @param {string} ct1 cell type 1
 * @param {string} ct2 cell type 2
 * @returns list of labels along the y-axis
 */
export const SetRange_y = (ymin: number, ymax: number, range: Range2D, dimensions: Range2D, ct1: string, ct2: string) => {
  // export const SetRange_y = ({ymin, ymax, range, dimensions, ct1, ct2}) => {
  let range_y: number[] = []
  let min_y: number = 0
  if (ymin < 0) min_y = parseInt(ymin.toString()[0] + (ymin - 0.5).toString()[1]) - 0.5
  else min_y = parseInt((ymin - 0.5).toString()[0]) - 0.5
  let max_y: number = parseInt((ymax + 0.5).toString()[0]) + 0.5

  if (max_y > 0.5 + ymax) max_y -= 0.5
  if (min_y < ymin - 0.5) min_y += 0.5

  while (min_y <= max_y) {
    range_y.push(min_y)
    min_y += 0.5
  }

  // transform and return labels of y axis
  const y_axis = (y: number, i: number, range_y: number[], ct1: string, ct2: string) => {
    const p: Point2D = { x: range.x.start, y: y }
    const t = linearTransform2D(range, dimensions)(p)
    let r: number = range_y[range_y.length - 1] // last label in list
    let cellTypeLabel: string[] = [
      "translate(39," + t.y.toString() + ") rotate(-90)",
      "translate(39," + (t.y + 180).toString() + ") rotate(-90)",
    ]

    // next y-axis label
    if (range_y[i + 1]) r = linearTransform2D(range, dimensions)({ x: range.x.start, y: range_y[i + 1] }).y

    if (y === 0.0)
      return (
        <Fragment key={y}>
          <text x={65} y={t.y + 4} style={{ fontSize: 12 }}>
            {"0.0"}
          </text>
          <line x1={94} x2={100} y1={t.y} y2={t.y} stroke="black"></line>
          <line x1={100} x2={900} y1={t.y} y2={t.y} stroke="black"></line>
          <line x1={900} x2={906} y1={t.y} y2={t.y} stroke="#549623"></line>
          <text x={925} y={t.y + 4} style={{ fontSize: 12, fill: "#549623" }}>
            {"0.0"}
          </text>
          <line x1={41} x2={50} y1={t.y} y2={t.y} stroke="black"></line>
          <g transform={cellTypeLabel[1]}>
            <text x={10} y={10} style={{ fontSize: 10 }}>
              ◄ {ct1.replace(/_/g, " ")}
            </text>
          </g>
          <g transform={cellTypeLabel[0]}>
            <text x={10} y={10} style={{ fontSize: 10 }}>
              {ct2.replace(/_/g, " ")} ►
            </text>
          </g>
        </Fragment>
      )
    else
      return (
        <Fragment key={y}>
          <text x={y < 0 ? 60 : 65} y={t.y + 4} style={{ fontSize: 12, textAlign: "right" }}>
            {y.toString().split(".").length > 1 ? y : y.toString() + ".0"}
          </text>
          <line x1={94} x2={100} y1={t.y} y2={t.y} stroke="black"></line>
          <line x1={900} x2={906} y1={t.y} y2={t.y} stroke="#549623"></line>
          <text x={y < 0 ? 920 : 925} y={t.y + 4} style={{ fontSize: 12, fill: "#549623" }}>
            {y.toString().split(".").length > 1 ? y : y.toString() + ".0"}
          </text>
        </Fragment>
      )
  }

  return range_y.map((y: number, i: number) => y_axis(y, i, range_y, ct1, ct2))
}
