export type GenomicRegion = {
  chrom: string
  start: number
  end: number
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
      intersecting_genes: {name: string}[]
    }
    pc: {
      intersecting_genes: {name: string}[]
    }
  }
}

export type MainQueryParams = {
  assembly: string;
  chromosome: string;
  start: number;
  end: number;
  CellLine?: boolean;
  PrimaryCell?: boolean;
  Tissue?: boolean;
  Organoid?: boolean;
  InVitro?: boolean;
  Biosample?: {
    selected: boolean;
    biosample: string;
    tissue: string;
    summaryName: string;
  };
  dnase_s?: number;
  dnase_e?: number;
  h3k4me3_s?: number;
  h3k4me3_e?: number;
  h3k27ac_s?: number;
  h3k27ac_e?: number;
  ctcf_s?: number;
  ctcf_e?: number;
  CA?: boolean;
  CA_CTCF?: boolean;
  CA_H3K4me3?: boolean;
  CA_TF?: boolean;
  dELS?: boolean;
  pELS?: boolean;
  PLS?: boolean;
  TF?: boolean;
}

export type CellTypeData = {
  byCellType: {
    [key: string]: {
      assay: string,
      biosample_summary: string,
      biosample_type: string,
      tissue: string,
      checked: boolean,
      value: string,
    }[]
  }
}

export type UnfilteredBiosampleData = {
  [key: string]: {
    summaryName: string,
    biosampleType: string,
    biosampleTissue: string,
    queryValue: string,
    assays: {
      atac: boolean,
      ctcf: boolean,
      dnase: boolean,
      h3k27ac: boolean,
      h3k4me3: boolean
    }
  }[]
}

export type FilteredBiosampleData = [string , {
  summaryName: string;
  biosampleType: string;
  biosampleTissue: string;
  queryValue: string;
  assays: {
      atac: boolean;
      ctcf: boolean;
      dnase: boolean;
      h3k27ac: boolean;
      h3k4me3: boolean;
  };
}[]][]