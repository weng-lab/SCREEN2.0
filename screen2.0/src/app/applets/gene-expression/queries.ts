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
 query geneAutocomplete($assembly: String!, $name: [String!], $limit: Int, $version: Int) {
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

export type GET_ORTHOLOG_VARS = {
  name: string[],
  assembly: 'grch38' | 'mm10'
}

export type GET_ORTHOLOG_DATA = {
  geneOrthologQuery: {
    humanGene: string,
    mouseGene: string
  }[]
}

export const GET_ORTHOLOG = gql`
  query geneOrthologQuery($name: [String]!, $assembly: String!) {
    geneOrthologQuery: geneorthologQuery(name: $name, assembly: $assembly) {
      humanGene: external_gene_name
      mouseGene: mmusculus_homolog_associated_gene_name
    }
  }
`