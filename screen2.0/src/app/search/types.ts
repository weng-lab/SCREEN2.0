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

//I think there needs to be more spearation in what is used by the query (true params) and what's captured from url and used
export type MainQueryParams = {
  bed_intersect: boolean,
  assembly: "GRCh38" | "mm10"
  chromosome: string | null
  start: number | null
  end: number | null
  gene?: string
  snpid?: string
  CellLine?: boolean
  PrimaryCell?: boolean
  Tissue?: boolean
  Organoid?: boolean
  InVitro?: boolean
  Biosample?: {
    selected: boolean
    biosample: string
    tissue: string
    summaryName: string
  }
  dnase_s?: number
  dnase_e?: number
  h3k4me3_s?: number
  h3k4me3_e?: number
  h3k27ac_s?: number
  h3k27ac_e?: number
  atac_s?: number
  atac_e?: number
  vert_s?: number
  vert_e?: number
  mamm_s?: number
  mamm_e?: number
  prim_s?: number
  prim_e?: number
  ctcf_s?: number
  ctcf_e?: number  
  CA?: boolean
  CA_CTCF?: boolean
  CA_H3K4me3?: boolean
  CA_TF?: boolean
  dELS?: boolean
  pELS?: boolean
  PLS?: boolean
  TF?: boolean
  genesToFind: string[]
  distancePC: boolean
  distanceAll: boolean
  distanceFromcCRE: number
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
      value: string
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

/**
 * I guess this is best described as the parameters that can be modified by the filters panel. Strong overlap with mainQueryParams
 */
export type URLParams = {
    Tissue: boolean
    PrimaryCell: boolean
    InVitro: boolean
    Organoid: boolean
    CellLine: boolean
    start: number
    end: number   
    Biosample: {
      selected: boolean
      biosample: string | null
      tissue: string | null
      summaryName: string | null
    },
    DNaseStart: number
    DNaseEnd: number
    H3K4me3Start: number
    H3K4me3End: number
    H3K27acStart: number
    H3K27acEnd: number
    CTCFStart: number
    CTCFEnd: number
    ATACStart: number
    ATACEnd: number
    CA: boolean
    CA_CTCF: boolean
    CA_H3K4me3: boolean
    CA_TF: boolean
    dELS: boolean
    pELS: boolean
    PLS: boolean
    TF: boolean
    PrimateStart: number
    PrimateEnd: number
    MammalStart: number
    MammalEnd: number
    VertebrateStart: number
    VertebrateEnd: number
    genesToFind: string[]
    distancePC: boolean
    distanceAll: boolean
    distanceFromcCRE: number
    CTCF_ChIA_PET: boolean
    RNAPII_ChIA_PET: boolean
    Accessions: string
    Page: number
}