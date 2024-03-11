import React, { useState, useEffect, SetStateAction, useTransition } from "react"
import Box from "@mui/material/Box"
import TextField from "@mui/material/TextField"
import Autocomplete from "@mui/material/Autocomplete"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Typography from "@mui/material/Typography"
import { IconButton, Stack } from "@mui/material"
import { Search } from "@mui/icons-material"
import { parseGenomicRegion } from "./parsegenomicregion"
import { biosampleQuery } from "../../common/lib/queries"
import { RegistryBiosample } from "../search/types"

export const CelltypeAutocomplete: React.FC<{ assembly: string, header?: boolean }> = (props) => {
  const [valueCellType, setValueCellType] = useState<RegistryBiosample>(null)
  const [valueRegion, setValueRegion] = useState(null)
  const [inputValue, setInputValue] = useState("")
  const [options, setOptions] = useState<RegistryBiosample[]>([])
  const [isPending, startTransition] = useTransition();

  //fetch biosample info, populate selected biosample if specified
  useEffect(() => {
    startTransition(async () => {
      const biosamples = await (await biosampleQuery()).data[props.assembly.toLowerCase() === "grch38" ? "human" : "mouse"].biosamples
      setOptions(biosamples)
    })
  }, [props.assembly])

  const handleSubmit = () => {
    if (valueCellType) {
      const tissue = valueCellType.ontology
      const biosample = valueCellType.name
      const biosample_summary = valueCellType.displayname
      let region: { chromosome: string, start: string, end: string }
      if (valueRegion) {
        try {
          region = parseGenomicRegion(valueRegion)
          return (
            `/search?assembly=${props.assembly}&chromosome=${region.chromosome}&start=${Math.max(0, Number(region.start))}&end=${region.end}&BiosampleTissue=${tissue}&BiosampleSummary=${biosample_summary}&Biosample=${biosample}`
          )
        }
        catch (msg) {
          window.alert("Error in input format - " + msg)
          setValueRegion("")
        }
      } else {
        region = { chromosome: 'chr11', start: "5205263", end: "5381894" }
        return (
          `/search?assembly=${props.assembly}&chromosome=${region.chromosome}&start=${Math.max(0, Number(region.start))}&end=${region.end}&BiosampleTissue=${tissue}&BiosampleSummary=${biosample_summary}&Biosample=${biosample}`
        )
      }
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
        onChange={(_, newValue: RegistryBiosample) => {          
          setValueCellType(newValue)
        }}
        inputValue={inputValue}
        onInputChange={(_, newInputValue) => {
          
          setInputValue(newInputValue)
        }}
        noOptionsText={props.assembly === "mm10" ? "strain B6NCrl cortical plate tissue male adult (8 weeks)" : "e.g. LNCAP"}
        getOptionLabel={(option) => option.displayname}
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
                    {option.displayname}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {option.ontology}
                  </Typography>
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
          if (event.key === "Enter" && valueCellType) {
            window.open(handleSubmit(), "_self")
          }
          if (event.key === "Tab" && !valueRegion) {
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
      <IconButton aria-label="Search" type="submit" onClick={() => window.open(handleSubmit(), "_self")} sx={{ color: `${props.header ? "white" : "black"}`, maxHeight: "100%" }}>
        <Search />
      </IconButton>
    </Stack>
  )
}
