"use client"
import * as React from "react"
import { useEffect } from "react"

import { Typography, Switch, SwitchProps, Stack } from "@mui/material"
import { styled, alpha } from "@mui/material/styles"

import mouseIcon from "../../../public/mouse.png"
import humanIcon from "../../../public/human.png"

export type GenomeSwitchProps = SwitchProps & {
  /**
   * false for human, true for mouse
   */
  initialChecked?: boolean
  /**
   *
   */
  onSwitchChange?: (checked: boolean) => void
}

/**
 * Typescript does not like accessing .src attribute of the unknown image objects.
 * Can't find a better solution than this given next.js complications with images
 * and modifying basePath. Typescript told to ignore these errors.
 */

const StyledSwitch = styled(Switch)(({ theme }) => ({
  width: 62,
  height: 34,
  padding: 7,
  "& .MuiSwitch-switchBase": {
    margin: 1,
    padding: 0,
    transform: "translateX(6px)",
    "&.Mui-checked": {
      color: "#fff",
      transform: "translateX(22px)",
      "& .MuiSwitch-thumb:before": {
        // @ts-expect-error
        backgroundImage: `url(${mouseIcon.src})`,
      },
      "& + .MuiSwitch-track": {
        opacity: 1,
        backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
      },
    },
  },
  "& .MuiSwitch-thumb": {
    backgroundColor: theme.palette.mode === "dark" ? "#003892" : `${theme.palette.primary.dark}`,
    width: 32,
    height: 32,
    "&:before": {
      content: "''",
      position: "absolute",
      width: "100%",
      height: "100%",
      left: 0,
      top: 0,
      backgroundRepeat: "no-repeat",
      backgroundPosition: "center",
      // @ts-expect-error
      backgroundImage: `url(${humanIcon.src})`,
      backgroundSize: "70%",
    },
  },
  "& .MuiSwitch-track": {
    opacity: 1,
    backgroundColor: theme.palette.mode === "dark" ? "#8796A5" : "#aab4be",
    borderRadius: 20 / 2,
  },
}))

const GenomeSwitch: React.FC<GenomeSwitchProps> = (props: GenomeSwitchProps) => {
  const [checked, setChecked] = React.useState(false)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked)
  }

  useEffect(() => {
    props.onSwitchChange && props.onSwitchChange(checked)
  })

  return (
    <Stack direction="row" alignItems="center">
      <Typography>GRCh38</Typography>
      <StyledSwitch
        //This is the value of the switch. When going to the results page, this value needs to mirror the search query
        //false = human, true = mouse
        checked={checked}
        //Not positive that this works as expected
        defaultChecked={props.initialChecked && props.initialChecked}
        onChange={handleChange}
        color="primary"
        inputProps={{ "aria-label": "primary checkbox" }}
      />
      <Typography>mm10</Typography>
    </Stack>
  )
}

export default GenomeSwitch
