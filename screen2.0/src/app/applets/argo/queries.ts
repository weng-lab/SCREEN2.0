import { gql } from "@apollo/client"

export const Z_SCORES_QUERY = gql`
query ccreSearchQuery($assembly: String!, $accessions: [String!]) {
   cCRESCREENSearch(assembly: $assembly, accessions: $accessions) {
      dnase_zscore      
      promoter_zscore      
      enhancer_zscore
      ctcf_zscore
      atac_zscore   
      info {
        accession
      } 
   }
}
`