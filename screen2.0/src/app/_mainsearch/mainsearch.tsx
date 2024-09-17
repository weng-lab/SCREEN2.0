"use client"
import React, { useState } from "react"
import { Stack, InputBaseProps, Typography, Box } from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import { CcreAutoComplete } from "./ccreautocomplete"
import { SnpAutoComplete } from "./snpautocomplete"
import { CelltypeAutocomplete } from "./celltypeautocomplete"
import BedUpload from "./bedupload"
import GenomicRegion from "./genomicregion"
import { GeneAutocomplete, GeneInfo } from "../search/_geneAutocomplete/GeneAutocomplete"

export type MainSearchProps = InputBaseProps & {
  //false for human, true for mouse
  initialChecked?: boolean,
  header?: boolean
}

export const MainSearch: React.FC<MainSearchProps> = (props: MainSearchProps) => {
  const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
  const [selectedSearch, setSelectedSearch] = useState<string>("Genomic Region")

  const handleSearchChange = (event: SelectChangeEvent) => {
    setSelectedSearch(event.target.value)
  }

  const handleAssemblyChange = (event: SelectChangeEvent) => {
    ((event.target.value === "GRCh38") || (event.target.value === "mm10")) && setAssembly(event.target.value)
  }

  const handleGeneSearch = (gene: GeneInfo) => {
    if (gene) {
      let chrom = gene.coordinates.chromosome
      let start = gene.coordinates.start
      let end = gene.coordinates.end
      let name = gene.name
      window.open(`/search?assembly=${assembly}&chromosome=${chrom}&start=${start}&end=${end}&gene=${name}&tssDistance=0`, "_self")
    }
  }

  return (
      <Stack direction={props.header ? "row" : "column"} spacing={3}>
        <Stack direction={"row"} alignItems={"center"} flexWrap={"wrap"}>
          {!props.header && <Typography variant={"h5"} mr={1} alignSelf="center">Search by</Typography>}
          <Stack direction={"row"} alignItems={"center"} flexWrap={props.header ? "nowrap" : "wrap"}>
            <FormControl variant="standard" size="medium">
            {/* <ThemeProvider theme={darkTheme}> */}
            <Select
              fullWidth
              id="select-search"
              value={selectedSearch}
              onChange={handleSearchChange}
              //Manually aligning like this isn't ideal
              SelectDisplayProps={{ style: { paddingBottom: '0px', paddingTop: '1px' } }}
              sx={props.header ?
                {
                  color: "white",
                  '&:before': {
                    borderColor: 'white',
                  },
                  '&:after': {
                    borderColor: 'white',
                  },
                  '&:not(.Mui-disabled):hover::before': {
                    borderColor: 'white',
                  },
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
                :
                { fontSize: '1.5rem' }
              }
            >
              <MenuItem value={"Genomic Region"}>Genomic Region</MenuItem>
              <MenuItem value={"cCRE Accession"}>cCRE Accession</MenuItem>
              <MenuItem value={"SNP rsID"}>SNP rsID</MenuItem>
              <MenuItem value={"Gene Name"}>Gene Name</MenuItem>
              <MenuItem value={"Cell Type"}>Cell Type</MenuItem>
              <MenuItem value={".BED Intersect"}>.BED Intersect</MenuItem>
            </Select>
            {/* </ThemeProvider> */}
          </FormControl>
          <Typography variant={props.header ? "body1" : "h5"} ml={1} mr={1} alignSelf="center">in</Typography>
          <FormControl variant="standard" size="medium">
            <Select
              fullWidth
              id="select-search"
              value={assembly}
              onChange={handleAssemblyChange}
              SelectDisplayProps={{ style: { paddingBottom: '0px', paddingTop: '1px' } }}
              sx={props.header ?
                {
                  color: "white",
                  '&:before': {
                    borderColor: 'white',
                  },
                  '&:after': {
                    borderColor: 'white',
                  },
                  '&:not(.Mui-disabled):hover::before': {
                    borderColor: 'white',
                  },
                  '& .MuiSvgIcon-root': { color: 'white' }
                }
                :
                { fontSize: '1.5rem' }
              }
            >
              <MenuItem value={"GRCh38"}>GRCh38</MenuItem>
              <MenuItem value={"mm10"}>mm10</MenuItem>
            </Select>
          </FormControl>
          </Stack>
        </Stack>
        <Box>
          {selectedSearch === "Genomic Region" ? (
            <GenomicRegion assembly={assembly} header={props.header} />
          ) : selectedSearch === "Gene Name" ? (
            <GeneAutocomplete
              assembly={assembly}
              colorTheme={props.header ? "dark" : "light"}
              endIcon="search"
              onGeneSubmitted={handleGeneSearch}
              slotProps={{
                stackProps: {width: 300},
                autocompleteProps: {fullWidth: true, size: props.header ? "small" : "medium"},
                inputTextFieldProps: {InputLabelProps: {shrink: true}}
              }} 
            />
          ) : selectedSearch === "SNP rsID" ? (
            <SnpAutoComplete assembly={assembly} header={props.header} />
          ) : selectedSearch === "Cell Type" ? (
            <CelltypeAutocomplete assembly={assembly} header={props.header} />
          ) : selectedSearch === "cCRE Accession" ? (
            <CcreAutoComplete assembly={assembly} header={props.header} />
          ) :
            // Need to make this able to submit 
            <BedUpload assembly={assembly} header={props.header} />
          }
        </Box>
      </Stack>
  )
}
