import { gql } from "@apollo/client"

export const CCRE_AUTOCOMPLETE_QUERY = gql`
query cCREQuery($accession_prefix: [String!], $limit: Int, $assembly: String!) {
    cCREQuery(accession_prefix: $accession_prefix, assembly: $assembly, limit: $limit) {
        accession
      coordinates {
        start
        end
        chromosome
      }
    }
}
`


export const GENE_AUTOCOMPLETE_QUERY = `
query geneAutocomplete($assembly: String!, $name_prefix: [String!], $limit: Int, $version: Int) {
    gene(assembly: $assembly, name_prefix: $name_prefix, limit: $limit, version: $version) {
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

export const SNP_AUTOCOMPLETE_QUERY = `
query snpAutocompleteQuery($snpid: String!, $assembly: String!) {
    snpAutocompleteQuery(snpid: $snpid, assembly: $assembly) {
        id
        coordinates {
            chromosome
            start
            end
        }
    }
}
`

export const BED_INTERSECT_QUERY = gql`
query bedIntersectCCRE_1 ($user_ccres: [cCRE]!, $assembly: String!, $max_ouput_length: Int) {
  intersection (
    userCcres: $user_ccres,
    assembly: $assembly,
    maxOutputLength: $max_ouput_length
  )
}
`