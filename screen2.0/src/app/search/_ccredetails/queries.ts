import { TypedDocumentNode, gql } from "@apollo/client"

type Data = {
  ccREBiosampleQuery: {
    biosamples: {
      sampleType: string;
      displayname: string;
      cCREZScores: {
        score: number;
        assay: string;
        experiment_accession: string;
      }[];
      name: string;
      ontology: string;
    }[]
  },
  cCREQuery: [{
    accession: string,
    group: string,
    dnase: number,
    h3k4me3: number,
    h3k27ac: number,
    ctcf: number
  }]
}

type Variables = {
  assembly: "mm10" | "grch38",
  accession: [string],
}

export const TOP_TISSUES: TypedDocumentNode<Data, Variables> = gql`
  query q($accession: [String!], $assembly: String!) {
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
`
export const LINKED_GENES = gql`
  query ($assembly: String!, $accession: [String]!) {
    linkedGenesQuery(assembly: $assembly, accession: $accession) {
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
    }
  }
`
export const MPRA_FUNCTIONAL_DATA_QUERY = gql `
query ($coordinates: [GenomicRangeInput!]) {
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
`
export const CAPRA_SOLO_FUNCTIONAL_DATA_QUERY = gql `
query ($accession: [String]!) {
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
`
export const CAPRA_DOUBLE_FUNCTIONAL_DATA_QUERY = gql `
query ($accession: [String]!) {
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
`
export const CCRE_RDHS_QUERY = gql`
query ($rDHS: [String!],$assembly: String!) {
  cCREQuery(assembly: $assembly, rDHS: $rDHS) {
    accession
  }
}
`

export const FUNCTIONAL_DATA_QUERY= gql`
query ($coordinates: [GenomicRangeInput!],$assembly: String!) {
  functionalCharacterizationQuery(assembly: $assembly, coordinates: $coordinates) {
    tissues
    element_id
    assay_result
    chromosome
    stop
    start
  }
}

`
export const GENE_NAME = gql`
  query ($assembly: String!, $name_prefix: [String!], $version: Int) {
    gene(assembly: $assembly, name_prefix: $name_prefix, version: $version) {
      name
      id
    }
  }
`
export const ORTHOLOG_QUERY = gql`
  query ($assembly: String!, $accession: String!) {
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
`

export const NEARBY_GENOMIC_FEATURES_QUERY = gql`
  query features($coordinates: [GenomicRangeInput!], $chromosome: String, $start: Int, $end: Int, $b: String!, $c: String!, $a: String!, $version: Int) {
    gene(chromosome: $chromosome, start: $start, end: $end, assembly: $b, version: $version) {
      name
      id
      coordinates {
        chromosome
        start
        end
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
`

export const NEARBY_GENOMIC_FEATURES_NOSNPS_QUERY = gql`
  query features($coordinates: [GenomicRangeInput!], $chromosome: String, $start: Int, $end: Int, $b: String!, $c: String!, $version: Int) {
    gene(chromosome: $chromosome, start: $start, end: $end, assembly: $b, version: $version) {
      name
      id
      coordinates {
        chromosome
        start
        end
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
`
export const CRE_TF_DCC_QUERY = gql`
  query tfpeaks($assembly: String, $range: [ChromosomeRangeInput]!, $target: String) {
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
`

export const TF_INTERSECTION_QUERY = gql`
  query tfpeaks($assembly: String, $range: [ChromosomeRangeInput]!, $species: String) {
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
`
export const NEARBY_AND_LINKED_GENES = gql`
  query nearbyAndLinkedGenes(
    $accession: String!
    $assembly: String!
    $coordinates: ChromRange!
    $nearbyLimit: Int!
  ) {
    nearestGenes(
      assembly: $assembly
      limit: $nearbyLimit
      coordinates: $coordinates
    ) {
      intersecting_genes {
        name
        id
        gene_type
        coordinates {
          start
          end
          chromosome
        }
      }
    }
    linkedGenes: linkedGenesQuery(assembly: $assembly, accession: [$accession]) {
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
      variantid
      source
      slope
      score
      displayname
    }
  }
`
