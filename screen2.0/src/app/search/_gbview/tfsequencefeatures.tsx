"use client"
import React, { useMemo, useState, useRef, useCallback, useEffect } from "react"
import Grid from "@mui/material/Grid"
import { RulerTrack, GenomeBrowser } from "umms-gb"
import Controls from "./controls"
import { gql, useQuery } from "@apollo/client"
import CytobandView, { GenomicRange } from "./cytobandview"
import EGeneTracks from "./egenetracks"
import { client } from "../_ccredetails/client"
import { TfMotifTrack } from "./tfmotiftrack"
import { EmptyTrack, FullBigWig } from "umms-gb"
import { GraphQLImportanceTrack } from "bpnet-ui"
import { BigQueryResponse } from "./types"
import { BIG_QUERY } from "./queries"
import { BigWigData } from "bigwig-reader"
type TfSequenceFeaturesProps = {
  coordinates: {
    start: number
    end: number
    chromosome?: string
  }
  assembly: string
}
const GENE_QUERY = gql`
  query s_1($chromosome: String, $start: Int, $end: Int, $assembly: String!, $version: Int) {
    gene(chromosome: $chromosome, start: $start, end: $end, assembly: $assembly, version: $version) {
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
  const [settingsMousedOver, setSettingsMousedOver] = useState(false)
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
  const url = props.assembly==="GRCh38" ?"gs://gcp.wenglab.org/241-mammalian-2020v2.bigWig" : "gs://gcp.wenglab.org/mm10.phylop.bigWig"
  const { data: sequenceData, loading: sequenceLoading } = useQuery<BigQueryResponse>(BIG_QUERY, {
    variables: { bigRequests: [{
      url,
      chr1: coordinates.chromosome,
      start: coordinates.start,
      chr2: coordinates.chromosome,
      end: coordinates.end
    }] },
    client,
 })
 //sequenceData?.bigRequests array
  const snpResponse = useQuery<SNPQueryResponse>(GENE_QUERY, {
    variables: { ...coordinates, assembly: props.assembly,version: props.assembly.toLowerCase()==="grch38" ? 40: 25 },
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
  const l = useCallback((c) => ((c - coordinates.start) * 1400) / (coordinates.end - coordinates.start), [coordinates])
  
  return (<>
    <Grid container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
      <Grid
        size={{
          xs: 12,
          lg: 12
        }}>
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
          <>
          {(props.coordinates.start  > coordinates.start  || props.coordinates.end < coordinates.end   ) &&
            <rect key={"tfseq"} fill="#FAA4A4" fillOpacity={0.8} height={3500} x={l(props.coordinates.start)} width={l(props.coordinates.end) - l(props.coordinates.start)} />
          }
          </>
          <EGeneTracks
            genes={groupedTranscripts || []}
            expandedCoordinates={coordinates}
            squish={true}
          />
          {!loading && data && props.assembly!=="mm10" && <TfMotifTrack width={1400} data={data} svgRef={svgRef} coordinates={coordinates}/>}
          <g>
          <EmptyTrack height={40} width={1400} text={`Sequence Importance (${url})`} transform="" id="" />
          {coordinates.end - coordinates.start < 5000  ? <g transform="translate(0,30)"><GraphQLImportanceTrack
        width={1400}
        height={140}
        
        endpoint="https://ga.staging.wenglab.org"
        signalURL={url}
        sequenceURL={props.assembly==="GRCh38" ?"gs://gcp.wenglab.org/hg38.2bit" :"gs://gcp.wenglab.org/mm10.2bit"}
        coordinates={{ chromosome: coordinates.chromosome!, start: coordinates.start, end: coordinates.end }}
        key={`${coordinates.chromosome}:${coordinates.start}-${coordinates.end}-${url}`}
      /></g>:   
      <FullBigWig
      width={1400}
      height={140}
      domain={coordinates}
      id={url}
      transform="translate(0,40)"        
      data={sequenceData?.bigRequests[0].data as BigWigData[]}
      noTransparency
    />}
    {settingsMousedOver && (
      <rect width={ 1400} height={150} transform="translate(0,0)" fill="#0000ff" fillOpacity={0.1} />
    )}
      <rect transform="translate(0,0)" height={150} width={40} fill="#ffffff" />
      <rect
      height={150}
      width={15}
      fill="#0000ff"
      stroke="#000000"        
      fillOpacity={settingsMousedOver ? 1 : 0.6}
      onMouseOver={() => setSettingsMousedOver(true)}
      onMouseOut={() => setSettingsMousedOver(false)}
      strokeWidth={1}
      transform="translate(20,0)"
    />
    <text transform={`rotate(270) translate(-${100 / 2 + 60},12)`} fill="#0000ff">
      Sequence
    </text>
    </g>
          
        </GenomeBrowser>
      </Grid>
    </Grid>
  </>);
}
