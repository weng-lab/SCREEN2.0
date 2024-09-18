import { LinkedGeneInfo } from "./_ccredetails/ccredetails"

export type GenomicRegion = {
  chrom: string
  start: number
  end: number
}

export type MainQueryParams = {
  coordinates: {
    assembly: "GRCh38" | "mm10"
    chromosome: string | null
    start: number | null
    end: number | null
  }
  biosample: RegistryBiosample
  snp: {
    rsID: string
    distance: number
  }
  gene: {
    name: string
    distance: number
    nearTSS: boolean
  }  
  searchConfig: {
    bed_intersect: boolean
  }
}

export type BiosampleTableFilters = {
  CellLine: { checked: boolean, label: "Cell Line" }
  PrimaryCell: { checked: boolean, label: "Primary Cell" },
  Tissue: { checked: boolean, label: "Tissue" },
  Organoid: { checked: boolean, label: "Organoid" },
  InVitro: { checked: boolean, label: "In Vitro Differentiated Cell" },
  Core: { checked: boolean, label: "Core Collection" },
  Partial: { checked: boolean, label: "Partial Data Collection" },
  Ancillary: { checked: boolean, label: "Ancillary Collection" },
  Embryo: { checked: boolean, label: "Embryo" }
  Adult: { checked: boolean, label: "Adult" }
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
  linkedGeneName: string
  CTCFChIAPET: {checked: boolean, biosample: string}
  RNAPIIChIAPET: {checked: boolean, biosample: string}
  HiC: {checked: boolean, biosample: string}
  CRISPRiFlowFISH: {checked: boolean, biosample: string}
  eQTLs: {checked: boolean, biosample: string}
}

export type CellTypeData = {
  byCellType: {
    [key: string]: {
      celltypename: string
      name: string
      biosample_summary: string
      assay: string
      tissue: string
      biosample_type: string
      rnaseq: boolean
    }[]
  }
}

export type BiosampleData = {
  [key: string]: RegistryBiosamplePlusRNA[]
}

export interface RegistryBiosamplePlusRNA extends RegistryBiosample {
  rnaseq: boolean | undefined
}

export type RegistryBiosample = {
  name: string;
  ontology: string;
  lifeStage: string;
  sampleType: string;
  displayname: string;
  dnase: string | null;
  h3k4me3: string | null;
  h3k27ac: string | null;
  ctcf: string | null;
  atac: string | null;
  dnase_signal: string | null;
  h3k4me3_signal: string | null;
  h3k27ac_signal: string | null;
  ctcf_signal: string | null;
  atac_signal: string | null;
};

export type MainResultTableRows = MainResultTableRow[]

export type MainResultTableRow = {
  accession: string
  class: string
  chromosome: string
  start: number
  end: number
  dnase?: number
  atac?: number
  h3k4me3?: number
  h3k27ac?: number
  ctcf?: number
  nearestGenes: {gene: string, distance: number}[]
  linkedGenes: LinkedGeneInfo[]
  conservationData: ConservationData
}

export type ConservationData = {
  vertebrates: number,
  mammals: number,
  primates: number
}

export type MainQueryData = {
  data: {
    cCRESCREENSearch: SCREENSearchResult[]
  }
}

type SCREENCellTypeSpecificResponse = {
  __typename: "SCREENCellTypeSpecificResponse";
  ct: null | any; // Replace 'any' with the actual type if 'ct' has a specific type
  dnase_zscore: null | number;
  h3k4me3_zscore: null | number;
  h3k27ac_zscore: null | number;
  ctcf_zscore: null | number;
  atac_zscore: null | number;
};

type CCREInfo = {
  __typename: "CCREInfo";
  accession: string;
  isproximal: boolean;
  concordant: boolean;
};

type NearestGene = {
  gene: string;
  distance: number;
};

export type SCREENSearchResult = {
  __typename: "SCREENSearchResult";
  chrom: string;
  start: number;
  len: number;
  pct: string;
  vertebrates: number;
  mammals: number;
  primates: number;
  ctcf_zscore: number;
  dnase_zscore: number;
  enhancer_zscore: number;
  promoter_zscore: number;
  atac_zscore: number;
  ctspecific: SCREENCellTypeSpecificResponse;
  info: CCREInfo;
  nearestgenes: NearestGene[]
};