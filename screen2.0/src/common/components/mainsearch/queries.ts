
export const CCRE_AUTOCOMPLETE_QUERY = `
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