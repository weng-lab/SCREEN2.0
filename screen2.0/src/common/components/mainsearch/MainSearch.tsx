"use client"
import React, { useState } from "react"
import Grid2 from "../../mui-client-wrappers/Grid2"
import { Stack, InputBaseProps, Typography, Box } from "@mui/material"

import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import { CcreAutoComplete } from "./CcreAutocomplete"
import { GeneAutoComplete } from "./GeneAutocomplete"
import { SnpAutoComplete } from "./SnpAutocomplete"
import { CelltypeAutocomplete } from "./CelltypeAutocomplete"
import BedUpload from "./BedUpload"
import GenomicRegion from "./GenomicRegion"

//Should the code for searching live here in one big handleSubmit, or should each search individually handle it, and just have the trigger sent to them?

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

  return (
    <Stack direction={props.header ? "row" : "column"} spacing={3}>
      <Stack direction={"row"} alignItems={"center"}>
        <Typography variant={props.header ? "body1" : "h5"} mr={1} alignSelf="center">Search by</Typography>
        <FormControl variant="standard" size="medium" sx={
          props.header ?
          { 
            '& .MuiInputBase-root': { color: "white" }, 
            '& .MuiInputBase-root::before': { borderColor: "white" }, 
            '& .MuiInputBase-root::after': { borderColor: "white" },
            '& .MuiSvgIcon-root': { fill: "white" } 
          }
          :
          { '& .MuiInputBase-root': { fontSize: '1.5rem' } }}>
          <Select
            fullWidth
            id="select-search"
            value={selectedSearch}
            onChange={handleSearchChange}
            //Manually aligning like this isn't ideal
            SelectDisplayProps={{ style: { paddingBottom: '0px', paddingTop: '1px' } }}
          >
            <MenuItem value={"Genomic Region"}>Genomic Region</MenuItem>
            <MenuItem value={"cCRE Accession"}>cCRE Accession</MenuItem>
            <MenuItem value={"SNP rsID"}>SNP rsID</MenuItem>
            <MenuItem value={"Gene Name"}>Gene Name</MenuItem>
            <MenuItem value={"Cell Type"}>Cell Type</MenuItem>
            <MenuItem value={".BED Intersect"}>.BED Intersect</MenuItem>
          </Select>
        </FormControl>
        <Typography variant={props.header ? "body1" : "h5"} ml={1} mr={1} alignSelf="center">in</Typography>
        <FormControl variant="standard" size="medium" sx={
          props.header ?
          { 
            '& .MuiInputBase-root': { color: "white" }, 
            '& .MuiInputBase-root::before': { borderColor: "white" }, 
            '& .MuiInputBase-root::after': { borderColor: "white" },
            '& .MuiSvgIcon-root': { fill: "white" } 
          }
          :
          { '& .MuiInputBase-root': { fontSize: '1.5rem' } }}>
          <Select
            fullWidth
            id="select-search"
            value={assembly}
            onChange={handleAssemblyChange}
            SelectDisplayProps={{ style: { paddingBottom: '0px', paddingTop: '1px' } }}
          >
            <MenuItem value={"GRCh38"}>GRCh38</MenuItem>
            <MenuItem value={"mm10"}>mm10</MenuItem>
          </Select>
        </FormControl>
      </Stack>
      <Box>
        {selectedSearch === "Genomic Region" ? (
          <GenomicRegion assembly={assembly} header={props.header} />
        ) : selectedSearch === "Gene Name" ? (
          <GeneAutoComplete textColor={props.textColor || "black"} assembly={assembly} header={props.header} />
        ) : selectedSearch === "SNP rsID" ? (
          <SnpAutoComplete textColor={props.textColor || "black"} assembly={assembly} header={props.header} />
        ) : selectedSearch === "Cell Type" ? (
          <CelltypeAutocomplete textColor={props.textColor || "black"} assembly={assembly} header={props.header} />
        ) : selectedSearch === "cCRE Accession" ? (
          <CcreAutoComplete textColor={props.textColor || "black"} assembly={assembly} header={props.header} />
        ) :
          // Need to make this able to submit 
          <BedUpload assembly={assembly} header={props.header} />
        }
      </Box>
    </Stack>
  )
}

export default MainSearch
