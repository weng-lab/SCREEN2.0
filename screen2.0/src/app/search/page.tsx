// Search Results Page

import MainQuery from "../../common/components/MainQuery";
import MainQueryResultsTable from "../../common/components/MainResultsTable";
import { ApolloQueryResult } from "@apollo/client";

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
  //Uh oh this needs better input validation
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
        start: currentElement.start,
        end: (currentElement.start + currentElement.len),
        dnase: currentElement.dnase_zscore,
        //Need to get this data still from somewhere
        atac: "TBD",
        h3k4me3: currentElement.promoter_zscore,
        h3k27ac: currentElement.enhancer_zscore,
        ctcf: currentElement.ctcf_zscore,
      }
    });
    return rows; 
  }

  return (
    <main>
      {/* Feed rows generated from the query result to the Table. Columns for table defined in the MainQueryResultsTable component */}
      <MainQueryResultsTable rows={generateRows(mainQueryResult)} tableTitle="cCRE Search Results" itemsPerPage={10}/>
    </main>
  )
}