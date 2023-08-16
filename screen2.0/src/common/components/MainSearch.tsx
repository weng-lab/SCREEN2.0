"use client"
import React, {useState} from "react"
import Grid from "@mui/material/Grid";
import { InputBase, Switch, Stack, Typography, TextField, FormHelperText, IconButton, InputAdornment, InputBaseProps } from "@mui/material"
import SearchIcon from "@mui/icons-material/Search"
import GenomeSwitch from "./GenomeSwitch"
import { useRouter } from "next/navigation"
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { CcreAutoComplete } from "./CcreAutocomplete";
import { GeneAutoComplete } from "./GeneAutocomplete";
import { SnpAutoComplete} from "./SnpAutocomplete";
import { CelltypeAutocomplete } from "./CelltypeAutocomplete"
export type MainSearchProps = InputBaseProps & {
  //false for human, true for mouse
  initialChecked?: boolean
}

const MainSearch: React.FC<MainSearchProps> = (props: MainSearchProps) => {
  const [value, setValue] = useState("")
  const [checked, setChecked] = useState(props.initialChecked || false)
  const [selectedSearch, setSelectedSearch] = useState<string>("Genomic Region");
  const assembly = checked ? "mm10" : "GRCh38"
  const handleSearchChange = (event: SelectChangeEvent) => {
    
    setSelectedSearch(event.target.value);
  };
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
       <Grid container>
        <Grid item>
       <FormControl variant="standard">
            <Select
            fullWidth
              id="select-search"
              value={selectedSearch}
              onChange={handleSearchChange}
            >
              <MenuItem value={"Genomic Region"}>Genomic Region</MenuItem>
              <MenuItem value={"cCRE Accession"}>cCRE Accession</MenuItem>
              <MenuItem value={"SNP rsID"}>SNP rsID</MenuItem>
              <MenuItem value={"Gene Name"}>Gene Name</MenuItem>
              <MenuItem value={"Cell Type"}>Cell Type</MenuItem>
            </Select>
          </FormControl>
          </Grid>
          <Grid item>
      {selectedSearch==="Genomic Region" ? <TextField
        
        variant="outlined"
        InputLabelProps={{ shrink: true }}
        label="Enter a genomic region in form chr:start-end."
        placeholder='chr11:5205263-5381894'
        // helperText='You may also enter a cell type name to filter results.'
        value={value}
        onChange={handleChange}
        onKeyDown={(event) => {
          if (event.code === "Enter") {
            handleSubmit()
          }
        }}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton aria-label="Search" type="submit" onClick={() => handleSubmit()}>
                <SearchIcon />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{ mr: "1em", ml:"1em" }}
      /> : selectedSearch==="Gene Name" ? <GeneAutoComplete assembly={assembly}/> : selectedSearch==="SNP rsID" ? <SnpAutoComplete assembly={assembly}/> : selectedSearch==="Cell Type"? <CelltypeAutocomplete assembly={assembly}/> : <CcreAutoComplete assembly={assembly}  />}
      </Grid>
      <Grid>
      <GenomeSwitch
        initialChecked={props.initialChecked && props.initialChecked}
        checked={checked}
        onSwitchChange={(checked) => setChecked(checked)}
      />
      </Grid>
      </Grid>
    </Stack>
  )
}

export default MainSearch
