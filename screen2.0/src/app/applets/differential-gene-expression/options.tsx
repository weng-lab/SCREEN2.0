import { Box, Button, Checkbox, FormControlLabel, TextField, Typography } from "@mui/material"
import { Range2D } from "jubilant-carnival"
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
  const CoordinateTextBox = () => {
    return (
      <TextField
        id="outlined-basic"
        label={"Coordinates"}
        variant="standard"
        size="small"
        sx={{ mb: 1.5 }}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
          let value: string[] = event.target.value.split(":")[1].split("-")
          console.log(value)
          if (value[0].split(",").length > 0) {
            let j: string = ""
            for (let c of value[0].split(",")) {
              j += c
            }
            value[0] = j
          }
          if (value[1].split(",").length > 0) {
            let j: string = ""
            for (let c of value[1].split(",")) {
              j += c
            }
            value[1] = j
          }
          console.log(value)
          if (parseInt(value[1]) - parseInt(value[0]) <= 500000 && parseInt(value[1]) - parseInt(value[0]) > 0)
            props.setdr([parseInt(value[0]), parseInt(value[1])])
          // variant === "min"
          // ? props.setdr([parseInt(value[0]), props.dr[1]])
          // : props.setdr([props.dr[0], parseInt(value[1])])
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            if (props.range.x.end - props.dr[0] > 0 && props.range.x.end - props.dr[0] <= 500000) {
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
                x2: props.range.x.end,
                min: props.dr[0],
                max: props.range.x.end,
              })
            } else return <ErrorMessage error={new Error("invalid range")} />
            if (props.dr[1] - props.range.x.start > 0 && props.dr[1] - props.range.x.start <= 500000) {
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
                x1: props.range.x.start,
                x2: props.dr[1],
                min: props.range.x.start,
                max: props.dr[1],
              })
            } else return <ErrorMessage error={new Error("invalid range")} />
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
      {CoordinateTextBox()}
      <Button
        onClick={() => {
          if (props.dr[1] - props.dr[0] > 0 && props.dr[1] - props.dr[0] <= 500000) {
            props.setRange({
              x: {
                start: props.dr[0],
                end: props.dr[1],
              },
              y: {
                start: props.range.y.start,
                end: props.range.y.end,
              },
            })
            props.setSlider({
              x1: props.dr[0],
              x2: props.dr[1],
              min: props.dr[0],
              max: props.dr[1],
            })
          } else return <ErrorMessage error={new Error("invalid range")} />
        }}
      >
        Set
      </Button>
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
