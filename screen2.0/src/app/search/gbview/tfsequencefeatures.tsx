"use client"
import React, { useMemo, useState, useRef, useCallback, useEffect } from "react"
import Grid2 from "../../../common/mui-client-wrappers/Grid2"
import { RulerTrack, GenomeBrowser } from "umms-gb"
import Controls from "./controls"
import { gql, useQuery } from "@apollo/client"
import CytobandView, { GenomicRange } from "./cytobandview"
import EGeneTracks from "./egenetracks"
import { client } from "../ccredetails/client"
import { TfMotifTrack } from "./tfmotiftrack"
import { DenseBigBed, EmptyTrack, FullBigWig } from "umms-gb"

type TfSequenceFeaturesProps = {
  coordinates: {
    start: number
    end: number
    chromosome?: string
  }
  assembly: string
}
const GENE_QUERY = gql`
  query s($chromosome: String, $start: Int, $end: Int, $assembly: String!) {
    gene(chromosome: $chromosome, start: $start, end: $end, assembly: $assembly) {
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
`
export type Transcript = {
  id: string
  name: string
  strand: string
  coordinates: GenomicRange
}
export type SNPQueryResponse = {
  gene: {
    name: string
    strand: string
    transcripts: Transcript[]
  }[]
}
export function expandCoordinates(coordinates, l = 0) {
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

export const TfSequenceFeatures: React.FC<TfSequenceFeaturesProps> = (props) => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const svgRef = useRef<SVGSVGElement>(null)
  const expandedCoordinates = useMemo(() => expandCoordinates(props.coordinates), [props.coordinates])
  const [coordinates, setCoordinates] = useState<GenomicRange>(expandedCoordinates)
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
              end: coordinates.end
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
  console.log(data,'data')
  const snpResponse = useQuery<SNPQueryResponse>(GENE_QUERY, {
    variables: { ...coordinates, assembly: props.assembly },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  const groupedTranscripts = useMemo(
    () =>
      snpResponse.data?.gene.map((x) => ({
        ...x,
        transcripts: x.transcripts.map((xx) => ({
          ...xx,
          color: "#aaaaaa",
        })),
      })),
    [snpResponse]
  )
  const onDomainChanged = useCallback(
    (d: GenomicRange) => {
      const chr = d.chromosome === undefined ? props.coordinates.chromosome : d.chromosome
      const start = Math.round(d.start)
      const end = Math.round(d.end)
      if (end - start > 10) {
        setCoordinates({ chromosome: chr, start, end })
      }
    },
    [props.coordinates]
  )
  return (
    <>
      <Grid2 container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
        <Grid2 xs={12} lg={12}>
          <br />
          <CytobandView innerWidth={1000} height={15} chromosome={coordinates.chromosome!} assembly={props.assembly!=="mm10"? "hg38": "mm10"} position={coordinates} />
          <br />
          <div style={{ textAlign: "center" }}>
            <Controls onDomainChanged={onDomainChanged} domain={coordinates || props.coordinates} />
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
                })
              }
            }}
          >
            <RulerTrack domain={coordinates} height={30} width={1400} />
            <EGeneTracks
              genes={groupedTranscripts || []}
              expandedCoordinates={coordinates}
              squish={true}
            />
            {!loading && data && props.assembly!=="mm10" && <TfMotifTrack width={1400} data={data} svgRef={svgRef} coordinates={coordinates}/>}
            
          </GenomeBrowser>
        </Grid2>
      </Grid2>
    </>
  )
}
