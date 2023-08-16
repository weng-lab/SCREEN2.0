import React, { useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
import { Cytobands } from "umms-gb";
import { Grid } from "@mui/material";
import { client } from "../ccredetails/client"
export type GenomicRange = {
    chromosome?: string;
    start: number;
    end: number;
  };
  
const CYTOBAND_QUERY = gql`
  query cytobands($assembly: String!, $chromosome: String) {
    cytoband(assembly: $assembly, chromosome: $chromosome) {
      stain
      coordinates {
        chromosome
        start
        end
      }
    }
  }
`;

export type CytobandQueryResponse = {
  cytoband: {
    stain: string;
    coordinates: {
      chromosome: string;
      start: number;
      end: number;
    };
  }[];
};

export type CytobandsProps = {
  assembly: string;
  chromosome: string;
  innerWidth: number;
  height: number;
  position?: GenomicRange;
};

const CytobandView: React.FC<CytobandsProps> = (props) => {
  const { loading, data } = useQuery<CytobandQueryResponse>(CYTOBAND_QUERY, {
    variables: {
      assembly: props.assembly,
      chromosome: props.chromosome,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  });
  const domain = useMemo(
    () =>
      data && {
        start: 0,
        end: Math.max(
          ...(data.cytoband.length === 0
            ? [1]
            : data.cytoband.map((x) => x.coordinates.end))
        ),
      },
    [data]
  );
  return loading || !data ? null : (
    <Grid container>
      <Grid item sm={2} md={2} lg={2} xl={2} />
      <Grid item sm={8} md={8} lg={8} xl={8}>
        <svg width="100%" viewBox={`0 0 ${props.innerWidth} ${props.height}`}>
          <Cytobands
            highlight={
              props.position && { ...props.position, color: "#0000ff" }
            }
            data={data.cytoband}
            domain={domain || { start: 0, end: 1 }}
            width={props.innerWidth}
            height={props.height}
            id="cytobands"
          />
        </svg>
      </Grid>
      <Grid item sm={2} md={2} lg={2} xl={2}>
        <strong>
          {props.assembly}:{props.chromosome}
        </strong>
      </Grid>
    </Grid>
  );
};
export default CytobandView;
