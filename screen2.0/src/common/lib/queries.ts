/**
 * Send the request to our Server from a server component
 */

import { getClient } from "../lib/client"
import { ApolloQueryResult, gql } from "@apollo/client"

const cCRE_QUERY = gql`
query ccreSearchQuery(
  $accessions: [String!]
  $assembly: String!
  $cellType: String
  $coord_chrom: String
  $coord_end: Int
  $coord_start: Int
  $element_type: String
  $gene_all_start: Int
  $gene_all_end: Int
  $gene_pc_start: Int
  $gene_pc_end: Int
  $rank_ctcf_end: Float!
  $rank_ctcf_start: Float!
  $rank_dnase_end: Float!
  $rank_dnase_start: Float!
  $rank_enhancer_end: Float!
  $rank_enhancer_start: Float!
  $rank_promoter_end: Float!
  $rank_promoter_start: Float!
  $uuid: String
  $limit: Int
) {
  cCRESCREENSearch(
    assembly: $assembly
    accessions: $accessions
    cellType: $cellType
    coord_chrom: $coord_chrom
    coord_end: $coord_end
    coord_start: $coord_start
    element_type: $element_type
    gene_all_start: $gene_all_start
    gene_all_end: $gene_all_end
    gene_pc_start: $gene_pc_start
    gene_pc_end: $gene_pc_end
    rank_ctcf_end: $rank_ctcf_end
    rank_ctcf_start: $rank_ctcf_start
    rank_dnase_end: $rank_dnase_end
    rank_dnase_start: $rank_dnase_start
    rank_enhancer_end: $rank_enhancer_end
    rank_enhancer_start: $rank_enhancer_start
    rank_promoter_end: $rank_promoter_end
    rank_promoter_start: $rank_promoter_start
    uuid: $uuid
    limit: $limit
  ) {
    chrom
    start
    len
    pct
    ctcf_zscore
    dnase_zscore
    enhancer_zscore
    promoter_zscore
    ctspecific {
      ct
      dnase_zscore
      h3k4me3_zscore
      h3k27ac_zscore
      ctcf_zscore
    }
    info {
      accession
    }
    genesallpc {
      accession
      all {
        end
        start
        chromosome
        assembly
        intersecting_genes {
          name
        }
      }
      pc {
        end
        assembly
        chromosome
        start
        intersecting_genes {
          name
        }
      }
    }
  }
}
`

const BIOSAMPLE_QUERY = gql`
  query biosamples {
    human: ccREBiosampleQuery(assembly: "grch38") {
      biosamples {
        name
        ontology
        lifeStage
        sampleType
        displayname
        dnase: experimentAccession(assay: "DNase")
        h3k4me3: experimentAccession(assay: "H3K4me3")
        h3k27ac: experimentAccession(assay: "H3K27ac")
        ctcf: experimentAccession(assay: "CTCF")
        dnase_signal: fileAccession(assay: "DNase")
        h3k4me3_signal: fileAccession(assay: "H3K4me3")
        h3k27ac_signal: fileAccession(assay: "H3K27ac")
        ctcf_signal: fileAccession(assay: "CTCF")
      }
    }
    mouse: ccREBiosampleQuery(assembly: "mm10") {
      biosamples {
        name
        ontology
        lifeStage
        sampleType
        displayname
        dnase: experimentAccession(assay: "DNase")
        h3k4me3: experimentAccession(assay: "H3K4me3")
        h3k27ac: experimentAccession(assay: "H3K27ac")
        ctcf: experimentAccession(assay: "CTCF")
        dnase_signal: fileAccession(assay: "DNase")
        h3k4me3_signal: fileAccession(assay: "H3K4me3")
        h3k27ac_signal: fileAccession(assay: "H3K27ac")
        ctcf_signal: fileAccession(assay: "CTCF")
      }
    }
  }
`

const UMAP_QUERY = gql`
  query q($assembly: String!, $assay: [String!], $a: String!) {
    ccREBiosampleQuery(assay: $assay, assembly: $assembly) {
      biosamples {
        name
        displayname
        ontology
        sampleType
        lifeStage
        umap_coordinates(assay: $a)
        experimentAccession(assay: $a)
      }
    }
  }
`

export const TOP_TISSUES = gql`
  query q($accession: [String!], $assembly: String!) {
    ccREBiosampleQuery(assembly: $assembly) {
      biosamples {
        sampleType
        cCREZScores(accession: $accession) {
          score
          assay
          experiment_accession
        }
        name
        ontology
      }
    }
    cCREQuery(assembly: $assembly, accession: $accession) {
      accession
      group
      zScores {
        score
        experiment
      }
      dnase: maxZ(assay: "DNase")
      h3k4me3: maxZ(assay: "H3K4me3")
      h3k27ac: maxZ(assay: "H3K27ac")
      ctcf: maxZ(assay: "CTCF")
    }
  }
`

function cCRE_QUERY_VARIABLES(assembly: string, chromosome: string, start: number, end: number, biosample?: string) {
  return {
    uuid: null,
    assembly: assembly,
    coord_chrom: chromosome,
    coord_start: start,
    coord_end: end,
    gene_all_start: 0,
    gene_all_end: 5000000,
    gene_pc_start: 0,
    gene_pc_end: 5000000,
    rank_dnase_start: -10,
    rank_dnase_end: 10,
    rank_promoter_start: -10,
    rank_promoter_end: 10,
    rank_enhancer_start: -10,
    rank_enhancer_end: 10,
    rank_ctcf_start: -10,
    rank_ctcf_end: 10,
    cellType: biosample,
    element_type: null,
    limit: 25000,
  }
}

const LINKED_GENES_QUERY = gql`
  query ($assembly: String!, $accession: [String]!) {
    linkedGenesQuery(assembly: $assembly, accession: $accession) {
      assay
      accession
      celltype
      gene
    }
  }
`

const GENE_QUERY = gql`
  query($assembly: String!, $name_prefix: [String!]) {
    gene(assembly: $assembly, name_prefix: $name_prefix) {
      name
      id
    }
  }
`

export async function linkedGenesQuery(assembly: "GRCh38" | "mm10", accession: string[]) {
  let returnData: {[key: string]: {genes: {geneName: string, linkedBy: "CTCF-ChIAPET" | "RNAPII-ChIAPET", biosample: string}[]}} = {}
  let geneIDs: string[] = []
  let linkedGenes: ApolloQueryResult<any>
  let geneNames: ApolloQueryResult<any>
  //Attempt first linked genes query
  try {
    linkedGenes = await getClient().query({
      query: LINKED_GENES_QUERY,
      variables: { assembly, accession },
    })
    linkedGenes.data.linkedGenesQuery.forEach((entry) => {
      !geneIDs.includes(entry.gene.split(".")[0]) && geneIDs.push(entry.gene.split(".")[0])
    })
    //Attempt to lookup gene names
    try {
      geneNames = await getClient().query({
        query: GENE_QUERY,
        variables: { assembly: assembly, name_prefix: geneIDs },
      })
      //If both queries are successful, go through each of linkedGenes.data.linkedGenesQuery, find the accession and (if doesnt exist) add to linkedGenesData along with any gene names matching the ID in queryRes2
      linkedGenes.data.linkedGenesQuery.forEach((entry) => {
        // if returnData does not have an entry for that accession, and if there is a gene in query2 with an id that matches
        if (geneNames.data && (!Object.hasOwn(returnData, entry.accession)) && (geneNames.data.gene.find((x) => x.id === entry.gene)!== undefined)){
          Object.defineProperty(returnData, entry.accession, {value: {genes: [{geneName: geneNames.data.gene.find((x) => x.id === entry.gene).name, linkedBy: entry.assay, biosample: entry.celltype}]}, writable: true, enumerable: true, configurable: true})
        } 
        // if returnData does already have a linked gene for that accession, add the linked gene to the existing data
        else if (geneNames.data && (Object.hasOwn(returnData, entry.accession)) && (geneNames.data.gene.find((x) => x.id === entry.gene)!== undefined)){
          Object.defineProperty(returnData[entry.accession], "genes", {value: [...returnData[entry.accession].genes, {geneName: geneNames.data.gene.find((x) => x.id === entry.gene).name, linkedBy: entry.assay, biosample: entry.celltype}], writable: true, enumerable: true, configurable: true})
        }
      })
    } catch (error) {
      console.log("Gene Name Lookup Failed")
      console.log(error)
    }
  } catch (error) {
    console.log(error)
  }
  //for some reason, the formatting of the data (newlines) aren't consistent. Don't think this has any effect though
  return returnData
}


/**
 *
 * @param assembly string, "GRCh38" or "mm10"
 * @param chromosome string, ex: "chr11"
 * @param start number
 * @param end number
 * @param biosample optional - a biosample selection. If not specified or "undefined", will be marked as "null" in gql query
 * @returns cCREs matching the search
 */
export async function MainQuery(assembly: string = null, chromosome: string = null, start: number = null, end: number = null, biosample: string = null) {
  // console.log("queried with: " + assembly, chromosome, start, end, biosample)
  let data: ApolloQueryResult<any>
  try {
    data = await getClient().query({
      query: cCRE_QUERY,
      variables: cCRE_QUERY_VARIABLES(assembly, chromosome, start, end, biosample),
    })
  } catch (error) {
    console.log(error)
  } finally {
    return data
  }
}

export async function biosampleQuery() {
  var data: ApolloQueryResult<any> | -1
  try {
    data = await getClient().query({
      query: BIOSAMPLE_QUERY,
    })
  } catch (error) {
    console.log(error)
  } finally {
    return data
  }
}

export async function UMAPQuery(assembly: "grch38" | "mm10", assay: "DNase" | "H3K4me3" | "H3K27ac" | "CTCF") {
  var data: ApolloQueryResult<any> | -1
  try {
    data = await getClient().query({
      query: UMAP_QUERY,
      variables: {
        assembly: assembly,
        assay: assay,
        a: assay.toLocaleLowerCase(),
      },
    })
  } catch (error) {
    console.log(error)
    data = -1
  } finally {
    return data
  }
}

/**
 *
 * @returns the shortened byCellType file from https://downloads.wenglab.org/databyct.json
 */
export const getGlobals = async (assembly: "GRCh38" | "mm10") => {
  // console.log(assembly)
  let res: Response
  if (assembly === "GRCh38") {
    res = await fetch("https://downloads.wenglab.org/databyct.json")
  } else if (assembly === "mm10") {
    res = await fetch("https://downloads.wenglab.org/mm10_byct.json")
  }
  return res.json()
}
