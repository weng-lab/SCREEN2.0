"use client"
import * as React from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { debounce } from "@mui/material/utils"
import { Button } from "@weng-lab/psychscreen-ui-components"
import { useRouter } from "next/navigation"

///search?assembly=GRCh38&chromosome=chr11&start=5205263&end=5381894&accession=EH38E1516972

const CCRE_AUTOCOMPLETE_QUERY = `
query cCREQuery($accession_prefix: [String!], $limit: Int, $assembly: String!) {
    cCREQuery(accession_prefix: $accession_prefix, assembly: $assembly, limit: $limit) {
        accession
      coordinates {
        start
        end
        chromosome
      }
    }
}
`
export const CcreAutoComplete = (props) => {
  const [value, setValue] = React.useState(null)
  const [inputValue, setInputValue] = React.useState("")
  const [options, setOptions] = React.useState([])
  const [ccreAccessions, setCcreAccessions] = React.useState([])

  const router = useRouter()
  const onSearchChange = async (value: any) => {
    setOptions([])
    const response = await fetch("https://factorbook.api.wenglab.org/graphql", {
      method: "POST",
      body: JSON.stringify({
        query: CCRE_AUTOCOMPLETE_QUERY,
        variables: {
          assembly: props.assembly,
          accession_prefix: [value],
          limit: 100,
        },
      }),
      headers: { "Content-Type": "application/json" },
    })
    const ccreSuggestion = (await response.json()).data?.cCREQuery
    if (ccreSuggestion && ccreSuggestion.length > 0) {
      const r = ccreSuggestion.map((g: any) => g.accession)
      const ccres = ccreSuggestion.map((g: any) => {
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

  const debounceFn = React.useCallback(debounce(onSearchChange, 500), [])

  return (
    <Grid container sx={{ mr: "1em", ml: "1em" }}>
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
                let chrom = ccreAccessions.find((g) => g.ccreaccession === value)?.chrom
                let start = ccreAccessions.find((g) => g.ccreaccession === value)?.start
                let end = ccreAccessions.find((g) => g.ccreaccession === value)?.end
                router.push(`search?assembly=${props.assembly}&chromosome=${chrom}&start=${start}&end=${end}&accession=${value}`)
              }
            }
          }}
          value={value}
          onChange={(_: any, newValue: string | null) => {
            setValue(newValue)
          }}
          inputValue={inputValue}
          onInputChange={(event, newInputValue) => {
            if (newInputValue != "") {
              debounceFn(newInputValue)
            }

            setInputValue(newInputValue)
          }}
          noOptionsText="e.g. EH38E0001314"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Enter a cCRE accession"
              InputLabelProps={{ shrink: true, style: { color: props.textColor || "black" } }}
            //  InputProps={{ style: { color: props.textColor || "black" } }}
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
                    {ccreAccessions && ccreAccessions.find((g) => g.ccreaccession === option) && (
                      <Typography variant="body2" color="text.secondary">
                        {`${ccreAccessions.find((g) => g.ccreaccession === option)?.chrom}:${
                          ccreAccessions.find((g) => g.ccreaccession === option)?.start
                        }:${ccreAccessions.find((g) => g.ccreaccession === option)?.end}`}
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
