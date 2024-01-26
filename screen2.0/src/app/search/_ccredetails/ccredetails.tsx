"use client"
import React from "react"
import { Typography, Stack, Divider } from "@mui/material"
import { CellTypeData, GenomicRegion, LinkedGenesData } from "../types"
import { InSpecificBiosamples } from "./inspecificbiosample"
import { NearByGenomicFeatures } from "./nearbygenomicfeatures"
import { LinkedGenes } from "./linkedgenes"
import { Ortholog } from "./linkedccres"
import { TfIntersection } from "./tfintersection"
import { FunctionData } from "./functionaldata"
import Rampage from "./rampage"
import { GeneExpression } from "./geneexpression"
import { TfSequenceFeatures} from "../_gbview/tfsequencefeatures"
import ConfigureGBTab from "./configuregbtab"

//Passing these props through this file could be done with context to reduce prop drilling
type CcreDetailsProps = {
  accession: string
  assembly: "GRCh38" | "mm10"
  region: GenomicRegion
  globals: CellTypeData
  genes: LinkedGenesData
  page: number
}

export const CcreDetails: React.FC<CcreDetailsProps> = ({ accession, region, globals, assembly, genes, page }) => {
  let geneList =  [...genes.distancePC.map(g=>g.name), ...genes.distanceAll.map(g=>g.name)]
  return (
    <>
      <Stack direction="row" justifyContent={"space-between"} alignItems={"baseline"}>
        <Typography variant="h4">{accession}</Typography>
        <Typography variant="h6">{`${region.chrom}:${region.start.toLocaleString("en-US")}-${region.end.toLocaleString("en-US")}`}</Typography>
      </Stack>
      <Divider sx={{mb: 2}}/>
      {page === 0 && <InSpecificBiosamples accession={accession} assembly={assembly} />}
      {page === 1 && <LinkedGenes accession={accession} assembly={assembly} />}
      {page === 2 && (
        <NearByGenomicFeatures
          accession={accession}
          assembly={assembly}
          coordinates={{
            chromosome: region.chrom,
            start: +region.start,
            end: +region.end,
          }}
        />
      )}
      {page === 3 && <Ortholog accession={accession} assembly={assembly} />}      
      {page === 4 && <GeneExpression assembly={assembly} genes={geneList} />}
      {page === 5 && <FunctionData accession={accession} coordinates={{ chromosome: region.chrom, start: region.start, end: region.end }} assembly={assembly} />}
      {page === 6 &&
        <>
          <TfSequenceFeatures assembly={assembly} coordinates={{ chromosome: region.chrom, start: region.start, end: region.end }} />
          <TfIntersection
            assembly={assembly}
            coordinates={{
              chromosome: region.chrom,
              start: region.start,
              end: region.end,
            }}
          />
        </>
      }
      {page === 7 &&
        <ConfigureGBTab
          byCellType={globals}
          coordinates={{
            assembly: assembly,
            chromosome: region.chrom,
            start: region.start,
            end: region.end
          }} 
          accession={accession}
        />
      }
      {assembly !== "mm10" && page === 8 && <Rampage gene={genes.distancePC[0].name} />}
    </>
  )
}
