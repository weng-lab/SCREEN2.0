import { TextField, InputAdornment, IconButton, Stack, Select, MenuItem, SelectChangeEvent, FormControl, InputLabel, Typography } from "@mui/material"
import { useState } from "react"
import { Search } from "@mui/icons-material"
import { useRouter } from "next/navigation"

//https://mui.com/material-ui/react-text-field/#integration-with-3rd-party-input-libraries
//For formatting the start/end as it's being entered.

const GenomicRegion = (props: { assembly: "mm10" | "GRCh38", header?: boolean }) => {
  const [chromosome, setChromosome] = useState('11')
  const [start, setStart] = useState(null)
  const [end, setEnd] = useState(null)

  const router = useRouter()

  const assembly = props.assembly

  function handleSubmit(): void {
    console.log("handleSubmit called")
    router.push(`/search?assembly=${assembly}&chromosome=${"chr" + chromosome}&start=${start ?? "5205263"}&end=${end ?? "5381894"}`)
  }

  //TODO disallow entry of values outside of chromosome lengths and outside of a certain range (no searching whole chromosome)
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
    <Stack direction="row" alignItems="center">
      <FormControl sx={{ minWidth: "6.25rem" }}>
        <InputLabel id="demo-simple-select-standard-label">Chromosome</InputLabel>
        <Select
          labelId="demo-simple-select-standard-label"
          id="demo-simple-select-standard"
          value={chromosome}
          onChange={(event: SelectChangeEvent) => setChromosome(event.target.value)}
          // size="small"
          label="Chromosome"
          sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'black' } }}
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
        sx={{ mr: "1em", ml: "1em", fieldset: { borderColor: "black" || "black" } }}
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
        sx={{ mr: "1em", ml: "1em", fieldset: { borderColor: "black" || "black" } }}
        size={props.header ? "small" : "medium"}
      />
      <IconButton aria-label="Search" type="submit" onClick={() => handleSubmit()} sx={{ color: "black" || "black", maxHeight: "100%" }}>
        <Search />
      </IconButton>
    </Stack>
  )
}

export default GenomicRegion