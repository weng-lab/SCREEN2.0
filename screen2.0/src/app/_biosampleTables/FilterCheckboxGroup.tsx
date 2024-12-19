import { FormControl, FormLabel, FormControlLabel, FormGroup, Checkbox } from "@mui/material"
import { Dispatch, SetStateAction } from "react"
import { Checkboxes } from "./types"

export type FilterCheckboxGroupProps<T extends Checkboxes> = {
  groupLabel: string
  controlsState: T,
  setState: Dispatch<SetStateAction<T>>
}

/**
   * Takes in the state variable checkboxes should control, and makes checkboxes with a select all
   */
export const FilterCheckboxGroup = <T extends Checkboxes>({groupLabel, controlsState, setState}: FilterCheckboxGroupProps<T>) => {
  const allTrue = Object.values(controlsState).every(val => val === true)
  const allFalse = Object.values(controlsState).every(val => val === false)
  const isIndeterminate = !allTrue && !allFalse

  return (
    <FormControl component="fieldset" variant="standard">
      <FormLabel component="legend">{groupLabel}</FormLabel>
      <FormGroup>
        <FormControlLabel
          label={"Select All"}
          control={
            <Checkbox
              checked={allTrue}
              indeterminate={isIndeterminate}
              //sets all values to true/false
              onChange={e => setState(Object.fromEntries(
                Object.keys(controlsState).map(key => [key, e.target.checked])
              ) as T)} //why do i need to do as T?
            />
          }
        />
        {Object.entries(controlsState).map(([key, checked]) => {
          return (
            <FormControlLabel
              label={key}
              key={key}
              sx={{ml: 1}}
              control={
                <Checkbox
                  checked={checked}
                  onChange={e => setState({ ...controlsState, [key]: e.target.checked })}
                />
              }
            />
          )
        })}
      </FormGroup>
    </FormControl>
  )
}