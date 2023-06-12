// Search Results Page

// 'use client'
import MainQuery from "../../common/components/MainQuery";
import MainResultsTable from "../../common/components/MainResultsTable";
import MainResultsFilers from "../../common/components/MainResultsFilters";
import { ApolloQueryResult } from "@apollo/client";

import Grid2 from "../../common/mui-client-wrappers/Grid2";
import Typography from "../../common/mui-client-wrappers/Typography"

export default async function Search({
  // Object from URL, see https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {

  // data for query is extracted from URL
  const mainQueryResult = await MainQuery((searchParams.assembly ? searchParams.assembly : "GRCh38"), (searchParams.chromosome ? searchParams.chromosome : "chr11"),(searchParams.start ? Number(searchParams.start) : 5205263), (searchParams.end ? Number(searchParams.end) : 5381894))

  /**
   * @param QueryResult Result from Main Query
   * @returns rows usable by the DataTable component
   */
  //This needs better input handling
  //Fails in basically any case when input isn't exactly as expected
  function generateRows(QueryResult: ApolloQueryResult<any>) {
    const rows: {
      //atac will need to be changed from string to number when that data is available
      accession: string; class: string; chromosome: string; start: number; end: number; dnase: number; atac: string; h3k4me3: number; h3k27ac: number; ctcf: number;
    }[] = [];
    const cCRE_data: any[] = QueryResult.data.cCRESCREENSearch;
    cCRE_data.forEach((currentElement, index) => {
      rows[index] = {
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
    });
    return rows; 
  }

  return (
    <main>
      {/* Feed rows generated from the query result to the Table. Columns for table defined in the MainResultsTable component */}
      <Grid2 container spacing={3} sx={{mt: "2rem", mb: "2rem"}}>
        <Grid2 xs={12} lg={3}>
          <MainResultsFilers />
        </Grid2>
        <Grid2 xs={12} lg={9}>
          <MainResultsTable rows={generateRows(mainQueryResult)} tableTitle={`Searching ${searchParams.chromosome} in ${searchParams.assembly} from ${searchParams.start} to ${searchParams.end}`} itemsPerPage={10}/>
        </Grid2>
      </Grid2>
    </main>
  )
}