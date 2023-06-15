"use client"
import * as React from "react"

import { InputBase, Switch, Stack, Typography, TextField, FormHelperText, IconButton, InputAdornment, InputBaseProps } from "@mui/material"

import SearchIcon from "@mui/icons-material/Search"

import GenomeSwitch from "./GenomeSwitch"

import { useRouter } from "next/navigation"

export type MainSearchProps = InputBaseProps & {
  //false for human, true for mouse
  initialChecked?: boolean
}

const MainSearch: React.FC<MainSearchProps> = (props: MainSearchProps) => {
  const [value, setValue] = React.useState("")
  const [checked, setChecked] = React.useState(props.initialChecked || false)

  const router = useRouter()

  const handleChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setValue(event.target.value)
  }

  function handleSubmit() {
    const assembly = checked ? "mm10" : "GRCh38"
    //if submitted with empty value, use default search
    if (value == "") {
      router.push(`/search?assembly=${assembly}&chromosome=chr11&start=5205263&end=5381894`)
      return
    }
    const input = value.split(":")
    const chromosome = input[0]
    const coordinates = input[1].split("-")
    const start = coordinates[0]
    const end = coordinates[1]
    router.push(`/search?assembly=${assembly}&chromosome=${chromosome}&start=${start}&end=${end}`)
  }

  return (
    <Stack direction={"row"} sx={{ mt: "1em", display: "flex", flexGrow: 1 }}>
      <TextField
        fullWidth
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        label="Enter a gene name or alias, a genomic region in the form chr:start-end, a SNP rsID, or a cCRE accession."
        placeholder='"K562”, “chr11:5205263-5381894", "rs4846913", "EH38E1613479"'
        // helperText='You may also enter a cell type name to filter results.'
        value={value}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.code === "Enter") {
            handleSubmit()
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label="Search" type="submit" onClick={() => handleSubmit()}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mr: "1em" }}
      />
      <GenomeSwitch
        initialChecked={props.initialChecked && props.initialChecked}
        checked={checked}
        onSwitchChange={(checked) => setChecked(checked)}
      />
    </Stack>
  )
}

export default MainSearch
