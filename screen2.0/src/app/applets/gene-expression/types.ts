export type gene = {
  chrom: string
  start: number
  end: number
  id: string
  name: string
}

export type RIDItem = {
  // [id: string]: {
  ageTitle: string
  cellType: string
  logFPKM: number
  logTPM: number
  rID: number
  rawFPKM: number
  rawTPM: number
  rep: number
  tissue: string
  // }[]
}

export type GeneExpEntry = {
  value: number
  biosample_term?: string
  cellType?: string
  expID: string
  rep?: number
  tissue: string
  strand?: string
  color: string
}

export type BiosampleList = {
  cell_line: boolean
  in_vitro: boolean
  primary_cell: boolean
  tissue: boolean
}

export type CellComponents = {
  cell: boolean
  chromatin: boolean
  cytosol: boolean
  membrane: boolean
  nucleolus: boolean
  nucleoplasm: boolean
  nucleus: boolean
}

export type GeneExpressions = {
  all: {
    assembly: string
    coords: {
      chrom: string
      start: number
      stop: number
    }
    ensemblid_ver: string
    gene: string
    itemsByRID: {
      [id: number]: {
        ageTitle: string
        cellType: string
        logFPKM: number
        logTPM: number
        rID: number
        rawFPKM: number
        rawTPM: number
        rep: number
        tissue: string
      }
    }
    mean: {
      byExpressionFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byExpressionTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueFPKM: {
        [tissue_type: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
    }
    single: {
      byExpressionFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byExpressionTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueFPKM: {
        [tissue_type: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
    }
    strand: string
  }
  assembly: string
  gene: string
  "polyA RNA-seq": {
    assembly: string
    coords: {
      chrom: string
      start: number
      stop: number
    }
    ensemblid_ver: string
    gene: string
    itemsByRID: {
      [id: number]: {
        ageTitle: string
        cellType: string
        logFPKM: number
        logTPM: number
        rID: number
        rawFPKM: number
        rawTPM: number
        rep: number
        tissue: string
      }
    }
    mean: {
      byExpressionFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byExpressionTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueFPKM: {
        [tissue_type: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
    }
    single: {
      byExpressionFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byExpressionTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueFPKM: {
        [tissue_type: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
    }
    strand: string
  }
  "total RNA-seq": {
    assembly: string
    coords: {
      chrom: string
      start: number
      stop: number
    }
    ensemblid_ver: string
    gene: string
    itemsByRID: {
      [id: number]: {
        ageTitle: string
        cellType: string
        logFPKM: number
        logTPM: number
        rID: number
        rawFPKM: number
        rawTPM: number
        rep: number
        tissue: string
      }
    }
    mean: {
      byExpressionFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byExpressionTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueFPKM: {
        [tissue_type: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
    }
    single: {
      byExpressionFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byExpressionTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueFPKM: {
        [tissue_type: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxFPKM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
      byTissueMaxTPM: {
        [id: string]: {
          color: string
          displayName: string
          items: number[]
          name: string
        }
      }
    }
    strand: string
  }
}
