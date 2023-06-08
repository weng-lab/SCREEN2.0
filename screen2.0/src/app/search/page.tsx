// Search Results Page
// This can't easily be a client rendered page, because you can't easily import and use server components like this.

import TypographyCSR from "../../common/components/TypographyCSR";
import MainQuery from "../../common/components/MainQuery";
import MainQueryResultsTable from "../../common/components/MainResultsTable";
import { ApolloQueryResult } from "@apollo/client";

export default async function Search({
  // Object from URL, see https://nextjs.org/docs/app/api-reference/file-conventions/page#searchparams-optional
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {

  // data can be extracted from URL
  const mainQueryResult = await MainQuery(searchParams.assembly ? searchParams.assembly : "mm10")

  function generateRows(QueryResult: ApolloQueryResult<any>) {
    const rows: {
      accession: string; class: string; chromosome: string; start: number; end: number; dnase: number; atac: string; h3k4me3: number; h3k27ac: number; ctcf: number;
    }[] = [];
    // Is there a way to assign cCRE_data to be an array without initializing like this?
    const cCRE_data: any[] = QueryResult.data.cCRESCREENSearch;
    // console.log(typeof(cCRE_data))
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
    // console.log(rows)
    return rows; 
  }

  const ROWS = [
    {
      accession: mainQueryResult.data.cCRESCREENSearch[0].info.accession,
      //pct
      class: mainQueryResult.data.cCRESCREENSearch[0].pct,
      chromosome: mainQueryResult.data.cCRESCREENSearch[0].chrom,
      start: mainQueryResult.data.cCRESCREENSearch[0].start,
      //Need to calculate end as start + len, right
      end: (mainQueryResult.data.cCRESCREENSearch[0].start + mainQueryResult.data.cCRESCREENSearch[0].len),
      dnase: mainQueryResult.data.cCRESCREENSearch[0].dnase_zscore,
      //Where is ATAC in the return object? NOT AVAILABLE IN CURRENT QUERY
      atac: "TBD",
      h3k4me3: mainQueryResult.data.cCRESCREENSearch[0].promoter_zscore,
      h3k27ac: mainQueryResult.data.cCRESCREENSearch[0].enhancer_zscore,
      ctcf: mainQueryResult.data.cCRESCREENSearch[0].ctcf_zscore,
    }
  ];

  // generateRows(mainQueryResult)

  return (
    <main>
      <MainQueryResultsTable rows={generateRows(mainQueryResult)} tableTitle="cCRE Search Results" itemsPerPage={10}/>
    </main>
  )
}