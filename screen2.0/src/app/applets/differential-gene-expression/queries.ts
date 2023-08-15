import { gql } from "@apollo/client"

export const GENE_SEARCH_QUERY = gql`
  query ($assembly: String!, $chromosome: String, $start: Int, $end: Int, $limit: Int) {
    gene(assembly: $assembly, chromosome: $chromosome, start: $start, end: $end, limit: $limit) {
      name
      id
      coordinates {
        chromosome
        start
        end
      }
      strand
    }
  }
`

export const ZSCORE_QUERY = gql`
  query ccreSearchQuery(
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
      ctspecific {
        h3k4me3_zscore
        h3k27ac_zscore
      }
    }
  }
`
