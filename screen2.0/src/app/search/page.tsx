// Search Results Page
import { CcreSearch } from "./ccresearch"
import { getGlobals } from "../../common/lib/queries"
import { CellTypeData, MainQueryParams } from "./types"
import { checkTrueFalse } from "./search-helpers"


export default async function Search({
  // Object from URL, see https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  //Get search parameters and define defaults.
  const mainQueryParams: MainQueryParams = {
    //Flag that user-entered accessions are to be used
    bed_intersect: searchParams.intersect ? checkTrueFalse(searchParams.intersect): false,
    assembly: searchParams.assembly === "GRCh38" || searchParams.assembly === "mm10" ? searchParams.assembly : "GRCh38",
    gene: searchParams.gene,
    snpid: searchParams.snpid,
    //If bed intersecting, set chr start end to null
    chromosome: (searchParams.intersect && checkTrueFalse(searchParams.intersect)) ? null : searchParams.chromosome ? searchParams.chromosome : "chr11",
    start: (searchParams.intersect && checkTrueFalse(searchParams.intersect)) ? null : searchParams.start ? Number(searchParams.start) : 5205263,
    end: (searchParams.intersect && checkTrueFalse(searchParams.intersect)) ? null : searchParams.end ? Number(searchParams.end) : 5381894,
    // Biosample Filters
    // URL could probably be cut down by putting this into one long string where each letter is t/f or 0/1
    CellLine: searchParams.CellLine ? checkTrueFalse(searchParams.CellLine) : true,
    PrimaryCell: searchParams.PrimaryCell ? checkTrueFalse(searchParams.PrimaryCell) : true,
    Tissue: searchParams.Tissue ? checkTrueFalse(searchParams.Tissue) : true,
    Organoid: searchParams.Organoid ? checkTrueFalse(searchParams.Organoid) : true,
    InVitro: searchParams.InVitro ? checkTrueFalse(searchParams.InVitro) : true,
    Biosample: searchParams.Biosample
      ? {
        selected: true,
        biosample: searchParams.Biosample,
        tissue: searchParams.BiosampleTissue,
        summaryName: searchParams.BiosampleSummary,
      }
      : { selected: false, biosample: null, tissue: null, summaryName: null },
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
    
    atac_s: searchParams.atac_s ? Number(searchParams.atac_s) : -10,
    atac_e: searchParams.atac_e ? Number(searchParams.atac_e) : 10,
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
    //Conservation Filter
    prim_s: searchParams.prim_s ? Number(searchParams.prim_s) : -2,
    prim_e:searchParams.prim_e ? Number(searchParams.prim_e) : 2,
    mamm_s: searchParams.mamm_s ? Number(searchParams.mamm_s) : -4,
    mamm_e:searchParams.mamm_e ? Number(searchParams.mamm_e) : 8,
    vert_s: searchParams.vert_s ? Number(searchParams.vert_s) : -3,
    vert_e:searchParams.vert_e ? Number(searchParams.vert_e) : 8,
  }

  //Contains cell type data of the specified assembly
  const globals: CellTypeData = await getGlobals(mainQueryParams.assembly)

  return (
    <main>
      <CcreSearch
        mainQueryParams={mainQueryParams}
        globals={globals}
      />
    </main>
  )
}
