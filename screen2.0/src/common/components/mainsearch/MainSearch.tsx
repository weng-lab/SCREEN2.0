"use client"
import React, { useState } from "react"
import Grid2 from "../../mui-client-wrappers/Grid2"
import { Stack, TextField, IconButton, InputAdornment, InputBaseProps, createTheme, Typography } from "@mui/material"
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
import GenomicRegion from "./GenomicRegion"
import { URLParams } from "../../../app/search/types"

export type MainSearchProps = InputBaseProps & {
  //false for human, true for mouse
  initialChecked?: boolean,
  textColor?: string,
  header?: boolean
}
const MainSearch: React.FC<MainSearchProps> = (props: MainSearchProps) => {
  const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
  const [selectedSearch, setSelectedSearch] = useState<string>("Genomic Region")
  
  const handleSearchChange = (event: SelectChangeEvent) => {
    setSelectedSearch(event.target.value)
  }

  const handleAssemblyChange = (event: SelectChangeEvent) => {
    ((event.target.value === "GRCh38") || (event.target.value === "mm10")) && setAssembly(event.target.value)
  }

  const router = useRouter()

  function handleSubmit(chromosome: string, start: string, end: string): void {
    console.log("handleSubmit called")
    router.push(`/search?assembly=${assembly}&chromosome=${"chr" + chromosome}&start=${start}&end=${end}`)
  }

  return (
    <Grid2 container spacing={3}>
      <Grid2 xs={12}>
        <Stack direction={"row"} >
          <Typography variant="h5" mr={1} alignSelf="center">Search by</Typography>
          <FormControl variant="standard" size="medium" sx={{'& .MuiInputBase-root': {fontSize: '1.5rem'}}}>
            <Select
              fullWidth
              id="select-search"
              value={selectedSearch}
              onChange={handleSearchChange}
              //Manually aligning like this isn't ideal
              SelectDisplayProps={{style: {paddingBottom: '0px', paddingTop: '1px'}}}
            >
              <MenuItem value={"Genomic Region"}>Genomic Region</MenuItem>
              <MenuItem value={"cCRE Accession"}>cCRE Accession</MenuItem>
              <MenuItem value={"SNP rsID"}>SNP rsID</MenuItem>
              <MenuItem value={"Gene Name"}>Gene Name</MenuItem>
              <MenuItem value={"Cell Type"}>Cell Type</MenuItem>
              <MenuItem value={".BED Intersect"}>.BED Intersect</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="h5" ml={1} mr={1} alignSelf="center">in</Typography>
          <FormControl variant="standard" size="medium" sx={{'& .MuiInputBase-root': {fontSize: '1.5rem'}}}>
            <Select
              fullWidth
              id="select-search"
              value={assembly}
              onChange={handleAssemblyChange}
              SelectDisplayProps={{style: {paddingBottom: '0px', paddingTop: '1px'}}}
            >
              <MenuItem value={"GRCh38"}>GRCh38</MenuItem>
              <MenuItem value={"mm10"}>mm10</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Grid2>
      <Grid2 xs={12} display={"inline-flex"}>
        {selectedSearch === "Genomic Region" ? (
          <GenomicRegion assembly={assembly} onSubmit={(chromosome: string, start: string, end: string) => handleSubmit(chromosome, start, end)} />
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
          <BedUpload assembly={assembly} />
        }
        <IconButton aria-label="Search" type="submit" onClick={null} sx={{ color: "black" || "black" }}>
          <SearchIcon />
        </IconButton>
      </Grid2>
    </Grid2>
  )
}

export default MainSearch
