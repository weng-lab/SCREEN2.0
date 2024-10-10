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
  query bedIntersectCCRE ($inp: [cCRE]!, $assembly: String!) {
    intersection (
      userCcres: $inp,
      assembly: $assembly
    )
  }
`)

export const CCRE_SEARCH = gql(`
  query ccreSearchQuery_2(
    $assembly: String!
    $celltype: String
    $accessions: [String!]
  ) {
    cCRESCREENSearch(
      assembly: $assembly
      accessions: $accessions
      cellType: $celltype
      nearbygeneslimit: 1
    ) {
      chrom
      start
      len
      pct
      nearestgenes {
        gene
        distance
      }
      ctcf_zscore
      dnase_zscore
      enhancer_zscore
      promoter_zscore
      atac_zscore
      ctspecific {
        dnase_zscore
        ctcf_zscore
        atac_zscore
        h3k4me3_zscore
        h3k27ac_zscore
      }
      info {
        accession
      }
    }
  }
`)

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