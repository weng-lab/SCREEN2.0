import * as React from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Typography from "@mui/material/Typography"
import { debounce } from "@mui/material/utils"
import { useRouter } from "next/navigation"
import { SNP_AUTOCOMPLETE_QUERY } from "./queries"
import Config from "../../config.json"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { IconButton, Stack } from "@mui/material"
import { Search } from "@mui/icons-material"
import { constructSearchURL, constructMainQueryParamsFromURL } from "../search/search-helpers"

export const SnpAutoComplete: React.FC<{ assembly: string, header?: boolean }> = (props) => {
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
      const r = snpSuggestion.map((g: { id: string }) => g.id)
      const snp = snpSuggestion.map((g: { id: string, coordinates: { chromosome: string, start: number, end: number } }) => {
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

  const handleSubmit = () => {
    if (value) {
      let chromosome = snpids.find((g) => g.id === value)?.chrom
      let start = snpids.find((g) => g.id === value)?.start
      let end = snpids.find((g) => g.id === value)?.end
      // router.push(
      //   `search?assembly=${props.assembly}&chromosome=${chromosome}&start=${Math.max(0, start)}&end=${end}&snpid=${value}`
      // )
      router.push(constructSearchURL(constructMainQueryParamsFromURL({assembly: props.assembly, chromosome: chromosome, start: String(Math.max(0, start)), end: String(end), snpid: value}), 0, ''))
    }
  }

  return (
    <Stack direction="row" spacing={2}>
      <Autocomplete
        size={props.header ? "small" : "medium"}
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
            handleSubmit()
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
            InputLabelProps={{ shrink: true, style: props.header ? {color: "white"} : { color: "black" } }}
            placeholder="e.g. rs11669173"
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
                <Grid2 sx={{ width: "calc(100% - 44px)", wordWrap: "break-word" }}>
                  <Box component="span" sx={{ fontWeight: "regular" }}>
                    {option}
                  </Box>
                  {snpids && snpids.find((g) => g.id === option) && (
                    <Typography variant="body2" color="text.secondary">
                      {`${snpids.find((g) => g.id === option)?.chrom}:${snpids.find((g) => g.id === option)?.start}:${snpids.find((g) => g.id === option)?.end
                        }`}
                    </Typography>
                  )}
                </Grid2>
              </Grid2>
            </li>
          )
        }}
      />
      <IconButton aria-label="Search" type="submit" onClick={() => handleSubmit()} sx={{ color: `${props.header ? "white" : "black"}`, maxHeight: "100%" }}>
        <Search />
      </IconButton>
    </Stack>
  )
}
