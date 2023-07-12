"use client"
import React from "react"
import { Tab, Tabs, Typography, Paper } from "@mui/material"
import { GenomicRegion } from "../types"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { StyledTab } from "../ccresearch"
import { InSpecificBiosamples } from "./inspecificbiosample"
import { NearByGenomicFeatures } from "./nearbygenomicfeatures"
import { LinkedGenes } from "./linkedgenes"
import { Ortholog } from "./linkedccres"

type CcreDetailsProps = {
  accession: string
  assembly: string
  region: GenomicRegion
  globals: any
}

export const CcreDetails: React.FC<CcreDetailsProps> = ({ accession, region, globals, assembly }) => {
  const [value, setValue] = React.useState(0)
  const handleChange = (_, newValue: number) => {
    setValue(newValue)
  }
  return (
    <Paper>
      <Grid2 container spacing={3} sx={{ ml: "2rem", mt: "2rem", mb: "2rem" }}>
        <Grid2 xs={2} lg={2}>
          <Typography sx={{ ml: "1rem", mt: "1rem" }} variant="h5">
            {accession}
          </Typography>
        </Grid2>
        <Grid2 xs={3} lg={3}>
          <Typography sx={{ mt: "1.5rem" }}>{`${region.chrom}:${region.start}-${region.end}`}</Typography>
        </Grid2>
      </Grid2>
      <Grid2 container spacing={3} sx={{ ml: "2rem", mt: "2rem", mb: "2rem" }}>
        <Grid2 xs={12} lg={12}>
          <Tabs aria-label="basic tabs example" value={value} onChange={handleChange}>
            <StyledTab label="In Specific Biosamples" />
            <StyledTab label="Linked Genes" />
            <StyledTab label="Nearby Genomic Features" />
            <StyledTab label="TF and His-mod Intersection" />
            <StyledTab label="TF Motifs and Sequence Features" />
            <StyledTab label="Linked cCREs in other Assemblies" />
          </Tabs>
        </Grid2>
        {
          <Grid2 container spacing={3} sx={{ mt: "1rem", mb: "1rem", mr: "2rem" }}>
            <Grid2 xs={12} lg={12}>
              {value === 0 && <InSpecificBiosamples accession={accession} globals={globals} assembly={assembly} />}
              {value === 1 && <LinkedGenes accession={accession} assembly={assembly} />}
              {value ===2 && <NearByGenomicFeatures accession={accession} assembly={assembly} coordinates={{chromosome: region.chrom, start: +region.start.toString().replace(/\D/g,''), end: +region.end.toString().replace(/\D/g,'')}} />}
              {value === 5 && <Ortholog accession={accession} assembly={assembly} />}
            </Grid2>
          </Grid2>
        }
      </Grid2>
    </Paper>
  )
}
