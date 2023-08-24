import React from "react"
import { Button } from "@mui/material"
export interface Domain {
  chromosome?: string
  start: number
  end: number
}

export type ShiftButtonProps = {
  text: string
  shift: number
  domain: Domain
  onClick: (domain: Domain) => void
}

const ShiftButton = ({ text, shift, domain, onClick }) => {
  return (
    <>
      <Button
        style={{
          color: "#000000",
          borderColor: "#000000",
        }}
        variant="outlined"
        onClick={() => onClick({ start: Math.floor(domain.start + shift), end: Math.ceil(domain.end + shift) })}
      >
        {text}
      </Button>
    </>
  )
}
export default ShiftButton
