"use client"
import React, { useMemo, useState, useRef, useCallback, useEffect } from "react"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { RulerTrack, GenomeBrowser } from "umms-gb"
import Controls from "./controls"
import { gql, useQuery } from "@apollo/client"
import CytobandView, { GenomicRange } from "./cytobandview"
import EGeneTracks from "./egenetracks"
import { client } from "../_ccredetails/client"
import DefaultTracks from "./defaulttracks"
import { BiosampleTracks } from "./biosampletracks"
type GenomeBrowserViewProps = {
  coordinates: {
    start: number
    end: number
    chromosome?: string
  }
  biosample?: string
  biosampledisplayname?: string
  gene?: string
  accessions?: {accession: string, chromosome: string, start: number, end: number}[]
  assembly: string
  handlecCREClickInTrack?: (newcCRE: {accession: string, chromosome: string, start: number, end: number}) => void
}

const BIOSAMPLE_QUERY = gql`
  query biosamples {
    human: ccREBiosampleQuery(assembly: "grch38") {
      biosamples {
        name
        dnase: experimentAccession(assay: "DNase")
        h3k4me3: experimentAccession(assay: "H3K4me3")
        h3k27ac: experimentAccession(assay: "H3K27ac")
        ctcf: experimentAccession(assay: "CTCF")        
        dnase_signal: fileAccession(assay: "DNase")
        h3k4me3_signal: fileAccession(assay: "H3K4me3")
        h3k27ac_signal: fileAccession(assay: "H3K27ac")
        ctcf_signal: fileAccession(assay: "CTCF")
        
      }
    }
    mouse: ccREBiosampleQuery(assembly: "mm10") {
      biosamples {
        name
        dnase: experimentAccession(assay: "DNase")
        h3k4me3: experimentAccession(assay: "H3K4me3")
        h3k27ac: experimentAccession(assay: "H3K27ac")
        ctcf: experimentAccession(assay: "CTCF")        
        dnase_signal: fileAccession(assay: "DNase")
        h3k4me3_signal: fileAccession(assay: "H3K4me3")
        h3k27ac_signal: fileAccession(assay: "H3K27ac")
        ctcf_signal: fileAccession(assay: "CTCF")
        
      }
    }
  }
`
const GENE_QUERY = gql`
  query s($chromosome: String, $start: Int, $end: Int, $assembly: String!, $version: Int) {
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
export function expandCoordinates(coordinates, l = 20000) {
  return {
    chromosome: coordinates.chromosome,
    start: coordinates.start - l < 0 ? 0 : coordinates.start - l,
    end: coordinates.end + l,
  }
}

export const GenomeBrowserView: React.FC<GenomeBrowserViewProps> = (props) => {
  
  const svgRef = useRef<SVGSVGElement>(null)
  const expandedCoordinates = useMemo(() => expandCoordinates(props.coordinates), [props.coordinates])
  const [coordinates, setCoordinates] = useState<GenomicRange>(expandedCoordinates)
  const [highlight, setHighlight] = useState(null)
  
  const [cTracks, setTracks] = useState<[string, string, string][] | null>(null)
  const snpResponse = useQuery<SNPQueryResponse>(GENE_QUERY, {
    variables: { ...coordinates, assembly: props.assembly, version: props.assembly.toLowerCase()==="grch38" ? 40 : 25  },
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
          color: props.gene ? (x.name.includes(props.gene) ? "#880000" : "#aaaaaa") : "#aaaaaa",
        })),
      })),
    [snpResponse, props.gene]
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

  const { loading: bloading, data: bdata } = useQuery(BIOSAMPLE_QUERY, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  useEffect(() => {
    if (bdata && props.biosample) {
      const humanBiosamples = bdata && bdata.human && bdata.human.biosamples
      const mouseBiosamples = bdata && bdata.mouse && bdata.mouse.biosamples

      const result =
        props.assembly === "mm10"
          ? mouseBiosamples.find((m) => m.name === props.biosample)
          : humanBiosamples.find((m) => m.name === props.biosample)
      const r = [result.dnase_signal, result.h3k4me3_signal, result.h3k27ac_signal, result.ctcf_signal].filter((x) => !!x)
      
      //copy v4 bed files to google bucket
      const bigBedUrl = `https://downloads.wenglab.org/Registry-V4/${r.join("_")}.bigBed`
      let tracks: [string, string, string][] = [[`cCREs colored by activity in ${props.biosampledisplayname}`, bigBedUrl, ""]]
      if (result.dnase_signal)
        tracks.push([
          `DNase-seq signal in ${props.biosampledisplayname}`,
          `https://www.encodeproject.org/files/${result.dnase_signal}/@@download/${result.dnase_signal}.bigWig`,
          "DNase",
        ])
      if (result.h3k4me3_signal)
        tracks.push([
          `H3K4me3 ChIP-seq signal in ${props.biosampledisplayname}`,
          `https://www.encodeproject.org/files/${result.h3k4me3_signal}/@@download/${result.h3k4me3_signal}.bigWig`,
          "H3K4me3",
        ])
      if (result.h3k27ac_signal)
        tracks.push([
          `H3K27ac ChIP-seq signal in ${props.biosampledisplayname}`,
          `https://www.encodeproject.org/files/${result.h3k27ac_signal}/@@download/${result.h3k27ac_signal}.bigWig`,
          "H3K27ac",
        ])
      if (result.ctcf_signal)
        tracks.push([
          `CTCF ChIP-seq signal in ${props.biosampledisplayname}`,
          `https://www.encodeproject.org/files/${result.ctcf_signal}/@@download/${result.ctcf_signal}.bigWig`,
          "CTCF",
        ])
      setTracks(tracks)
    }
  }, [bdata, props.biosample,props.assembly])
  
  return (
    <>
      <Grid2 container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
        <Grid2 xs={12} lg={12}>
          <br />
          <CytobandView innerWidth={1000} height={15} chromosome={coordinates.chromosome!} assembly={props.assembly!=="mm10" ?"hg38" : "mm10"} position={coordinates} />
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
            {highlight && (
              <rect fill="#8ec7d1" fillOpacity={0.5} height={900} x={l(highlight.start)} width={l(highlight.end) - l(highlight.start)} />
            )}
            <>
             {props.accessions && props.accessions.map((a)=>(
              <rect key={a.accession} fill="#FAA4A4" fillOpacity={0.5} height={900} x={l(a.start)} width={l(a.end) - l(a.start)} />
            ))}
            </>
            <EGeneTracks
              genes={groupedTranscripts || []}
              expandedCoordinates={coordinates}
              squish={true}
            />
            <DefaultTracks
              assembly={props.assembly}
              domain={coordinates}
              oncCREClicked={(x)=>{              
              props.handlecCREClickInTrack && props.handlecCREClickInTrack({ accession: x.name, chromosome: x.coordinates.chromosome,start: x.coordinates.start,end: x.coordinates.end })
              }}
              oncCREMousedOver={(x) => x && setHighlight(x)}              
              oncCREMousedOut={() => setHighlight(null)}
            />
            {props.biosample && props.assembly != "mm10" && cTracks && (
              <BiosampleTracks
                assembly={props.assembly}
                biosample={props.biosample}
                domain={coordinates}
                tracks={cTracks}
                oncCREMousedOver={(x) => x && setHighlight(x)}              
                oncCREMousedOut={() => setHighlight(null)}
                oncCREClicked={(x)=>{              
                  props.handlecCREClickInTrack && props.handlecCREClickInTrack({ accession: x.name, chromosome: x.coordinates.chromosome,start: x.coordinates.start,end: x.coordinates.end })
                  }}
              />
            )}
          </GenomeBrowser>
        </Grid2>
      </Grid2>
    </>
  )
}
