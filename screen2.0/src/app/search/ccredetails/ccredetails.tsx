"use client"
import React from "react"
import { Typography, Paper, ThemeProvider, AppBar, Toolbar, IconButton, Box, Stack, Divider } from "@mui/material"
import { GenomicRegion, LinkedGenesData } from "../types"
import { InSpecificBiosamples } from "./inspecificbiosample"
import { NearByGenomicFeatures } from "./nearbygenomicfeatures"
import { LinkedGenes } from "./linkedgenes"
import { Ortholog } from "./linkedccres"
import { TfIntersection } from "./tfintersection"
import { FunctionData } from "./functionaldata"
import Rampage from "./rampage"
import { GeneExpression } from "./gene-expression"

type CcreDetailsProps = {
  accession: string
  assembly: string
  region: GenomicRegion
  globals: any
  genes: LinkedGenesData
  page: number
}

export const CcreDetails: React.FC<CcreDetailsProps> = ({ accession, region, globals, assembly, genes, page }) => {
  return (
    <>
      <Stack direction="row" justifyContent={"space-between"} alignItems={"baseline"}>
        <Typography variant="h4">{accession}</Typography>
        <Typography variant="h5">{`${region.chrom}:${region.start}-${region.end}`}</Typography>
      </Stack>
      <Divider/>
      {page === 0 && <InSpecificBiosamples accession={accession} globals={globals} assembly={assembly} />}
      {page === 1 && <LinkedGenes accession={accession} assembly={assembly} />}
      {page === 2 && (
        <NearByGenomicFeatures
          accession={accession}
          assembly={assembly}
          coordinates={{
            chromosome: region.chrom,
            start: +region.start.replace(/\D/g, ""),
            end: +region.end.replace(/\D/g, ""),
          }}
        />
      )}
      {page === 3 && (
        <TfIntersection
          assembly={assembly}
          coordinates={{
            chromosome: region.chrom,
            start: +region.start.toString().replace(/\D/g, ""),
            end: +region.end.toString().replace(/\D/g, ""),
          }}
        />
      )}
      {page === 5 && <Ortholog accession={accession} assembly={assembly} />}
      {page === 6 && <Rampage gene={genes.distancePC[0].name} />}
      {page === 7 && <GeneExpression accession={accession} assembly={assembly} genes={genes} hamburger={false} />}
      {page === 8 && <FunctionData accession={accession} coordinates={{ chromosome: region.chrom, start: +region.start.toString().replace(/\D/g, ""), end: +region.end.toString().replace(/\D/g, "") }} assembly={assembly} />}
    </>
  )
}
