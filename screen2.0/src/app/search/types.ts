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
  atac: string
  promoter_zscore?: number
  enhancer_zscore?: number
  ctcf_zscore?: number
  ctspecific?: {
    ct?: string
    dnase_zscore?: number
    h3k4me3_zscore?: number
    h3k27ac_zscore?: number
    ctcf_zscore?: number
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
  assembly: "GRCh38" | "mm10"
  chromosome: string
  start: number
  end: number
  gene?: string
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
  //atac will need to be changed from string to number when that data is available
  accession: string
  class: string
  chromosome: string
  start: string
  end: string
  dnase?: number
  atac: string
  h3k4me3?: number
  h3k27ac?: number
  ctcf?: number
  linkedGenes: LinkedGenesData
}

export type LinkedGenesData = {
  distancePC: { name: string }[],
  distanceAll: { name: string }[],
  CTCF_ChIAPET: { name: string, biosample: string }[],
  RNAPII_ChIAPET: { name: string, biosample: string }[]
}
