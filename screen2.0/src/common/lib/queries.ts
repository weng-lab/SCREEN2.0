/**
 * Send the request to our Server from a server component
 */

import { getClient } from "../lib/client"
import { gql } from "@apollo/client"

const cCRE_QUERY = gql`
  query ccreSearchQuery(
    $accessions: [String!]
    $assembly: String!
    $cellType: String
    $coord_chrom: String
    $coord_end: Int
    $coord_start: Int
    $element_type: String
    $gene_all_start: Int
    $gene_all_end: Int
    $gene_pc_start: Int
    $gene_pc_end: Int
    $rank_ctcf_end: Float!
    $rank_ctcf_start: Float!
    $rank_dnase_end: Float!
    $rank_dnase_start: Float!
    $rank_enhancer_end: Float!
    $rank_enhancer_start: Float!
    $rank_promoter_end: Float!
    $rank_promoter_start: Float!
    $uuid: String
    $limit: Int
  ) {
    cCRESCREENSearch(
      assembly: $assembly
      accessions: $accessions
      cellType: $cellType
      coord_chrom: $coord_chrom
      coord_end: $coord_end
      coord_start: $coord_start
      element_type: $element_type
      gene_all_start: $gene_all_start
      gene_all_end: $gene_all_end
      gene_pc_start: $gene_pc_start
      gene_pc_end: $gene_pc_end
      rank_ctcf_end: $rank_ctcf_end
      rank_ctcf_start: $rank_ctcf_start
      rank_dnase_end: $rank_dnase_end
      rank_dnase_start: $rank_dnase_start
      rank_enhancer_end: $rank_enhancer_end
      rank_enhancer_start: $rank_enhancer_start
      rank_promoter_end: $rank_promoter_end
      rank_promoter_start: $rank_promoter_start
      uuid: $uuid
      limit: $limit
    ) {
      chrom
      start
      len
      pct
      ctcf_zscore
      dnase_zscore
      enhancer_zscore
      promoter_zscore
      vistaids
      sct
      pct
      maxz
      rfacets
      in_cart
      info {
        accession
        isproximal
        concordant
        ctcfmax
        k4me3max
        k27acmax
      }
      genesallpc {
        accession
        all {
          end
          start
          chromosome
          assembly
          intersecting_genes {
            name
          }
        }
        pc {
          end
          assembly
          chromosome
          start
          intersecting_genes {
            name
          }
        }
      }
    }
  }
`
function cCRE_QUERY_VARIABLES(assembly: string, chromosome: string, start: number, end: number, biosample?: string) {
  return {
    uuid: null,
    assembly: assembly,
    coord_chrom: chromosome,
    coord_start: start,
    coord_end: end,
    gene_all_start: 0,
    gene_all_end: 5000000,
    gene_pc_start: 0,
    gene_pc_end: 5000000,
    rank_dnase_start: -10,
    rank_dnase_end: 10,
    rank_promoter_start: -10,
    rank_promoter_end: 10,
    rank_enhancer_start: -10,
    rank_enhancer_end: 10,
    rank_ctcf_start: -10,
    rank_ctcf_end: 10,
    cellType: biosample,
    element_type: null,
    limit: 25000,
  }
}

/**
 *
 * @param assembly string, "GRCh38" or "mm10"
 * @param chromosome string, ex: "chr11"
 * @param start number
 * @param end number
 * @param biosample optional - a biosample selection. If not specified or "undefined", will be marked as "null" in gql query
 * @returns cCREs matching the search
 */
export default async function MainQuery(assembly: string, chromosome: string, start: number, end: number, biosample: string = null) {

  console.log("queried with: " + biosample)
  const data = await getClient().query({
    query: cCRE_QUERY,
    variables: cCRE_QUERY_VARIABLES(assembly, chromosome, start, end, biosample),
  })

  return data
}

export const TOP_TISSUES = gql`
  query q($accession: [String!], $assembly: String!) {
    ccREBiosampleQuery(assembly: $assembly) {
      biosamples {
        sampleType
        cCREZScores(accession: $accession) {
          score
          assay
          experiment_accession
        }
        name
        ontology
      }
    }
    cCREQuery(assembly: $assembly, accession: $accession) {
      accession
      group
      zScores {
        score
        experiment
      }
      dnase: maxZ(assay: "DNase")
      h3k4me3: maxZ(assay: "H3K4me3")
      h3k27ac: maxZ(assay: "H3K27ac")
      ctcf: maxZ(assay: "CTCF")
    }
  }
`
export const getGlobals = async () => {
  const res = await fetch("https://downloads.wenglab.org/bycelltype.json")
  return res.json()
}
