import { gql } from "../../../graphql/__generated__/gql"

export const GET_ALL_GWAS_STUDIES = gql(`
  query getAllGWASStudies {
    getAllGwasStudies {
      study
      totalldblocks    
      author
      pubmedid
      studyname
      
    }
  }
`)

export const GET_SNPS_FOR_GIVEN_GWASSTUDY= gql(`
  query getSNPsforgivengwasStudy($study: [String!]!){
    getSNPsforGWASStudies(study:$study) {
      snpid
      ldblock
      rsquare
      chromosome
      stop
      start
      ldblocksnpid
    }
  }`
)

export const BED_INTERSECT= gql(`
  query bedIntersectCCRE ($inp: [cCRE]!, $assembly: String!, $maxOutputLength: Int) {
    intersection (
      userCcres: $inp,
      assembly: $assembly,
      maxOutputLength: $maxOutputLength
    )
  }
`)

export const NEW_CCRE_SEARCH = gql(`
  query NewCcreSearch(
  $assembly: String!
  $accession: [String]
  $biosampleValue: [String]
) {
  getcCREZScoresQuery(
    assembly: $assembly
    accession: $accession
    biosample_value: $biosampleValue
    nearbygeneslimit: 1
  ) {
    accession
    chromosome
    start
    stop
    dnase_max_zscore
    h3k4me3_max_zscore
    h3k27ac_max_zscore
    ctcf_max_zscore
    atac_max_zscore
    nearestgenes {
      gene
      distance
    }
    zscores
  }
}
`);

export const CT_ENRICHMENT = gql(`
  query getGWASCTEnrichmentQuery($study: String!) {
    getGWASCtEnrichmentQuery(study: $study) {
      celltype
      accession
      fc
      fdr
      pvalue
    }
  }
`)

export const BIOSAMPLE_DISPLAYNAMES = gql(`
  query getDisplayNames($assembly: String!, $samples: [String!]) {
    ccREBiosampleQuery(assembly: $assembly, name: $samples) {
      biosamples {
        name
        displayname
        ontology
      }    
    }
  }
`)