export type QueryResponse = [number, string[], any, [string, string, string, string, string, string][], string[]]

export type ccre = {
  accession: string
  center: number
  len: number
  start: number
  stop: number
  typ: string
  value: number
  width: number
}

export type gene = {
  chrom: string
  start: number
  end: number
  id: string
  name: string
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
