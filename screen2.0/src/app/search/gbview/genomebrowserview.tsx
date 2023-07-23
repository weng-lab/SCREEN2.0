"use client"
import React, { useMemo, useState, useRef, useCallback } from "react"
import Grid2 from "../../../common/mui-client-wrappers/Grid2"
import { UCSCControls } from "umms-gb";
import { gql, useQuery } from "@apollo/client";
import CytobandView, { GenomicRange } from "./cytobandview"
import EGeneTracks from "./egenetracks";


type GenomeBrowserViewProps = {
    coordinates : {
        start: number,
        end: number,
        chromosome?: string 
    },
    assembly: string
}
const SNP_QUERY = gql`
  query s(
    $chromosome: String
    $start: Int
    $end: Int
    $coordinates: [GenomicRangeInput]
    $assembly: String!
  ) {
    snpQuery(assembly: "hg38", coordinates: $coordinates, common: true) {
      id
      coordinates {
        chromosome
        start
        end
      }
    }
    gene(
      chromosome: $chromosome
      start: $start
      end: $end
      assembly: $assembly
    ) {
      name
      strand
      transcripts {
        name
        strand
        exons {
          coordinates {
            chromosome
            start
            end
          }
        }
        coordinates {
          chromosome
          start
          end
        }
      }
    }
  }
`;  
export type Transcript = {
  id: string;
  name: string;
  strand: string;
  coordinates: GenomicRange;
};
export type SNPQueryResponse = {
  snpQuery: {
    id: string;
    coordinates: GenomicRange;
  }[];
  gene: {
    name: string;
    strand: string;
    transcripts: Transcript[];
  }[];
};

export const GenomeBrowserView: React.FC<GenomeBrowserViewProps> = (props) =>{
    const svgRef = useRef<SVGSVGElement>(null);
    const [coordinates, setCoordinates] = useState<GenomicRange>(props.coordinates);    
    
    const snpResponse = useQuery<SNPQueryResponse>(SNP_QUERY, {
        variables: { ...coordinates, coordinates: props.coordinates, assembly: "GRCh38" }
      });    
      const groupedTranscripts = useMemo(
        () =>
          snpResponse.data?.gene.map((x) => ({
            ...x,
            transcripts: x.transcripts.map((xx) => ({
              ...xx,
              color:"#aaaaaa",
            })),
          })),
        [snpResponse]
      );
      const onDomainChanged = useCallback(
        (d: GenomicRange) => {
          const chr =
            d.chromosome === undefined
              ? props.coordinates.chromosome
              : d.chromosome;
          const start = Math.round(d.start);
          const end = Math.round(d.end);
          if (end - start > 10) {
            setCoordinates({ chromosome: chr, start, end });
          }
        },
        [props.coordinates]
      );
    return(<><Grid2 container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
    <Grid2 xs={12} lg={12}>
    <br/>
        <CytobandView
          innerWidth={1000}
          height={15}
          chromosome={coordinates.chromosome!}
          assembly={"hg38"}
          position={coordinates}
        />
        <br />
        <div style={{ textAlign: "center" }}>
          <UCSCControls
            onDomainChanged={onDomainChanged}
            domain={coordinates ||  props.coordinates}
            withInput={false}
          />
        </div>
        <br />
       
    </Grid2>
  </Grid2></>)
}