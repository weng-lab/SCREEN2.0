import { gql } from "@apollo/client"
export const UMAP_QUERY = gql`
  query q($assembly: String!, $assay: [String!], $a: String!) {
    ccREBiosampleQuery(assay: $assay, assembly: $assembly) {
      biosamples {
        name
        displayname
        ontology
        sampleType
        lifeStage
        umap_coordinates(assay: $a)
        experimentAccession(assay: $a)
      }
    }
  }
`
