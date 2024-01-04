import React, { useState, useEffect, SetStateAction } from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Typography from "@mui/material/Typography"
import Config from "../../config.json"
import { IconButton, Stack } from "@mui/material"
import { Search } from "@mui/icons-material"
import { parseGenomicRegion } from "./parsegenomicregion"

export const CelltypeAutocomplete: React.FC<{ assembly: string, header?: boolean }> = (props) => {
  const [valueCellType, setValueCellType] = useState(null)
  const [valueRegion, setValueRegion] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState([])
  const [cellTypes, setCelltypes] = useState([])


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
            biosample_summary: data.byCellType[ct][0].biosample_summary,
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
    if (valueCellType) {
      console.log(valueCellType,"val ct", cellTypes)
      const tissue = cellTypes.find((g) => g.biosample_summary === valueCellType)?.tissue
      const biosample = cellTypes.find((g) => g.biosample_summary === valueCellType)?.value
      console.log(tissue,biosample)
      const biosample_summary = valueCellType
      let region: { chromosome: string, start: string, end: string }
      if (valueRegion) {
        region = parseGenomicRegion(valueRegion)
      } else {
        region = { chromosome: 'chr11', start: "5205263", end: "5381894" }
      }
      return (
        `search?assembly=${props.assembly}&chromosome=${region.chromosome}&start=${Math.max(0, Number(region.start))}&end=${region.end}&BiosampleTissue=${tissue}&BiosampleSummary=${biosample_summary}&Biosample=${biosample}`
      )
    }
  }

  return (
    <Stack direction={"row"} spacing={2}>
      <Autocomplete
        size={props.header ? "small" : "medium"}
        id="celltype-autocomplete"
        sx={{ minWidth: 200, paper: { height: 200 } }}
        options={options}
        onKeyDown={(event) => {
          if (event.key === "Enter" && valueCellType) {
            event.defaultPrevented = true
            window.open(handleSubmit(), "_self")
          }
        }}
        value={valueCellType}
        onChange={(_, newValue: string | null) => {          
          setValueCellType(newValue)
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          
          setInputValue(newInputValue)
        }}
        noOptionsText={props.assembly === "mm10" ? "strain B6NCrl cortical plate tissue male adult (8 weeks)" : "e.g. LNCAP"}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Enter a celltype"
            InputLabelProps={{ shrink: true, style: props.header ? { color: "white" } : { color: "black" } }}
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
              '& .MuiSvgIcon-root': props.header && { fill: "white" }
            }}
          />
        )}
        renderOption={(props, option) => {
          return (
            <li {...props} key={props.id}>
              <Grid2 container alignItems="center">
                <Grid2 sx={{ width: "100%", wordWrap: "normal" }}>
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
      {/* Ideally this and the other genomic region should share the same code */}
      <TextField
        variant="outlined"
        InputLabelProps={{ shrink: true, style: props.header ? { color: "white" } : { color: "black" } }}
        label="Enter a genomic region"
        placeholder="chr11:5205263-5381894"
        value={valueRegion}
        onChange={(event: { target: { value: SetStateAction<string> } }) => {
          setValueRegion(event.target.value)
        }}
        onKeyDown={(event) => {
          if (event.code === "Enter" && valueCellType) {
            window.open(handleSubmit(), "_self")
          }
          if (event.code === "Tab" && !valueRegion) {
            setValueRegion("chr11:5205263-5381894")
          }
        }}
        InputProps={props.header ? { style: { color: "white" } } : {}}
        sx={{
          //Border at rest
          fieldset: props.header ? { borderColor: "white" } : { borderColor: "black" },
          '& .MuiOutlinedInput-root': {
            //hover border color
            '&:hover fieldset': props.header ? { borderColor: "white" } : { borderColor: "black" },
            //focused border color
            '&.Mui-focused fieldset': props.header ? { borderColor: "white" } : { borderColor: "black" },
          },
        }}
        size={props.header ? "small" : "medium"}
      />
      <IconButton aria-label="Search" type="submit" href={handleSubmit()} sx={{ color: `${props.header ? "white" : "black"}`, maxHeight: "100%" }}>
        <Search />
      </IconButton>
    </Stack>
  )
}
