import { cCREData, MainQueryParams, CellTypeData, UnfilteredBiosampleData, FilteredBiosampleData } from "../../app/search/types"

/**
 *
 * @param input string
 * @returns true if string === 't', else false
 */
export function checkTrueFalse(input: string): boolean {
  if (input == "t") {
    return true
  } else {
    return false
  }
}

/**
 *
 * @param input boolean
 * @returns 't' if true, else 'f'
 */
export function outputT_or_F(input: boolean): "t" | "f" {
  if (input === true) {
    return "t"
  } else return "f"
}

/**
 *
 * @param currentElement the cCRE to check
 * @param biosample the selected b
 * @param mainQueryParams
 * @returns
 */
export function passesCriteria(currentElement: cCREData, biosample: string | null, mainQueryParams: MainQueryParams): boolean {
  if (passesChromatinFilter(currentElement, biosample, mainQueryParams) && passesClassificationFilter(currentElement, mainQueryParams)) {
    return true
  } else return false
}

function passesChromatinFilter(currentElement: cCREData, biosample: string | null, mainQueryParams: MainQueryParams) {
  const dnase = biosample ? currentElement.ctspecific.dnase_zscore : currentElement.dnase_zscore
  const h3k4me3 = biosample ? currentElement.ctspecific.h3k4me3_zscore : currentElement.promoter_zscore
  const h3k27ac = biosample ? currentElement.ctspecific.h3k27ac_zscore : currentElement.enhancer_zscore
  const ctcf = biosample ? currentElement.ctspecific.ctcf_zscore : currentElement.ctcf_zscore
  if (
    mainQueryParams.dnase_s < dnase &&
    dnase < mainQueryParams.dnase_e &&
    mainQueryParams.h3k4me3_s < h3k4me3 &&
    h3k4me3 < mainQueryParams.h3k4me3_e &&
    mainQueryParams.h3k27ac_s < h3k27ac &&
    h3k27ac < mainQueryParams.h3k27ac_e &&
    mainQueryParams.ctcf_s < ctcf &&
    ctcf < mainQueryParams.ctcf_e
  ) {
    return true
  } else return false
}

//Consider changing this to a switch, might be slightly faster and would be cleaner.
function passesClassificationFilter(currentElement: cCREData, mainQueryParams: MainQueryParams) {
  const currentElementClass: string = currentElement.pct
  if (currentElementClass === "CA") {
    if (mainQueryParams.CA === true) {
      return true
    } else return false
  } else if (currentElementClass === "CA-CTCF") {
    if (mainQueryParams.CA_CTCF === true) {
      return true
    } else return false
  } else if (currentElementClass === "CA-H3K4me3") {
    if (mainQueryParams.CA_H3K4me3 === true) {
      return true
    } else return false
  } else if (currentElementClass === "CA-TF") {
    if (mainQueryParams.CA_TF === true) {
      return true
    } else return false
  } else if (currentElementClass === "dELS") {
    if (mainQueryParams.dELS === true) {
      return true
    } else return false
  } else if (currentElementClass === "pELS") {
    if (mainQueryParams.pELS === true) {
      return true
    } else return false
  } else if (currentElementClass === "PLS") {
    if (mainQueryParams.PLS === true) {
      return true
    } else return false
  } else if (currentElementClass === "TF") {
    if (mainQueryParams.TF === true) {
      return true
    } else return false
  } else {
    console.log("Something went wrong, cCRE class not determined!")
    return false
  }
}

/**
 * @param experiments Array of objects containing biosample experiments for a given biosample type
 * @returns an object with keys dnase, atac, h3k4me3, h3k27ac, ctcf with each marked true or false
 */
function availableAssays(
  experiments: {
    assay: string
    biosample_summary: string
    biosample_type: string
    tissue: string
    value: string
  }[]
) {
  const assays = { dnase: false, atac: false, h3k4me3: false, h3k27ac: false, ctcf: false }
  experiments.forEach((exp) => (assays[exp.assay.toLowerCase()] = true))
  return assays
}

/**
 *
 * @param byCellType JSON of byCellType
 * @returns an object of sorted biosample types, grouped by tissue type
 */
export function parseByCellType(byCellType: CellTypeData): UnfilteredBiosampleData {
  const biosamples = {}
  Object.entries(byCellType.byCellType).forEach((entry) => {
    // if the tissue catergory hasn't been catalogued, make a new blank array for it
    const experiments = entry[1]
    var tissueArr = []
    if (!biosamples[experiments[0].tissue]) {
      Object.defineProperty(biosamples, experiments[0].tissue, {
        value: [],
        enumerable: true,
        writable: true,
      })
    }
    //The existing tissues
    tissueArr = biosamples[experiments[0].tissue]
    tissueArr.push({
      //display name
      summaryName: experiments[0].biosample_summary,
      //for filtering
      biosampleType: experiments[0].biosample_type,
      //for query
      queryValue: experiments[0].value,
      //for filling in available assay wheels
      //THIS DATA IS MISSING ATAC DATA! ATAC will always be false
      assays: availableAssays(experiments),
      //for displaying tissue category when selected
      biosampleTissue: experiments[0].tissue,
    })
    Object.defineProperty(biosamples, experiments[0].tissue, { value: tissueArr, enumerable: true, writable: true })
  })
  return biosamples
}

/**
 *
 * @param biosamples The biosamples object to filter
 * @returns The same object but filtered with the current state of Biosample Type filters
 */
export function filterBiosamples(
  biosamples: UnfilteredBiosampleData,
  Tissue: boolean,
  PrimaryCell: boolean,
  CellLine: boolean,
  InVitro: boolean,
  Organoid: boolean
): FilteredBiosampleData {
  const filteredBiosamples: FilteredBiosampleData = Object.entries(biosamples).map(([str, objArray]) => [
    str,
    objArray.filter((biosample) => {
      if (Tissue && biosample.biosampleType === "tissue") {
        return true
      } else if (PrimaryCell && biosample.biosampleType === "primary cell") {
        return true
      } else if (CellLine && biosample.biosampleType === "cell line") {
        return true
      } else if (InVitro && biosample.biosampleType === "in vitro differentiated cells") {
        return true
      } else if (Organoid && biosample.biosampleType === "organoid") {
        return true
      } else return false
    }),
  ])
  return filteredBiosamples
}

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

//IMPORTANT: This will wipe the current cCRE when Nishi puts it in. Need to talk to Nishi about deciding when/how to display the cCRE details
/**
 *
 * @param newBiosample optional, use if setting Biosample State and then immediately triggering router before re-render when the new state is accessible
 * @returns A URL configured with filter information
 */
export function constructURL(
  mainQueryParams: MainQueryParams,
  urlParams: {
    Tissue: boolean
    PrimaryCell: boolean
    InVitro: boolean
    Organoid: boolean
    CellLine: boolean
    Biosample: { selected: boolean; biosample: string | null; tissue: string | null; summaryName: string | null }
    DNaseStart: number
    DNaseEnd: number
    H3K4me3Start: number
    H3K4me3End: number
    H3K27acStart: number
    H3K27acEnd: number
    CTCFStart: number
    CTCFEnd: number
    CA: boolean
    CA_CTCF: boolean
    CA_H3K4me3: boolean
    CA_TF: boolean
    dELS: boolean
    pELS: boolean
    PLS: boolean
    TF: boolean
  },
  newBiosample?: {
    selected: boolean
    biosample: string
    tissue: string
    summaryName: string
  }
) {
  //Assembly, Chromosome, Start, End
  const urlBasics = `search?assembly=${mainQueryParams.assembly}&chromosome=${mainQueryParams.chromosome}&start=${mainQueryParams.start}&end=${mainQueryParams.end}`

  //Can probably get biosample down to one string, and extract other info when parsing byCellType
  const biosampleFilters = `&Tissue=${outputT_or_F(urlParams.Tissue)}&PrimaryCell=${outputT_or_F(
    urlParams.PrimaryCell
  )}&InVitro=${outputT_or_F(urlParams.InVitro)}&Organoid=${outputT_or_F(urlParams.Organoid)}&CellLine=${outputT_or_F(urlParams.CellLine)}${
    (urlParams.Biosample.selected && !newBiosample) || (newBiosample && newBiosample.selected)
      ? "&Biosample=" +
        (newBiosample ? newBiosample.biosample : urlParams.Biosample.biosample) +
        "&BiosampleTissue=" +
        (newBiosample ? newBiosample.tissue : urlParams.Biosample.tissue) +
        "&BiosampleSummary=" +
        (newBiosample ? newBiosample.summaryName : urlParams.Biosample.summaryName)
      : ""
  }`

  const chromatinFilters = `&dnase_s=${urlParams.DNaseStart}&dnase_e=${urlParams.DNaseEnd}&h3k4me3_s=${urlParams.H3K4me3Start}&h3k4me3_e=${urlParams.H3K4me3End}&h3k27ac_s=${urlParams.H3K27acStart}&h3k27ac_e=${urlParams.H3K27acEnd}&ctcf_s=${urlParams.CTCFStart}&ctcf_e=${urlParams.CTCFEnd}`

  const classificationFilters = `&CA=${outputT_or_F(urlParams.CA)}&CA_CTCF=${outputT_or_F(urlParams.CA_CTCF)}&CA_H3K4me3=${outputT_or_F(
    urlParams.CA_H3K4me3
  )}&CA_TF=${outputT_or_F(urlParams.CA_TF)}&dELS=${outputT_or_F(urlParams.dELS)}&pELS=${outputT_or_F(urlParams.pELS)}&PLS=${outputT_or_F(
    urlParams.PLS
  )}&TF=${outputT_or_F(urlParams.TF)}`

  const url = `${urlBasics}${biosampleFilters}${chromatinFilters}${classificationFilters}`
  return url
}
