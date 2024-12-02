import { gql } from "../../../graphql/__generated__"

export const Z_SCORES_QUERY = gql(`
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
      pct 
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
`)

export const LINKED_GENES = gql(`
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
`)

export const GENE_EXP_QUERY = gql(`
query geneExpression($assembly: String!, $biosample_value: [String], $gene_id: [String]) {
  gene_dataset(biosample_value: $biosample_value) {  
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
 `)

export const ORTHOLOG_QUERY = gql(`
  query orthoQuery($accessions: [String], $assembly: String){
  orthologQuery(accession: $accessions, assembly: $assembly) {
    assembly
    accession
    ortholog
     {
      accession
    }
  }
}
   `)

export const BIG_REQUEST_QUERY = gql(`
    query BigRequestQuery($requests: [BigRequest!]!) {
  bigRequests(requests: $requests) {
    data
  }
}
     `)

export const MOTIF_QUERY = gql(`
  query occurrences($range: [GenomicRegionInput!], $limit: Int) {
        meme_occurrences(genomic_region: $range, , limit: $limit) {
            motif {
              id
                pwm
                peaks_file {
                    assembly
                    accession
                    dataset_accession
                }
              
                tomtom_matches {
                    jaspar_name
                    target_id
                    e_value
                  
                }
                flank_p_value
                shuffled_p_value
            }
            strand
            peaks_accession
            consensus_regex
            q_value
            genomic_region {
                chromosome
                start
                end
            }
        }
    }
  `)

export const TOMTOM_MATCH_QUERY = gql(`
    query tomtomMatches($peaks_accessions: [String!]!, $ids: [String!]!) {
        target_motifs(peaks_accessions: $peaks_accessions, motif_id: $ids) {
            target_id
            e_value
            jaspar_name
        }
    }
`);

export const ALLELE_QUERY = gql(`
  query bigRequestsMultipleRegionsSequence($requests: MultipleRegionBigRequest!) {
  bigRequestsMultipleRegions(requests: $requests) {
    data
    error {
      errortype
      message
    }
  }  
}
  `)

