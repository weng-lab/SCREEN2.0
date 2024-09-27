import { gql, useQuery } from "@apollo/client"
import React, { useMemo } from "react"
import { CircularProgress } from "@mui/material"
import { client } from "../_ccredetails/client"
import { GROUP_COLOR_MAP } from "../_ccredetails/utils"

const QUERY = gql`
  query cCRE_1($assembly: String!, $accession: [String!], $experiments: [String!]) {
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
  query cCRE_2($assembly: String!, $accession: [String!]) {
    cCREQuery(assembly: $assembly, accession: $accession) {
      group
      dnase: maxZ(assay: "dnase")
      h3k4me3: maxZ(assay: "h3k4me3")
      h3k27ac: maxZ(assay: "h3k27ac")
      ctcf: maxZ(assay: "ctcf")
      atac: maxZ(assay: "atac")
    }
  }
`

const biosampleExperiments = (x) => [x.dnase, x.h3k4me3, x.h3k27ac, x.ctcf, x.atac].filter((xx) => !!xx)

const MARKS = ["DNase", "H3K4me3", "H3K27ac", "CTCF", "ATAC"]
const marks = (x) => [x.dnase, x.h3k4me3, x.h3k27ac, x.ctcf, x.atac].map((x, i) => x && MARKS[i]).filter((xx) => !!xx)

const CCRETooltip = (props) => {
  const experiments = useMemo(
    () => (props.biosample ? biosampleExperiments(props.biosample) : ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"]),
    [props]
  )
  const { data, loading } = useQuery(props.biosample ? QUERY : MAXZ_QUERY, {
    variables: {
      assembly: props.assembly,
      accession: props.name,
      experiments,
    },
    client,
  })
  return (
    <div style={{ border: "1px solid", padding: "0.75em", background: "#ffffff" }}>
      {loading || !data.cCREQuery[0] ? (
        <CircularProgress />
      ) : (
        <>
          <svg height={18}>
            <rect width={10} height={10} y={3} fill={GROUP_COLOR_MAP.get(data.cCREQuery[0].group).split(":")[1] || "#8c8c8c"} />
            <text x={16} y={12}>
              {props.name}
            </text>
          </svg>
          {GROUP_COLOR_MAP.get(data.cCREQuery[0].group).split(":")[0]}
          
          <br/>
          <br/>
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
