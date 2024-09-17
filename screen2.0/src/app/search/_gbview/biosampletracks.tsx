import { useQuery } from "@apollo/client"
import { associateBy } from "queryz"

import React, { RefObject, useEffect, useMemo, useState } from "react"
import { EmptyTrack } from "umms-gb"
import { client } from "../_ccredetails/client"
import { TitledTrack } from "./defaulttracks"
import { BIOSAMPLE_QUERY, BIG_QUERY } from "./queries"
import { GenomicRange, BigQueryResponse } from "./types"


type BiosampleTracksProps = {
  tracks: [string, string, string][]
  biosample: string
  domain: GenomicRange
  onHeightChanged?: (i: number) => void
  cCREHighlight?: GenomicRange
  cCREHighlights?: Set<string>
  svgRef?: RefObject<SVGSVGElement>
  assembly: string
  oncCREClicked?: (clickedcCRE: {name: string, coordinates: {chromosome: string, start: number, end: number}}) => void
  oncCREMousedOver?: (coordinates?: GenomicRange) => void
  oncCREMousedOut?: () => void
  onSettingsClick?: () => void
}

export const COLOR_MAP: Map<string, string> = new Map([
  ["DNase", "#06da93"],
  ["H3K4me3", "#ff0000"],
  ["H3K27ac", "#ffcd00"],
  ["CTCF", "#00b0d0"],
])

export const BiosampleTracks: React.FC<BiosampleTracksProps> = (props) => {
  const [cTracks, setTracks] = useState<[string, string, string][]>(props.tracks)

  useEffect(() => {
    setTracks(props.tracks)
  }, [props.tracks])
  const height = useMemo(() => cTracks && cTracks.length * 80, [cTracks])
  const bigRequests = useMemo(
    () =>
      cTracks &&
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
    skip: bigRequests === null,
  })
  const { data: biosampleData, loading: biosampleDataLoading } = useQuery(BIOSAMPLE_QUERY, {
    variables: { assembly: props.assembly.toLowerCase() },
    client,
  })
  const groupedBiosamples = useMemo(
    () =>
      associateBy(
        biosampleData && biosampleData.ccREBiosampleQuery ? biosampleData.ccREBiosampleQuery.biosamples : [],
        (x: any) => x.name as any,
        (x) => x
      ),
    [biosampleData]
  )

  const cCRECoordinateMap = useMemo(
    () =>
      associateBy(
        (data && data.bigRequests && data.bigRequests[0].data as any) || [],
        (x: any) => x.name,
        (x: any) => ({ chromosome: x.chr, start: x.start, end: x.end })
      ),
    [data]
  )
  useEffect(() => {
    height && props.onHeightChanged && props.onHeightChanged(height)
  }, [props.onHeightChanged, height, props])

  const [settingsMousedOver, setSettingsMousedOver] = useState(false)

  return loading || !cTracks || !height || (data?.bigRequests.length || 0) < 2 ? (
    <EmptyTrack width={1400} height={40} transform="" id="" text="Loading..." />
  ) : (
    <>
      <g className="biosample-tracks">
        <rect y={10} height={55} fill="none" width={1400} />
      </g>
      {(data?.bigRequests || []).map((data, i) => (
        <TitledTrack
          key={i}
          assembly={props.assembly}
          oncCREMousedOut={props.oncCREMousedOut}
          oncCREMousedOver={props.oncCREMousedOver}
          height={40}
          url={cTracks[i][1]}
          oncCREClicked={props.oncCREClicked}
          domain={props.domain}
          title={cTracks[i][0]}
          svgRef={props.svgRef}
          data={data.data}
          biosample={groupedBiosamples.get(props.biosample)}
          color={COLOR_MAP.get(cTracks[i][2])}
          transform={`translate(0,${i * 70})`}
          cCRECoordinateMap={cCRECoordinateMap}
        />
      ))}
      <g className="bs-tracks">
        <rect y={110} height={55} fill="none" width={1400} />
      </g>
      {settingsMousedOver && <rect width={1400} height={height} transform="translate(0,-0)" fill="#194023" fillOpacity={0.1} />}
      <rect transform="translate(0,0)" height={height} width={40} fill="#ffffff" />
      <rect
        height={height}
        width={15}
        fill="#194023"
        stroke="#000000"
        fillOpacity={settingsMousedOver ? 1 : 0.6}
        onMouseOver={() => setSettingsMousedOver(true)}
        onMouseOut={() => setSettingsMousedOver(false)}
        strokeWidth={1}
        transform="translate(20,0)"
      />
      <text transform={`rotate(270) translate(-${height / 2},12)`} textAnchor="middle" fill="#194023">
        Biosample-Specific Tracks
      </text>
    </>
  )
}
