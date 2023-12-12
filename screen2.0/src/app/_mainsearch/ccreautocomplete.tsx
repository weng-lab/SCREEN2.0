import React, { useState, useCallback } from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Typography from "@mui/material/Typography"
import { debounce } from "@mui/material/utils"
import { CCRE_AUTOCOMPLETE_QUERY } from "./queries"
import Config from "../../config.json"
import { IconButton, Stack } from "@mui/material"
import { Search } from "@mui/icons-material"

export const CcreAutoComplete: React.FC<{ assembly: string, header?: boolean }> = (props) => {
  const [value, setValue] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState([])
  const [ccreAccessions, setCcreAccessions] = useState([])

  const onSearchChange = async (value: string) => {
    setOptions([])
    const response = await fetch(Config.API.CcreAPI, {
      method: "POST",
      body: JSON.stringify({
        query: CCRE_AUTOCOMPLETE_QUERY,
        variables: {
          assembly: props.assembly,
          accession_prefix: [value],
          limit: 100
        },
      }),
      headers: { "Content-Type": "application/json" },
    })
    const ccreSuggestion = (await response.json()).data?.cCREQuery
    if (ccreSuggestion && ccreSuggestion.length > 0) {
      const r = ccreSuggestion.map((g: { accession: string }) => g.accession)
      const ccres = ccreSuggestion.map((g: { accession: string, coordinates: { start: number, end: number, chromosome: string } }) => {
        return {
          chrom: g.coordinates.chromosome,
          start: g.coordinates.start,
          end: g.coordinates.end,
          ccreaccession: g.accession,
        }
      })
      setOptions(r)
      setCcreAccessions(ccres)
    } else if (ccreSuggestion && ccreSuggestion.length === 0) {
      setOptions([])
      setCcreAccessions([])
    }
  }

  const debounceFn = useCallback(debounce(onSearchChange, 500), [])

  const handleSubmit = () => {
    if (value) {
      let chrom = (ccreAccessions.find((g: { ccreaccession: string }) => g.ccreaccession === value))?.chrom
      let start = (ccreAccessions.find((g: { ccreaccession: string }) => g.ccreaccession === value))?.start
      let end = (ccreAccessions.find((g: { ccreaccession: string }) => g.ccreaccession === value))?.end
      return (`search?assembly=${props.assembly}&chromosome=${chrom}&start=${start}&end=${end}&accessions=${value}&page=2`)
    }
  }

  return (
    <Stack direction="row" spacing={2}>
      <Autocomplete
          size={props.header ? "small" : "medium"}
          id="ccre-autocomplete"
          sx={{ width: 300, paper: { height: 200 } }}
          options={options}
          ListboxProps={{
            style: {
              maxHeight: "180px",
            },
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.defaultPrevented = true
              window.open(handleSubmit(), "_self")
            }
          }}
          value={value}
          onChange={(_, newValue: string | null) => {
            setValue(newValue)
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            if (newInputValue != "") {
              debounceFn(newInputValue)
            }

            setInputValue(newInputValue)
          }}
          noOptionsText={props.assembly === "mm10" ? "e.g EM10E0000207" : "e.g. EH38E0001314"}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Enter a cCRE accession"
              InputLabelProps={{ shrink: true, style: props.header ? {color: "white"} : { color: "black" } }}
              placeholder={props.assembly === "mm10" ? "e.g EM10E0000207" : "e.g. EH38E0001314"}
              fullWidth
              sx={{
                //Border at rest
                fieldset: props.header ? { borderColor: "white" } : { borderColor: "black" },
                '& .MuiOutlinedInput-root': {
                  //hover border color
                  '&:hover fieldset': props.header ? { borderColor: "white" } : { borderColor: "black" },
                  //focused border color
                  '&.Mui-focused fieldset': props.header ? { borderColor: "white" } : { borderColor: "black" },
                },
                //Text
                '& .MuiOutlinedInput-input': props.header && { color: "white" },
                //Icon
                '& .MuiSvgIcon-root': props.header && { fill: "white"}
              }}
            />
          )}
          renderOption={(props, option) => {
            return (
              <li {...props} key={props.id}>
                <Grid2 container alignItems="center">
                  <Grid2 sx={{ width: "100%", wordWrap: "break-word" }}>
                    <Box component="span" sx={{ fontWeight: "regular" }}>
                      {option}
                    </Box>
                    {ccreAccessions && ccreAccessions.find((g: { ccreaccession: string }) => g.ccreaccession === option) && (
                      <Typography variant="body2" color="text.secondary">
                        {`${(ccreAccessions.find((g: { ccreaccession: string }) => g.ccreaccession === option))?.chrom}:${(ccreAccessions.find((g: { ccreaccession: string }) => g.ccreaccession === option))?.start
                          }-${(ccreAccessions.find((g: { ccreaccession: string }) => g.ccreaccession === option))?.end}`}
                      </Typography>
                    )}
                  </Grid2>
                </Grid2>
              </li>
            )
          }}
      />
      <IconButton aria-label="Search" type="submit" href={handleSubmit()} sx={{ color: `${props.header ? "white" : "black"}`, maxHeight: "100%" }}>
        <Search />
      </IconButton>
    </Stack>
  )
}
