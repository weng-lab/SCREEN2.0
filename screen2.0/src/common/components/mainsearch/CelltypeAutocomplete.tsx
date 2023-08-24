import React, { useMemo, useState, useRef, useCallback, useEffect } from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Grid from "@mui/material/Grid"
import Typography from "@mui/material/Typography"
import { debounce } from "@mui/material/utils"
import { useRouter } from "next/navigation"
import { gql, useQuery } from "@apollo/client"

export const CelltypeAutocomplete = (props) => {
  const [value, setValue] = useState<any>(null)
  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState<any[]>([])
  const [cellTypes, setCelltypes] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetch("https://downloads.wenglab.org/databyct.json")
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        //setCellTypes(data)
        let byCt = Object.keys(data.byCellType).map((ct) => {
          return {
            value: ct,
            tissue: data.byCellType[ct][0].tissue,
            biosample_summary: data.byCellType[ct][0].biosample_summary + ":chr11:5205263-5381894",
          }
        })
        setOptions(byCt.map((ct) => ct.biosample_summary))
        setCelltypes(byCt)
        setLoading(false)
      })
      .catch((error: Error) => {
        // logging
        // throw error
      })
    setLoading(true)
  }, [props.assembly])

  return (
    <Grid container sx={{ mr: "1em", ml: "1em" }}>
      <Grid item sm={5.5} md={5.5} lg={5.5} xl={5.5}>
        <Autocomplete
          id="celltype-autocomplete"
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
                let tissue = cellTypes.find((g) => g.biosample_summary === value)?.tissue
                let biosample = cellTypes.find((g) => g.biosample_summary === value)?.value
                let biosample_summary = value.split(":")[0]
                let chromosome = value.split(":")[1]
                let start = value.split(":")[2].split("-")[0]
                let end = value.split(":")[2].split("-")[1]
                router.push(
                  `search?assembly=${props.assembly}&chromosome=${chromosome}&start=${Math.max(
                    0,
                    start
                  )}&end=${end}&BiosampleTissue=${tissue}&BiosampleSummary=${biosample_summary}&Biosample=${biosample}`
                )
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
              //debounceFn(newInputValue);
            }

            setInputValue(newInputValue)
          }}
          noOptionsText="e.g. LNCAP"
          renderInput={(params) => (
            <TextField
              {...params}
              label="Enter a celltype"
              InputLabelProps={{ shrink: true, style: { color: props.textColor || "black" } }}
             // InputProps={{ style: { color: props.textColor || "black" } }}
              placeholder="e.g. LNCAP"
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
                    {cellTypes && cellTypes.find((g) => g.biosample_summary === option) && (
                      <Typography variant="body2" color="text.secondary">
                        {`${cellTypes.find((g) => g.biosample_summary === option)?.tissue}`}
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
