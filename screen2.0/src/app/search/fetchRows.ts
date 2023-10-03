'use server'

import { ApolloQueryResult } from "@apollo/client"
import { MainQuery, linkedGenesQuery } from "../../common/lib/queries"
import { passesCriteria } from "./search-helpers"
import { MainQueryParams, cCREData, MainResultTableRows, MainResultTableRow } from "./types"

export async function fetchRows(mainQueryParams: MainQueryParams, accessions?: string[]) {
    //Should be able to send server-side query here
    let mainQueryResult: ApolloQueryResult<any>

    //This needs to be split up since the query will fail if accessions is passed and is null unlike other fields
    if (accessions) {
      mainQueryResult = await MainQuery(
        mainQueryParams.assembly,
        mainQueryParams.chromosome,
        mainQueryParams.start,
        mainQueryParams.end,
        mainQueryParams.Biosample.biosample,
        accessions
      )
    } else {
      mainQueryResult = await MainQuery(
        mainQueryParams.assembly,
        mainQueryParams.chromosome,
        mainQueryParams.start,
        mainQueryParams.end,
        mainQueryParams.Biosample.biosample,
      )
    }
      
      return(generateRows(mainQueryResult, mainQueryParams.Biosample.biosample, mainQueryParams))
}

/**
   * This needs better input handling. To be called only from server components, will throw an error if used client-side
   * @param QueryResult Result from Main Query
   * @returns rows usable by the DataTable component
   */
export async function generateRows(QueryResult: ApolloQueryResult<any>, biosample: string | null, mainQueryParams: MainQueryParams): Promise<MainResultTableRows> {
  const cCRE_data: cCREData[] = QueryResult.data.cCRESCREENSearch
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
        //Need to get this data still from somewhere
        atac: "TBD",
        h3k4me3: biosample ? currentElement.ctspecific.h3k4me3_zscore : currentElement.promoter_zscore,
        h3k27ac: biosample ? currentElement.ctspecific.h3k27ac_zscore : currentElement.enhancer_zscore,
        ctcf: biosample ? currentElement.ctspecific.ctcf_zscore : currentElement.ctcf_zscore,
        linkedGenes: { distancePC: currentElement.genesallpc.pc.intersecting_genes, distanceAll: currentElement.genesallpc.all.intersecting_genes, CTCF_ChIAPET: [], RNAPII_ChIAPET: [] },
        conservationData: {mammals: currentElement.mammals, primates: currentElement.primates, vertebrates: currentElement.vertebrates}
      })
      accessions.push(currentElement.info.accession)
    }
  })
  const otherLinked = await linkedGenesQuery(mainQueryParams.assembly, accessions)
  //Need to add in biosample information for the hover
  rows.forEach((row: MainResultTableRow) => {
    const accession = row.accession
    const genesToAdd = otherLinked[accession] ?? null

    genesToAdd && genesToAdd.genes.forEach(gene => {
      if (gene.linkedBy === "CTCF-ChIAPET") {
        row.linkedGenes.CTCF_ChIAPET.push({name: gene.geneName, biosample: gene.biosample})
      }
      else if (gene.linkedBy === "RNAPII-ChIAPET"){
        row.linkedGenes.RNAPII_ChIAPET.push({name: gene.geneName, biosample: gene.biosample})
      }
    });
  })

  return rows
}