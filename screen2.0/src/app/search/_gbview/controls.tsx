import React from "react"

import ShiftButton from "./shiftbutton"
import ZoomButton from "./zoombutton"

export interface Domain {
  chromosome?: string
  start: number
  end: number
}
export type ControlProps = {
  domain: Domain
  onDomainChanged: (domain: Domain) => void
}
const Controls = ({ domain, onDomainChanged }) => {
  return (
    <>
      move&nbsp;
      <ShiftButton text="<<<" shift={domain.start - domain.end} domain={domain} onClick={onDomainChanged} />
      <ShiftButton text="<<" shift={(domain.start - domain.end) / 2} domain={domain} onClick={onDomainChanged} />
      <ShiftButton text="<" shift={(domain.start - domain.end) / 4} domain={domain} onClick={onDomainChanged} />
      <ShiftButton text=">" shift={(domain.end - domain.start) / 4} domain={domain} onClick={onDomainChanged} />
      <ShiftButton text=">>" shift={(domain.end - domain.start) / 2} domain={domain} onClick={onDomainChanged} />
      <ShiftButton text=">>>" shift={domain.end - domain.start} domain={domain} onClick={onDomainChanged} />
      &nbsp; zoom in&nbsp;
      <ZoomButton text="1.5x" factor={1.0 / 1.5} domain={domain} onClick={onDomainChanged} />
      <ZoomButton text="3x" factor={1.0 / 3} domain={domain} onClick={onDomainChanged} />
      <ZoomButton text="10x" factor={1.0 / 10} domain={domain} onClick={onDomainChanged} />
      &nbsp; zoom out&nbsp;
      <ZoomButton text="1.5x" factor={1.5} domain={domain} onClick={onDomainChanged} />
      <ZoomButton text="3x" factor={3} domain={domain} onClick={onDomainChanged} />
      <ZoomButton text="10x" factor={10} domain={domain} onClick={onDomainChanged} />
      <ZoomButton text="100x" factor={100} domain={domain} onClick={onDomainChanged} />
      <br />
    </>
  )
}
export default Controls
