import * as React from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { debounce } from "@mui/material/utils"
import { useRouter } from "next/navigation"
import { SNP_AUTOCOMPLETE_QUERY } from "./queries"
import Config from "../../../config.json"

export const SnpAutoComplete: React.FC<{assembly: string, textColor: string }>  = (props) => {
  const [value, setValue] = React.useState(null)
  const [inputValue, setInputValue] = React.useState("")
  const [options, setOptions] = React.useState([])
  const [snpids, setSnpIds] = React.useState([])
  const router = useRouter()

  const onSearchChange = async (value: string) => {
    setOptions([])
    const response = await fetch(Config.API.GraphqlAPI, {
      method: "POST",
      body: JSON.stringify({
        query: SNP_AUTOCOMPLETE_QUERY,
        variables: {
          assembly: props.assembly.toLowerCase(),
          snpid: value,
        },
      }),
      headers: { "Content-Type": "application/json" },
    })
    const snpSuggestion = (await response.json()).data?.snpAutocompleteQuery
    if (snpSuggestion && snpSuggestion.length > 0) {
      const r = snpSuggestion.map((g: {id: string}) => g.id)
      const snp = snpSuggestion.map((g: {id: string, coordinates: {chromosome:string, start: number, end: number} }) => {
        return {
          chrom: g.coordinates.chromosome,
          start: g.coordinates.start,
          end: g.coordinates.end,
          id: g.id,
        }
      })
      setOptions(r)
      setSnpIds(snp)
    } else if (snpSuggestion && snpSuggestion.length === 0) {
      setOptions([])
      setSnpIds([])
    }
    
  }

  const debounceFn = React.useCallback(debounce(onSearchChange, 500), [])

  return (
    <Grid sx={{ mr: "1em", ml: "1em" }}>
      <Grid item sm={5.5} md={5.5} lg={5.5} xl={5.5}>
        <Autocomplete
          id="snp-autocomplete"
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
                let chromosome = snpids.find((g) => g.id === value)?.chrom
                let start = snpids.find((g) => g.id === value)?.start - 2000
                let end = snpids.find((g) => g.id === value)?.end + 2000
                router.push(
                  `search?assembly=${props.assembly}&chromosome=${chromosome}&start=${Math.max(0, start)}&end=${end}&snpid=${value}`
                )
              }
            }
          }}
          value={value}
          onChange={(_, newValue: string | null) => {
            setValue(newValue)
          }}
          inputValue={inputValue}
          onInputChange={(_, newInputValue) => {
            if (newInputValue != "") {
              debounceFn(newInputValue)
            }

            setInputValue(newInputValue)
          }}
          noOptionsText="e.g. rs11669173"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Enter a snp rsId"
              InputLabelProps={{ shrink: true, style: { color: props.textColor || "black" } }}             
              placeholder="e.g. rs11669173"
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
                    {snpids && snpids.find((g) => g.id === option) && (
                      <Typography variant="body2" color="text.secondary">
                        {`${snpids.find((g) => g.id === option)?.chrom}:${snpids.find((g) => g.id === option)?.start}:${
                          snpids.find((g) => g.id === option)?.end
                        }`}
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
