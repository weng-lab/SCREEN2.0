import { gql } from "../../../graphql/__generated__"

export const GET_CCRE_CT_TF = gql(`
query cCRETF($accession: String!, $assembly: String!) {
getcCRETFQuery(accession: $accession, assembly: $assembly) {
    celltype
    tf
  }
}
`)
export const TOP_TISSUES = gql(`
  query topTissues($accession: [String!], $assembly: String!) {
    ccREBiosampleQuery(assembly: $assembly) {
      biosamples {
        sampleType
        displayname
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
      dnase: maxZ(assay: "DNase")
      h3k4me3: maxZ(assay: "H3K4me3")
      h3k27ac: maxZ(assay: "H3K27ac")
      ctcf: maxZ(assay: "CTCF")
      atac: maxZ(assay: "ATAC")
    }
  }
`)

export const LINKED_GENES = gql(`
  query linkedGenes(
    $assembly: String!
    $accessions: [String]!
    $methods: [String]
    $celltypes: [String]
  ) {
    linkedGenes: linkedGenesQuery(
      assembly: $assembly
      accession: $accessions
      method: $methods
      celltype: $celltypes
    ) {
      p_val
      gene
      geneid
      genetype
      method
      accession
      grnaid
      effectsize
      assay
      celltype
      experiment_accession
      tissue
      score
      variantid
      source
      slope
      tissue
      displayname
    }
  }
`)

export const MPRA_FUNCTIONAL_DATA_QUERY = gql(`
query MPRA_FCC($coordinates: [GenomicRangeInput!]) {
  mpraFccQuery(coordinates: $coordinates) {
    celltype
    chromosome
    stop
    start
    assay_type
    element_location
    series
    strand
    log2fc
    experiment    
    barcode_location
  }
}
`)
export const CAPRA_SOLO_FUNCTIONAL_DATA_QUERY = gql(`
query capraFccSoloQuery($accession: [String]!) {
  capraFccSoloQuery(accession: $accession) {
    rdhs
    log2fc
    fdr
    dna_rep1
    rna_rep1
    rna_rep2
    rna_rep3
    pvalue
    experiment
  }
}
`)

export const CAPRA_DOUBLE_FUNCTIONAL_DATA_QUERY = gql(`
query capraFccDoubleQuery($accession: [String]!) {
  capraFccDoubleQuery(accession: $accession) {
    rdhs_p1
    rdhs_p2
    log2fc
    fdr
    dna_rep1
    rna_rep1
    rna_rep2
    rna_rep3
    pvalue
    experiment
  }
}
`)

export const CCRE_RDHS_QUERY = gql(`
query rdhs($rDHS: [String!],$assembly: String!) {
  cCREQuery(assembly: $assembly, rDHS: $rDHS) {
    accession
  }
}
`)

export const FUNCTIONAL_DATA_QUERY= gql(`
query functionalCharacterizationQuery($coordinates: [GenomicRangeInput!],$assembly: String!) {
  functionalCharacterizationQuery(assembly: $assembly, coordinates: $coordinates) {
    tissues
    element_id
    assay_result
    chromosome
    stop
    start
  }
}
`)

export const GENE_NAME = gql(`
  query geneName($assembly: String!, $name_prefix: [String!], $version: Int) {
    gene(assembly: $assembly, name_prefix: $name_prefix, version: $version) {
      name
      id
    }
  }
`)

export const ORTHOLOG_QUERY = gql(`
  query orthologTab($assembly: String!, $accession: [String!]) {
    orthologQuery(accession: $accession, assembly: $assembly) {
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
`)

export const NEARBY_GENOMIC_FEATURES_QUERY = gql(`
  query nearbyGenomicFeatures($coordinates: [GenomicRangeInput!], $chromosome: String, $start: Int, $end: Int, $b: String!, $c: String!, $a: String!, $version: Int) {
    gene(chromosome: $chromosome, start: $start, end: $end, assembly: $b, version: $version) {
      name
      id
      strand
      coordinates {
        chromosome
        start
        end
      }
      transcripts {
        id
        coordinates {
          chromosome
          start
          end
        }
      }
    }

    cCREQuery(assembly: $c, coordinates: $coordinates) {
      accession
      coordinates {
        chromosome
        start
        end
      }
      group
    }

    snpQuery(coordinates: $coordinates, assembly: $a, common: true) {
      id
      coordinates {
        chromosome
        start
        end
      }
    }
  }
`)

export const NEARBY_GENOMIC_FEATURES_NOSNPS_QUERY = gql(`
  query nearbyGenomicFeaturesNoSNPs($coordinates: [GenomicRangeInput!], $chromosome: String, $start: Int, $end: Int, $b: String!, $c: String!, $version: Int) {
    gene(chromosome: $chromosome, start: $start, end: $end, assembly: $b, version: $version) {
      name
      id
      strand
      coordinates {
        chromosome
        start
        end
      }
      transcripts {
        id
        coordinates {
          chromosome
          start
          end
        }
      }
    }

    cCREQuery(assembly: $c, coordinates: $coordinates) {
      accession
      coordinates {
        chromosome
        start
        end
      }
      group
    }
  }
`)
export const CRE_TF_DCC_QUERY = gql(`
  query tfpeaks_1($assembly: String, $range: [ChromosomeRangeInput]!, $target: String) {
    peaks(assembly: $assembly, range: $range, target: $target) {
      peaks {
        chrom
        chrom_start
        chrom_end
        dataset {
          biosample
          accession
          target
          files(types: "replicated_peaks") {
            accession
          }
        }
      }
    }
  }
`)

export const TF_INTERSECTION_QUERY = gql(`
  query tfpeaks_2($assembly: String, $range: [ChromosomeRangeInput]!, $species: String) {
    peaks(assembly: $assembly, range: $range) {
      peaks {
        chrom
        chrom_start
        chrom_end
        dataset {
          biosample
          accession
          target
        }
      }
    }
    peakDataset(species: $species) {
      partitionByTarget {
        target {
          name
        }
        counts {
          total
        }
      }
    }
  }
`)

export const NEARBY_AND_LINKED_GENES = gql(`
  query nearbyAndLinkedGenes(
    $accessions: [String!]!
    $assembly: String!
    $geneSearchStart: Int!
    $geneSearchEnd: Int!
    $geneSearchChrom: String!
    $geneVersion: Int!
  ) {
    nearbyGenes: gene(
      chromosome: $geneSearchChrom
      start: $geneSearchStart
      end: $geneSearchEnd
      assembly: $assembly
      version: $geneVersion
    ) {
      name
      id
      gene_type
      strand
      coordinates {
        chromosome
        start
        end
      }
      transcripts {
        id
        coordinates {
          chromosome
          start
          end
        }
      }
    }
    linkedGenes: linkedGenesQuery(assembly: $assembly, accession: $accessions) {
      accession  
      p_val
      gene
      geneid
      genetype
      method
      grnaid
      effectsize
      assay
      celltype
      experiment_accession
      tissue
      variantid
      source
      slope
      score
      displayname
    }
  }
`)

export const GENE_QUERY = gql(`
  query geneQuery($assembly: String!, $name_prefix: [String!], $limit: Int, $version: Int) {
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
  )
   
export const TSS_RAMPAGE_QUERY = gql(`
  query tssRampage($gene: String!) {
  tssrampageQuery(genename: $gene) {
    start    
    organ   
    strand
    peakId
    biosampleName
    biosampleType
    biosampleSummary
    peakType
    expAccession
    value
    start
    end 
    chrom    
    genes {
      geneName
        locusType
    }
  }
}`
)