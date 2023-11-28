
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
 * @param row the cCRE row to check
 * @param biosample the selected biosample
 * @param mainQueryParams
 * @returns
 */
export function passesFilters(row: MainResultTableRow, mainQueryParams: MainQueryParams): boolean {
  return (
    passesChromatinFilter(row, mainQueryParams) &&
    passesConservationFilter(row, mainQueryParams) &&
    passesClassificationFilter(row, mainQueryParams) &&
    passesLinkedGenesFilter(row, mainQueryParams)
  )
}

function passesChromatinFilter(row: MainResultTableRow, mainQueryParams: MainQueryParams) {
  const dnase = row.dnase
  const h3k4me3 = row.h3k4me3
  const h3k27ac = row.h3k27ac
  const ctcf = row.ctcf
  const atac = row.atac
  return (
    (dnase ? mainQueryParams.dnase_s <= dnase && dnase <= mainQueryParams.dnase_e : true) &&
    (h3k4me3 ? mainQueryParams.h3k4me3_s <= h3k4me3 && h3k4me3 <= mainQueryParams.h3k4me3_e : true) &&
    (h3k27ac ? mainQueryParams.h3k27ac_s <= h3k27ac && h3k27ac <= mainQueryParams.h3k27ac_e : true) &&
    (ctcf ? mainQueryParams.ctcf_s <= ctcf && ctcf <= mainQueryParams.ctcf_e : true) &&
    (atac ? mainQueryParams.atac_s <= atac && atac <= mainQueryParams.atac_e: true) 
  )
}

function passesConservationFilter(row: MainResultTableRow, mainQueryParams: MainQueryParams) {
  const primates = row.conservationData.primates
  const mammals = row.conservationData.mammals
  const vertebrates = row.conservationData.vertebrates
  return (
    mainQueryParams.prim_s <= primates &&
    primates <= mainQueryParams.prim_e &&
    mainQueryParams.mamm_s <= mammals &&
    mammals <= mainQueryParams.mamm_e &&
    mainQueryParams.vert_s <= vertebrates &&
    vertebrates <= mainQueryParams.vert_e
  )
}

//Consider changing this to a switch, might be slightly faster and would be cleaner.
function passesClassificationFilter(row: MainResultTableRow, mainQueryParams: MainQueryParams) {
  const currentElementClass: string = row.class
  switch (currentElementClass) {
    case "CA":
      return mainQueryParams.CA;
    case "CA-CTCF":
      return mainQueryParams.CA_CTCF;
    case "CA-H3K4me3":
      return mainQueryParams.CA_H3K4me3;
    case "CA-TF":
      return mainQueryParams.CA_TF;
    case "dELS":
      return mainQueryParams.dELS;
    case "pELS":
      return mainQueryParams.pELS;
    case "PLS":
      return mainQueryParams.PLS;
    case "TF":
      return mainQueryParams.TF;
    default:
      console.error("Something went wrong, cCRE class not determined!");
      return false;
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
  mainQueryParams: MainQueryParams):
  MainResultTableRows {
  const cCRE_data: cCREData[] = rawQueryData.mainQueryData.data.cCRESCREENSearch
  const otherLinked = rawQueryData.linkedGenesData
  //Assembly unfiltered rows
  const rows: MainResultTableRows = []
  cCRE_data.forEach((currentElement) => {
    const genesToAdd = otherLinked[currentElement.info.accession] ?? null
    const CTCF_ChIAPET_ToAdd: { name: string, biosample: string }[] = []
    const RNAPII_ChIAPET_ToAdd: { name: string, biosample: string }[] = []
    //Gather lists of CTCF-ChIAPET and RNAPII-ChIAPET linked genes
    genesToAdd && genesToAdd.genes.forEach(gene => {
      if (gene.linkedBy === "CTCF-ChIAPET") {
        CTCF_ChIAPET_ToAdd.push({ name: gene.geneName, biosample: gene.biosample })
      }
      else if (gene.linkedBy === "RNAPII-ChIAPET") {
        RNAPII_ChIAPET_ToAdd.push({ name: gene.geneName, biosample: gene.biosample })
      }
    })
    rows.push({
      accession: currentElement.info.accession,
      class: currentElement.pct,
      chromosome: currentElement.chrom,
      start: currentElement.start.toLocaleString("en-US"),
      end: (currentElement.start + currentElement.len).toLocaleString("en-US"),
      dnase: currentElement.dnase_zscore,
      h3k4me3: currentElement.promoter_zscore,
      h3k27ac: currentElement.enhancer_zscore,
      ctcf: currentElement.ctcf_zscore,
      atac: currentElement.atac_zscore,
      linkedGenes: { distancePC: currentElement.genesallpc.pc.intersecting_genes, distanceAll: currentElement.genesallpc.all.intersecting_genes, CTCF_ChIAPET: CTCF_ChIAPET_ToAdd, RNAPII_ChIAPET: RNAPII_ChIAPET_ToAdd },
      conservationData: { mammals: currentElement.mammals, primates: currentElement.primates, vertebrates: currentElement.vertebrates }
    })
  })

  //This could be structured better
  return rows.filter((row) => passesFilters(row, mainQueryParams))
}