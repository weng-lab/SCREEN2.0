import { gql } from "@apollo/client"
export const GENE_EXP_QUERY = gql`
query geneexpression($assembly: String!, $accessions: [String], $gene_id: [String]) {
  gene_dataset(accession: $accessions) {
    biosample
    tissue
  	cell_compartment
    biosample_type
  	assay_term_name
    accession  
    gene_quantification_files(assembly: $assembly) {
      accession
      biorep
      quantifications(gene_id_prefix: $gene_id) {
        tpm
        file_accession
        fpkm
      }
    }
  }
}
 `
export const GENE_QUERY = gql`
 query ($assembly: String!, $name: [String!], $limit: Int, $version: Int) {
   gene(assembly: $assembly, name: $name, limit: $limit, version: $version) {
     name
     id
     coordinates {
       start
       chromosome
       end
     }
   }
 } ` 