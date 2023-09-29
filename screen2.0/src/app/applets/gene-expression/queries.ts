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
      quantifications(gene_id: $gene_id) {
        tpm
        file_accession
        fpkm
      }
    }
    
  }
}
 `
export const GENE_QUERY = gql`
 query ($assembly: String!, $name: [String!], $limit: Int) {
   gene(assembly: $assembly, name: $name, limit: $limit) {
     name
     id
     coordinates {
       start
       chromosome
       end
     }
   }
 } ` 