import { gql } from "@apollo/client"

export const GENE_AUTOCOMPLETE_QUERY = `
  query ($assembly: String!, $name_prefix: [String!], $limit: Int) {
    gene(assembly: $assembly, name_prefix: $name_prefix, limit: $limit) {
      name
      id
      coordinates {
        start
        chromosome
        end
      }
    }
  }
`

export const GENE_SEARCH_QUERY = gql`
  query ($assembly: String!,  $chromosome: String, $start: Int, $end: Int, $limit: Int) {
    gene( assembly: $assembly, chromosome: $chromosome, start: $start, end: $end, limit: $limit) {
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
  $assembly: String!,
  $cellType: String,
  $coord_chrom: String,
  $coord_end: Int,
  $coord_start: Int,
  $element_type: String,
  $gene_all_start: Int,
  $gene_all_end: Int,
  $gene_pc_start: Int,
  $gene_pc_end: Int,
  $rank_ctcf_end: Float!,
  $rank_ctcf_start: Float!,
  $rank_dnase_end: Float!,
  $rank_dnase_start: Float!,
  $rank_enhancer_end: Float!,
  $rank_enhancer_start: Float!,
  $rank_promoter_end: Float!,
  $rank_promoter_start: Float!,
  $uuid: String,
  $limit: Int) {
cCRESCREENSearch(
  assembly: $assembly,
  cellType: $cellType,
  coord_chrom: $coord_chrom,
  coord_end: $coord_end,
  coord_start: $coord_start,
  element_type: $element_type,
  gene_all_start: $gene_all_start,
  gene_all_end: $gene_all_end,
  gene_pc_start: $gene_pc_start,
  gene_pc_end: $gene_pc_end,
  rank_ctcf_end: $rank_ctcf_end,
  rank_ctcf_start: $rank_ctcf_start
  rank_dnase_end: $rank_dnase_end,
  rank_dnase_start: $rank_dnase_start,
  rank_enhancer_end: $rank_enhancer_end,
  rank_enhancer_start: $rank_enhancer_start,
  rank_promoter_end: $rank_promoter_end,
  rank_promoter_start: $rank_promoter_start,
  uuid: $uuid,
  limit: $limit) {
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

export const payload = JSON.stringify({
  assembly: "mm10",
  gene: "Gm25142",
  uuid: "62ba8f8c-8335-4404-8c48-b569cf401664",
  ct1: "C57BL/6_limb_embryo_11.5_days",
  ct2: "C57BL/6_limb_embryo_15.5_days",
})

export const initialGeneList = {
  chrom: "chr3",
  start: 108107280,
  end: 108146146,
  id: "ENSMUSG00000000001.4",
  name: "Gm25142",
}

/**
 * define types for cell info fetch - geneID is name cant set type
 */
export const initialChart = {
  Gm25142: {
    xdomain: [4818163.5, 5818163.5],
    coord: {
      chrom: "chr11",
      start: 5251850,
      end: 5251956,
    },
    diffCREs: {
      data: [
        {
          accession: "EM10E0493447",
          center: 4848833.5,
          len: 341,
          start: 4848663,
          stop: 4849004,
          typ: "promoter-like signature",
          value: 0.152,
          width: 4,
        },
      ],
    },
    nearbyDEs: {
      names: [null, "ENSMUSG00000064632.1"],
      data: [
        {
          fc: 0.669,
          gene: null,
          start: 5520659,
          stop: 5525893,
          strand: "+",
        },
      ],
      xdomain: [4818163.5, 5818163.5],
      genes: [
        {
          gene: "Nf2",
          start: 4765845,
          stop: 4849536,
          strand: "-",
        },
      ],
      ymin: -1.066,
      ymax: 2.958,
    },
  },
  assembly: "mm10",
  gene: "Gm25142",
  ct1: "C57BL/6_limb_embryo_11.5_days",
  ct2: "C57BL/6_limb_embryo_15.5_days",
}
