import {
  TextField,
  IconButton,
  Stack,
  Select,
  MenuItem,
  SelectChangeEvent,
  FormControl,
  InputLabel,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material"
import { useState, SetStateAction, useEffect, useMemo } from "react"
import { Search } from "@mui/icons-material"
import Grid from "@mui/material/Grid2"
import { parseGenomicRegion } from "./parsegenomicregion"

//https://mui.com/material-ui/react-text-field/#integration-with-3rd-party-input-libraries
//For formatting the start/end as it's being entered.

const GenomicRegion = (props: { assembly: "mm10" | "GRCh38"; header?: boolean }) => {
  const [value, setValue] = useState("")
  const [chromosome, setChromosome] = useState("11")
  const [start, setStart] = useState("")
  const [end, setEnd] = useState("")
  const [inputType, setInputType] = useState("UCSC")
  const [error, setError] = useState(false)
  const [sepErrStart, setSepErrStart] = useState(false)
  const [sepErrEnd, setSepErrEnd] = useState(false)

  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setValue(event.target.value)
    validateInput(event.target.value.toString())
  }

  const chromosomeLengths: { [key: string]: { [key: string]: number } } = {
    GRCh38: {
      "1": 248956422,
      "2": 242193529,
      "3": 198295559,
      "4": 190214555,
      "5": 181538259,
      "6": 170805979,
      "7": 159345973,
      "8": 145138636,
      "9": 138394717,
      "10": 133797422,
      "11": 135086622,
      "12": 133275309,
      "13": 114364328,
      "14": 107043718,
      "15": 101991189,
      "16": 90338345,
      "17": 83257441,
      "18": 80373285,
      "19": 58617616,
      "20": 64444167,
      "21": 46709983,
      "22": 50818468,
      X: 156040895,
      Y: 57227415,
    },
    mm10: {
      "1": 195471971,
      "2": 182113224,
      "3": 160039680,
      "4": 156508116,
      "5": 151834684,
      "6": 149736546,
      "7": 145441459,
      "8": 129401213,
      "9": 124595110,
      "10": 130694993,
      "11": 122082543,
      "12": 120129022,
      "13": 120421639,
      "14": 124902244,
      "15": 104043685,
      "16": 98207768,
      "17": 94987271,
      "18": 90702639,
      "19": 61431566,
      X: 171031299,
      Y: 91744698,
    },
  }

  useEffect(() => {
    if (!value) {
      setError(false)
    }
    if (!start) {
      setSepErrStart(false)
    }
    if (!end) {
      setSepErrEnd(false)
    }
  }, [value, start, end])

  // for chr:start-end
  const validateInput = (input: string) => {
    const expression = /^chr(\d+|X|Y):[0-9,]*-[0-9,]*$/
    let isValid = false

    if (input.includes("\t")) {
      const inputArr = input.split("\t")
      const c = inputArr[0]
      const s = inputArr[1].replace(/,/g, "")
      const e = inputArr[2].replace(/,/g, "")
      input = `${c}:${s}-${e}`
    }

    const match = input.match(/^chr(\d+|X|Y):/)

    if (expression.test(input)) {
      const c = match ? match[1] : null
      const coordinates = input.split(":")[1]?.split("-")
      const startInt = coordinates?.[0] ? parseInt(coordinates[0].replace(/,/g, "")) : null
      const endInt = coordinates?.[1] ? parseInt(coordinates[1].replace(/,/g, "")) : null

      if (c && startInt !== null && endInt !== null) {
        if (c in chromosomeLengths[props.assembly] && startInt < endInt && startInt > 0 && endInt <= chromosomeLengths[props.assembly][c]) {
          isValid = true
        }
      }
    }

    setError(!isValid)
  }
  // for individual input
  const validateSeparatedInput = (start: string, end: string, chromosome: string) => {
    const startInt = start ? parseInt(start.replace(/,/g, "")) : null
    const endInt = end ? parseInt(end.replace(/,/g, "")) : null

    if (startInt !== null && startInt < endInt && startInt > 0) {
      setSepErrStart(false)
    } else {
      setSepErrStart(true)
    }
    if (
      endInt !== null &&
      startInt < endInt &&
      chromosome in chromosomeLengths[props.assembly] &&
      endInt <= chromosomeLengths[props.assembly][chromosome]
    ) {
      setSepErrEnd(false)
    } else {
      setSepErrEnd(true)
    }
  }

  // revalidate on assembly change
  useEffect(() => {
    if (value) {
      validateInput(value)
    }
    if (chromosome && start && end) {
      validateSeparatedInput(start, end, chromosome)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chromosome, end, props.assembly, start, value])

  //TODO: Better catch errors in input so that invalid values are not passed to api
  function generateURL(
    value: string,
    inputType: string,
    assembly: "mm10" | "GRCh38",
    chromosome: string,
    start: string,
    end: string
  ): string {
    if (inputType === "Separated") {
      return `/search?assembly=${assembly}&chromosome=${"chr" + chromosome}&start=${start.replace(new RegExp(",", "g"), "") ?? "5205263"}&end=${end.replace(new RegExp(",", "g"), "") ?? "5381894"}`
    } else {
      if (!value) {
        return `/search?assembly=${assembly}&chromosome=chr11&start=5205263&end=5381894`
      }
      try {
        const region = parseGenomicRegion(value)
        // setError(false)
        return `/search?assembly=${assembly}&chromosome=${region.chromosome}&start=${region.start}&end=${region.end}`
      } catch (error) {
        //If function can't parse input
        // setError(true)
      }
    }
  }

  const url = useMemo(() => {
    return generateURL(value, inputType, props.assembly, chromosome, start, end)
  }, [value, inputType, props.assembly, chromosome, start, end])

  return (
    <Grid container spacing={2}>
      {!props.header && (
        <Grid pt={0} size={12}>
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
        </Grid>
      )}
      <Grid size={12}>
        <Stack direction="row" alignItems="center">
          {inputType === "Separated" ? (
            <>
              <FormControl sx={{ minWidth: "auto !important" }}>
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
                  onChange={(event: SelectChangeEvent) => {
                    setChromosome(event.target.value)
                    validateSeparatedInput(start, end, event.target.value)
                    if (!start && !end) {
                      setSepErrEnd(false)
                      setSepErrStart(false)
                    }
                  }}
                  label="Chr"
                  sx={
                    props.header
                      ? { "& .MuiOutlinedInput-notchedOutline": { borderColor: "white" } }
                      : { "& .MuiOutlinedInput-notchedOutline": { borderColor: "black" } }
                  }
                  size={props.header ? "small" : "medium"}
                >
                  {Array.from({ length: 22 }, (_, i) => i + 1).map(
                    (value) =>
                      (value < 20 || (value >= 20 && props.assembly === "GRCh38")) && (
                        <MenuItem key={value} value={value}>
                          {value}
                        </MenuItem>
                      )
                  )}
                  <MenuItem value={"X"}>X</MenuItem>
                  <MenuItem value={"Y"}>Y</MenuItem>
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
                  validateSeparatedInput(event.target.value.toString(), end, chromosome)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    window.open(url, "_self")
                  }
                  if (event.key === "Tab" && !start) {
                    setStart("5205263")
                  }
                }}
                sx={
                  props.header
                    ? {
                        mr: "0.5rem",
                        ml: "0.5rem",
                        fieldset: sepErrStart ? { borderColor: "red" } : { borderColor: "white" },
                        maxWidth: "7rem",
                      }
                    : {
                        mr: "0.5rem",
                        ml: "0.5rem",
                        fieldset: sepErrStart ? { borderColor: "red" } : { borderColor: "black" },
                        maxWidth: "7rem",
                      }
                }
                size={props.header ? "small" : "medium"}
                error={sepErrStart}
              />
              <Typography sx={{ justifySelf: "center" }}>–</Typography>
              <TextField
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                label="End"
                placeholder="5381894"
                value={end}
                onChange={(event: { target: { value: SetStateAction<string> } }) => {
                  setEnd(event.target.value)
                  validateSeparatedInput(start, event.target.value.toString(), chromosome)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    window.open(url, "_self")
                  }
                  if (event.key === "Tab" && !end) {
                    setEnd("5381894")
                  }
                }}
                sx={
                  props.header
                    ? {
                        mr: "1rem",
                        ml: "0.5rem",
                        fieldset: sepErrEnd ? { borderColor: "red" } : { borderColor: "white" },
                        maxWidth: "7rem",
                      }
                    : {
                        mr: { xs: "0rem", sm: "1rem" },
                        ml: "0.5rem",
                        fieldset: sepErrEnd ? { borderColor: "red" } : { borderColor: "black" },
                        maxWidth: "7rem",
                      }
                }
                size={props.header ? "small" : "medium"}
                error={sepErrEnd}
              />
            </>
          ) : (
            //UCSC Input
            (<TextField
              variant="outlined"
              InputLabelProps={{
                shrink: true,
                htmlFor: "region-input",
                style: error ? null : props.header ? { color: "white" } : { color: "black" },
              }}
              id="region-input"
              label="Enter a genomic region"
              placeholder={`chr11:${(5205263).toLocaleString()}-${(5381894).toLocaleString()}`}
              value={value}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  if (!error) {
                    window.open(url, "_self")
                  }
                }
                if (event.key === "Tab" && !value) {
                  const defaultGenomicRegion = `chr11:${(5205263).toLocaleString()}-${(5381894).toLocaleString()}`
                  setValue(defaultGenomicRegion)
                }
              }}
              InputProps={props.header ? { style: { color: "white" } } : {}}
              sx={{
                mr: "1rem",
                minWidth: "16rem",
                fieldset: error ? { borderColor: "error" } : props.header ? { borderColor: "white" } : { borderColor: "black" },
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": error ? { borderColor: "error" } : props.header ? { borderColor: "white" } : { borderColor: "black" },
                  "&.Mui-focused fieldset": error
                    ? { borderColor: "error" }
                    : props.header
                      ? { borderColor: "white" }
                      : { borderColor: "black" },
                },
              }}
              size={props.header ? "small" : "medium"}
              error={error}
              helperText={error ? (props.header ? "" : "Invalid format or range.") : ""}
            />)
          )}
          <IconButton
            aria-label="Search"
            type="submit"
            sx={{ color: `${props.header ? "white" : "black"}`, maxHeight: "100%" }}
            onClick={() => {
              if ((inputType !== "Separated" && !error) || (inputType === "Separated" && !sepErrStart && !sepErrEnd)) {
                window.open(url, "_self")
              }
            }}
          >
            <Search />
          </IconButton>
        </Stack>
      </Grid>
    </Grid>
  );
}

export default GenomicRegion
