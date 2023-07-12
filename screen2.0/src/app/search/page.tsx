// Search Results Page
import { CcreSearch } from "./ccresearch"
import MainQuery, { getGlobals } from "../../common/lib/queries"
import { ApolloQueryResult } from "@apollo/client"
import { cCREData, CellTypeData, MainQueryParams } from "./types"
import { checkTrueFalse, passesCriteria } from "../../common/lib/filter-helpers"


export default async function Search({
  // Object from URL, see https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  //Get search parameters and define defaults.
  const mainQueryParams: MainQueryParams = {
    assembly: (searchParams.assembly === "GRCh38" || searchParams.assembly === "mm10") ? searchParams.assembly : "GRCh38",
    chromosome: searchParams.chromosome ? searchParams.chromosome : "chr11",
    start: searchParams.start ? Number(searchParams.start) : 5205263,
    end: searchParams.end ? Number(searchParams.end) : 5381894,
    // Biosample Filters
    // URL could probably be cut down by putting this into one long string where each letter is t/f or 0/1
    CellLine: searchParams.CellLine ? checkTrueFalse(searchParams.CellLine): true,
    PrimaryCell: searchParams.PrimaryCell ? checkTrueFalse(searchParams.PrimaryCell): true,
    Tissue: searchParams.Tissue ? checkTrueFalse(searchParams.Tissue): true,
    Organoid: searchParams.Organoid ? checkTrueFalse(searchParams.Organoid): true,
    InVitro: searchParams.InVitro ? checkTrueFalse(searchParams.InVitro): true,
    Biosample: searchParams.Biosample ? { selected: true, biosample: searchParams.Biosample, tissue: searchParams.BiosampleTissue, summaryName: searchParams.BiosampleSummary } : { selected: false, biosample: null, tissue: null, summaryName: null },
    // Chromatin Filters
    // "[...]_s" = start, "[...]_e" = end.
    //Maybe make these properly cased to make URL a bit more readable
    dnase_s: searchParams.dnase_s ? Number(searchParams.dnase_s) : -10,
    dnase_e: searchParams.dnase_e ? Number(searchParams.dnase_e) : 10,
    h3k4me3_s: searchParams.h3k4me3_s ? Number(searchParams.h3k4me3_s) : -10,
    h3k4me3_e: searchParams.h3k4me3_e ? Number(searchParams.h3k4me3_e) : 10,
    h3k27ac_s: searchParams.h3k27ac_s ? Number(searchParams.h3k27ac_s) : -10,
    h3k27ac_e: searchParams.h3k27ac_e ? Number(searchParams.h3k27ac_e) : 10,
    ctcf_s: searchParams.ctcf_s ? Number(searchParams.ctcf_s) : -10,
    ctcf_e: searchParams.ctcf_e ? Number(searchParams.ctcf_e) : 10,
    // Classification Filters
    // URL could probably be cut down by putting this into one long string where each letter is t/f or 0/1
    CA: searchParams.CA ? checkTrueFalse(searchParams.CA) : true,
    CA_CTCF: searchParams.CA_CTCF ? checkTrueFalse(searchParams.CA_CTCF) : true,
    CA_H3K4me3: searchParams.CA_H3K4me3 ? checkTrueFalse(searchParams.CA_H3K4me3) : true,
    CA_TF: searchParams.CA_TF ? checkTrueFalse(searchParams.CA_TF) : true,
    dELS: searchParams.dELS ? checkTrueFalse(searchParams.dELS) : true,
    pELS: searchParams.pELS ? checkTrueFalse(searchParams.pELS) : true,
    PLS: searchParams.PLS ? checkTrueFalse(searchParams.PLS) : true,
    TF: searchParams.TF ? checkTrueFalse(searchParams.TF) : true,
  }

  //Main query. Returns -1 if query returns an error
  const mainQueryResult: ApolloQueryResult<any> | -1 = await MainQuery(mainQueryParams.assembly, mainQueryParams.chromosome, mainQueryParams.start, mainQueryParams.end, mainQueryParams.Biosample.biosample)
  
  //Contains cell type data of the specified assembly
  const globals: CellTypeData = await getGlobals(mainQueryParams.assembly)


  /**
   * This needs better input handling
   * @param QueryResult Result from Main Query
   * @returns rows usable by the DataTable component
   */
  const generateRows = (QueryResult: ApolloQueryResult<any>, biosample: string | null) => {
    const rows: {
      //atac will need to be changed from string to number when that data is available
      accession: string
      class: string
      chromosome: string
      start: string
      end: string
      dnase?: number
      atac: string
      h3k4me3?: number
      h3k27ac?: number
      ctcf?: number
      linkedGenes: {pc: {name: string}[], all: {name: string}[]}
    }[] = []
    const cCRE_data: cCREData[] = QueryResult.data.cCRESCREENSearch
    let offset = 0
    cCRE_data.forEach((currentElement, index) => {
      if (passesCriteria(currentElement, biosample, mainQueryParams)) {
        rows[index - offset] = {
          accession: currentElement.info.accession,
          class: currentElement.pct,
          chromosome: currentElement.chrom,
          start: currentElement.start.toLocaleString("en-US"),
          end: (currentElement.start + currentElement.len).toLocaleString("en-US"),
          dnase: biosample ? currentElement.ctspecific.dnase_zscore : currentElement.dnase_zscore,
          //Need to get this data still from somewhere
          atac: "TBD",
          h3k4me3: biosample ? currentElement.ctspecific.h3k4me3_zscore : currentElement.promoter_zscore,
          h3k27ac: biosample ? currentElement.ctspecific.h3k27ac_zscore : currentElement.enhancer_zscore,
          ctcf: biosample ? currentElement.ctspecific.ctcf_zscore : currentElement.ctcf_zscore,
          linkedGenes: {pc: currentElement.genesallpc.pc.intersecting_genes, all: currentElement.genesallpc.all.intersecting_genes}
        }
      }
      // Offset incremented to account for missing rows which do not meet filter criteria
      else {
        offset += 1
      }
    })
    
    return rows
  }

  return (
    <main>
      <CcreSearch
        mainQueryParams={mainQueryParams}
        globals={globals}
        ccrerows={(mainQueryResult === -1) ? [] : generateRows(mainQueryResult, mainQueryParams.Biosample.biosample)}
        assembly={mainQueryParams.assembly}
      />
    </main>
  )
}
