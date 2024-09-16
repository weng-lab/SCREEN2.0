
import { MainQueryParams, MainResultTableRows, MainResultTableRow, FilterCriteria, BiosampleTableFilters, MainQueryData, SCREENSearchResult, RegistryBiosample, BiosampleData } from "./types"
import { MainQuery } from "../../common/lib/queries"
import { startTransition } from "react"
import { LinkedGeneInfo } from "./_ccredetails/ccredetails"

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
 * @param noLimit boolean, set to true to eliminate 25K limit on results (defined in queries.ts). Only remove limit if region is ~ <20M bp to avoid crashing cCRE service
 * @returns Main cCRE search results (of type MainQueryData) (mostly) raw data. If biosample passed, 
 * the ctspecific zscores in mainQueryData are used to replace normal zscores to avoid passing biosample
 * to specify where to select scores from later in generateFilteredRows
 */
export async function fetchcCREData (
  assembly: "GRCh38" | "mm10",
  chromosome: string,
  start: number,
  end: number,
  biosample: string,
  nearbygenesdistancethreshold: number,
  nearbygeneslimit: number,
  intersectedAccessions?: string[],
  noLimit?: boolean
): Promise<MainQueryData> {
  
  //cCRESearchQuery
  let mainQueryData: MainQueryData = await MainQuery(
    assembly,
    chromosome,
    start,
    end,
    biosample,
    nearbygenesdistancethreshold,
    nearbygeneslimit,
    intersectedAccessions,
    noLimit
  )
  //If biosample-specific data returned, sync z-scores with ctspecific to avoid having to select ctspecific later
  if (biosample) {
    mainQueryData.data.cCRESCREENSearch = mainQueryData.data.cCRESCREENSearch.map(cCRE => {
      cCRE.dnase_zscore = cCRE.ctspecific.dnase_zscore;
      cCRE.atac_zscore = cCRE.ctspecific.atac_zscore;
      cCRE.enhancer_zscore = cCRE.ctspecific.h3k27ac_zscore;
      cCRE.promoter_zscore = cCRE.ctspecific.h3k4me3_zscore;
      cCRE.ctcf_zscore = cCRE.ctspecific.ctcf_zscore;
      return cCRE
    })
  }
  
  return (mainQueryData)
}

/**
 * @param mainQueryData 
 * @param linkedGenesData 
 * @param filterCriteria 
 * @param unfiltered 
 * @param TSSranges 
 * @returns filtered rows
 */
export function generateFilteredRows(
  mainQueryData: MainQueryData,
  linkedGenesData: LinkedGeneInfo[],
  filterCriteria: FilterCriteria,
  unfiltered?: boolean,
  TSSranges?: {start: number, end: number}[]
): MainResultTableRows {
  const rows: MainResultTableRows = []
  //Assemble unfiltered rows, if TSS ranges passed check to make sure it's in one of them
  mainQueryData.data.cCRESCREENSearch.forEach((currentElement) => {
    if (!TSSranges || TSSranges && TSSranges.find((TSSrange) => currentElement.start <= TSSrange.end && TSSrange.start <= (currentElement.start + currentElement.len))) {
      rows.push({
        accession: currentElement.info.accession,
        class: currentElement.pct,
        chromosome: currentElement.chrom,
        start: currentElement.start,
        end: (currentElement.start + currentElement.len),
        dnase: currentElement.dnase_zscore,
        h3k4me3: currentElement.promoter_zscore,
        h3k27ac: currentElement.enhancer_zscore,
        ctcf: currentElement.ctcf_zscore,
        atac: currentElement.atac_zscore,
        nearestGenes: currentElement.nearestgenes,
        linkedGenes: linkedGenesData ? linkedGenesData.filter(gene => gene.accession === currentElement.info.accession) : null,
        conservationData: { mammals: currentElement.mammals, primates: currentElement.primates, vertebrates: currentElement.vertebrates }
      })
    }
  })
  if (unfiltered) {
    return rows
  } else {
    return rows.filter((row) => passesFilters(row, filterCriteria))
  }
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
    passesChromatinFilter(
      row,
      {
        dnase_s: filterCriteria.dnase_s,
        dnase_e: filterCriteria.dnase_e,
        atac_s: filterCriteria.atac_s,
        atac_e: filterCriteria.atac_e,
        h3k4me3_s: filterCriteria.h3k4me3_s,
        h3k4me3_e: filterCriteria.h3k4me3_e,
        h3k27ac_s: filterCriteria.h3k27ac_s,
        h3k27ac_e: filterCriteria.h3k27ac_e,
        ctcf_s: filterCriteria.ctcf_s,
        ctcf_e: filterCriteria.ctcf_e,
      }
    )
    && passesConservationFilter(
      row,
      {
        prim_s: filterCriteria.prim_s,
        prim_e: filterCriteria.prim_e,
        mamm_s: filterCriteria.mamm_s,
        mamm_e: filterCriteria.mamm_e,
        vert_s: filterCriteria.vert_s,
        vert_e: filterCriteria.vert_e
      }
    )
    && passesClassificationFilter(
      row,
      {
        CA: filterCriteria.CA,
        CA_CTCF: filterCriteria.CA_CTCF,
        CA_H3K4me3: filterCriteria.CA_H3K4me3,
        CA_TF: filterCriteria.CA_TF,
        dELS: filterCriteria.dELS,
        pELS: filterCriteria.pELS,
        PLS: filterCriteria.PLS,
        TF: filterCriteria.TF
      }
    )
    && passesLinkedGenesFilter(
      row,
      filterCriteria
    )
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

function linkedGeneIsMatch(rowInfo: LinkedGeneInfo, gene: string, filters: FilterCriteria): boolean {
  if (rowInfo.gene !== gene) return false
  //check if assay of linked gene is checked in filter
  //As of writing this, the eQTLs method is the only which has no assay field. If this changes, this will break
  switch (rowInfo.assay) {
    case "CTCF-ChIAPET":
      return filters.CTCFChIAPET.checked && (filters.CTCFChIAPET.biosample ? filters.CTCFChIAPET.biosample === rowInfo.displayname : true)
    case "RNAPII-ChIAPET":
      return filters.RNAPIIChIAPET.checked && (filters.RNAPIIChIAPET.biosample ? filters.RNAPIIChIAPET.biosample === rowInfo.displayname : true)
    case "Intact-HiC":
      return filters.HiC.checked && (filters.HiC.biosample ? filters.HiC.biosample === rowInfo.displayname : true)
    case "CRISPRi-FlowFISH":
      return filters.CRISPRiFlowFISH.checked && (filters.CRISPRiFlowFISH.biosample ? filters.CRISPRiFlowFISH.biosample === rowInfo.displayname : true)
    //Currently this means that the method is eQTLs
    case null:
      return filters.eQTLs.checked && (filters.eQTLs.biosample ? filters.eQTLs.biosample === rowInfo.tissue : true)
  }
}

export function passesLinkedGenesFilter(
  row: MainResultTableRow,
  filterCriteria: FilterCriteria
): boolean {
  const gene = filterCriteria.linkedGeneName

  //if row.linkedGenes is null, it hasn't been fetched yet, so allow row through
  //or if no genes specified do the same
  if (!row.linkedGenes || !gene) {
    return true
  }
  for (const linkedGenes of row.linkedGenes) {
    if (linkedGeneIsMatch(linkedGenes, gene, filterCriteria)) return true
  } return false
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
    celltypename: string
  }[]
) {
  const assays = { dnase: false, atac: false, h3k4me3: false, h3k27ac: false, ctcf: false }
  experiments.forEach((exp) => (assays[exp.assay.toLowerCase()] = true))
  return assays
}

/**
 * 
 * @param biosampleData 
 * @param rnaSeqSamples 
 * @returns an object of sorted biosample types, grouped by tissue type
 * @todo remove this once old biosmaple tables is out
 */
export function parseBiosamples(biosampleData: RegistryBiosample[], rnaSeqSamples: { biosample: string }[]): BiosampleData{
  const groupedBiosamples: BiosampleData = {}

  biosampleData.forEach(biosample => {
    //If tissue hasn't been cataloged yet, define an entry for it
    if (!groupedBiosamples[biosample.ontology]){
      groupedBiosamples[biosample.ontology] = [];
    }
    //Add biosample to corresponding entry
    groupedBiosamples[biosample.ontology].push(
      {
        ...biosample,
        rnaseq: Boolean(rnaSeqSamples.map((sample) => sample.biosample).find(sampleName => biosample.name === sampleName)),
      }
    )
  })

  return groupedBiosamples
}

/**
 *
 * @param biosamples The biosamples object to filter
 * @returns The same object but filtered with the current state of Biosample Type filters
 * @todo remove this function once old biosample tables is out
 */
export function filterBiosamples(
  biosamples: BiosampleData,
  Tissue: boolean,
  PrimaryCell: boolean,
  CellLine: boolean,
  InVitro: boolean,
  Organoid: boolean,
  Core: boolean,
  Partial: boolean,
  Ancillary: boolean,
  Embryo: boolean,
  Adult: boolean,
): BiosampleData {

  const filteredBiosamples: BiosampleData = {}

  for (const ontology in biosamples) {
    filteredBiosamples[ontology] = biosamples[ontology].filter((biosample) => {
      let passesType: boolean = false
      if (Tissue && biosample.sampleType === "tissue") {
        passesType = true
      } else if (PrimaryCell && biosample.sampleType === "primary cell") {
        passesType = true
      } else if (CellLine && biosample.sampleType === "cell line") {
        passesType = true
      } else if (InVitro && biosample.sampleType === "in vitro differentiated cells") {
        passesType = true
      } else if (Organoid && biosample.sampleType === "organoid") {
        passesType = true
      }
      let passesLifestage = false
      if (Embryo && biosample.lifeStage === "embryonic") {
        passesLifestage = true
      } else if (Adult && biosample.lifeStage === "adult") {
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
      if ((Core && collection == "Core") || (Partial && collection == "Partial") || (Ancillary && collection == "Ancillary")) {
        passesCollection = true
      }
      return (passesType && passesLifestage && passesCollection)
    })
  }
  return filteredBiosamples
}

/**
 * @todo remove this once biosample tables is out
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

/**
 *
 * @param newSearchParams object of type MainQueryParams
 * @param newFilterCriteria object of type FilterCriteria
 * @param newBiosampleTableFilters object of type BiosampleTableFilters
 * @param page number, should be current page
 * @param accessions string, comma-separated, (NOT string[])
 * @param newBiosample optional, use if setting Biosample State and then immediately triggering router before re-render when the new state is accessible
 * @returns A URL configured with search params matching newSearchParams
 *
 */
export function constructSearchURL(
  newSearchParams: MainQueryParams,
  newFilterCriteria: FilterCriteria,
  newBiosampleTableFilters: BiosampleTableFilters,
  page: number = 0,
  accessions: string = '',
): string {
  /**
   * ! Important !
   * 
   * When adding to the url using template strings, be sure to match the string extactly with what search/page.tsx is expecting when
   * it constructs the mainQueryParams object. There's no easy way type this to catch errors
   */ 

  //Assembly, Chromosome, Start, End
  const urlBasics =
    newSearchParams.searchConfig.bed_intersect ?
      `search?intersect=t&assembly=${newSearchParams.coordinates.assembly}`
      :
      "search?"
      + `assembly=${newSearchParams.coordinates.assembly}`
      + `&chromosome=${newSearchParams.coordinates.chromosome}`
      + `&start=${newSearchParams.coordinates.start}`
      + `&end=${newSearchParams.coordinates.end}`
      + `${newSearchParams.gene.name ? "&gene=" + newSearchParams.gene.name + "&tssDistance=" + newSearchParams.gene.distance + "&nearTSS=" + outputT_or_F(newSearchParams.gene.nearTSS) : ""}`
      + `${newSearchParams.snp.rsID ? "&snpid=" + newSearchParams.snp.rsID + "&snpDistance=" + newSearchParams.snp.distance : ""}`

  //Can probably get biosample down to one string, and extract other info when parsing byCellType
  const biosampleFilters =
    `${newSearchParams.biosample ?
      "&Biosample=" + (newSearchParams.biosample.name)
      + "&BiosampleTissue=" + (newSearchParams.biosample.ontology)
      + "&BiosampleSummary=" + (newSearchParams.biosample.displayname)
      : ""
    }`
    + `&Tissue=${outputT_or_F(newBiosampleTableFilters.Tissue.checked)}`
    + `&PrimaryCell=${outputT_or_F(newBiosampleTableFilters.PrimaryCell.checked)}`
    + `&InVitro=${outputT_or_F(newBiosampleTableFilters.InVitro.checked)}`
    + `&Organoid=${outputT_or_F(newBiosampleTableFilters.Organoid.checked)}`
    + `&CellLine=${outputT_or_F(newBiosampleTableFilters.CellLine.checked)}`
    + `&Core=${outputT_or_F(newBiosampleTableFilters.Core.checked)}`
    + `&Partial=${outputT_or_F(newBiosampleTableFilters.Partial.checked)}`
    + `&Ancillary=${outputT_or_F(newBiosampleTableFilters.Ancillary.checked)}`
    + `&Embryo=${outputT_or_F(newBiosampleTableFilters.Embryo.checked)}`
    + `&Adult=${outputT_or_F(newBiosampleTableFilters.Adult.checked)}`

  const chromatinFilters =
    `&dnase_s=${newFilterCriteria.dnase_s}`
    + `&dnase_e=${newFilterCriteria.dnase_e}`
    + `&h3k4me3_s=${newFilterCriteria.h3k4me3_s}`
    + `&h3k4me3_e=${newFilterCriteria.h3k4me3_e}`
    + `&h3k27ac_s=${newFilterCriteria.h3k27ac_s}`
    + `&h3k27ac_e=${newFilterCriteria.h3k27ac_e}`
    + `&ctcf_s=${newFilterCriteria.ctcf_s}`
    + `&ctcf_e=${newFilterCriteria.ctcf_e}`
    + `&atac_s=${newFilterCriteria.atac_s}`
    + `&atac_e=${newFilterCriteria.atac_e}`

  const classificationFilters =
    `&CA=${outputT_or_F(newFilterCriteria.CA)}`
    + `&CA_CTCF=${outputT_or_F(newFilterCriteria.CA_CTCF)}`
    + `&CA_H3K4me3=${outputT_or_F(newFilterCriteria.CA_H3K4me3)}`
    + `&CA_TF=${outputT_or_F(newFilterCriteria.CA_TF)}`
    + `&dELS=${outputT_or_F(newFilterCriteria.dELS)}`
    + `&pELS=${outputT_or_F(newFilterCriteria.pELS)}`
    + `&PLS=${outputT_or_F(newFilterCriteria.PLS)}`
    + `&TF=${outputT_or_F(newFilterCriteria.TF)}`

  const conservationFilters =
    `&prim_s=${newFilterCriteria.prim_s}`
    + `&prim_e=${newFilterCriteria.prim_e}`
    + `&mamm_s=${newFilterCriteria.mamm_s}`
    + `&mamm_e=${newFilterCriteria.mamm_e}`
    + `&vert_s=${newFilterCriteria.vert_s}`
    + `&vert_e=${newFilterCriteria.vert_e}`

  const linkedGenesFilter =
    `&linkedGeneName=${newFilterCriteria.linkedGeneName ?? ''}`
    + `&CTCFChIAPET=${outputT_or_F(newFilterCriteria.CTCFChIAPET.checked)}_${newFilterCriteria.CTCFChIAPET.biosample ?? ''}`
    + `&RNAPIIChIAPET=${outputT_or_F(newFilterCriteria.RNAPIIChIAPET.checked)}_${newFilterCriteria.RNAPIIChIAPET.biosample ?? ''}`
    + `&HiC=${outputT_or_F(newFilterCriteria.HiC.checked)}_${newFilterCriteria.HiC.biosample ?? ''}`
    + `&CRISPRiFlowFISH=${outputT_or_F(newFilterCriteria.CRISPRiFlowFISH.checked)}_${newFilterCriteria.CRISPRiFlowFISH.biosample ?? ''}`
    + `&eQTLs=${outputT_or_F(newFilterCriteria.eQTLs.checked)}_${newFilterCriteria.eQTLs.biosample ?? ''}`

  const accessionsAndPage =
    `&accessions=${accessions}`
    + `&page=${page}`

  const url =
    `${urlBasics}`
    + `${biosampleFilters}`
    + `${chromatinFilters}`
    + `${classificationFilters}`
    + `${conservationFilters}`
    + `${linkedGenesFilter}`
    + `${accessionsAndPage}`

  return url
}

export function constructMainQueryParamsFromURL(searchParams: { [key: string]: string | undefined }): MainQueryParams {
  
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
            +(searchParams.start) : 5205263,
        end: (searchParams.intersect && checkTrueFalse(searchParams.intersect)) ?
          null : searchParams.end ?
            +(searchParams.end) : 5381894,
      },
      //Incomplete data, will be filled in once biosample query is loaded
      biosample: searchParams.Biosample ?
        {
          displayname: searchParams.BiosampleSummary,
          ontology: searchParams.BiosampleTissue,
          name: searchParams.Biosample,
          lifeStage: null,
          sampleType: null,
          dnase: null,
          h3k4me3: null,
          h3k27ac: null,
          ctcf: null,
          atac: null,
          dnase_signal: null,
          h3k4me3_signal: null,
          h3k27ac_signal: null,
          ctcf_signal: null,
          atac_signal: null,
        } : null,
      searchConfig: {
        //Flag for if user-entered bed file intersection accessions to be used from sessionStorage
        bed_intersect: searchParams.intersect ? checkTrueFalse(searchParams.intersect) : false,
      },
      gene: {
        name: searchParams.gene,
        distance: +searchParams.tssDistance ? +searchParams.tssDistance : 0,
        nearTSS: searchParams.nearTSS ? checkTrueFalse(searchParams.nearTSS) : false
      },
      snp: {
        rsID: searchParams.snpid,
        distance: searchParams.snpDistance ? +searchParams.snpDistance : 0
      }
    }
  )
}

export function constructFilterCriteriaFromURL(searchParams: { [key: string]: string | undefined }): FilterCriteria {
  const sP = searchParams
  return (
    {
      dnase_s: sP.dnase_s ? +(sP.dnase_s) : -10,
      dnase_e: sP.dnase_e ? +(sP.dnase_e) : 11,
      atac_s: sP.atac_s ? +(sP.atac_s) : -10,
      atac_e: sP.atac_e ? +(sP.atac_e) : 11,
      h3k4me3_s: sP.h3k4me3_s ? +(sP.h3k4me3_s) : -10,
      h3k4me3_e: sP.h3k4me3_e ? +(sP.h3k4me3_e) : 11,
      h3k27ac_s: sP.h3k27ac_s ? +(sP.h3k27ac_s) : -10,
      h3k27ac_e: sP.h3k27ac_e ? +(sP.h3k27ac_e) : 11,
      ctcf_s: sP.ctcf_s ? +(sP.ctcf_s) : -10,
      ctcf_e: sP.ctcf_e ? +(sP.ctcf_e) : 11,
      prim_s: sP.prim_s ? +(sP.prim_s) : -2,
      prim_e: sP.prim_e ? +(sP.prim_e) : 2,
      mamm_s: sP.mamm_s ? +(sP.mamm_s) : -4,
      mamm_e: sP.mamm_e ? +(sP.mamm_e) : 8,
      vert_s: sP.vert_s ? +(sP.vert_s) : -3,
      vert_e: sP.vert_e ? +(sP.vert_e) : 8,
      CA: sP.CA ? checkTrueFalse(sP.CA) : true,
      CA_CTCF: sP.CA_CTCF ? checkTrueFalse(sP.CA_CTCF) : true,
      CA_H3K4me3: sP.CA_H3K4me3 ? checkTrueFalse(sP.CA_H3K4me3) : true,
      CA_TF: sP.CA_TF ? checkTrueFalse(sP.CA_TF) : true,
      dELS: sP.dELS ? checkTrueFalse(sP.dELS) : true,
      pELS: sP.pELS ? checkTrueFalse(sP.pELS) : true,
      PLS: sP.PLS ? checkTrueFalse(sP.PLS) : true,
      TF: sP.TF ? checkTrueFalse(sP.TF) : true,
      linkedGeneName: sP.linkedGeneName ? sP.linkedGeneName : null,
      //For these, with be 't' or 'f', a comma, and then the biosample if specified. Splitting to separate check state from it's biosample. Default to checked, no biosample
      CTCFChIAPET: sP.CTCFChIAPET ? {checked: checkTrueFalse(sP.CTCFChIAPET.split('_')[0]), biosample: sP.CTCFChIAPET.split('_')[1]} : {checked: true, biosample: null},
      RNAPIIChIAPET: sP.RNAPIIChIAPET ? {checked: checkTrueFalse(sP.RNAPIIChIAPET.split('_')[0]), biosample: sP.RNAPIIChIAPET.split('_')[1]} : {checked: true, biosample: null},
      HiC: sP.HiC ? {checked: checkTrueFalse(sP.HiC.split('_')[0]), biosample: sP.HiC.split('_')[1]} : {checked: true, biosample: null},
      CRISPRiFlowFISH: sP.CRISPRiFlowFISH ? {checked: checkTrueFalse(sP.CRISPRiFlowFISH.split('_')[0]), biosample: sP.CRISPRiFlowFISH.split('_')[1]} : {checked: true, biosample: null},
      eQTLs: sP.eQTLs ? {checked: checkTrueFalse(sP.eQTLs.split('_')[0]), biosample: sP.eQTLs.split('_')[1]} : {checked: true, biosample: null}
    }
  )
}

export function constructBiosampleTableFiltersFromURL(searchParams: { [key: string]: string | undefined }): BiosampleTableFilters {
  return (
    {
      CellLine: { checked: searchParams.CellLine ? checkTrueFalse(searchParams.CellLine) : true, label: "Cell Line" },
      PrimaryCell: { checked: searchParams.PrimaryCell ? checkTrueFalse(searchParams.PrimaryCell) : true, label: "Primary Cell" },
      Tissue: { checked: searchParams.Tissue ? checkTrueFalse(searchParams.Tissue) : true, label: "Tissue" },
      Organoid: { checked: searchParams.Organoid ? checkTrueFalse(searchParams.Organoid) : true, label: "Organoid" },
      InVitro: { checked: searchParams.InVitro ? checkTrueFalse(searchParams.InVitro) : true, label: "In Vitro Differentiated Cell" },
      Core: { checked: searchParams.Core ? checkTrueFalse(searchParams.Core) : true, label: "Core Collection" },
      Partial: { checked: searchParams.Partial ? checkTrueFalse(searchParams.Partial) : true, label: "Partial Data Collection" },
      Ancillary: { checked: searchParams.Ancillary ? checkTrueFalse(searchParams.Ancillary) : true, label: "Ancillary Collection" },
      Embryo: { checked: searchParams.Ancillary ? checkTrueFalse(searchParams.Embyro) : true, label: "Embryo" },
      Adult: { checked: searchParams.Ancillary ? checkTrueFalse(searchParams.Adult) : true, label: "Adult" },
    }
  )
}

export function filtersModified(
  f: FilterCriteria,
  checkFilter: "chromatin signals" | "conservation" | "classification"
): boolean {
  switch (checkFilter) {
    case ("chromatin signals"):
      if (
        f.atac_s === -10 &&
        f.atac_e === 11 &&
        f.dnase_s === -10 &&
        f.dnase_e === 11 &&
        f.ctcf_s === -10 &&
        f.ctcf_e === 11 &&
        f.h3k4me3_s === -10 &&
        f.h3k4me3_e === 11 &&
        f.h3k27ac_s === -10 &&
        f.h3k27ac_e === 11
      ) return false
      else return true
    case ("conservation"):
      if (
        f.prim_s === -2 &&
        f.prim_e === 2 &&
        f.mamm_s === -4 &&
        f.mamm_e === 8 &&
        f.vert_s === -3 &&
        f.vert_e === 8
      ) return false
      else return true
    case ("classification"):
      if (
        f.CA && f.CA_CTCF && f.CA_H3K4me3 && f.CA_TF && f.PLS && f.TF && f.dELS && f.pELS
      ) return false
      else return true
  }
}
/**
 * @todo download linked genes data in bed file
 * @param mainQueryData 
 * @param assays 
 * @param conservation 
 * @param linkedGenes 
 * @returns BED file
 */
const convertToBED = (
  mainQueryData: MainQueryData,
  assays: { atac: boolean, ctcf: boolean, dnase: boolean, h3k27ac: boolean, h3k4me3: boolean },
  conservation: { primate: boolean, mammal: boolean, vertebrate: boolean },
): string => {
  //Create header comment for the file
  let header = [
    "# chr\tstart\tend\tacccession\tclassification",
    `${assays.dnase ? '\tDNase_z-score' : ''}`,
    `${assays.atac ? '\tATAC_z-score' : ''}`,
    `${assays.ctcf ? '\tCTCF_z-score' : ''}`,
    `${assays.h3k27ac ? '\tH3K27ac_z-score' : ''}`,
    `${assays.h3k4me3 ? '\tH3K4me3_z-score' : ''}`,
    `${conservation.primate ? '\tprimate_conservation' : ''}`,
    `${conservation.mammal ? '\tmammal_conservation' : ''}`,
    `${conservation.vertebrate ? '\tvertebrate_conservation' : ''}`,
    '\tnearest_gene',
    '\tnearest_gene_distance',
    '\n'
  ].join('')
  let bedContent: string[] = [header];

  mainQueryData.data.cCRESCREENSearch.forEach((item) => {
    const chromosome = item.chrom;
    const start = item.start;
    const end = start + item.len;
    const name = item.info.accession;
    const classification = item.pct;
    const dnase = item.ctspecific.ct ? item.ctspecific.dnase_zscore : item.dnase_zscore;
    const atac = item.ctspecific.ct ? item.ctspecific.atac_zscore : item.atac_zscore;
    const ctcf = item.ctspecific.ct ? item.ctspecific.ctcf_zscore : item.ctcf_zscore;
    const h3k27ac = item.ctspecific.ct ? item.ctspecific.h3k27ac_zscore : item.enhancer_zscore;
    const h3k4me3 = item.ctspecific.ct ? item.ctspecific.h3k4me3_zscore : item.promoter_zscore;
    const primate = item.primates;
    const mammal = item.mammals;
    const vertebrate = item.vertebrates;
    const nearestGene = item.nearestgenes[0].gene
    const nearestGeneDistance = item.nearestgenes[0].distance

    // Construct tab separated row, ends with newline
    const bedRow = [
      `${chromosome}`,
      `\t${start}`,
      `\t${end}`,
      `\t${name}`,
      `\t${classification}`,
      `${assays.dnase ? '\t' + dnase : ''}`,
      `${assays.atac ? '\t' + atac : ''}`,
      `${assays.ctcf ? '\t' + ctcf : ''}`,
      `${assays.h3k27ac ? '\t' + h3k27ac : ''}`,
      `${assays.h3k4me3 ? '\t' + h3k4me3 : ''}`,
      `${conservation.primate ? '\t' + primate : ''}`,
      `${conservation.mammal ? '\t' + mammal : ''}`,
      `${conservation.vertebrate ? '\t' + vertebrate : ''}`,
      `\t${nearestGene}`,
      `\t${nearestGeneDistance}`,
      '\n'
    ].join('')
    // Append to the content string
    bedContent.push(bedRow);
  });

  //sort contents
  return bedContent.sort((a, b) => {
    const startA = parseInt(a.split('\t')[1]);
    const startB = parseInt(b.split('\t')[1]);
  
    // Compare the start values
    return startA - startB;
  }).join('');
};

export const downloadBED = async (
  assembly: "GRCh38" | "mm10",
  chromosome: string,
  start: number,
  end: number,
  biosampleName: string | undefined,
  bedIntersect: boolean = false,
  TSSranges: { start: number, end: number }[] = null,
  assays: { atac: boolean, ctcf: boolean, dnase: boolean, h3k27ac: boolean, h3k4me3: boolean },
  conservation: { primate: boolean, mammal: boolean, vertebrate: boolean },
  setBedLoadingPercent?: React.Dispatch<React.SetStateAction<number>>
) => {

  setBedLoadingPercent(0)

  let ranges: { start: number, end: number }[] = []
  const maxRange = 10000000
  //Divide range into sub ranges no bigger than maxRange
  for (let i = start; i <= end; i += maxRange) {
    const rangeEnd = Math.min(i + maxRange - 1, end)
    ranges.push({ start: i, end: rangeEnd })
  }
  //For each range, send query and populate dataArray
  let dataArray: MainQueryData[] = []

  startTransition(async () => {
    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i];
      try {
        const data = await fetchcCREData(
          assembly,
          chromosome,
          range.start,
          range.end,
          biosampleName ?? undefined,
          1000000,
          null,
          bedIntersect ? sessionStorage.getItem("bed intersect")?.split(' ') : undefined,
          true
        )
        dataArray.push(data)
        setBedLoadingPercent(dataArray.length / ranges.length * 100)
        //Wait one second before sending the next query to reduce load on service
        await new Promise(resolve => setTimeout(resolve, 1000))
      } catch (error) {
        window.alert(
          "There was an error fetching cCRE data, please try again soon. If this error persists, please report it via our 'Contact Us' form on the About page and include this info:\n\n" +
          `Downloading:\n${assembly}\n${chromosome}\n${start}\n${end}\n${biosampleName ?? undefined}\n` +
          error
        );
        setBedLoadingPercent(null)
        return;
      }
    }
  })

  //Check every second to see if the queries have resolved
  while (dataArray.length < ranges.length) {
    await new Promise(resolve => setTimeout(resolve, 1000))
    // setBedLoadingPercent(dataArray.length / ranges.length * 100)
  }
  //Combine and deduplicate results, as a cCRE might be included in two searches
  let combinedResults: SCREENSearchResult[] = []
  dataArray.forEach((queryResult) => { queryResult.data.cCRESCREENSearch.forEach((cCRE) => { combinedResults.push(cCRE) }) })
  //If it is a near gene TSS search, make sure each cCRE is within one of the ranges
  if (TSSranges) {
    combinedResults = combinedResults.filter((cCRE) => TSSranges.find((TSSrange) => cCRE.start <= TSSrange.end && TSSrange.start <= (cCRE.start + cCRE.len)))
  }

  const deduplicatedResults: MainQueryData = {
    data: {
      cCRESCREENSearch: Array.from(new Set(combinedResults.map((x) => JSON.stringify(x))), (x) => JSON.parse(x)),
    },
  };

  //generate BED string
  const bedContents = convertToBED(deduplicatedResults, assays, conservation)

  const blob = new Blob([bedContents], { type: 'text/plain' });

  // Create a temporary URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create a link element to trigger the download
  const link = document.createElement('a');
  link.href = url;
  link.download = `${assembly}-${chromosome}-${start}-${end}${biosampleName ? '-' + biosampleName : ''}.bed`; // File name for download
  document.body.appendChild(link);

  // Simulate a click on the link to initiate download
  link.click();

  // Clean up by removing the link and revoking the URL object
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  setBedLoadingPercent(null)
}

//This should be moved to a constants folder
export const eQTLsTissues = [
  "Adipose Subcutaneous",
  "Adipose Visceral Omentum",
  "Adrenal Gland",
  "Artery Aorta",
  "Artery Coronary",
  "Artery Tibial",
  "Brain Amygdala",
  "Brain Anterior cingulate cortex BA24",
  "Brain Caudate basal ganglia",
  "Brain Cerebellar Hemisphere",
  "Brain Cerebellum",
  "Brain Cortex",
  "Brain Frontal Cortex BA9",
  "Brain Hippocampus",
  "Brain Hypothalamus",
  "Brain Nucleus accumbens basal ganglia",
  "Brain Putamen basal ganglia",
  "Brain Spinal cord cervical c-1",
  "Brain Substantia nigra",
  "Breast Mammary Tissue",
  "Cells Cultured fibroblasts",
  "Cells EBV-transformed lymphocytes",
  "Colon Sigmoid",
  "Colon Transverse",
  "Esophagus Gastroesophageal Junction",
  "Esophagus Mucosa",
  "Esophagus Muscularis",
  "Heart Atrial Appendage",
  "Heart Left Ventricle",
  "Kidney Cortex",
  "Liver",
  "Lung",
  "Minor Salivary Gland",
  "Muscle Skeletal",
  "Nerve Tibial",
  "Ovary",
  "Pancreas",
  "Pituitary",
  "Prostate",
  "Skin Not Sun Exposed Suprapubic",
  "Skin Sun Exposed Lower leg",
  "Small Intestine Terminal Ileum",
  "Spleen",
  "Stomach",
  "Testis",
  "Thyroid",
  "Uterus",
  "Vagina",
  "Whole Blood"
]
