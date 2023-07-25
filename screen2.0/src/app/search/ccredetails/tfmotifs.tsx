"use client"
import React, { useMemo, useState, useRef, useCallback, useEffect } from "react"
import Grid2 from "../../../common/mui-client-wrappers/Grid2"
import {  RulerTrack, GenomeBrowser, EmptyTrack, SquishBigBed } from "umms-gb";
import Controls from "../gbview/controls";
import { gql, useQuery } from "@apollo/client";
import CytobandView, { GenomicRange } from "../gbview/cytobandview"
import EGeneTracks from "../gbview/egenetracks";
import {TfMotifTrack} from "../gbview/tfmotiftrack"
import { client } from "../ccredetails/client"
//import ImportanceTrack from "../gbview/importancetrack"
type TfMotifsProps = {
    coordinates : {
        start: number,
        end: number,
        chromosome?: string 
    },
    assembly: string
}
const GENE_QUERY = gql`
  query s(
    $chromosome: String
    $start: Int
    $end: Int
    $assembly: String!
  ) {
   
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
  gene: {
    name: string;
    strand: string;
    transcripts: Transcript[];
  }[];
};
export function expandCoordinates(coordinates, l = 20000) {
    return {
      chromosome: coordinates.chromosome,
      start: coordinates.start - l < 0 ? 0 : coordinates.start - l,
      end: coordinates.end + l,
    }
  }
  const DATA_QUERY = `
query q($requests: [BigRequest!]!) {
    bigRequests(requests: $requests) {
        data
    }
}
`

export const TfMotifs: React.FC<TfMotifsProps> = (props) =>{
    const svgRef = useRef<SVGSVGElement>(null);
    
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(true)
    const [mousedOver, setMousedOver] = useState(null)
    const [coordinates, setCoordinates] = useState<GenomicRange>(props.coordinates);    
    
    const snpResponse = useQuery<SNPQueryResponse>(GENE_QUERY, {
        variables: { ...coordinates,  assembly:props.assembly },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        client,
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
        [coordinates,props.coordinates]
      );
      useEffect(() => {
        fetch("https://ga.staging.wenglab.org/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            query: DATA_QUERY,
            variables: {
              requests: [
                {
                  url: "gs://gcp.wenglab.org/SCREEN/all-sites.sorted.formatted.bigBed",
                  chr1: coordinates.chromosome,
                  start: coordinates.start,
                  chr2: coordinates.chromosome,
                  end:  coordinates.end
                },
              ],
            },
          }),
        })
          .then((x) => x.json())
          .then((x) => {
            setData(x.data.bigRequests[0].data.filter((x) => x.name.split("$")[3] === "True"))
            setLoading(false)
          })
      }, [coordinates])
    return(<><Grid2 container sx={{ ml: "12rem",mr: "10rem", mb: "1rem" }}>
    <Grid2 xs={12} lg={12}>
    <br/>
        <CytobandView
          innerWidth={1000}
          height={15}
          chromosome={coordinates.chromosome!}
          assembly={props.assembly==="mm10" ? "mm10" :"hg38"}
          position={coordinates}
        />
        <br />
        <div style={{ textAlign: "center" }}>
          <Controls
            onDomainChanged={onDomainChanged}
            domain={coordinates ||  props.coordinates}            
          />
        </div>
        <br />
        <br />
        <GenomeBrowser
        svgRef={svgRef}
        domain={coordinates}
        innerWidth={1400}
        width="100%"
        noMargin
        onDomainChanged={(x) => {
          if (Math.ceil(x.end) - Math.floor(x.start) > 10) {
            setCoordinates({
              chromosome: coordinates.chromosome,
              start: Math.floor(x.start),
              end: Math.ceil(x.end),
            });
          }
        }}
      >
        <RulerTrack
          domain={coordinates}
          height={30}
          width={1400}
        />
        <EGeneTracks
          genes={groupedTranscripts || []}
          expandedCoordinates={coordinates}
          squish={true}
          
        />
        {props.assembly==="GRCh38" && data && <TfMotifTrack svgRef={svgRef} data={data} assembly={props.assembly} coordinates={coordinates}/>
        }
        
      </GenomeBrowser>
       
    </Grid2>
  </Grid2></>)
}