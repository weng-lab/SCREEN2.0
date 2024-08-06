import { gql } from "@apollo/client"

export const Z_SCORES_QUERY = gql`
query ccreSearchQuery($assembly: String!, $accessions: [String!], $cellType: String) {
   cCRESCREENSearch(assembly: $assembly, accessions: $accessions, cellType: $cellType) {
      dnase_zscore      
      promoter_zscore      
      enhancer_zscore
      ctcf_zscore
      atac_zscore
      vertebrates
      mammals
      primates 
      info {
        accession
      } 
      ctspecific
      {
        dnase_zscore
        ctcf_zscore
        atac_zscore
        h3k4me3_zscore
        h3k27ac_zscore
      }
   }
}
`

export const LINKED_GENES = gql`
  query(
    $assembly: String!
    $accessions: [String]!
    $methods: [String]
    $celltypes: [String]
  ) {
    linkedGenes: linkedGenesQuery(
      assembly: $assembly
      accession: $accessions
      method: $methods
      celltype: $celltypes
    ) {
      p_val
      gene
      geneid
      genetype
      method
      accession
      grnaid
      effectsize
      assay
      celltype
      experiment_accession
      tissue
      score
      variantid
      source
      slope
      tissue
      displayname
    }
  }
`

export const GENE_EXP_QUERY = gql`
query geneexpression($assembly: String!, $accessions: [String], $gene_id: [String]) {
  gene_dataset(accession: $accessions) {  
    gene_quantification_files(assembly: $assembly) {
      quantifications(gene_id_prefix: $gene_id) {
        gene { id }
        tpm
        file_accession
        fpkm
      }
    }
  }
}
 `

