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
import { ChromHMM } from "./chromhmm";
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

export const CcreDetails: React.FC<CcreDetailsProps> = ({ accession, region, biosampleData, assembly, page, handleOpencCRE }) => {
  const [isPending, startTransition] = useTransition();
  const [linkedGenes, setLinkedGenes] = useState({
    distancePC: null,
    distanceAll: null,
    CTCF_ChIAPET: null,
    RNAPII_ChIAPET: null
  })

  //This is hacky and should be changed once new gene link methods are available
  //Fetch linked genes data. Use startTransition to server fetch to make it easy
  useEffect(() => {
    (!linkedGenes.CTCF_ChIAPET || !linkedGenes.RNAPII_ChIAPET) && startTransition(async () => {
      const linkedGenesData = await fetchLinkedGenes(assembly, [accession])
      try {
        let CTCF_ChIAPET = []
        let RNAPII_ChIAPET = []
        linkedGenesData[accession].genes.forEach(gene => {
          switch (gene.linkedBy) {
            case ("CTCF-ChIAPET"): CTCF_ChIAPET.push(gene.geneName); break;
            case ("RNAPII-ChIAPET"): RNAPII_ChIAPET.push(gene.geneName); break;
          }
        })
        setLinkedGenes({...linkedGenes, CTCF_ChIAPET, RNAPII_ChIAPET})
      } catch (error) {
        console.log(error)
      }
    })
  }, [assembly, accession, linkedGenes])

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
    data_distanceLinked && (!linkedGenes.RNAPII_ChIAPET || !linkedGenes.CTCF_ChIAPET) && setLinkedGenes({
    ...linkedGenes,
     distanceAll: data_distanceLinked.cCRESCREENSearch[0].genesallpc.all.intersecting_genes.map((gene) => gene.name),
     distancePC: data_distanceLinked.cCRESCREENSearch[0].genesallpc.pc.intersecting_genes.map((gene) => gene.name),
    })
  }, [data_distanceLinked])

  
  
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
      {page === 4 && <GeneExpression assembly={assembly} genes={[... new Set(Object.values(linkedGenes).flat())]} />}
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
      {assembly !== "mm10" && page === 8 && <Rampage gene={Object.values(linkedGenes).flat()[0]} />}
      {assembly !== "mm10" && page === 9 && (
            <ChromHMM accession={accession} coordinates={{ chromosome: region.chrom, start: region.start, end: region.end }} assembly={assembly}  />
          )}
    </>
  )
}
