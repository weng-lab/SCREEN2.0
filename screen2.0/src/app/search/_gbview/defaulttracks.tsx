import {  useQuery } from "@apollo/client"
import { associateBy } from "queryz"
import { BigWigData, BigBedData } from "bigwig-reader"
import React, { RefObject, useEffect, useMemo, useState } from "react"
import { DenseBigBed, EmptyTrack, FullBigWig } from "umms-gb"
import { client } from "../_ccredetails/client"
import CCRETooltip from "./ccretooltip"
import { BIG_QUERY } from "./queries"
import { GenomicRange, BigQueryResponse, BigResponseData } from "./types"


export const COLOR_MAP: Map<string, string> = new Map([
  ["Aggregated DNase-seq signal, all Registry biosamples", "#06da93"],
  ["Aggregated H3K4me3 ChIP-seq signal, all Registry biosamples", "#ff0000"],
  ["Aggregated H3K27ac ChIP-seq signal, all Registry biosamples", "#ffcd00"],
  ["Aggregated CTCF ChIP-seq signal, all Registry biosamples", "#00b0d0"],
])

type DefaultTracksProps = {
  domain: GenomicRange
  onHeightChanged?: (i: number) => void
  cCREHighlight?: GenomicRange
  cCREHighlights?: Set<string>
  svgRef?: RefObject<SVGSVGElement>
  assembly: string
  oncCREClicked?: (accession: any) => void
  oncCREMousedOver?: (coordinates?: GenomicRange) => void
  onTrackLoad?: () => void;
  oncCREMousedOut?: () => void
  onSettingsClick?: () => void
}

export const TitledTrack: React.FC<{
  data: BigResponseData
  assembly: string
  url: string
  title: string
  color?: string
  height: number
  transform?: string
  onHeightChanged?: (height: number) => void
  domain: GenomicRange
  svgRef?: React.RefObject<SVGSVGElement>
  oncCREMousedOver?: (coordinates?: GenomicRange) => void
  oncCREMousedOut?: () => void
  oncCREClicked?: (name: any) => void
  cCRECoordinateMap?: any
  biosample?: string
}> = ({
  data,
  assembly,
  url,
  title,
  height,
  domain,
  transform,
  onHeightChanged,
  svgRef,
  color,
  oncCREMousedOver,
  oncCREMousedOut,
  oncCREClicked,
  cCRECoordinateMap,
  biosample,
}) => {
  
  useEffect(() => onHeightChanged && onHeightChanged(height + 40), [height, onHeightChanged])

  return (
    <g transform={transform}>
      <EmptyTrack height={40} width={1400} transform="translate(0,8)" id="" text={title} />
      {url.endsWith(".bigBed") || url.endsWith(".bigbed") ? (
        <DenseBigBed
          width={1400}
          height={height}
          domain={domain}
          id={url}
          transform="translate(0,40)"
          data={data as BigBedData[]}
          svgRef={svgRef}
          tooltipContent={(rect) => <CCRETooltip {...rect} assembly={assembly.toLowerCase()} biosample={biosample} />}
          onMouseOver={(x) => oncCREMousedOver && x.name && oncCREMousedOver(cCRECoordinateMap.get(x.name))}
          onMouseOut={oncCREMousedOut}
          onClick={(x) =>  oncCREClicked && x.name && oncCREClicked({name:x.name, coordinates: cCRECoordinateMap.get(x.name) })}
          /*onClick={(x)=>{
            console.log(x.name,pathname,createQueryString("accessions",x.name))
            router.push(`${pathname}?${createQueryString("accessions",x.name)}&page=2`)
          }}*/
        />
      ) : (
        <FullBigWig
          transform="translate(0,40)"
          width={1400}
          height={height}
          domain={domain}
          id={url}
          color={color}
          data={data as BigWigData[]}
          noTransparency
        />
      )}
    </g>
  )
}

const DefaultTracks: React.FC<DefaultTracksProps> = (props) => {
  const [cTracks, setTracks] = useState<[string, string][]>(
    props.assembly.toLowerCase() === "mm10"
      ? [
          ["All cCREs colored by group", "https://downloads.wenglab.org/mm10-cCREs.DCC.bigBed"],
          ["Aggregated DNase-seq signal, all Registry biosamples", "gs://gcp.wenglab.org/dnase.mm10.sum.bigWig"],
        ]
      : [
          ["All cCREs colored by group", "https://downloads.wenglab.org/GRCh38-cCREs.DCC.bigBed"],
          ["Aggregated DNase-seq signal, all Registry biosamples", "gs://gcp.wenglab.org/dnase.GRCh38.sum.bigWig"],
          ["Aggregated H3K4me3 ChIP-seq signal, all Registry biosamples", "gs://gcp.wenglab.org/h3k4me3.hg38.sum.bigWig"],
          ["Aggregated H3K27ac ChIP-seq signal, all Registry biosamples", "gs://gcp.wenglab.org/h3k27ac.hg38.sum.bigWig"],
          ["Aggregated CTCF ChIP-seq signal, all Registry biosamples", "gs://gcp.wenglab.org/ctcf.hg38.sum.bigWig"],
        ]
  )
  const height = useMemo(() => cTracks.length * 80, [cTracks])
  const bigRequests = useMemo(
    () =>
      cTracks.map((x) => ({
        chr1: props.domain.chromosome!,
        start: props.domain.start,
        end: props.domain.end,
        preRenderedWidth: 1400,
        url: x[1],
      })),
    [cTracks, props]
  )
  const { data, loading } = useQuery<BigQueryResponse>(BIG_QUERY, {
    variables: { bigRequests },
    client,
  })
  const cCRECoordinateMap = useMemo(
    () =>
      associateBy(
        (data && data.bigRequests && data.bigRequests[0].data) || [],
        (x: { name: string}) => x.name,
        (x: any) => ({ chromosome: x.chr, start: x.start, end: x.end })
      ),
    [data]
  )

  useEffect(()=>{
    props.onTrackLoad && props.onTrackLoad()
  },[])

  useEffect(() => {
    
    props.onHeightChanged && props.onHeightChanged(height)
    
  }, [props.onHeightChanged, height, props])

  const [settingsMousedOver, setSettingsMousedOver] = useState(false)

  return loading || (data?.bigRequests.length || 0) < 2 ? (
    <EmptyTrack width={1400} height={40} transform="" id="" text="Loading..." />
  ) : (
    <>
      <g className="default-tracks">
        <rect y={10} height={55} fill="none" width={1400} />
      </g>
      {(data?.bigRequests || []).map((data, i) => (
        <TitledTrack
          key={i}
          assembly={props.assembly}
          oncCREMousedOut={props.oncCREMousedOut}
          oncCREMousedOver={props.oncCREMousedOver}
          oncCREClicked={props.oncCREClicked}
          height={40}
          biosample={undefined}
          url={cTracks[i][1]}
          domain={props.domain}
          title={cTracks[i][0]}
          svgRef={props.svgRef}
          data={data.data}
          color={COLOR_MAP.get(cTracks[i][0])}
          transform={`translate(0,${i * 70})`}
          cCRECoordinateMap={cCRECoordinateMap}
        />
      ))}
      <g className="df-tracks">
        <rect y={110} height={55} fill="none" width={1400} />
      </g>
      {settingsMousedOver && <rect width={1400} height={height} transform="translate(0,-0)" fill="#4c1f8f" fillOpacity={0.1} />}
      <rect transform="translate(0,0)" height={height} width={40} fill="#ffffff" />
      <rect
        height={height}
        width={15}
        fill="#4c1f8f"
        stroke="#000000"
        fillOpacity={settingsMousedOver ? 1 : 0.6}
        onMouseOver={() => setSettingsMousedOver(true)}
        onMouseOut={() => setSettingsMousedOver(false)}
        strokeWidth={1}
        transform="translate(20,0)"
      />
      <text transform={`rotate(270) translate(-${height / 2},12)`} textAnchor="middle" fill="#4c1f8f">
        Aggregated signal Tracks
      </text>
    </>
  )
}
export default DefaultTracks
