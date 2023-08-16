import { gql, useQuery } from "@apollo/client"
import React, { useMemo } from "react"
import { CircularProgress } from "@mui/material"
import { client } from "../ccredetails/client"

export const COLORS = new Map([
  ["PLS", "#ff0000"],
  ["pELS", "#ffa700"],
  ["dELS", "#ffcd00"],
  ["DNase-H3K4me3", "#ffaaaa"],
  ["CTCF-only", "#00b0f0"],
])

export const GROUPS = new Map([
  ["PLS", "promoter-like"],
  ["pELS", "proximal enhancer-like"],
  ["dELS", "distal enhancer-like"],
  ["DNase-H3K4me3", "DNase-H3K4me3"],
  ["CTCF-only", "CTCF-only"],
])

const QUERY = gql`
  query cCRE($assembly: String!, $accession: [String!], $experiments: [String!]) {
    cCREQuery(assembly: $assembly, accession: $accession) {
      group
      zScores(experiments: $experiments) {
        experiment
        score
      }
    }
  }
`

const MAXZ_QUERY = gql`
  query cCRE($assembly: String!, $accession: [String!]) {
    cCREQuery(assembly: $assembly, accession: $accession) {
      group
      dnase: maxZ(assay: "dnase")
      h3k4me3: maxZ(assay: "h3k4me3")
      h3k27ac: maxZ(assay: "h3k27ac")
      ctcf: maxZ(assay: "ctcf")
    }
  }
`

const biosampleExperiments = (x) => [x.dnase, x.h3k4me3, x.h3k27ac, x.ctcf].filter((xx) => !!xx)

const MARKS = ["DNase", "H3K4me3", "H3K27ac", "CTCF"]
const marks = (x) => [x.dnase, x.h3k4me3, x.h3k27ac, x.ctcf].map((x, i) => x && MARKS[i]).filter((xx) => !!xx)

const CCRETooltip = (props) => {
  const experiments = useMemo(
    () => (props.biosample ?  biosampleExperiments(props.biosample)  : ["dnase", "h3k4me3", "h3k27ac", "ctcf"]),
    [props]
  )
  const { data, loading } = useQuery(props.biosample ? QUERY : MAXZ_QUERY, {
    variables: {
      assembly: props.assembly,
      accession: props.name,
      experiments,
    },
    client
  })
  return (
    <div style={{ border: "1px solid", padding: "0.75em", background: "#ffffff" }}>
      {loading || !data.cCREQuery[0] ? (
        <CircularProgress/>
      ) : (
        <>
          <svg height={18}>
            <rect width={10} height={10} y={3} fill={COLORS.get(data.cCREQuery[0].group || "") || "#06da93"} />
            <text x={16} y={12}>
              {props.name} ⸱ {GROUPS.get(data.cCREQuery[0].group || "")}
            </text>
          </svg>
          Click for details about this cCRE
          <br />
          <br />
          <strong>{props.biosample ? "Z-scores in " + props.biosample.name : "Max Z-scores across all biosamples:"}</strong>
          <br />
          {(props.biosample ? marks(props.biosample) : MARKS).map((x, i) => (
            <React.Fragment key={i}>
              <strong>{x}</strong>:{" "}
              {props.biosample
                ? data.cCREQuery[0].zScores.find((xx) => xx.experiment === experiments[i]).score.toFixed(2)
                : data.cCREQuery[0][experiments[i]].toFixed(2)}
              <br />
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  )
}
export default CCRETooltip
