import React, { useState, useRef } from "react"
import { EmptyTrack, SquishBigBed } from "umms-gb"
import { DNALogo, Y } from "logots-react"
import { MOTIFS } from "./allmotifs"
import { Typography } from "@mui/material"
export type GenomicRange = {
  chromosome?: string
  start: number
  end: number
}

const MotifTooltip = (props) => {
  const rc = (x) => [...x].map((xx) => [...xx].reverse()).reverse()
  return (
    <div style={{ border: "1px solid", borderColor: "#000000", backgroundColor: "#ffffff", padding: "5px" }}>
      <Typography variant="h5">{props.rectname.split("$")[2]}</Typography>
      <DNALogo
        ppm={props.rectname.split("$")[1] === "-" ? rc(MOTIFS[props.rectname.split("$")[2]]) : MOTIFS[props.rectname.split("$")[2]]}
        width={MOTIFS[props.rectname.split("$")[2]].length * 10}
      />
    </div>
  )
}
export const TfMotifTrack = (props) => {
  const [height, setHeight] = useState(60)
  const [settingsMousedOver, setSettingsMousedOver] = useState(false)

  return (
    <g>
      <EmptyTrack height={40} width={props.width || 1400} text="TF Motif Occurences" transform="" id="" />
      <SquishBigBed
        domain={props.coordinates}
        svgRef={props.svgRef}
        width={1000}
        rowHeight={20}
        onHeightChanged={(x) => {
          setHeight(x + 40)
          props.onHeightChanged && props.onHeightChanged(40 + x)
        }}
        data={props.data}
        transform="translate(0,40)"
        tooltipContent={(rect: any) => {
          
          return <MotifTooltip {...rect} />
        }}
        onClick={(x: any) => {
          
          return window.open(
            `https://factorbook.org/tf/${props.assembly === "GRCh38" ? "human" : "mouse"}/${x.rectname.split("$")[2]}/motif`,
            "_blank"
          )
        }}
      />
      {settingsMousedOver && (
        <rect width={props.width || 1400} height={height} transform="translate(0,0)" fill="#194023" fillOpacity={0.1} />
      )}
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
        onClick={props.onSettingsClick}
      />
      <text transform={`rotate(270) translate(-${height / 2 + 20},12)`} fill="#194023">
        TF Binding sites
      </text>
    </g>
  )
}
