
import { cCREData, MainQueryParams, CellTypeData, UnfilteredBiosampleData, FilteredBiosampleData, URLParams, MainResultTableRows, MainResultTableRow, rawQueryData, FilterCriteria } from "./types"
import { ApolloQueryResult } from "@apollo/client"
import { MainQuery, fetchLinkedGenes } from "../../common/lib/queries"

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
export async function fetchcCREDataAndLinkedGenes (
  assembly: "GRCh38" | "mm10",
  chromosome: string,
  start: number,
  end: number,
  biosample: string,
  nearbygenesdistancethreshold: number,
  nearbygeneslimit: number,
  intersectedAccessions?: string[]
): Promise<rawQueryData> {
  //cCRESEarchQuery
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
  const linkedGenesData = await fetchLinkedGenes(assembly, accessions)
  return ({mainQueryData, linkedGenesData})
}

export function generateFilteredRows(rawQueryData: rawQueryData, filterCriteria: FilterCriteria): MainResultTableRows {
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

  return rows.filter((row) => passesFilters(row, filterCriteria))
}



/**
 *
 * @param row the cCRE row to check
 * @param biosample the selected biosample
 * @param mainQueryParams
 * @returns boolean, true if row passes filter criteria
 */
export function passesFilters(
  row: MainResultTableRow,
  filterCriteria: FilterCriteria
): boolean {
  return (
    passesChromatinFilter(row, filterCriteria.chromatinFilter)
    && passesConservationFilter(row, filterCriteria.conservationFilter)
    && passesClassificationFilter(row, filterCriteria.classificationFilter)
    && passesLinkedGenesFilter(row, filterCriteria.linkedGenesFilter)
  )
}

function passesChromatinFilter(
  row: MainResultTableRow,
  chromatinFilter: {
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
  }
): boolean {
  const dnase = row.dnase
  const h3k4me3 = row.h3k4me3
  const h3k27ac = row.h3k27ac
  const ctcf = row.ctcf
  const atac = row.atac
  return (
    (dnase ? chromatinFilter.dnase_s <= dnase && dnase <= chromatinFilter.dnase_e : true) &&
    (h3k4me3 ? chromatinFilter.h3k4me3_s <= h3k4me3 && h3k4me3 <= chromatinFilter.h3k4me3_e : true) &&
    (h3k27ac ? chromatinFilter.h3k27ac_s <= h3k27ac && h3k27ac <= chromatinFilter.h3k27ac_e : true) &&
    (ctcf ? chromatinFilter.ctcf_s <= ctcf && ctcf <= chromatinFilter.ctcf_e : true) &&
    (atac ? chromatinFilter.atac_s <= atac && atac <= chromatinFilter.atac_e : true)
  )
}

function passesConservationFilter(
  row: MainResultTableRow,
  conservationFilter: {
    prim_s: number
    prim_e: number
    mamm_s: number
    mamm_e: number
    vert_s: number
    vert_e: number
  }
): boolean {
  const primates = row.conservationData.primates
  const mammals = row.conservationData.mammals
  const vertebrates = row.conservationData.vertebrates
  return (
    conservationFilter.prim_s <= primates && primates <= conservationFilter.prim_e &&
    conservationFilter.mamm_s <= mammals && mammals <= conservationFilter.mamm_e &&
    conservationFilter.vert_s <= vertebrates && vertebrates <= conservationFilter.vert_e
  )
}

function passesClassificationFilter(
  row: MainResultTableRow,
  classificationFilter: {
    CA: boolean
    CA_CTCF: boolean
    CA_H3K4me3: boolean
    CA_TF: boolean
    dELS: boolean
    pELS: boolean
    PLS: boolean
    TF: boolean
  }
): boolean {
  const currentElementClass: string = row.class
  switch (currentElementClass) {
    case "CA":
      return classificationFilter.CA;
    case "CA-CTCF":
      return classificationFilter.CA_CTCF;
    case "CA-H3K4me3":
      return classificationFilter.CA_H3K4me3;
    case "CA-TF":
      return classificationFilter.CA_TF;
    case "dELS":
      return classificationFilter.dELS;
    case "pELS":
      return classificationFilter.pELS;
    case "PLS":
      return classificationFilter.PLS;
    case "TF":
      return classificationFilter.TF;
    default:
      console.error("Something went wrong, cCRE class not determined!");
      return false;
  }
}

export function passesLinkedGenesFilter(
  row: MainResultTableRow,
  linkedGenesFilter: {
    genesToFind: string[]
    distancePC: boolean
    distanceAll: boolean
    CTCF_ChIA_PET: boolean
    RNAPII_ChIA_PET: boolean
  }
): boolean {
  let found = false
  //If there is a gene to find a match for
  if (linkedGenesFilter.genesToFind.length > 0) {
    const genes = row.linkedGenes
    //For each selected checkbox, try to find it in the corresponding spot, mark flag as found
    if (linkedGenesFilter.distancePC && genes.distancePC.find((gene) => linkedGenesFilter.genesToFind.find((x) => x === gene.name))) {
      found = true
    }
    if (linkedGenesFilter.distanceAll && genes.distanceAll.find((gene) => linkedGenesFilter.genesToFind.find((x) => x === gene.name))) {
      found = true
    }
    if (linkedGenesFilter.CTCF_ChIA_PET && genes.CTCF_ChIAPET.find((gene) => linkedGenesFilter.genesToFind.find((x) => x === gene.name))) {
      found = true
    }
    if (linkedGenesFilter.RNAPII_ChIA_PET && genes.RNAPII_ChIAPET.find((gene) => linkedGenesFilter.genesToFind.find((x) => x === gene.name))) {
      found = true
    }
    return found
  } else {
    return true
  }
}

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
  const urlBasics = mainQueryParams.searchConfig.bed_intersect ? `search?intersect=t&assembly=${mainQueryParams.coordinates.assembly}` :
   `search?assembly=${mainQueryParams.coordinates.assembly}&chromosome=${mainQueryParams.coordinates.chromosome}&start=${urlParams.start}&end=${urlParams.end}${mainQueryParams.searchConfig.gene ? "&gene=" + mainQueryParams.searchConfig.gene : ""}${mainQueryParams.searchConfig.snpid ? "&snpid=" + mainQueryParams.searchConfig.snpid : ""}`

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

export function constructMainQueryParamsFromURL(searchParams): MainQueryParams {
  return (
    {
      coordinates: {
        //If bed intersecting, set chr start end to null
        assembly: searchParams.assembly === "GRCh38" || searchParams.assembly === "mm10" ?
          searchParams.assembly : "GRCh38",
        chromosome: (searchParams.intersect && checkTrueFalse(searchParams.intersect)) ?
          null : searchParams.chromosome ?? "chr11",
        start: (searchParams.intersect && checkTrueFalse(searchParams.intersect)) ?
          null : searchParams.start ?
            Number(searchParams.start) : 5205263,
        end: (searchParams.intersect && checkTrueFalse(searchParams.intersect)) ?
          null : searchParams.end ?
            Number(searchParams.end) : 5381894,
      },
      biosample: searchParams.Biosample ? 
        {
          selected: true,
          biosample: searchParams.Biosample,
          tissue: searchParams.BiosampleTissue,
          summaryName: searchParams.BiosampleSummary,
        } : { selected: false, biosample: null, tissue: null, summaryName: null },
      searchConfig: {
        //Flag for if user-entered bed file intersection accessions to be used from sessionStorage
        bed_intersect: searchParams.intersect ? checkTrueFalse(searchParams.intersect) : false,
        gene: searchParams.gene,
        snpid: searchParams.snpid,
      },
      filterCriteria: {
        biosampleTableFilters: {
          CellLine: searchParams.CellLine ? checkTrueFalse(searchParams.CellLine) : true,
          PrimaryCell: searchParams.PrimaryCell ? checkTrueFalse(searchParams.PrimaryCell) : true,
          Tissue: searchParams.Tissue ? checkTrueFalse(searchParams.Tissue) : true,
          Organoid: searchParams.Organoid ? checkTrueFalse(searchParams.Organoid) : true,
          InVitro: searchParams.InVitro ? checkTrueFalse(searchParams.InVitro) : true,
        },
        chromatinFilter: {
          dnase_s: searchParams.dnase_s ? Number(searchParams.dnase_s) : -10,
          dnase_e: searchParams.dnase_e ? Number(searchParams.dnase_e) : 10,
          atac_s: searchParams.atac_s ? Number(searchParams.atac_s) : -10,
          atac_e: searchParams.atac_e ? Number(searchParams.atac_e) : 10,
          h3k4me3_s: searchParams.h3k4me3_s ? Number(searchParams.h3k4me3_s) : -10,
          h3k4me3_e: searchParams.h3k4me3_e ? Number(searchParams.h3k4me3_e) : 10,
          h3k27ac_s: searchParams.h3k27ac_s ? Number(searchParams.h3k27ac_s) : -10,
          h3k27ac_e: searchParams.h3k27ac_e ? Number(searchParams.h3k27ac_e) : 10,
          ctcf_s: searchParams.ctcf_s ? Number(searchParams.ctcf_s) : -10,
          ctcf_e: searchParams.ctcf_e ? Number(searchParams.ctcf_e) : 10,
        },
        conservationFilter: {
          prim_s: searchParams.prim_s ? Number(searchParams.prim_s) : -2,
          prim_e: searchParams.prim_e ? Number(searchParams.prim_e) : 2,
          mamm_s: searchParams.mamm_s ? Number(searchParams.mamm_s) : -4,
          mamm_e: searchParams.mamm_e ? Number(searchParams.mamm_e) : 8,
          vert_s: searchParams.vert_s ? Number(searchParams.vert_s) : -3,
          vert_e: searchParams.vert_e ? Number(searchParams.vert_e) : 8,
        },
        classificationFilter: {
          CA: searchParams.CA ? checkTrueFalse(searchParams.CA) : true,
          CA_CTCF: searchParams.CA_CTCF ? checkTrueFalse(searchParams.CA_CTCF) : true,
          CA_H3K4me3: searchParams.CA_H3K4me3 ? checkTrueFalse(searchParams.CA_H3K4me3) : true,
          CA_TF: searchParams.CA_TF ? checkTrueFalse(searchParams.CA_TF) : true,
          dELS: searchParams.dELS ? checkTrueFalse(searchParams.dELS) : true,
          pELS: searchParams.pELS ? checkTrueFalse(searchParams.pELS) : true,
          PLS: searchParams.PLS ? checkTrueFalse(searchParams.PLS) : true,
          TF: searchParams.TF ? checkTrueFalse(searchParams.TF) : true,
        },
        linkedGenesFilter: {
          genesToFind: searchParams.genesToFind ? searchParams.genesToFind.split(",") : [],
          distancePC: searchParams.distancePC ? checkTrueFalse(searchParams.distancePC) : true,
          distanceAll: searchParams.distanceAll ? checkTrueFalse(searchParams.distanceAll) : true,
          CTCF_ChIA_PET: searchParams.CTCF_ChIA_PET ? checkTrueFalse(searchParams.CTCF_ChIA_PET) : true,
          RNAPII_ChIA_PET: searchParams.RNAPII_ChIA_PET ? checkTrueFalse(searchParams.RNAPII_ChIA_PET) : true
        }
      }
    }
  )
}