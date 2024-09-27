import { gql } from "../../graphql/__generated__"
export const UMAP_QUERY = gql(`
  query q_4($assembly: String!, $assay: [String!], $a: String!) {
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
`)
