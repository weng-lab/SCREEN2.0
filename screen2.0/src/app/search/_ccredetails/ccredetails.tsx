"use client"
import React, { useMemo } from "react"
import { Typography, Stack, Divider, CircularProgress } from "@mui/material"
import { GenomicRegion } from "../types"
import { InSpecificBiosamples } from "./inspecificbiosample"
import { NearByGenomicFeatures } from "./nearbygenomicfeatures"
import { LinkedGenes } from "./linkedgenes"
import { Ortholog } from "./linkedccres"
import { TfIntersection } from "./tfintersection"
import { FunctionData } from "./functionaldata"
import { ChromHMM } from "./chromhmm"
import Rampage from "./rampage"
import { GeneExpression } from "./geneexpression"
import { TfSequenceFeatures } from "../_gbview/tfsequencefeatures"
import ConfigureGBTab from "./configuregbtab"
import { ApolloQueryResult } from "@apollo/client"
import { BIOSAMPLE_Data } from "../../../common/lib/queries"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { NEARBY_AND_LINKED_GENES } from "./queries"
import { calcDistToTSS } from "./utils"
import GraphComponent from "./graphcomponent"
import { LoadingMessage } from "../../../common/lib/utility"

//Passing these props through this file could be done with context to reduce prop drilling
type CcreDetailsProps = {
  accession: string
  assembly: "GRCh38" | "mm10"
  region: GenomicRegion
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>
  page: number
  handleOpencCRE: (row: any) => void
}

export type LinkedGeneInfo = {
  p_val: number
  gene: string
  geneid: string
  genetype: string
  method: "CRISPR" | "Chromatin" | "eQTLs"
  accession: string
  grnaid: string
  effectsize: number
  assay: "RNAPII-ChIAPET" | "CTCF-ChIAPET" | "Intact-HiC" | "CRISPRi-FlowFISH"
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
  strand: "+" | "-"
  coordinates: Coordinates
  transcripts: {
    id: string
    coordinates: Coordinates
  }[]
}

export type NearbyGeneInfoWithDistance = NearbyGeneInfo & { distanceToTSS: number }

export type NearbyAndLinked = {
  nearbyGenes: NearbyGeneInfo[]
  linkedGenes: LinkedGeneInfo[]
}

export type NearbyWithDistanceAndLinked = {
  nearbyGenes: NearbyGeneInfoWithDistance[]
  linkedGenes: LinkedGeneInfo[]
}

export type NearbyAndLinkedVariables = {
  accessions: String[]
  assembly: String
  geneSearchStart: Number
  geneSearchEnd: Number
  geneSearchChrom: String
  geneVersion: 40 | 25
}

export const CcreDetails: React.FC<CcreDetailsProps> = ({ accession, region, biosampleData, assembly, page, handleOpencCRE }) => {
  //Fetch linked genes and genes within a 2M bp window around cCRE
  const {
    loading: loadingLinkedGenes,
    data: dataNearbyAndLinked,
    error: errorNearbyAndLinked,
  } = useQuery<NearbyAndLinked, NearbyAndLinkedVariables>(NEARBY_AND_LINKED_GENES, {
    variables: {
      assembly: assembly.toLowerCase(),
      accessions: [accession],
      geneSearchChrom: region.chrom,
      geneSearchStart: region.start - 1000000,
      geneSearchEnd: region.end + 1000000,
      geneVersion: assembly.toLowerCase() === "grch38" ? 40 : 25,
    },
    skip: !region,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  //Find distance to nearest TSS for each nearby gene, and only keep the closest 3
  const nearest3AndLinkedGenes: NearbyWithDistanceAndLinked = useMemo(() => {
    return dataNearbyAndLinked
      ? {
          //remove trailing space in return data
          linkedGenes: [
            ...dataNearbyAndLinked.linkedGenes.map((g) => {
              return { ...g, gene: g.gene.split(" ")[0] }
            }),
          ],
          nearbyGenes: [
            ...dataNearbyAndLinked.nearbyGenes.map((gene) => {
              return {
                ...gene,
                distanceToTSS: calcDistToTSS(region, gene.transcripts, gene.strand),
              }
            }),
          ]
            .sort((a, b) => a.distanceToTSS - b.distanceToTSS)
            .slice(0, 3),
        }
      : null
  }, [dataNearbyAndLinked, region])

  //Used to pass genes and their linking method to Gene Expression and RAMPAGE pages
  const uniqueGenes: { name: string; linkedBy: string[] }[] = useMemo(() => {
    const uniqueGenes: { name: string; linkedBy: string[] }[] = []
    if (nearest3AndLinkedGenes) {
      for (const gene of [...nearest3AndLinkedGenes.nearbyGenes, ...nearest3AndLinkedGenes.linkedGenes]) {
        const isNearbyGene: boolean = Object.hasOwn(gene, "distanceToTSS")
        let geneName: string
        let methodToPush: string
        if (isNearbyGene) {
          geneName = (gene as NearbyGeneInfoWithDistance).name
          methodToPush = `Distance to TSS - ${(gene as NearbyGeneInfoWithDistance).distanceToTSS.toLocaleString()} bp`
        } else {
          geneName = (gene as LinkedGeneInfo).gene
          methodToPush = (gene as LinkedGeneInfo).assay ?? (gene as LinkedGeneInfo).method
        }
        const existingGeneEntry = uniqueGenes.find((uniqueGene) => uniqueGene.name === geneName)
        if (existingGeneEntry) {
          //add linking method if duplicate doesn't exist
          !existingGeneEntry.linkedBy.find((method) => method === methodToPush) && existingGeneEntry.linkedBy.push(methodToPush)
        } else uniqueGenes.push({ name: geneName, linkedBy: [methodToPush] })
      }
    }
    return uniqueGenes
  }, [nearest3AndLinkedGenes])

  return region ? (
    <>
      <Stack direction="row" justifyContent={"space-between"} alignItems={"baseline"}>
        <Typography variant="h4">{accession}</Typography>
        <Typography variant="h6">{`${region.chrom}:${region.start.toLocaleString("en-US")}-${region.end.toLocaleString("en-US")}`}</Typography>
      </Stack>
      <Divider sx={{ mb: 2 }} />
      {page === 0 && <InSpecificBiosamples accession={accession} assembly={assembly} />}
      {page === 1 &&
        assembly !== "mm10" &&
        (loadingLinkedGenes ? (
          <CircularProgress />
        ) : errorNearbyAndLinked ? (
          <Typography>{`Issue fetching Linked Genes for ${accession}.`}</Typography>
        ) : (
          <LinkedGenes linkedGenes={nearest3AndLinkedGenes?.linkedGenes || []} />
        ))}
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
      {page === 3 && <Ortholog accession={accession} assembly={assembly} />}
      {page === 4 &&
        (loadingLinkedGenes ? (
          <CircularProgress />
        ) : errorNearbyAndLinked ? (
          <Typography>{`Issue fetching Linked Genes for ${accession}. Please use our Gene Expression Applet`}</Typography>
        ) : (
          <GeneExpression assembly={assembly} genes={uniqueGenes || []} biosampleData={biosampleData} />
        ))}
      {page === 5 && (
        <FunctionData
          accession={accession}
          coordinates={{ chromosome: region.chrom, start: region.start, end: region.end }}
          assembly={assembly}
        />
      )}
      {page === 6 && (
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
      )}
      {page === 7 && (
        <ConfigureGBTab
          biosampleData={biosampleData}
          coordinates={{
            assembly: assembly,
            chromosome: region.chrom,
            start: region.start,
            end: region.end,
          }}
          accession={accession}
        />
      )}
      {page === 9 && assembly !== "mm10" && (
        <ChromHMM
          accession={accession}
          coordinates={{ chromosome: region.chrom, start: region.start, end: region.end }}
          assembly={assembly}
        />
      )}
      {page === 8 &&
        assembly !== "mm10" &&
        (!dataNearbyAndLinked || loadingLinkedGenes ? (
          <CircularProgress />
        ) : errorNearbyAndLinked ? (
          <Typography>{`Issue fetching Linked Genes for ${accession}.`}</Typography>
        ) : (
          <Rampage genes={uniqueGenes.length > 0 ? uniqueGenes : []} biosampleData={biosampleData} />
        ))}

      {page === 10 && assembly !== "mm10" && <GraphComponent accession={accession} />}
    </>
  ) : (
    <LoadingMessage />
  )
}
