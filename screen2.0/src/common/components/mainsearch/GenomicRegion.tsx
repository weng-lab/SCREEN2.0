import { TextField, InputAdornment, IconButton, Stack, Select, MenuItem, SelectChangeEvent, FormControl, InputLabel, Typography, FormControlLabel, FormLabel, Radio, RadioGroup } from "@mui/material"
import { useState } from "react"
import { Search } from "@mui/icons-material"
import { useRouter } from "next/navigation"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"

//https://mui.com/material-ui/react-text-field/#integration-with-3rd-party-input-libraries
//For formatting the start/end as it's being entered.

const GenomicRegion = (props: { assembly: "mm10" | "GRCh38", header?: boolean }) => {
  const [value, setValue] = useState("")
  const [chromosome, setChromosome] = useState('11')
  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)
  const [inputType, setInputType] = useState("UCSC")

  const router = useRouter()

  const assembly = props.assembly

  const handleChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setValue(event.target.value)
  }

  //TODO: Better catch errors in input so that invalid values are not passed to api
  function handleSubmit(): void {
    if (inputType === "Separated") {
      router.push(`/search?assembly=${assembly}&chromosome=${"chr" + chromosome}&start=${start ?? "5205263"}&end=${end ?? "5381894"}`)
    } else {
      if (value == "") {
        router.push(`/search?assembly=${assembly}&chromosome=chr11&start=5205263&end=5381894`)
        return
      }
      try {
        //This is the tab character
        let input: string[]
        let chromosome: string
        let coordinates: string[]
        let start: string
        let end: string
        if (value.includes("	")){
          input = value.split("	")
          chromosome = input[0]
          start = input[1].replace(new RegExp(',', 'g'), "")
          end = input[2].replace(new RegExp(',', 'g'), "")
        } else {
          input = value.split(":")
          chromosome = input[0]
          coordinates = input[1].split("-")
          start = coordinates[0].replace(new RegExp(',', 'g'), "")
          end = coordinates[1].replace(new RegExp(',', 'g'), "")
        }
        router.push(`/search?assembly=${assembly}&chromosome=${chromosome}&start=${start}&end=${end}`)
      }
      catch (msg) {
        window.alert("Error in input format" + msg)
        setValue("")
      }
    }
  }

  const chromosomeLengths = {
    human: {
      1: 248956422,
      2: 242193529,
      3: 198295559,
      4: 190214555,
      5: 181538259,
      6: 170805979,
      7: 159345973,
      8: 145138636,
      9: 138394717,
      10: 133797422,
      11: 135086622,
      12: 133275309,
      13: 114364328,
      14: 107043718,
      15: 101991189,
      16: 90338345,
      17: 83257441,
      18: 80373285,
      19: 58617616,
      20: 64444167,
      21: 46709983,
      22: 50818468,
      X: 156040895,
      Y: 57227415,
    },
    mouse: {
      1: 195471971,
      2: 182113224,
      3: 160039680,
      4: 156508116,
      5: 151834684,
      6: 149736546,
      7: 145441459,
      8: 129401213,
      9: 124595110,
      10: 130694993,
      11: 122082543,
      12: 120129022,
      13: 120421639,
      14: 124902244,
      15: 104043685,
      16: 98207768,
      17: 94987271,
      18: 90702639,
      19: 61431566,
      X: 171031299,
      Y: 91744698,
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
              <FormControl>
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
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={6}>6</MenuItem>
                  <MenuItem value={7}>7</MenuItem>
                  <MenuItem value={8}>8</MenuItem>
                  <MenuItem value={9}>9</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={11}>11</MenuItem>
                  <MenuItem value={12}>12</MenuItem>
                  <MenuItem value={13}>13</MenuItem>
                  <MenuItem value={14}>14</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                  <MenuItem value={16}>16</MenuItem>
                  <MenuItem value={17}>17</MenuItem>
                  <MenuItem value={18}>18</MenuItem>
                  <MenuItem value={19}>19</MenuItem>
                  {assembly === "GRCh38" && <MenuItem value={20}>20</MenuItem>}
                  {assembly === "GRCh38" && <MenuItem value={21}>21</MenuItem>}
                  {assembly === "GRCh38" && <MenuItem value={22}>22</MenuItem>}
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
                onChange={(event: { target: { value: React.SetStateAction<string> } }) => {
                  setStart(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.code === "Enter") {
                    handleSubmit()
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
                onChange={(event: { target: { value: React.SetStateAction<string> } }) => {
                  setEnd(event.target.value)
                }}
                onKeyDown={(event) => {
                  if (event.code === "Enter") {
                    handleSubmit()
                  }
                }}
                sx={
                  props.header ?
                    { mr: "1rem", ml: "0.5rem", fieldset: { borderColor: "white" }, maxWidth: "7rem" }
                    :
                    { mr: "1rem", ml: "0.5rem", fieldset: { borderColor: "black" }, maxWidth: "7rem" }
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
                if (event.code === "Enter") {
                  handleSubmit()
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
          <IconButton aria-label="Search" type="submit" onClick={() => handleSubmit()} sx={{ color: `${props.header ? "white" : "black"}`, maxHeight: "100%" }}>
            <Search />
          </IconButton>
        </Stack>
      </Grid2>
    </Grid2>

  )
}

export default GenomicRegion