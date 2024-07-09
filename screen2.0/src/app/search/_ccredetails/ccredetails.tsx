"use client"
import React, { useCallback, useMemo, useState } from "react"
import { Typography, Stack, Divider, CircularProgress } from "@mui/material"
import { GenomicRegion, MainQueryParams } from "../types"
import { InSpecificBiosamples } from "./inspecificbiosample"
import { NearByGenomicFeatures } from "./nearbygenomicfeatures"
import { LinkedGenes } from "./linkedgenes"
import { Ortholog } from "./linkedccres"
import { TfIntersection } from "./tfintersection"
import { FunctionData } from "./functionaldata"
import { ChromHMM } from "./chromhmm";
import Rampage from "./rampage"
import { GeneExpression } from "./geneexpression"
import { TfSequenceFeatures } from "../_gbview/tfsequencefeatures"
import ConfigureGBTab from "./configuregbtab"
import { ApolloQueryResult } from "@apollo/client"
import { BIOSAMPLE_Data } from "../../../common/lib/queries"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { NEARBY_AND_LINKED_GENES } from "./queries"
import Error from "../../error"

//Passing these props through this file could be done with context to reduce prop drilling
type CcreDetailsProps = {
  accession: string
  assembly: "GRCh38" | "mm10"
  region: GenomicRegion
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>
  page: number
  handleOpencCRE: (row: any) => void
}

type LinkedBy = "distance (PC)" | "distanceAll" | "CTCF-ChIAPET" | "RNAPII-ChIAPET"

export type LinkedGeneInfo = {
  p_val: number
  gene: string
  geneid: string
  genetype: string
  method: string
  accession: string
  grnaid: string
  effectsize: number
  assay: string
  celltype: string
  experiment_accession: string
  score: number
  variantid: string
  source: string
  slope: number
  tissue: string
  displayname: string
}

type Coordinates = {
  chromosome: string
  start: number
  end: number
}

type NearbyGeneInfo = {
  name: string
  id: string
  gene_type: string
  coordinates: Coordinates
}

export type NearbyGeneInfoWithDistance = {
  name: string
  id: string
  gene_type: string
  coordinates: Coordinates
  distance: number
}

type NearbyAndLinked = {
  nearestGenes: [{ intersecting_genes: NearbyGeneInfo[] }]
  linkedGenes: LinkedGeneInfo[]
}

export type NearbyWithDistanceAndLinked = {
  nearestGenes: [{ intersecting_genes: NearbyGeneInfoWithDistance[] }]
  linkedGenes: LinkedGeneInfo[]
}

type NearbyAndLinkedVariables = {
  assembly: string
  accession: string
  coordinates: { chromosome: string, start: number, stop: number }
  nearbyLimit: number
}

function calculateDistanceFromEdges(coord1: Coordinates, coord2: Coordinates): number {
  if (coord1.end < coord2.start) {
    return coord2.start - coord1.end;
  } else if (coord2.end < coord1.start) {
    return coord1.start - coord2.end;
  } else {
    return 0;
  }
}

export function calculateDistanceFromMiddles(coord1: Coordinates, coord2: Coordinates): number {
  const mid1 = (coord1.start + coord1.end) / 2
  const mid2 = (coord2.start + coord2.end) / 2
  return Math.floor(Math.abs(mid1 - mid2))
}


export const CcreDetails: React.FC<CcreDetailsProps> = ({ accession, region, biosampleData, assembly, page, handleOpencCRE }) => {

  const { loading: loadingLinkedGenes, data: dataNearbyAndLinked, error: errorNearbyAndLinked, refetch } = useQuery<NearbyAndLinked, NearbyAndLinkedVariables>(NEARBY_AND_LINKED_GENES, {
    variables: {
      assembly: assembly.toLowerCase(),
      accession: accession,
      coordinates: { chromosome: region.chrom, start: region.start - 1000000, stop: region.end + 1000000 },
      nearbyLimit: 3
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  const nearest3AndLinkedGenes: NearbyWithDistanceAndLinked = useMemo(() => {
    return dataNearbyAndLinked ? {
      linkedGenes: [...dataNearbyAndLinked.linkedGenes.map((g) => { return { ...g, gene: g.gene.split(' ')[0] } })], //remove trailing space in return data
      nearestGenes: [{
        intersecting_genes: [...dataNearbyAndLinked.nearestGenes[0].intersecting_genes.map((gene) => {
          return { ...gene, distance: calculateDistanceFromMiddles({ chromosome: region.chrom, start: region.start, end: region.end }, gene.coordinates) }
        })]
      }]
    } : null
  }, [dataNearbyAndLinked, region.chrom, region.end, region.start])

  //Used to pass genes and their linking method to gene expression and RAMPAGE app
  const uniqueGenes: { name: string; linkedBy: string[]; }[] = [];

  if (nearest3AndLinkedGenes) {
    for (const gene of [
      ...nearest3AndLinkedGenes.nearestGenes[0].intersecting_genes,
      ...nearest3AndLinkedGenes.linkedGenes
    ]) {
      const geneName = gene['gene'] ?? gene['name']
      const methodToPush = gene['distance'] !== undefined ? `Distance - ${gene['distance']} bp` : gene['assay'] ?? gene['method']
      const existingGeneEntry = uniqueGenes.find((uniqueGene) => uniqueGene.name === geneName)
      if (existingGeneEntry) {
        !existingGeneEntry.linkedBy.find(method => method === methodToPush) && existingGeneEntry.linkedBy.push(methodToPush) //deduplicate for linking methods with multiple tissues
      } else uniqueGenes.push({ name: geneName, linkedBy: [methodToPush] })
    }
  }

  return (
    <>
      <Stack direction="row" justifyContent={"space-between"} alignItems={"baseline"}>
        <Typography variant="h4">{accession}</Typography>
        <Typography variant="h6">{`${region.chrom}:${region.start.toLocaleString("en-US")}-${region.end.toLocaleString("en-US")}`}</Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {page === 0 &&
        <InSpecificBiosamples accession={accession} assembly={assembly} />
      }
      {(page === 1 && assembly !== "mm10") &&
        (loadingLinkedGenes ?
        <CircularProgress />
        :
        errorNearbyAndLinked ?
          <Typography>{`Issue fetching Linked Genes for ${accession}.`}</Typography>
          :
          <LinkedGenes linkedGenes={nearest3AndLinkedGenes?.linkedGenes || []} />)
      }
      {page === 2 && (
        <NearByGenomicFeatures
          accession={accession}
          assembly={assembly}
          coordinates={{
            chromosome: region.chrom,
            start: +region.start,
            end: +region.end,
          }}
          handleOpencCRE={handleOpencCRE}
        />
      )}
      {page === 3 &&
        <Ortholog accession={accession} assembly={assembly} />
      }
      {(page === 4) &&
        (loadingLinkedGenes ?
        <CircularProgress />
        :
        errorNearbyAndLinked ?
          <Typography>{`Issue fetching Linked Genes for ${accession}. Please use our Gene Expression Applet`}</Typography> 
          :
          <GeneExpression assembly={assembly} genes={uniqueGenes || []} biosampleData={biosampleData} />)
      }
      {page === 5 &&
        <FunctionData accession={accession} coordinates={{ chromosome: region.chrom, start: region.start, end: region.end }} assembly={assembly} />
      }
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
          biosampleData={biosampleData}
          coordinates={{
            assembly: assembly,
            chromosome: region.chrom,
            start: region.start,
            end: region.end
          }}
          accession={accession}
        />
      }
      {page === 9 && assembly !== "mm10" &&
        <ChromHMM accession={accession} coordinates={{ chromosome: region.chrom, start: region.start, end: region.end }} assembly={assembly} />
      }
      {(page === 8 && assembly !== "mm10") &&
      (loadingLinkedGenes ?
        <CircularProgress />
        :
        errorNearbyAndLinked ?
          <Typography>{`Issue fetching Linked Genes for ${accession}.`}</Typography> 
          :
          <Rampage genes={uniqueGenes || []} biosampleData={biosampleData} />)
      }
    </>
  )
}
