"use client"
import React, { useCallback, useMemo, useState } from "react"
import { Typography, Stack, Divider } from "@mui/material"
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
  nearbyGenes: NearbyGeneInfo[]
  linkedGenes: LinkedGeneInfo[]
}

export type NearbyWithDistanceAndLinked = {
  nearbyGenes: NearbyGeneInfoWithDistance[]
  linkedGenes: LinkedGeneInfo[]
}

type NearbyAndLinkedVariables = {
  assembly: string
  accession: string
  geneChr: string
  geneStart: number
  geneEnd: number
  genesVersion: number
}

function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  if (coord1.end < coord2.start) {
    return coord2.start - coord1.end;
  } else if (coord2.end < coord1.start) {
    return coord1.start - coord2.end;
  } else {
    return 0;
  }
}

const extractClosestGenes = (genesList: NearbyGeneInfo[], targetRegion: Coordinates, numGenes: number): NearbyGeneInfoWithDistance[] => {
  return genesList
    .map(gene => ({
      ...gene,
      distance: calculateDistance(gene.coordinates, targetRegion)
    }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, numGenes)
}

export const CcreDetails: React.FC<CcreDetailsProps> = ({ accession, region, biosampleData, assembly, page, handleOpencCRE }) => {
  const { loading: loadingLinkedGenes, data: dataNearbyAndLinked }: { loading: boolean, data: NearbyAndLinked } = useQuery<NearbyAndLinked, NearbyAndLinkedVariables>(NEARBY_AND_LINKED_GENES, {
    variables: {
      assembly: assembly.toLowerCase(),
      accession: accession,
      geneChr: region.chrom,
      geneStart: region.start - 1000000,
      geneEnd: region.end + 1000000,
      genesVersion: assembly === "GRCh38" ? 40 : 25 //Version 40 for Human, 25 for Mouse
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  const nearest3AndLinkedGenes: NearbyWithDistanceAndLinked = useMemo(() => {
    return dataNearbyAndLinked ? {
      linkedGenes: [...dataNearbyAndLinked.linkedGenes.map((g) => {return {...g, gene: g.gene.split(' ')[0]}})],
      nearbyGenes: extractClosestGenes(dataNearbyAndLinked.nearbyGenes, { chromosome: region.chrom, start: region.start, end: region.end }, 3)
    } : null
  }, [dataNearbyAndLinked, region.chrom, region.end, region.start])

  const combinedGenes: (LinkedGeneInfo | NearbyGeneInfoWithDistance)[] = []
  if (nearest3AndLinkedGenes) {
    combinedGenes.push(...nearest3AndLinkedGenes.nearbyGenes)
    combinedGenes.push(...nearest3AndLinkedGenes.linkedGenes)
  }

  const uniqueGenes: {
    name: string;
    linkedBy: string[];
  }[] = [];

  for (const gene of combinedGenes) {
    const geneName = gene['gene'] ?? gene['name']
    const methodToPush = gene['distance'] !== undefined ? `Distance - ${gene['distance']} bp` : gene['assay'] ?? gene['method']
    const existingGeneEntry = uniqueGenes.find((uniqueGene) => uniqueGene.name === geneName)
    if (existingGeneEntry) {
      !existingGeneEntry.linkedBy.find(method => method === methodToPush) && existingGeneEntry.linkedBy.push(methodToPush) //deduplicate for linking methods with multiple tissues
    } else uniqueGenes.push({name: geneName, linkedBy: [methodToPush]})
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
      {page === 1 && assembly !== "mm10" && dataNearbyAndLinked &&
        <LinkedGenes linkedGenes={nearest3AndLinkedGenes.linkedGenes} />
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
      {/* @todo replace genses here */}
      {page === 4 && uniqueGenes.length > 0 &&
        <GeneExpression assembly={assembly} genes={uniqueGenes} biosampleData={biosampleData} />
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
      {page === 8 && assembly !== "mm10" && uniqueGenes.length > 0 &&
        <Rampage genes={uniqueGenes} biosampleData={biosampleData} />
      }
    </>
  )
}
