import { gql } from "../../graphql/__generated__/gql"


export const RNA_SEQ_QUERY = gql(`
  query RNASeqQuery($assembly: String!){
    rnaSeqQuery(assembly:$assembly) {
      biosample
    }
  }
`)

export const BIOSAMPLE_QUERY = gql(`
  query biosamples_1($assembly: String!, $assays: [String!]) {
    ccREBiosampleQuery(assembly: $assembly, assay: $assays) {
      biosamples {
        name
        ontology
        lifeStage
        sampleType
        displayname
        dnase: experimentAccession(assay: "DNase")
        h3k4me3: experimentAccession(assay: "H3K4me3")
        h3k27ac: experimentAccession(assay: "H3K27ac")
        ctcf: experimentAccession(assay: "CTCF")
        atac: experimentAccession(assay: "ATAC")
        dnase_signal: fileAccession(assay: "DNase")
        h3k4me3_signal: fileAccession(assay: "H3K4me3")
        h3k27ac_signal: fileAccession(assay: "H3K27ac")
        ctcf_signal: fileAccession(assay: "CTCF")
        atac_signal: fileAccession(assay: "ATAC")
      }
    }
  }
`)