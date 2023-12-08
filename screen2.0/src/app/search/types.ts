import { ApolloQueryResult } from "@apollo/client"

export type GenomicRegion = {
  chrom: string
  start: string
  end: string
}

export type cCREData = {
  info: { accession: string }
  pct: string
  chrom: string
  start: number
  len: number
  dnase_zscore?: number
  atac_zscore?: number  
  promoter_zscore?: number
  enhancer_zscore?: number
  ctcf_zscore?: number
  vertebrates: number,
  mammals: number,
  primates: number,
  ctspecific?: {
    ct?: string
    dnase_zscore?: number
    h3k4me3_zscore?: number
    h3k27ac_zscore?: number
    ctcf_zscore?: number
    atac_zscore?: number
  }
  genesallpc: {
    all: {
      intersecting_genes: { name: string }[]
    }
    pc: {
      intersecting_genes: { name: string }[]
    }
  }

}


export type MainQueryParams = {
  coordinates: {
    assembly: "GRCh38" | "mm10"
    chromosome: string | null
    start: number | null
    end: number | null
  }
  //biosample.biosample should be changed to something like: queryvalue
  biosample: {
    selected: boolean
    biosample: string
    tissue: string
    summaryName: string
  }
  // snp: {
  //   //old searchConfig.snpid
  //   rsID: string
  //   distance: number
  // }
  searchConfig: {
    bed_intersect: boolean
    gene: string
    snpid: string
  }
}

export type BiosampleTableFilters = {
  CellLine: boolean
  PrimaryCell: boolean
  Tissue: boolean
  Organoid: boolean
  InVitro: boolean
}

export type FilterCriteria = {
  dnase_s: number
  dnase_e: number
  atac_s: number
  atac_e: number
  h3k4me3_s: number
  h3k4me3_e: number
  h3k27ac_s: number
  h3k27ac_e: number
  ctcf_s: number
  ctcf_e: number
  prim_s: number
  prim_e: number
  mamm_s: number
  mamm_e: number
  vert_s: number
  vert_e: number
  CA: boolean
  CA_CTCF: boolean
  CA_H3K4me3: boolean
  CA_TF: boolean
  dELS: boolean
  pELS: boolean
  PLS: boolean
  TF: boolean
  genesToFind: string[]
  distancePC: boolean
  distanceAll: boolean
  CTCF_ChIA_PET: boolean
  RNAPII_ChIA_PET: boolean
}

export type CellTypeData = {
  byCellType: {
    [key: string]: {
      assay: string
      biosample_summary: string
      biosample_type: string
      tissue: string
      celltypename: string
    }[]
  }
}

export type UnfilteredBiosampleData = {
  [key: string]: {
    summaryName: string
    biosampleType: string
    biosampleTissue: string
    queryValue: string
    assays: {
      atac: boolean
      ctcf: boolean
      dnase: boolean
      h3k27ac: boolean
      h3k4me3: boolean
    }
  }[]
}

export type FilteredBiosampleData = [
  string,
  {
    summaryName: string
    biosampleType: string
    biosampleTissue: string
    queryValue: string
    assays: {
      atac: boolean
      ctcf: boolean
      dnase: boolean
      h3k27ac: boolean
      h3k4me3: boolean
    }
  }[],
][]

export type MainResultTableRows = MainResultTableRow[]

export type MainResultTableRow = {
  accession: string
  class: string
  chromosome: string
  start: string
  end: string
  dnase?: number
  atac?: number
  h3k4me3?: number
  h3k27ac?: number
  ctcf?: number
  linkedGenes: LinkedGenesData
  conservationData: ConservationData
}

export type ConservationData = {
  vertebrates: number,
  mammals: number,
  primates: number
}

export type LinkedGenesData = {
  distancePC: { name: string }[],
  distanceAll: { name: string }[],
  CTCF_ChIAPET: { name: string, biosample: string }[],
  RNAPII_ChIAPET: { name: string, biosample: string }[]
}

export type rawQueryData = {
  mainQueryData: ApolloQueryResult<any>,
  linkedGenesData: {
    [key: string]: {
      genes: {
        geneName: string;
        linkedBy: "CTCF-ChIAPET" | "RNAPII-ChIAPET";
        biosample: string;
      }[];
    };
  }
}