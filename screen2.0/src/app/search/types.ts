import { ApolloQueryResult } from "@apollo/client"

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
  biosample: Biosample
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
      rnaseq: boolean
    }[]
  }
}

export type UnfilteredBiosampleData = {
  [key: string]: Biosample[]
}

export type FilteredBiosampleData = [
  string,
  Biosample[],
][]

export type Biosample = {
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
  }
  rnaseq: boolean
}

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
  mainQueryData: {
    data: {
      cCRESCREENSearch: SCREENSearchResult[]
    }
  },
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

type Gene = {
  __typename: "Gene";
  name: string;
};

type IntersectingGenes = {
  __typename: "IntersectingGenes";
  end: number;
  start: number;
  chromosome: string;
  assembly: string;
  intersecting_genes: Gene[];
};

type SCREENNearbyGenes = {
  __typename: "SCREENNearbyGenes";
  accession: string;
  all: IntersectingGenes;
  pc: IntersectingGenes;
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
  genesallpc: SCREENNearbyGenes;
};