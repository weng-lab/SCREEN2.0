"use client"
import React, { useState } from "react"
import Grid2 from "../../mui-client-wrappers/Grid2"
import { Stack, TextField, IconButton, InputAdornment, InputBaseProps, createTheme } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import GenomeSwitch from "../GenomeSwitch"
import { useRouter } from "next/navigation"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import { CcreAutoComplete } from "./CcreAutocomplete"
import { GeneAutoComplete } from "./GeneAutocomplete"
import { SnpAutoComplete } from "./SnpAutocomplete"
import { CelltypeAutocomplete } from "./CelltypeAutocomplete"
import BedUpload from "./BedUpload"

export type MainSearchProps = InputBaseProps & {
  //false for human, true for mouse
  initialChecked?: boolean,  
  textColor?: string
}
const MainSearch: React.FC<MainSearchProps> = (props: MainSearchProps) => {
  const [value, setValue] = useState("")
  const [checked, setChecked] = useState(props.initialChecked || false)
  const [selectedSearch, setSelectedSearch] = useState<string>("Genomic Region")
  const assembly = checked ? "mm10" : "GRCh38"
  const handleSearchChange = (event: SelectChangeEvent) => {
    setSelectedSearch(event.target.value)
  }
  const router = useRouter()

  const handleChange = (event: { target: { value: React.SetStateAction<string> } }) => {
    setValue(event.target.value)
  }

  function handleSubmit() {
    const assembly = checked ? "mm10" : "GRCh38"
    //if submitted with empty value, use default search
    if (value == "") {
      router.push(`/search?assembly=${assembly}&chromosome=chr11&start=5205263&end=5381894`)
      return
    }
    const input = value.split(":")
    const chromosome = input[0]
    const coordinates = input[1].split("-")
    const start = coordinates[0]
    const end = coordinates[1]
    router.push(`/search?assembly=${assembly}&chromosome=${chromosome}&start=${start}&end=${end}`)
  }

  return (
    <Stack direction={"row"} sx={{ mt: "1em", display: "flex", flexGrow: 1 }}>
      <Grid2 container>
        <Grid2>
          <FormControl variant="standard">
            <Select
              fullWidth
              sx={{
                "&:before": { borderColor: props.textColor || "black" },
                "&:after": { borderColor: props.textColor || "black" },
                "& .MuiSelect-iconStandard": { color: props.textColor || "black" },
                color: props.textColor || "black",
              }}
              id="select-search"
              value={selectedSearch}
              onChange={handleSearchChange}
            >
              <MenuItem value={"Genomic Region"}>Genomic Region</MenuItem>
              <MenuItem value={"cCRE Accession"}>cCRE Accession</MenuItem>
              <MenuItem value={"SNP rsID"}>SNP rsID</MenuItem>
              <MenuItem value={"Gene Name"}>Gene Name</MenuItem>
              <MenuItem value={"Cell Type"}>Cell Type</MenuItem>
              <MenuItem value={".BED Intersect"}>.BED Intersect</MenuItem>
            </Select>
          </FormControl>
        </Grid2>
        <Grid2>
          {selectedSearch === "Genomic Region" ? (
            <TextField
              variant="outlined"
              InputLabelProps={{ shrink: true, style: { color: props.textColor || "black" } }}
              label="Enter a genomic region in form chr:start-end."
              placeholder="chr11:5205263-5381894"
              value={value}
              onChange={handleChange}
              onKeyDown={(event) => {
                if (event.code === "Enter") {
                  handleSubmit()
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end" sx={{ color: props.textColor || "black" }}>
                    <IconButton aria-label="Search" type="submit" onClick={() => handleSubmit()} sx={{ color: props.textColor || "black" }}>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                style: { color: props.textColor || "black" },
              }}
              sx={{ mr: "1em", ml: "1em", fieldset: { borderColor: props.textColor || "black" } }}
            />
          ) : selectedSearch === "Gene Name" ? (
            <GeneAutoComplete textColor={props.textColor || "black"} assembly={assembly} />
          ) : selectedSearch === "SNP rsID" ? (
            <SnpAutoComplete textColor={props.textColor || "black"} assembly={assembly} />
          ) : selectedSearch === "Cell Type" ? (
            <CelltypeAutocomplete textColor={props.textColor || "black"} assembly={assembly} />
          ) : selectedSearch === "cCRE Accession" ? (
            <CcreAutoComplete textColor={props.textColor || "black"} assembly={assembly} />
          ) :
          // Need to make this able to submit 
          <BedUpload assembly={assembly}/>
          }
        </Grid2>
        <Grid2>
          {/* Need to make this use router to get to new page with bed stuff specified in the url */}
          <GenomeSwitch
            initialChecked={props.initialChecked && props.initialChecked}
            checked={checked}
            onSwitchChange={(checked) => setChecked(checked)}
          />
        </Grid2>
      </Grid2>
    </Stack>
  )
}

export default MainSearch
