
import { cCREData, MainQueryParams, CellTypeData, UnfilteredBiosampleData, FilteredBiosampleData, URLParams, MainResultTableRows, MainResultTableRow, rawQueryData } from "./types"
import { ApolloQueryResult } from "@apollo/client"
import { MainQuery, linkedGenesQuery } from "../../common/lib/queries"


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
 * @param biosample the selected biosample
 * @param mainQueryParams
 * @returns
 */
export function passesCriteria(currentElement: cCREData, biosample: string | null, mainQueryParams: MainQueryParams): boolean {
  return (
    passesChromatinFilter(currentElement, biosample, mainQueryParams) &&
    passesConservationFilter(currentElement, mainQueryParams) &&
    passesClassificationFilter(currentElement, mainQueryParams)
  )
}

function passesChromatinFilter(currentElement: cCREData, biosample: string | null, mainQueryParams: MainQueryParams) {
  const dnase = biosample ? currentElement.ctspecific.dnase_zscore : currentElement.dnase_zscore
  const h3k4me3 = biosample ? currentElement.ctspecific.h3k4me3_zscore : currentElement.promoter_zscore
  const h3k27ac = biosample ? currentElement.ctspecific.h3k27ac_zscore : currentElement.enhancer_zscore
  const ctcf = biosample ? currentElement.ctspecific.ctcf_zscore : currentElement.ctcf_zscore
  const atac = biosample ? currentElement.ctspecific.atac_zscore : currentElement.atac_zscore
  if (
    (dnase ? mainQueryParams.dnase_s <= dnase && dnase <= mainQueryParams.dnase_e : true) &&
    (h3k4me3 ? mainQueryParams.h3k4me3_s <= h3k4me3 && h3k4me3 <= mainQueryParams.h3k4me3_e : true) &&
    (h3k27ac ? mainQueryParams.h3k27ac_s <= h3k27ac && h3k27ac <= mainQueryParams.h3k27ac_e : true) &&
    (ctcf ? mainQueryParams.ctcf_s <= ctcf && ctcf <= mainQueryParams.ctcf_e : true) &&
    (atac ? mainQueryParams.atac_s <= atac && atac <= mainQueryParams.atac_e: true) 
  ) {
    return true
  } else return false
}

function passesConservationFilter(currentElement: cCREData, mainQueryParams: MainQueryParams) {
  const primates = currentElement.primates
  const mammals = currentElement.mammals
  const vertebrates = currentElement.vertebrates
  if (
    mainQueryParams.prim_s <= primates &&
    primates <= mainQueryParams.prim_e &&
    mainQueryParams.mamm_s <= mammals &&
    mammals <= mainQueryParams.mamm_e &&
    mainQueryParams.vert_s <= vertebrates &&
    vertebrates <= mainQueryParams.vert_e
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

export function passesLinkedGenesFilter(row: MainResultTableRow, mainQueryParams: MainQueryParams) {
  //If there is a gene to find a match for
  let found = false
  if (mainQueryParams.genesToFind) {
    const genes = row.linkedGenes
    //For each selected checkbox, try to find it in the corresponding spot, mark flag as found
    if (mainQueryParams.distancePC && genes.distancePC.find((gene) => mainQueryParams.genesToFind.find((x) => x === gene.name))) {
      found = true
    }
    if (mainQueryParams.distanceAll && genes.distanceAll.find((gene) => mainQueryParams.genesToFind.find((x) => x === gene.name))) {
      found = true
    }
    if (mainQueryParams.CTCF_ChIA_PET && genes.CTCF_ChIAPET.find((gene) => mainQueryParams.genesToFind.find((x) => x === gene.name))) {
      found = true
    }
    if (mainQueryParams.RNAPII_ChIA_PET && genes.RNAPII_ChIAPET.find((gene) => mainQueryParams.genesToFind.find((x) => x === gene.name))) {
      found = true
    }
    return found
  } else {
    return true
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

/**
 *
 * @param newBiosample optional, use if setting Biosample State and then immediately triggering router before re-render when the new state is accessible
 * @returns A URL configured with filter information
 * @todo this function should only take in urlParams, not mainQueryParams (which should be renamed). urlParams is more like filterParams. Also this should not append things to the url unless it changes from the default value
 */
export function constructURL(
  mainQueryParams: MainQueryParams,
  urlParams: URLParams,
  newBiosample?: {
    selected: boolean
    biosample: string
    tissue: string
    summaryName: string
  }
) {
  /**
   * ! Important !
   * 
   * When adding to the url using template strings, be sure to match the string extactly with what search/page.tsx is expecting when
   * it constructs the mainQueryParams object. There's no easy way type this to catch errors
   */ 

  //Assembly, Chromosome, Start, End
  const urlBasics = mainQueryParams.bed_intersect ? `search?intersect=t&assembly=${mainQueryParams.assembly}` :
   `search?assembly=${mainQueryParams.assembly}&chromosome=${mainQueryParams.chromosome}&start=${urlParams.start}&end=${urlParams.end}${mainQueryParams.gene ? "&gene=" + mainQueryParams.gene : ""}${mainQueryParams.snpid ? "&snpid=" + mainQueryParams.snpid : ""}`

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

  const chromatinFilters = `&dnase_s=${urlParams.DNaseStart}&dnase_e=${urlParams.DNaseEnd}&h3k4me3_s=${urlParams.H3K4me3Start}&h3k4me3_e=${urlParams.H3K4me3End}&h3k27ac_s=${urlParams.H3K27acStart}&h3k27ac_e=${urlParams.H3K27acEnd}&ctcf_s=${urlParams.CTCFStart}&ctcf_e=${urlParams.CTCFEnd}&atac_s=${urlParams.ATACStart}&atac_e=${urlParams.ATACEnd}`

  const classificationFilters = `&CA=${outputT_or_F(urlParams.CA)}&CA_CTCF=${outputT_or_F(urlParams.CA_CTCF)}&CA_H3K4me3=${outputT_or_F(
    urlParams.CA_H3K4me3
  )}&CA_TF=${outputT_or_F(urlParams.CA_TF)}&dELS=${outputT_or_F(urlParams.dELS)}&pELS=${outputT_or_F(urlParams.pELS)}&PLS=${outputT_or_F(
    urlParams.PLS
  )}&TF=${outputT_or_F(urlParams.TF)}`

  const conservationFilters = `&prim_s=${urlParams.PrimateStart}&prim_e=${urlParams.PrimateEnd}&mamm_s=${urlParams.MammalStart}&mamm_e=${urlParams.MammalEnd}&vert_s=${urlParams.VertebrateStart}&vert_e=${urlParams.VertebrateEnd}`

  const linkedGenesFilter = `&genesToFind=${urlParams.genesToFind.join(',')}&distancePC=${outputT_or_F(urlParams.distancePC)}&distanceAll=${outputT_or_F(urlParams.distanceAll)}&distanceFromcCRE=${urlParams.distanceFromcCRE}&CTCF_ChIA_PET=${outputT_or_F(urlParams.CTCF_ChIA_PET)}&RNAPII_ChIA_PET=${outputT_or_F(urlParams.RNAPII_ChIA_PET)}`

  const accessionsAndPage = `&accession=${urlParams.Accessions}&page=${urlParams.Page}`

  const url = `${urlBasics}${biosampleFilters}${chromatinFilters}${classificationFilters}${conservationFilters}${urlParams.genesToFind.length > 0 ? linkedGenesFilter : ""}${accessionsAndPage}`
  return url
}

/**
 * 
 * @param assembly "GRCh38" | "mm10"
 * @param chromosome string
 * @param start number
 * @param end number
 * @param biosample string
 * @param nearbygenesdistancethreshold number, 1,000,000 is default if undefined
 * @param nearbygeneslimit number, 3 is default if undefined
 * @param intersectedAccessions string[], optional, for intersected accessions from bed upload
 * @returns \{mainQueryData: ..., linkedGenesData: ...}, (mostly) raw data. If biosample passed, 
 * the ctspecific zscores in mainQueryData are used to replace normal zscores to avoid passing biosample
 * to specify where to select scores from later in generateFilteredRows
 */
export async function sendMainQueries (
  assembly: "GRCh38" | "mm10",
  chromosome: string,
  start: number,
  end: number,
  biosample: string,
  nearbygenesdistancethreshold: number,
  nearbygeneslimit: number,
  intersectedAccessions?: string[]
): Promise<rawQueryData> {
  const mainQueryData = await MainQuery(
    assembly,
    chromosome,
    start,
    end,
    biosample,
    nearbygenesdistancethreshold,
    nearbygeneslimit,
    intersectedAccessions
  )
  let cCRE_data: cCREData[] = mainQueryData?.data?.cCRESCREENSearch
  const accessions: string[] = []
  //If biosample-specific data returned, sync z-scores with ctspecific to avoid having to select ctspecific later
  if (biosample) {
    cCRE_data = cCRE_data.map(cCRE => {
      cCRE.dnase_zscore = cCRE.ctspecific.dnase_zscore;
      cCRE.atac_zscore = cCRE.ctspecific.atac_zscore;
      cCRE.enhancer_zscore = cCRE.ctspecific.h3k27ac_zscore;
      cCRE.promoter_zscore = cCRE.ctspecific.h3k4me3_zscore;
      cCRE.ctcf_zscore = cCRE.ctspecific.ctcf_zscore;
      return cCRE
    })
  }
  cCRE_data.forEach((currentElement) => {
    accessions.push(currentElement.info.accession)
  })
  const linkedGenesData = await linkedGenesQuery(assembly, accessions)
  return ({mainQueryData, linkedGenesData})
}

export function generateFilteredRows(
  rawQueryData: rawQueryData,
  biosample: string | null,
  mainQueryParams: MainQueryParams): 
  MainResultTableRows
  {
  const cCRE_data: cCREData[] = rawQueryData.mainQueryData.data.cCRESCREENSearch
  const rows: MainResultTableRows = []
  // Used for Linked Gene Query
  const accessions: string[] = []
  cCRE_data.forEach((currentElement) => {
    if (passesCriteria(currentElement, biosample, mainQueryParams)) {
      rows.push({
        accession: currentElement.info.accession,
        class: currentElement.pct,
        chromosome: currentElement.chrom,
        start: currentElement.start.toLocaleString("en-US"),
        end: (currentElement.start + currentElement.len).toLocaleString("en-US"),
        dnase: biosample ? currentElement.ctspecific.dnase_zscore : currentElement.dnase_zscore,
        h3k4me3: biosample ? currentElement.ctspecific.h3k4me3_zscore : currentElement.promoter_zscore,
        h3k27ac: biosample ? currentElement.ctspecific.h3k27ac_zscore : currentElement.enhancer_zscore,
        ctcf: biosample ? currentElement.ctspecific.ctcf_zscore : currentElement.ctcf_zscore,
        atac: biosample ? currentElement.ctspecific.atac_zscore : currentElement.atac_zscore,
        linkedGenes: { distancePC: currentElement.genesallpc.pc.intersecting_genes, distanceAll: currentElement.genesallpc.all.intersecting_genes, CTCF_ChIAPET: [], RNAPII_ChIAPET: [] },
        conservationData: { mammals: currentElement.mammals, primates: currentElement.primates, vertebrates: currentElement.vertebrates }
      })
      accessions.push(currentElement.info.accession)
    }
  })
  const otherLinked = rawQueryData.linkedGenesData
  rows.forEach((row: MainResultTableRow) => {
    const accession = row.accession
    const genesToAdd = otherLinked[accession] ?? null

    genesToAdd && genesToAdd.genes.forEach(gene => {
      if (gene.linkedBy === "CTCF-ChIAPET") {
        row.linkedGenes.CTCF_ChIAPET.push({ name: gene.geneName, biosample: gene.biosample })
      }
      else if (gene.linkedBy === "RNAPII-ChIAPET") {
        row.linkedGenes.RNAPII_ChIAPET.push({ name: gene.geneName, biosample: gene.biosample })
      }
    })
  })

  //Is there a better way to structure this code?
  return rows.filter((row) => passesLinkedGenesFilter(row, mainQueryParams))
}