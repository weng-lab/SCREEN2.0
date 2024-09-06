import {  useQuery } from "@apollo/client"
import { BigBedData } from "bigwig-reader"
import React, { RefObject, useEffect, useMemo, useState } from "react"
import { DenseBigBed, EmptyTrack } from "umms-gb"
import { client } from "./client"
import { BIG_QUERY } from "../_gbview/queries"
import { GenomicRange, BigQueryResponse, BigResponseData } from "../_gbview/types"



export const stateDetails = {
    ['TssFlnk'] : { description: "Flanking TSS", stateno: "E1", color: "#FF4500" },
    ['TssFlnkD'] : { description: "Flanking TSS downstream", stateno: "E2", color: "#FF4500"},
    ['TssFlnkU'] : { description: "Flanking TSS upstream", stateno: "E3", color: "#FF4500" },
    ['Tss'] : { description: "Active TSS", stateno: "E4", color: "#FF0000" },
    ['Enh1'] : { description: "Enhancer", stateno: "E5", color: "#FFDF00" },
    ['Enh2'] : { description: "Enhancer", stateno: "E6", color:"#FFDF00"  },
    ['EnhG1'] : { description: "Enhancer in gene", stateno: "E7", color: "#AADF07" },
    ['EnhG2'] : { description: "Enhancer in gene", stateno: "E8", color: "#AADF07" },
    ['TxWk'] : { description: "Weak transcription", stateno: "E9", color: "#3F9A50" },
    ['Biv'] : { description: "Bivalent", stateno: "E10" , color: "#CD5C5C" },
    ['ReprPC'] : { description: "Repressed by Polycomb", stateno: "E11", color:  "#8937DF" },
    ['Quies'] : { description: "Quiescent", stateno: "E12", color: "#DCDCDC"  },
    ['Het'] : { description: "Heterochromatin", stateno: "E13", color:  "#4B0082"  },
    ['ZNF/Rpts'] : { description: "ZNF genes repreats", stateno: "E14", color:  "#68cdaa"},
    ['Tx'] : { description: "Transcription", stateno: "E15", color:"#008000"  },

}

type HumanChromHmmTracksProps = {
  domain: GenomicRange
  onHeightChanged?: (i: number) => void
  tracks: [string,string, string][]
  tissue: string
  color: string
  svgRef?: RefObject<SVGSVGElement>
  assembly: string
}
  

const BigbedTrack: React.FC<{
  data: BigResponseData
  url: string
  height: number
  transform?: string
  onHeightChanged?: (height: number) => void
  domain: GenomicRange
  svgRef?: React.RefObject<SVGSVGElement>
  biosample?: string
}> = ({
  data,  
  url,  
  height,
  domain,
  transform,
  onHeightChanged,
  svgRef,
  biosample
}) => {
  
  useEffect(() => onHeightChanged && onHeightChanged(height + 40), [height, onHeightChanged])
  return (
    <g transform={transform}>      
      
        <DenseBigBed
          width={1400}
          height={height}
          domain={domain}
          id={url}
          transform="translate(0,20)"
          data={data as BigBedData[]}
          svgRef={svgRef}
          tooltipContent={(rect) => <div style={{ border: "1px solid", padding: "0.75em", background: "#ffffff" }}>
            <b>{stateDetails[rect.name].description}{"("+stateDetails[rect.name].stateno+")"}</b>{"\n"}{rect.name}<br/><br/>{biosample}
          </div>          
          }
        />
       
    </g>
  )
}

export const HumanChromHmmTracks: React.FC<HumanChromHmmTracksProps> = (props) => {
  const [cTracks, setTracks] = useState<[string, string, string][]>(props.tracks)
  const height = useMemo(() => (cTracks.length * 10)+30, [cTracks])
  const bigRequests = useMemo(
    () =>
      cTracks.map((x) => ({
        chr1: props.domain.chromosome!,
        start: props.domain.start,
        end: props.domain.end,
        preRenderedWidth: 1400,
        url: x[2],
      })),
    [cTracks, props]
  )
  const { data, loading } = useQuery<BigQueryResponse>(BIG_QUERY, {
    variables: { bigRequests },
    client,
  })

  useEffect(() => {    
    props.onHeightChanged && props.onHeightChanged(height)
    
    
  }, [props.onHeightChanged, height, props])


  const [settingsMousedOver, setSettingsMousedOver] = useState(false)

  return loading || (data?.bigRequests.length===0)  ? (
    <EmptyTrack width={1400} height={20} transform="" id="" text="Loading..." />
  ) : (
    <>
    <EmptyTrack height={10} width={1400} transform="translate(0,10)" id="" text={props.tissue} />
      {(data?.bigRequests || []).map((data, i) => (
        <BigbedTrack
          key={i+props.tissue+cTracks[i][0]}          
          height={15}          
          url={cTracks[i][2]}
          biosample={cTracks[i][1]}
          domain={props.domain}          
          svgRef={props.svgRef}
          data={data.data}          
          transform={`translate(0,${i * 10})`}
          
        />
      ))}
     
      {settingsMousedOver && <rect width={1400} height={height} transform="translate(0,-0)" fill={props.color} fillOpacity={0.1} />}
      <rect transform="translate(0,0)" height={height} width={40} fill="#ffffff" />
      <rect
        height={height}
        width={15}
        fill={props.color}
        stroke={props.color}
        fillOpacity={settingsMousedOver ? 1 : 0.6}
        onMouseOver={() => setSettingsMousedOver(true)}
        onMouseOut={() => setSettingsMousedOver(false)}
        strokeWidth={1}
        transform="translate(20,0)"
      />
    </>
  )
}

