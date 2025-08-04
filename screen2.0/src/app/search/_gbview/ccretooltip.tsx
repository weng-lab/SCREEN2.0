import { gql, useQuery } from "@apollo/client";
import React, { useEffect, useMemo } from "react";
import { CircularProgress } from "@mui/material";
import { client } from "../_ccredetails/client";
import { GROUP_COLOR_MAP } from "../_ccredetails/utils";

interface CCRETooltipProps {
  assembly: string;
  name: string;
  biosample?: {
    displayname?: string;
    dnase?: string;
    h3k4me3?: string;
    h3k27ac?: string;
    ctcf?: string;
    atac?: string;
    name?: string;
  };
}

const QUERY = gql`
  query cCRE_1(
    $assembly: String!
    $accession: [String!]
    $experiments: [String!]
  ) {
    cCREQuery(assembly: $assembly, accession: $accession) {
      group
      zScores(experiments: $experiments) {
        experiment
        score
      }
    }
  }
`;

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
`;

const biosampleExperiments = (x) =>
  [x.dnase, x.h3k4me3, x.h3k27ac, x.ctcf, x.atac].filter((xx) => !!xx);

const MARKS = ["DNase", "H3K4me3", "H3K27ac", "CTCF", "ATAC"];
const marks = (x) =>
  [x.dnase, x.h3k4me3, x.h3k27ac, x.ctcf, x.atac]
    .map((x, i) => x && MARKS[i])
    .filter((xx) => !!xx);

const CCRETooltip: React.FC<CCRETooltipProps> = ({
  assembly,
  name,
  biosample,
}) => {
  const experiments = useMemo(
    () =>
      biosample
        ? biosampleExperiments(biosample)
        : ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"],
    [biosample]
  );

  const { data, loading, error } = useQuery(biosample ? QUERY : MAXZ_QUERY, {
    variables: {
      assembly,
      accession: name,
      experiments,
    },
    client,
  });

  const width = 400;
  const height = loading || !data?.cCREQuery?.[0] ? 40 : 210;
  const padding = 16;
  const lineHeight = 20;
  const startY = padding + 35;

  return (
    <svg width={width} height={height}>
      {/* Background rectangle with nice border */}
      <rect
        width={width}
        height={height}
        fill="#ffffff"
        stroke="#000000"
        strokeWidth="2"
        rx="4"
        ry="4"
      />

      {loading || !data?.cCREQuery?.[0] ? (
        <g>
          {/* Loading indicator - simplified circle */}
          <circle
            cx={width / 2}
            cy={height / 2}
            r="8"
            fill="none"
            stroke="#1976d2"
            strokeWidth="2"
            strokeDasharray="12.57"
            strokeDashoffset="0"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 50 50;360 50 50"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </g>
      ) : (
        <g>
          {/* cCRE group color indicator */}
          <rect
            x={padding}
            y={padding + 3}
            width={10}
            height={10}
            fill={
              GROUP_COLOR_MAP.get(data.cCREQuery[0].group)?.split(":")[1] ||
              "#8c8c8c"
            }
          />

          {/* cCRE name */}
          <text
            x={padding + 16}
            y={padding + 12}
            fontSize="24"
            fontFamily="Arial, sans-serif"
            fill="#000000"
          >
            {name}
          </text>

          {/* cCRE group type */}
          <text
            x={padding}
            y={startY}
            fontSize="21"
            fontFamily="Arial, sans-serif"
            fill="#000000"
          >
            {GROUP_COLOR_MAP.get(data.cCREQuery[0].group)?.split(":")[0]}
          </text>

          {/* Click instruction */}
          <text
            x={padding}
            y={startY + lineHeight}
            fontSize="19"
            fontFamily="Arial, sans-serif"
            fill="#666666"
          >
            Click for details about this cCRE
          </text>

          {/* Header text */}
          <text
            x={padding}
            y={startY + lineHeight * 2.5}
            fontSize="19"
            fontFamily="Arial, sans-serif"
            fontWeight="bold"
            fill="#000000"
          >
            {biosample
              ? "Z-scores in " + biosample.displayname
              : "Max Z-scores across all biosamples:"}
          </text>

          {/* Z-scores data */}
          {(biosample ? marks(biosample) : MARKS).map((mark, i) => {
            const y = startY + lineHeight * (3.5 + i);
            const score = biosample
              ? data.cCREQuery[0].zScores
                  .find((xx) => xx.experiment === experiments[i])
                  ?.score.toFixed(2)
              : data.cCREQuery[0][experiments[i]]?.toFixed(2);

            return (
              <g key={i}>
                <text
                  x={padding}
                  y={y}
                  fontSize="19"
                  fontFamily="Arial, sans-serif"
                  fontWeight="bold"
                  fill="#000000"
                >
                  {mark}:
                </text>
                <text
                  x={padding + 120}
                  y={y}
                  fontSize="19"
                  fontFamily="Arial, sans-serif"
                  fill="#000000"
                >
                  {score}
                </text>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};
export default CCRETooltip;
