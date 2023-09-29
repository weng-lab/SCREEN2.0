import React, { useState, useEffect } from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Typography from "@mui/material/Typography"
import { useRouter } from "next/navigation"
import Config from "../../../config.json"
import { IconButton, Stack } from "@mui/material"
import { Search } from "@mui/icons-material"

export const CelltypeAutocomplete: React.FC<{ assembly: string, header?: boolean }> = (props) => {
  const [value, setValue] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState([])
  const [cellTypes, setCelltypes] = useState([])

  const router = useRouter()

  //Fetch for the biosample options
  useEffect(() => {
    fetch(props.assembly.toLowerCase() === "grch38" ? Config.API.HumanGlobals : Config.API.MouseGlobals)
      .then((response) => {
        return response.json()
      })
      .then((data) => {
        let byCt = Object.keys(data.byCellType).map((ct) => {
          return {
            value: ct,
            tissue: data.byCellType[ct][0].tissue,
            biosample_summary: data.byCellType[ct][0].biosample_summary + ":chr11:5205263-5381894",
          }
        })
        setOptions(byCt.map((ct) => ct.biosample_summary))
        setCelltypes(byCt)
      })
      .catch((error: Error) => {
        console.log(error)
      })

  }, [props.assembly])

  const handleSubmit = () => {
    if (value) {
      console.log(value, "ct")
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

  return (
    <Stack direction={"row"} spacing={2}>
      <Autocomplete
        size={props.header ? "small" : "medium"}
        // freeSolo
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
            handleSubmit()
          }
        }}
        value={value}
        onChange={(_, newValue: string | null) => {
          setValue(newValue)
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          setValue(newInputValue)
          setInputValue(newInputValue)
        }}
        noOptionsText={props.assembly === "mm10" ? "strain B6NCrl cortical plate tissue male adult (8 weeks)" : "e.g. LNCAP"}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Enter a celltype"
            InputLabelProps={{ shrink: true, style: props.header ? {color: "white"} : { color: "black" } }}
            placeholder={props.assembly === "mm10" ? "strain B6NCrl cortical plate tissue male adult (8 weeks)" : "e.g. LNCAP"}
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
                  {cellTypes && cellTypes.find((g) => g.biosample_summary === option) && (
                    <Typography variant="body2" color="text.secondary">
                      {`${cellTypes.find((g) => g.biosample_summary === option)?.tissue}`}
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
