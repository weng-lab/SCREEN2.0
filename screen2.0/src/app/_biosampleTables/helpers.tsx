/**
 * Helpers for Biosample Tables Componet
 */
import { assay, SampleTypeCheckboxes, CollectionCheckboxes, LifeStageCheckboxes, BiosampleData } from "./types"

export const assayColors: {[key in assay]: string} = {
  DNase: "#06DA93",
  H3K27ac: "#FFCD00",
  H3K4me3: "#FF0000",
  CTCF: "#00B0F0",
  ATAC: "#02c7b9"
}

// Type guard to safely check rnaseq
function hasRNASeq<HasRNASeq extends boolean>(
  biosample: BiosampleData<HasRNASeq>, 
  mustHaveRnaSeq: boolean
): boolean {
  if (mustHaveRnaSeq) {
    return 'rnaseq' in biosample && biosample.rnaseq === true;
  }
  return true;
}

/**
 * 
 * @param biosamples 
 * @param checkboxes 
 * @returns biosamples filtered by state of checkboxes
 * @todo this should have early returns within the filter if one of the checks fails
 */
export const filterBiosamples = <HasRNASeq extends boolean>(
  biosamples: { [key: string]: BiosampleData<HasRNASeq>[] },
  sampleTypeFilter: SampleTypeCheckboxes,
  collectionFilter: CollectionCheckboxes,
  lifeStageFiler: LifeStageCheckboxes,
  mustHaveRnaSeq: boolean,
  globalSearch: string,
) => {
  const filteredBiosamples: { [key: string]: BiosampleData<HasRNASeq>[] } = {}

  for (const ontology in biosamples) {
    filteredBiosamples[ontology] = biosamples[ontology].filter((biosample) => {
      let passesType = false
      if (sampleTypeFilter["Tissue"] && biosample.sampleType === "tissue") {
        passesType = true
      } else if (sampleTypeFilter["Primary Cell"] && biosample.sampleType === "primary cell") {
        passesType = true
      } else if (sampleTypeFilter["Cell Line"] && biosample.sampleType === "cell line") {
        passesType = true
      } else if (sampleTypeFilter["In Vitro Differentiated Cells"] && biosample.sampleType === "in vitro differentiated cells") {
        passesType = true
      } else if (sampleTypeFilter["Organoid"] && biosample.sampleType === "organoid") {
        passesType = true
      }
      let passesLifestage = false
      if (lifeStageFiler["Embryo"] && biosample.lifeStage === "embryonic") {
        passesLifestage = true
      } else if (lifeStageFiler["Adult"] && biosample.lifeStage === "adult") {
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
        (collectionFilter["Core Collection"] && collection == "Core") 
        || (collectionFilter["Partial Collection"] && collection == "Partial") 
        || (collectionFilter["Ancillary Collection"] && collection == "Ancillary")
      ) {
        passesCollection = true
      }

      const passesRNAseq = hasRNASeq(biosample, mustHaveRnaSeq);

      //typeof check needed since rnaseq is a boolean
      const passesGlobalSearch = globalSearch ? Object.values(biosample).some(val => typeof val === "string" && val?.toLowerCase().includes(globalSearch.toLowerCase()))
        : true

      return (passesType && passesLifestage && passesCollection && passesRNAseq && passesGlobalSearch)
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