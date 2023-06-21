import { gql } from "@apollo/client"

export const TOP_TISSUES = gql`
  query q($accession: [String!], $assembly: String!) {
    ccREBiosampleQuery(assembly: $assembly) {
      biosamples {
        sampleType
        cCREZScores(accession: $accession) {
          score
          assay
          experiment_accession
        }
        name
        ontology
      }
    }
    cCREQuery(assembly: $assembly, accession: $accession) {
      accession
      group
      zScores {
        score
        experiment
      }
      dnase: maxZ(assay: "DNase")
      h3k4me3: maxZ(assay: "H3K4me3")
      h3k27ac: maxZ(assay: "H3K27ac")
      ctcf: maxZ(assay: "CTCF")
    }
  }
`
export const LINKED_GENES = gql`
  query ($assembly: String!, $accession: String!) {
    linkedGenesQuery(assembly: $assembly, accession: $accession) {
      assembly
      accession
      experiment_accession
      celltype
      gene
      assay
    }
  }
`

export const GENE_NAME = gql`
  query ($assembly: String!, $name_prefix: [String!]) {
    gene(assembly: $assembly, name_prefix: $name_prefix) {
      name
      id
    }
  }
`
export const ORTHOLOG_QUERY = gql`
  query (
    $assembly: String!
    $accession: String!
  ) 
  {
    orthologQuery(accession:$accession,assembly:$assembly) {
      assembly
      accession
      ortholog {
        stop
        start
        chromosome
        accession
      }
    }
  }
`