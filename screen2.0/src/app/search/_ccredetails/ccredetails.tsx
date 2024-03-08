"use client"
import React, { useEffect, useState, useTransition } from "react"
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
import { ApolloQueryResult, gql } from "@apollo/client"
import { BIOSAMPLE_Data, fetchLinkedGenes } from "../../../common/lib/queries"
import { fetchLinkedGenesData } from "../searchhelpers"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"

//Passing these props through this file could be done with context to reduce prop drilling
type CcreDetailsProps = {
  accession: string
  assembly: "GRCh38" | "mm10"
  region: GenomicRegion
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>
  page: number
  handleOpencCRE: (row: any) => void
}

type LinkedBy = "distancePC" | "distanceAll" | "CTCF-ChIAPET" | "RNAPII-ChIAPET"

export const CcreDetails: React.FC<CcreDetailsProps> = ({ accession, region, biosampleData, assembly, page, handleOpencCRE }) => {
  const [isPending, startTransition] = useTransition();
  const [linkedGenes, setLinkedGenes] = useState<{name: string, linkedBy: LinkedBy[]}[]>([])
  const [fetched, setFetched] = useState(false)
  const [distanceAdded, setDistanceAdded] = useState(false)

  //This is hacky and should be changed once new gene link methods are available
  //Fetch linked genes data. Use startTransition to server fetch to make it easy
  useEffect(() => {
    !fetched && startTransition(async () => {
      const linkedGenesData = await fetchLinkedGenes(assembly, [accession])
      try {
        //make shallow copy
        let newLinkedGenes = [...linkedGenes]
        linkedGenesData[accession].genes.forEach(gene => {
          //try to find gene in list
          if (newLinkedGenes.find(x => x.name === gene.geneName)) {
            //If gene exists, add linking method
            newLinkedGenes = [...newLinkedGenes.map(x => x.name === gene.geneName ? { name: gene.geneName, linkedBy: [...new Set([...x.linkedBy, gene.linkedBy])] } : x)]
          }
          else {
            //else add new entry
            newLinkedGenes = [...newLinkedGenes, { name: gene.geneName, linkedBy: [gene.linkedBy] }]
          }
        })
        setLinkedGenes(newLinkedGenes)
        setFetched(true)
      } catch (error) {
        console.log(error)
      }
    })
  }, [assembly, accession, linkedGenes, fetched])

  const QUERY = gql`
    query nearestGenes(
      $accessions: [String!]
      $assembly: String!
    ) {
      cCRESCREENSearch(accessions: $accessions, assembly: $assembly){
        info{
          accession
        }
        genesallpc {
          all {
            protein_coding
            intersecting_genes {
              name
              strand
              gene_type
    
            }
          }
          pc {
            protein_coding
            intersecting_genes {
              name
              strand
              gene_type
            }
          }
        }
      }
    }
  `

  //fetch distance linked via main query
  const { data: data_distanceLinked, loading: loading_distanceLinked, error: error_distanceLinked } = useQuery(
    QUERY,
    {
      variables: {
        assembly: assembly,
        accessions: [accession],
      }
    }
  )

  useEffect(() => {
    if (data_distanceLinked && !distanceAdded) {
      let newLinkedGenes = [...linkedGenes]
      data_distanceLinked.cCRESCREENSearch[0].genesallpc.pc.intersecting_genes.forEach((gene: {name: string, strand: "+" | "-", gene_type: string}) => {
        if (newLinkedGenes.find(x => x.name === gene.name)) {
          //If gene exists, add linking method
          newLinkedGenes = [...newLinkedGenes.map(x => x.name === gene.name ? { name: gene.name, linkedBy: [...x.linkedBy, "distancePC" as LinkedBy] } : x)]
        }
        else {
          //else add new entry
          newLinkedGenes = [...newLinkedGenes, { name: gene.name, linkedBy: ["distancePC"] }]
        }
      })
      data_distanceLinked.cCRESCREENSearch[0].genesallpc.all.intersecting_genes.forEach((gene: {name: string, strand: "+" | "-", gene_type: string}) => {
        if (newLinkedGenes.find(x => x.name === gene.name)) {
          //If gene exists, add linking method
          newLinkedGenes = [...newLinkedGenes.map(x => x.name === gene.name ? { name: gene.name, linkedBy: [...x.linkedBy, "distanceAll" as LinkedBy] } : x)]
        }
        else {
          //else add new entry
          newLinkedGenes = [...newLinkedGenes, { name: gene.name, linkedBy: ["distanceAll"] }]
        }
      })
      setDistanceAdded(true)
      setLinkedGenes(newLinkedGenes)
    }
  }, [data_distanceLinked, linkedGenes])
  
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
          handleOpencCRE={handleOpencCRE}
        />
      )}
      {page === 3 && <Ortholog accession={accession} assembly={assembly} />}      
      {page === 4 && linkedGenes.length > 0 && <GeneExpression assembly={assembly} genes={linkedGenes} />}
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
      {assembly !== "mm10" && page === 8 && linkedGenes.length > 0 && <Rampage genes={linkedGenes} />}
    </>
  )
}
