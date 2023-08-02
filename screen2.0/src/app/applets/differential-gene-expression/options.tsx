import { Box, Checkbox, FormControlLabel, Switch, TextField, Typography } from "@mui/material"
import { Range2D } from "../../../../../../jubilant-carnival/src/utilities/types"
import { ErrorMessage } from "../../../common/lib/utility"

type SliderInfo = {
  x1: number
  x2: number
  min: number
  max: number
}

export function CoordinateRangeField(props: {
  dr: number[]
  range: Range2D
  slider: SliderInfo
  setdr: React.Dispatch<React.SetStateAction<number[]>>
  setRange: React.Dispatch<React.SetStateAction<Range2D>>
  setSlider: React.Dispatch<React.SetStateAction<SliderInfo>>
}) {
  const CoordinateTextBox = (variant: string) => {
    return (
      <TextField
        id="outlined-basic"
        label={variant === "min" ? props.dr[0].toLocaleString("en-US") : props.dr[1].toLocaleString("en-US")}
        variant="standard"
        size="small"
        sx={{ mb: 1.5 }}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          variant === "min"
            ? props.setdr([parseInt(event.target.value), props.dr[1]])
            : props.setdr([props.dr[0], parseInt(event.target.value)])
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (variant === "min") {
              if (props.range.x.end - props.dr[0] > 100000) {
                props.setRange({
                  x: {
                    start: props.dr[0],
                    end: props.range.x.end,
                  },
                  y: {
                    start: props.range.y.start,
                    end: props.range.y.end,
                  },
                })
                props.setSlider({
                  x1: props.dr[0],
                  x2: props.range.x.end + 1200000,
                  min: props.dr[0],
                  max: props.slider.max,
                })
              } else return <ErrorMessage error={new Error("invalid range")} />
            } else {
              if (props.dr[1] - props.range.x.start >= 100000) {
                props.setRange({
                  x: {
                    start: props.range.x.start,
                    end: props.dr[1],
                  },
                  y: {
                    start: props.range.y.start,
                    end: props.range.y.end,
                  },
                })
                props.setSlider({
                  x1: props.range.x.start - 1200000,
                  x2: props.dr[1],
                  min: props.slider.min,
                  max: props.dr[1],
                })
              } else return <ErrorMessage error={new Error("invalid range")} />
            }
          }
        }}
      />
    )
  }
  return (
    <Box sx={{ "& > :not(style)": { ml: 1.0, mr: 1.0 }, alignItems: "center", justifyContent: "center", display: "flex" }}>
      <Typography variant="h6" display="inline">
        Coordinates:
      </Typography>
      {CoordinateTextBox("min")}
      <Typography variant="h6" display="inline">
        to
      </Typography>
      {CoordinateTextBox("max")}
    </Box>
  )
}

export const TogglePlot = (props: { label: string; toggle: boolean; setToggle: React.Dispatch<React.SetStateAction<boolean>> }) => {
  return (
    <FormControlLabel
      control={<Checkbox checked={props.toggle} onChange={() => props.setToggle(props.toggle ? false : true)} />}
      label={props.label}
    />
  )
}

export const TogglePCT = (props: {
  togglePCT: { TF: boolean; CA: boolean; "CA-CTCF": boolean; "CA-H3K4me3": boolean; dELS: boolean; pELS: boolean }
  setPCT: React.Dispatch<
    React.SetStateAction<{ TF: boolean; CA: boolean; "CA-CTCF": boolean; "CA-H3K4me3": boolean; dELS: boolean; pELS: boolean }>
  >
}) => {
  return Object.entries(props.togglePCT).map((entry) => {
    return (
      <FormControlLabel
        key={entry[0]}
        control={
          <Checkbox
            checked={props.togglePCT[entry[0]]}
            onChange={() => {
              const tmp: any = {
                TF: props.togglePCT.TF,
                CA: props.togglePCT.CA,
                "CA-CTCF": props.togglePCT["CA-CTCF"],
                "CA-H3K4me3": props.togglePCT["CA-H3K4me3"],
                dELS: props.togglePCT.dELS,
                pELS: props.togglePCT.pELS,
              }
              tmp[entry[0]] = tmp[entry[0]] ? false : true
              props.setPCT(tmp)
            }}
          />
        }
        label={entry[0]}
      />
    )
  })
}
