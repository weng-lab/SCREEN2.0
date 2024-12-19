import { gql, useQuery } from "@apollo/client"
import React, { useEffect, useMemo } from "react"
import { CircularProgress } from "@mui/material"
import { client } from "../_ccredetails/client"
import { GROUP_COLOR_MAP } from "../_ccredetails/utils"

interface CCRETooltipProps {
  assembly: string
  name: string
  biosample?: {
    displayname?: string
    dnase?: string
    h3k4me3?: string
    h3k27ac?: string
    ctcf?: string
    atac?: string
    name?: string
  }
}

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

const CCRETooltip: React.FC<CCRETooltipProps> = ({ assembly, name, biosample }) => {
  const experiments = useMemo(
    () => (biosample ? biosampleExperiments(biosample) : ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"]),
    [biosample]
  )

  const { data, loading, error } = useQuery(biosample ? QUERY : MAXZ_QUERY, {
    variables: {
      assembly,
      accession: name,
      experiments,
    },
    client,
  })

  return (
    <div style={{
      border: "1px solid",
      padding: "0.75em",
      background: "#ffffff",
      maxWidth: "400px",
      width: "max-content",
      overflowY: "visible",
      whiteSpace: "normal",
      height: "auto",
      minHeight: loading || !data?.cCREQuery?.[0] ? "40px" : "auto"
    }}>
      <div style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        width: "max-content",
        minWidth: "300px",
        alignItems: "baseline",
        minHeight: "205px",
        height: "auto",
        transition: "all 0.2s ease-in-out"
      }}>
        {loading || !data?.cCREQuery?.[0] ? (
          <CircularProgress />
        ) : (
          <div>
            <svg height={18}>
              <rect
                width={10}
                height={10}
                y={3}
                fill={GROUP_COLOR_MAP.get(data.cCREQuery[0].group)?.split(":")[1] || "#8c8c8c"}
              />
              <text x={16} y={12}>
                {name}
              </text>
            </svg>
            <div>{GROUP_COLOR_MAP.get(data.cCREQuery[0].group)?.split(":")[0]}</div>
            Click for details about this cCRE
            <br />
            <strong>{biosample ? "Z-scores in " + biosample.displayname : "Max Z-scores across all biosamples:"}</strong>
            {(biosample ? marks(biosample) : MARKS).map((x, i) => {
              return (
                <div key={i} style={{ display: "flex", flexDirection: "row", justifyContent: "left", width: "100%" }}>
                  <strong>{x}</strong>:{" "}
                  {biosample
                    ? data.cCREQuery[0].zScores.find((xx) => xx.experiment === experiments[i]).score.toFixed(2)
                    : data.cCREQuery[0][experiments[i]].toFixed(2)}
                  <br />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  )
}
export default CCRETooltip

// useEffect(() => {
//   if (data?.cCREQuery?.[0]) {
//     console.log('Data loaded:', data.cCREQuery[0]);
//   }
// }, [data]);

// return (
//   <div style={{
//     border: "1px solid",
//     padding: "0.75em",
//     background: "#ffffff",
//     maxWidth: "400px",
//     width: "max-content",
//     overflowY: "visible",
//     whiteSpace: "normal",
//     height: "auto",
//     minHeight: loading || !data?.cCREQuery?.[0] ? "40px" : "auto"
//   }}>
//     <div style={{
//       display: "flex",
//       flexDirection: "column",
//       justifyContent: "flex-start",
//       width: "max-content",
//       minWidth: "300px",
//       alignItems: "baseline",
//       height: "100%",
//       transition: "all 0.2s ease-in-out"
//     }}>
//       {loading || !data?.cCREQuery?.[0] ? (
//         <CircularProgress />
//       ) : (
//         <div>
//           <svg height={18}>
//             <rect
//               width={10}
//               height={10}
//               y={3}
//               fill={GROUP_COLOR_MAP.get(data.cCREQuery[0].group)?.split(":")[1] || "#8c8c8c"}
//             />
//             <text x={16} y={12}>
//               {props.name}
//             </text>
//           </svg>
//           <div>{GROUP_COLOR_MAP.get(data.cCREQuery[0].group)?.split(":")[0]}</div>

//           <br />
//           <br />
//           Click for details about this cCRE
//           <br />
//           <br />
//           <strong>{props.biosample ? "Z-scores in " + props.biosample.name : "Max Z-scores across all biosamples:"}</strong>
//           <br />
//           {(props.biosample ? marks(props.biosample) : MARKS).map((x, i) => {
//             return (
//               <div key={i} style={{ display: "flex", flexDirection: "row", justifyContent: "left", width: "100%" }}>
//                 <strong>{x}</strong>:{" "}
//                 {props.biosample
//                   ? data.cCREQuery[0].zScores.find((xx) => xx.experiment === experiments[i]).score.toFixed(2)
//                   : data.cCREQuery[0][experiments[i]].toFixed(2)}
//                 <br />
//               </div>
//             );
//           })}
//         </div>
//       )}
//     </div>
//   </div>