"use client"
import React, {useState, useCallback} from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { debounce } from "@mui/material/utils"
import { useRouter } from "next/navigation"
import { CCRE_AUTOCOMPLETE_QUERY } from "./queries"
import Config from "../../../config.json"

export const CcreAutoComplete: React.FC<{assembly: string, textColor: string }>  = (props) => {
  const [value, setValue] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState([])
  const [ccreAccessions, setCcreAccessions] = useState([])

  const router = useRouter()
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
      const r = ccreSuggestion.map((g: { accession: string}) => g.accession)
      const ccres = ccreSuggestion.map((g: { accession: string, coordinates: { start: number, end: number, chromosome: string }}) => {
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

  return (
    <Grid sx={{ mr: "1em", ml: "1em" }}>
      <Grid item sm={5.5} md={5.5} lg={5.5} xl={5.5}>
        <Autocomplete
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

              if (value) {
                let chrom = (ccreAccessions.find((g: {ccreaccession: string}) => g.ccreaccession === value))?.chrom
                let start = (ccreAccessions.find((g: {ccreaccession: string}) => g.ccreaccession === value))?.start
                let end = (ccreAccessions.find((g: {ccreaccession: string}) => g.ccreaccession === value))?.end
                router.push(`search?assembly=${props.assembly}&chromosome=${chrom}&start=${start}&end=${end}&accession=${value}`)
              }
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
          noOptionsText={props.assembly==="mm10"? "e.g EM10E0000207": "e.g. EH38E0001314"}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Enter a cCRE accession"
              InputLabelProps={{ shrink: true, style: { color: props.textColor || "black" } }}
            
              placeholder="e.g. EH38E0001314"
              fullWidth
              sx={{ fieldset: { borderColor: props.textColor || "black"}, '& .MuiInput-underline:after': {
                borderBottomColor: props.textColor || "black",
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: props.textColor || "black",
                },
                '&:hover fieldset': {
                  borderColor: props.textColor || "black"
                  
                },
                '&.Mui-focused fieldset': {
                  borderColor: props.textColor || "black",
                },
              }}}
            />
          )}
          renderOption={(props, option) => {
            return (
              <li {...props} key={props.id}>
                <Grid container alignItems="center">
                  <Grid item sx={{ width: "calc(100% - 44px)", wordWrap: "break-word" }}>
                    <Box component="span" sx={{ fontWeight: "regular" }}>
                      {option}
                    </Box>
                    {ccreAccessions && ccreAccessions.find((g: {ccreaccession: string }) => g.ccreaccession === option) && (
                      <Typography variant="body2" color="text.secondary">
                        {`${(ccreAccessions.find((g: {ccreaccession: string }) => g.ccreaccession === option))?.chrom}:${
                          (ccreAccessions.find((g: {ccreaccession: string }) => g.ccreaccession === option))?.start
                        }:${(ccreAccessions.find((g: {ccreaccession: string }) => g.ccreaccession === option))?.end}`}
                      </Typography>
                    )}
                  </Grid>
                </Grid>
              </li>
            )
          }}
        />
      </Grid>
    </Grid>
  )
}
