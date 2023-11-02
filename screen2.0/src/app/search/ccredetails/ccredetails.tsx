"use client"
import React from "react"
import { Typography, Stack, Divider } from "@mui/material"
import { GenomicRegion, LinkedGenesData } from "../types"
import { InSpecificBiosamples } from "./inspecificbiosample"
import { NearByGenomicFeatures } from "./nearbygenomicfeatures"
import { LinkedGenes } from "./linkedgenes"
import { Ortholog } from "./linkedccres"
import { TfIntersection } from "./tfintersection"
import { FunctionData } from "./functionaldata"
import Rampage from "./rampage"
import { GeneExpression } from "./gene-expression"
import { TfSequenceFeatures} from "../gbview/tfsequencefeatures"

//Passing these props through this file could be done with context to reduce prop drilling
type CcreDetailsProps = {
  accession: string
  assembly: "GRCh38" | "mm10"
  region: GenomicRegion
  globals: any
  genes: LinkedGenesData
  page: number
}

export const CcreDetails: React.FC<CcreDetailsProps> = ({ accession, region, globals, assembly, genes, page }) => {
  let geneList =  [...genes.distancePC.map(g=>g.name), ...genes.distanceAll.map(g=>g.name)]
  return (
    <>
      <Stack direction="row" justifyContent={"space-between"} alignItems={"baseline"}>
        <Typography variant="h4">{accession}</Typography>
        <Typography variant="h5">{`${region.chrom}:${region.start}-${region.end}`}</Typography>
      </Stack>
      <Divider sx={{mb: 2}}/>
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
      {page === 4 && <Ortholog accession={accession} assembly={assembly} />}      
      {page === 5 && <GeneExpression assembly={assembly} genes={geneList} />}
      {page === 6 && <FunctionData accession={accession} coordinates={{ chromosome: region.chrom, start: +region.start.toString().replace(/\D/g, ""), end: +region.end.toString().replace(/\D/g, "") }} assembly={assembly} />}
      { page === 7 && <TfSequenceFeatures assembly={assembly} coordinates = {{ chromosome: region.chrom, start: +(region.start.replace(/\D/g, "")), end: +(region.end.replace(/\D/g, "")) }} />}
      {assembly!=="mm10" && page === 8 && <Rampage gene={genes.distancePC[0].name} />}
    </>
  )
}
