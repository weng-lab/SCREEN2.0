// Search Results Page

// 'use client'
import MainQuery from "../../common/lib/queries"
import MainResultsTable from "../../common/components/MainResultsTable"
import MainResultsFilers from "../../common/components/MainResultsFilters"
import { ApolloQueryResult } from "@apollo/client"

import Grid2 from "../../common/mui-client-wrappers/Grid2"
import Typography from "../../common/mui-client-wrappers/Typography"

export default async function Search({
  // Object from URL, see https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined }
}) {
  //Get search parameters and define defaults. Put into object.
  const mainQueryParams = {
    assembly: searchParams.assembly ? searchParams.assembly : "GRCh38",
    chromosome: searchParams.chromosome ? searchParams.chromosome : "chr11",
    start: searchParams.start ? Number(searchParams.start) : 5205263,
    end: searchParams.end ? Number(searchParams.end) : 5381894,
    // "[...]_s" = start, "[...]_e" = end. Used to filter results
    dnase_s: searchParams.dnase_s ? Number(searchParams.dnase_s) : -10,
    dnase_e: searchParams.dnase_e ? Number(searchParams.dnase_e) : 10,
    h3k4me3_s: searchParams.h3k4me3_s ? Number(searchParams.h3k4me3_s) : -10,
    h3k4me3_e: searchParams.h3k4me3_e ? Number(searchParams.h3k4me3_e) : 10,
    h3k27ac_s: searchParams.h3k27ac_s ? Number(searchParams.h3k27ac_s) : -10,
    h3k27ac_e: searchParams.h3k27ac_e ? Number(searchParams.h3k27ac_e) : 10,
    ctcf_s: searchParams.ctcf_s ? Number(searchParams.ctcf_s) : -10,
    ctcf_e: searchParams.ctcf_e ? Number(searchParams.ctcf_e) : 10,
  }

  //Send query with parameters assembly, chr, start, end
  //Importantly,
  const mainQueryResult = await MainQuery(mainQueryParams.assembly, mainQueryParams.chromosome, mainQueryParams.start, mainQueryParams.end)

  /**
   * @param QueryResult Result from Main Query
   * @returns rows usable by the DataTable component
   */
  //This needs better input handling
  //Fails in basically any case when input isn't exactly as expected
  function generateRows(QueryResult: ApolloQueryResult<any>) {
    const rows: {
      //atac will need to be changed from string to number when that data is available
      accession: string
      class: string
      chromosome: string
      start: number
      end: number
      dnase: number
      atac: string
      h3k4me3: number
      h3k27ac: number
      ctcf: number
    }[] = []
    const cCRE_data: any[] = QueryResult.data.cCRESCREENSearch
    let offset = 0
    cCRE_data.forEach((currentElement, index) => {
      if (passesCriteria(currentElement)) {
        rows[index - offset] = {
          accession: currentElement.info.accession,
          class: currentElement.pct,
          chromosome: currentElement.chrom,
          start: currentElement.start.toLocaleString("en-US"),
          end: (currentElement.start + currentElement.len).toLocaleString("en-US"),
          dnase: currentElement.dnase_zscore.toFixed(2),
          //Need to get this data still from somewhere
          atac: "TBD",
          h3k4me3: currentElement.promoter_zscore.toFixed(2),
          h3k27ac: currentElement.enhancer_zscore.toFixed(2),
          ctcf: currentElement.ctcf_zscore.toFixed(2),
        }
      }
      // Offset incremented to account for missing rows which do not meet filter criteria
      else {
        offset += 1
      }
    })
    return rows
  }

  function passesCriteria(currentElement: any) {
    //Chromatin Signals
    if (
      mainQueryParams.dnase_s < currentElement.dnase_zscore &&
      currentElement.dnase_zscore < mainQueryParams.dnase_e &&
      mainQueryParams.h3k4me3_s < currentElement.promoter_zscore &&
      currentElement.promoter_zscore < mainQueryParams.h3k4me3_e &&
      mainQueryParams.h3k27ac_s < currentElement.enhancer_zscore &&
      currentElement.enhancer_zscore < mainQueryParams.h3k27ac_e &&
      mainQueryParams.ctcf_s < currentElement.ctcf_zscore &&
      currentElement.ctcf_zscore < mainQueryParams.ctcf_e
    ) {
      return true
    } else return false
  }

  return (
    <main>
      {/* Feed rows generated from the query result to the Table. Columns for table defined in the MainResultsTable component */}
      <Grid2 container spacing={3} sx={{ mt: "2rem", mb: "2rem" }}>
        <Grid2 xs={12} lg={3}>
          <MainResultsFilers mainQueryParams={mainQueryParams} />
        </Grid2>
        <Grid2 xs={12} lg={9}>
          <MainResultsTable
            rows={generateRows(mainQueryResult)}
            tableTitle={`Searching ${mainQueryParams.chromosome} in ${mainQueryParams.assembly} from ${mainQueryParams.start.toLocaleString(
              "en-US"
            )} to ${mainQueryParams.end.toLocaleString("en-US")}`}
            itemsPerPage={10}
          />
        </Grid2>
      </Grid2>
    </main>
  )
}
