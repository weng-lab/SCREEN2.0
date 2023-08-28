export type Biosample = {
  ctcf: string | null
  ctcf_signal: string | null
  dnase: string | null
  dnase_signal: string | null
  h3k27ac: string | null
  h3k27ac_signal: string | null
  h3k4me3: string | null
  h3k4me3_signal: string | null
  name: string | null
  lifeStage: string
  sampleType: string
  ontology: string
  displayname: string
}

export type BiosampleUMAP = {
  name: string
  displayname: string
  ontology: string
  sampleType: string
  lifeStage: string
  umap_coordinates: number[]
  experimentAccession: string
}
