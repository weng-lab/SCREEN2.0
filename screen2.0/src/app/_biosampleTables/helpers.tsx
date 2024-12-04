/**
 * Helpers for Biosample Tables Componet
 */
import { RegistryBiosample, RegistryBiosamplePlusRNA, CheckboxState, assay } from "./types"

export const assayColors: {[key in assay]: string} = {
  DNase: "#06DA93",
  H3K27ac: "#FFCD00",
  H3K4me3: "#FF0000",
  CTCF: "#00B0F0",
  ATAC: "#02c7b9"
}

/**
 * 
 * @param biosamples 
 * @param checkboxes 
 * @returns biosamples filtered by state of checkboxes
 */
export const filterBiosamples = (
  biosamples: { [key: string]: (RegistryBiosample | RegistryBiosamplePlusRNA)[] },
  checkboxes: CheckboxState
) => {
  const filteredBiosamples: { [key: string]: (RegistryBiosample | RegistryBiosamplePlusRNA)[] } = {}

  for (const ontology in biosamples) {
    filteredBiosamples[ontology] = biosamples[ontology].filter((biosample) => {
      let passesType: boolean = false
      if (checkboxes.Tissue && biosample.sampleType === "tissue") {
        passesType = true
      } else if (checkboxes.PrimaryCell && biosample.sampleType === "primary cell") {
        passesType = true
      } else if (checkboxes.CellLine && biosample.sampleType === "cell line") {
        passesType = true
      } else if (checkboxes.InVitro && biosample.sampleType === "in vitro differentiated cells") {
        passesType = true
      } else if (checkboxes.Organoid && biosample.sampleType === "organoid") {
        passesType = true
      }
      let passesLifestage = false
      if (checkboxes.Embryo && biosample.lifeStage === "embryonic") {
        passesLifestage = true
      } else if (checkboxes.Adult && biosample.lifeStage === "adult") {
        passesLifestage = true
      }
      //Assign to Ancillary as baseline
      let collection = "Ancillary"
      if (biosample.dnase) {
        //Assign to Partial if at least dnase is available
        collection = "Partial"
        if (biosample.ctcf && biosample.h3k4me3 && biosample.h3k27ac) {
          //If all other marks (ignoring atac) are available, assign to core
          collection = "Core"
        }
      }
      let passesCollection = false
      if (
        (checkboxes.Core && collection == "Core") 
        || (checkboxes.Partial && collection == "Partial") 
        || (checkboxes.Ancillary && collection == "Ancillary")
      ) {
        passesCollection = true
      }
      return (passesType && passesLifestage && passesCollection)
    })
  }
  return filteredBiosamples
}

/**
 * 
 * @param assays 
 * @returns string to display on hover above available assay wheel
 */
export function assayHoverInfo(assays: { dnase: boolean; h3k27ac: boolean; h3k4me3: boolean; ctcf: boolean; atac: boolean }) {
  const dnase = assays.dnase
  const h3k27ac = assays.h3k27ac
  const h3k4me3 = assays.h3k4me3
  const ctcf = assays.ctcf
  const atac = assays.atac

  if (dnase && h3k27ac && h3k4me3 && ctcf && atac) {
    return "All assays available"
  } else if (!dnase && !h3k27ac && !h3k4me3 && !ctcf && !atac) {
    return "No assays available"
  } else
    return `Available:\n${dnase ? "DNase\n" : ""}${h3k27ac ? "H3K27ac\n" : ""}${h3k4me3 ? "H3K4me3\n" : ""}${ctcf ? "CTCF\n" : ""}${
      atac ? "ATAC\n" : ""
    }`
}