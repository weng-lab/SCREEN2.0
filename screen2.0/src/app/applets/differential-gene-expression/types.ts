export type QueryResponse = [number, string[], any, [string, string, string, string, string, string][], string[]]

export type cCREZScore = {
  chrom: string
  start: number
  len: number
  pct: string
  ctspecific: {
    h3k4me3_zscore: number
    h3k27ac_zscore: number
  }
}

export type Gene = {
  name: string
  id: string
  strand: string
  coordinates: {
    chromosome: string
    start: number
    end: number
    __typename: string
  }
  __typename: string
}

/**
 * define types for list of cell types
 */
export type cellTypeInfoArr = {
  cellTypeInfoArr: {
    assay: string
    cellTypeDesc: string
    cellTypeName: string
    biosample_summary: string
    biosample_type: string
    name: string
    expID: string
    isde: boolean
    fileID: string
    synonyms: string
    tissue: string
    rnaseq: boolean
    checked: boolean
    value: string
  }[]
}

/**
 * define types for cell info fetch - geneID is name cant set
 */
export type DEs = {
  Gm25142: {
    // [geneID: string]: {
    xdomain: number[]
    coord: {
      chrom: string
      start: number
      end: number
    }
    diffCREs: {
      data: {
        accession: string
        center: number
        len: number
        start: number
        stop: number
        typ: string
        value: number
        width: number
      }[]
    }
    nearbyDEs: {
      names: string[]
      data: {
        fc: number
        gene: string
        start: number
        stop: number
        strand: string
      }[]
      xdomain: number[]
      genes: {
        gene: string
        start: number
        stop: number
        strand: string
      }[]
      ymin: number
      ymax: number
    }
  }
  assembly: string
  gene: string
  ct1: string
  ct2: string
}
