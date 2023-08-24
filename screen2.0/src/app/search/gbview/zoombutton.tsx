import React from "react"
import { Button } from "@mui/material"
export interface Domain {
  chromosome?: string
  start: number
  end: number
}
export type ZoomButtonProps = {
  text: string
  factor: number
  domain: Domain
  onClick: (domain: Domain) => void
}

const ZoomButton = ({ text, factor, domain, onClick }) => (
  <Button
    variant="outlined"
    style={{
      color: "#000000",
      borderColor: "#000000",
    }}
    onClick={() => {
      const midpoint = (domain.end + domain.start) / 2.0
      const width = (domain.end - domain.start) * factor
      onClick({ start: Math.floor(midpoint - width / 2), end: Math.ceil(midpoint + width / 2) })
    }}
  >
    {text}
  </Button>
)
export default ZoomButton
