import { Range2D } from "jubilant-carnival"
import { H3K27ac, H3K4me3, geneBlue, geneRed } from "../../../common/lib/colors"
import React from "react"
import { SetRange_x, SetRange_y, Point, GenePoint } from "./utils"
import { Gene, cCREZScore } from "./types"

/**
 * Plots difference in z-score and gene expression
 * @param props
 * @returns svg of plotted z-score of ccres and log2 fold change
 */
export function PlotDifferentialExpression(props: {
  title: { ct1: { name: string; expID: string }; ct2: { name: string; expID: string } }
  chromosome: string
  range: Range2D
  dimensions: Range2D
  ct1: string
  ct2: string
  data_ct1: { cCRESCREENSearch: cCREZScore[] }
  data_ct2: { cCRESCREENSearch: cCREZScore[] }
  data_genes: { gene: Gene[] }
  toggleFC: boolean
  toggleccres: boolean
  toggleGenes: boolean
  togglePCT: { TF: boolean; CA: boolean; "CA-CTCF": boolean; "CA-H3K4me3": boolean; dELS: boolean; pELS: boolean }
  setRange: React.Dispatch<React.SetStateAction<Range2D>>
}) {
  let data: Gene[] = [...props.data_genes.gene]
  data = data.sort((a, b) => (a.coordinates.start < b.coordinates.start ? -1 : 1))
  let tmp: number = 408 / data.length
  return (
    <svg className="graph" aria-labelledby="title desc" role="img" viewBox="0 0 1000 535">
      <g className="x-grid grid" id="xGrid">
        <line x1="100" x2="900" y1="450" y2="450"></line>
      </g>
      <g className="y-grid grid" id="yGrid">
        <line x1="900" x2="900" y1="50" y2="450"></line>
      </g>
      <g className="legend" transform="translate(0,0)">
        <circle cx={735} cy={20} r="8" fill={H3K27ac}></circle>
        <text style={{ fontSize: 11 }} x={750} y={24}>
          Enhancer-like Signature
        </text>
        <circle cx={535} cy={20} r="8" fill={H3K4me3}></circle>
        <text style={{ fontSize: 11 }} x={550} y={24}>
          Promoter-like Signature
        </text>
        <text x="100" y="24" style={{ fontSize: 10, fontStyle: "italic" }}>
          {props.chromosome + ":" + props.range.x.start.toLocaleString("en-US") + "-" + props.range.x.end.toLocaleString("en-US")}
        </text>
        <text x={400} y={515} style={{ fontSize: 15 }}>
          Coordinates (base pairs)
        </text>
      </g>
      <g className="labels x-labels">
        <SetRange_x range={props.range} dimensions={props.dimensions} />
        <line x1="100" y1="450" x2="900" y2="450" stroke="black"></line>
      </g>
      <g className="labels y-labels">
        <SetRange_y
          title={props.title}
          range={props.range}
          dimensions={props.dimensions}
          ct1={props.ct1}
          ct2={props.ct2}
          data_ct1={props.data_ct1}
          data_ct2={props.data_ct2}
          setRange={props.setRange}
        />
        <line x1="100" y1="50" x2="100" y2="450" stroke="black"></line>
        <line x1="900" y1="50" x2="900" y2="450" stroke="#549623"></line>
        {!props.toggleFC ? (
          <></>
        ) : (
          <g transform="translate(890,240) rotate(-90)">
            <text style={{ fontSize: 12, fill: "#549623" }}>log2 gene expression fold change</text>
          </g>
        )}
        {!props.toggleccres ? (
          <></>
        ) : (
          <text x="110" y="50" style={{ fontSize: 12, writingMode: "vertical-lr" }}>
            change in cCRE Z-score
          </text>
        )}
      </g>
      <g className="data" data-setname="de plot">
        {/* {!toggleFC? <></> : (
                          data[data.gene].nearbyDEs.data.map(
                            (point, i: number) => BarPoint(point, i, range, dimensions)
                            <BarPoint point={point} i={i} range={props.range} dimensions={props.dimensions} />
                          )
                        )} */}
        {!props.toggleccres ? (
          <></>
        ) : (
          props.data_ct1.cCRESCREENSearch.map((point: cCREZScore, i: number) => (
            <Point
              key={i}
              point={point}
              i={i}
              range={props.range}
              dimensions={props.dimensions}
              data_ct2={props.data_ct2}
              setRange={props.setRange}
              ct1={props.ct1}
              ct2={props.ct2}
              togglePCT={props.togglePCT}
            />
          ))
        )}
        {!props.toggleGenes ? (
          <></>
        ) : (
          data.map((point: Gene, i: number) => (
            <GenePoint
              key={i}
              point={point}
              i={i}
              range={props.range}
              dimensions={props.dimensions}
              toggleGenes={props.toggleGenes}
              size={tmp}
            />
          ))
        )}
      </g>
    </svg>
  )
}

/**
 * PLots genes within coordinate range
 * @param {Gene[], Range2D, Range2D} props
 * @returns svg of plotted genes w/ length
 */
export function PlotGenes(props: { data_genes: { gene: Gene[] }; range: Range2D; dimensions: Range2D }) {
  let data: Gene[] = [...props.data_genes.gene]
  data = data.sort((a, b) => (a.coordinates.start < b.coordinates.start ? -1 : 1))
  let tmp: number = 300 / data.length
  return (
    <svg
      className="graph"
      aria-labelledby="title desc"
      role="img"
      viewBox={"0 -10 1000 " + (props.data_genes.gene.length * 20 + 50).toString()}
    >
      <title id="genes"></title>
      <desc id="desc">genes</desc>
      <g className="legend" transform="translate(0,0)">
        <circle cx={535} cy={0} r="8" fill={geneRed}></circle>
        <text style={{ fontSize: 11, fill: geneRed }} x={550} y={4}>
          Watson (+) strand
        </text>
        <circle cx={735} cy={0} r="8" fill={geneBlue}></circle>
        <text style={{ fontSize: 11, fill: geneBlue }} x={750} y={4}>
          Crick (-) strand
        </text>
      </g>
      <g className="data">
        {data.map((point: Gene, i: number) => (
          <GenePoint key={i} point={point} i={i} range={props.range} dimensions={props.dimensions} toggleGenes={false} size={tmp} />
        ))}
      </g>
    </svg>
  )
}
