import React, { useState } from "react"
import { EmptyTrack, PackTranscriptTrack, SquishTranscriptTrack } from "umms-gb"
import { TranscriptList } from "umms-gb/dist/components/tracks/transcripts/types"

export type GenomicRange = {
  chromosome?: string
  start: number
  end: number
}
export type EGeneTrackProps = {
  expandedCoordinates: GenomicRange
  genes: TranscriptList[]
  highlights?: Set<string>
  onSettingsClick?: () => void
  onHeightChanged?: (x: number) => void
  width?: number
  squish?: boolean
}

const EGeneTracks: React.FC<EGeneTrackProps> = (props) => {
  const [settingsMousedOver, setSettingsMousedOver] = useState(false)
  const [height, setHeight] = useState(60)
  return (
    <g>
      <EmptyTrack height={40} width={props.width || 1400} text="GENCODE genes" transform="" id="" />
      {props.squish ? (
        <SquishTranscriptTrack
          transform="translate(0,40)"
          rowHeight={20}
          width={props.width || 1400}
          domain={props.expandedCoordinates}
          id="innergencode"
          data={props.genes || []}
          onHeightChanged={(x) => {
            setHeight(x + 40)
            props.onHeightChanged && props.onHeightChanged(40 + x)
          }}
          color="#880000"
        />
      ) : (
        <PackTranscriptTrack
          transform="translate(0,40)"
          rowHeight={20}
          width={props.width || 1400}
          domain={props.expandedCoordinates}
          id="innergencode"
          data={props.genes || []}
          onHeightChanged={(x) => {
            setHeight(x + 40)
            props.onHeightChanged && props.onHeightChanged(40 + x)
          }}
          color="#880000"
        />
      )}
      {settingsMousedOver && (
        <rect width={props.width || 1400} height={height} transform="translate(0,0)" fill="#bf2604" fillOpacity={0.1} />
      )}
      <rect transform="translate(0,0)" height={height} width={40} fill="#ffffff" />
      <rect
        height={height}
        width={15}
        fill="#bf2604"
        stroke="#000000"
        fillOpacity={settingsMousedOver ? 1 : 0.6}
        onMouseOver={() => setSettingsMousedOver(true)}
        onMouseOut={() => setSettingsMousedOver(false)}
        strokeWidth={1}
        transform="translate(20,0)"
        onClick={props.onSettingsClick}
      />
      <text transform={`rotate(270) translate(-${height / 2 + 20},12)`} fill="#bf2604">
        Genes
      </text>
    </g>
  )
}
export default EGeneTracks
