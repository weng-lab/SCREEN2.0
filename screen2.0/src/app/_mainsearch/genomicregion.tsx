import { TextField, IconButton, Stack, Select, MenuItem, SelectChangeEvent, FormControl, InputLabel, Typography, FormControlLabel, Radio, RadioGroup } from "@mui/material"
import { useState, SetStateAction } from "react"
import { Search } from "@mui/icons-material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { parseGenomicRegion } from "./parsegenomicregion"

//https://mui.com/material-ui/react-text-field/#integration-with-3rd-party-input-libraries
//For formatting the start/end as it's being entered.

const GenomicRegion = (props: { assembly: "mm10" | "GRCh38", header?: boolean }) => {
  const [value, setValue] = useState('')
  const [chromosome, setChromosome] = useState('11')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [inputType, setInputType] = useState("UCSC")


  const assembly = props.assembly

  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setValue(event.target.value)
  }

  //TODO: Better catch errors in input so that invalid values are not passed to api
  function handleSubmit(): string {
    console.log("submit function called")
    if (inputType === "Separated") {
      return `/search?assembly=${assembly}&chromosome=${"chr" + chromosome}&start=${start.replace(new RegExp(',', 'g'), "") ?? "5205263"}&end=${end.replace(new RegExp(',', 'g'), "") ?? "5381894"}`
    } else {
      if (!value) {
        return `/search?assembly=${assembly}&chromosome=chr11&start=5205263&end=5381894`
      }
      try {
        const region = parseGenomicRegion(value)
        return `/search?assembly=${assembly}&chromosome=${region.chromosome}&start=${region.start}&end=${region.end}`
      }
      catch (msg) {
        window.alert("Error in input format - " + msg)
        setValue("")
      }
    }
  }


  return (
    <Grid2 container spacing={2}>
      {!props.header && <Grid2 xs={12} pt={0}>
        <FormControl>
          {/* <FormLabel id="demo-row-radio-buttons-group-label">Input Format</FormLabel> */}
          <RadioGroup
            row
            aria-labelledby="input-format"
            name="row-radio-buttons-group"
            value={inputType}
            onChange={(event) => setInputType(event.target.value)}
          >
            <FormControlLabel value="UCSC" control={<Radio />} label="chr:start-end" />
            <FormControlLabel value="Separated" control={<Radio />} label="Individual Inputs" />
          </RadioGroup>
        </FormControl>
      </Grid2>}
      <Grid2 xs={12}>
        <Stack direction="row" alignItems="center">
          {inputType === "Separated" ?
            //Separated Input
            <>
              <FormControl sx={{minWidth: "auto !important"}}>
                <InputLabel id="demo-simple-select-standard-label">Chr</InputLabel>
                <Select
                  MenuProps={{
                    sx: {
                      maxHeight: "25rem",
                    },
                  }}
                  labelId="demo-simple-select-standard-label"
                  id="demo-simple-select-standard"
                  value={chromosome}
                  onChange={(event: SelectChangeEvent) => setChromosome(event.target.value)}
                  label="Chr"
                  sx={
                    props.header ?
                      { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }
                      :
                      { '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' } }
                  }
                  size={props.header ? "small" : "medium"}
                >
                  {Array.from({ length: 22 }, (_, i) => i + 1).map((value) => (
                    (value < 20 || value >= 20 && (assembly === "GRCh38")) && <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                  <MenuItem value={'X'}>X</MenuItem>
                  <MenuItem value={'Y'}>Y</MenuItem>
                </Select>
              </FormControl>
              <Typography sx={{ justifySelf: "center" }} ml="0.5rem">
                :
              </Typography>
              <TextField
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                label="Start"
                placeholder="5205263"
                value={start}
                onChange={(event: { target: { value: SetStateAction<string> } }) => {
                  setStart(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    window.open(handleSubmit(), "_self")
                  }
                  if (event.key === "Tab" && !start) {
                    setStart("5205263")
                  }
                }}
                sx={
                  props.header ?
                    { mr: "0.5rem", ml: "0.5rem", fieldset: { borderColor: "white" }, maxWidth: "7rem" }
                    :
                    { mr: "0.5rem", ml: "0.5rem", fieldset: { borderColor: "black" }, maxWidth: "7rem" }
                }
                size={props.header ? "small" : "medium"}
              />
              <Typography sx={{ justifySelf: "center" }}>
                –
              </Typography>
              <TextField
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                label="End"
                placeholder="5381894"
                value={end}
                onChange={(event: { target: { value: SetStateAction<string> } }) => {
                  setEnd(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    window.open(handleSubmit(), "_self")
                  }
                  if (event.key === "Tab" && !end) {
                    setEnd("5381894")
                  }
                }}
                
                sx={
                  props.header ?
                    { mr: "1rem", ml: "0.5rem", fieldset: { borderColor: "white" }, maxWidth: "7rem" }
                    :
                    { mr: {xs: "0rem", sm: "1rem"}, ml: "0.5rem", fieldset: { borderColor: "black" }, maxWidth: "7rem" }
                }
                size={props.header ? "small" : "medium"}
              />
            </>
            :
            //UCSC Input
            <TextField
              variant="outlined"
              InputLabelProps={{ shrink: true, style: props.header ? {color: "white"} : { color: "black" } }}
              label="Enter a genomic region"
              placeholder="chr11:5205263-5381894"
              value={value}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  window.open(handleSubmit(), "_self")
                }
                if (event.key === "Tab" && !value) {
                  setValue("chr11:5205263-5381894")
                }
              }}
              InputProps={props.header ? { style: { color: "white" } } : {}}
              sx={{
                mr: "1rem",
                minWidth: "16rem",
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
          }
          <IconButton onClick={() =>  window.open(handleSubmit(), "_self")} aria-label="Search" type="submit" sx={{ color: `${props.header ? "white" : "black"}`, maxHeight: "100%" }}>
            <Search />
          </IconButton>
        </Stack>
      </Grid2>
    </Grid2>
  )
}

export default GenomicRegion
