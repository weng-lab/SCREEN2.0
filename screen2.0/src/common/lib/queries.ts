/**
 * Send the request to our Server from a server component
 */
'use server'
import { getClient } from "../lib/client"
import { ApolloQueryResult, gql } from "@apollo/client"
import Config from "../../config.json"

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
    $rank_atac_end: Float!
    $rank_atac_start: Float!
    $mammals_min: Float
    $mammals_max: Float
    $vertebrates_min: Float
    $vertebrates_max: Float
    $primates_min: Float
    $primates_max: Float
    $uuid: String
    $limit: Int
    $nearbygeneslimit: Int
    $nearbygenesdistancethreshold: Int
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
      rank_atac_end: $rank_atac_end
      rank_atac_start: $rank_atac_start
      rank_ctcf_end: $rank_ctcf_end
      rank_ctcf_start: $rank_ctcf_start
      rank_dnase_end: $rank_dnase_end
      rank_dnase_start: $rank_dnase_start
      rank_enhancer_end: $rank_enhancer_end
      rank_enhancer_start: $rank_enhancer_start
      rank_promoter_end: $rank_promoter_end
      rank_promoter_start: $rank_promoter_start
      mammals_min: $mammals_min
      mammals_max: $mammals_max
      vertebrates_min: $vertebrates_min
      vertebrates_max: $vertebrates_max
      primates_min: $primates_min
      primates_max: $primates_max
      uuid: $uuid
      limit: $limit
      nearbygeneslimit: $nearbygeneslimit
      nearbygenesdistancethreshold: $nearbygenesdistancethreshold
    ) {
      chrom
      start
      len
      pct
      vertebrates
      mammals
      primates
      ctcf_zscore
      dnase_zscore
      enhancer_zscore
      promoter_zscore
      atac_zscore
      ctspecific {
        ct
        dnase_zscore
        h3k4me3_zscore
        h3k27ac_zscore
        ctcf_zscore
        atac_zscore
      }
      info {
        accession
        isproximal
        concordant
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

function cCRE_QUERY_VARIABLES(assembly: string, chromosome: string, start: number, end: number, biosample: string, nearbygenesdistancethreshold: number, nearbygeneslimit: number, accessions: string[]) {
  let vars = {
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
    rank_atac_start: -10,
    rank_atac_end: 10,
    rank_promoter_start: -10,
    rank_promoter_end: 10,
    rank_enhancer_start: -10,
    rank_enhancer_end: 10,
    rank_ctcf_start: -10,
    rank_ctcf_end: 10,
    cellType: biosample,
    element_type: null,
    limit: 25000,
    nearbygenesdistancethreshold: nearbygenesdistancethreshold,
    nearbygeneslimit: nearbygeneslimit
  }
  if (accessions) {
    vars["accessions"] = accessions
  }

  return vars
}

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
  let returnData: { [key: string]: { genes: { geneName: string, linkedBy: "CTCF-ChIAPET" | "RNAPII-ChIAPET", biosample: string }[] } } = {}
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
        if (geneNames.data && (!Object.hasOwn(returnData, entry.accession)) && (geneNames.data.gene.find((x) => x.id === entry.gene) !== undefined)) {
          Object.defineProperty(returnData, entry.accession, { value: { genes: [{ geneName: geneNames.data.gene.find((x) => x.id === entry.gene).name, linkedBy: entry.assay, biosample: entry.celltype }] }, writable: true, enumerable: true, configurable: true })
        }
        // if returnData does already have a linked gene for that accession, add the linked gene to the existing data
        else if (geneNames.data && (Object.hasOwn(returnData, entry.accession)) && (geneNames.data.gene.find((x) => x.id === entry.gene) !== undefined)) {
          Object.defineProperty(returnData[entry.accession], "genes", { value: [...returnData[entry.accession].genes, { geneName: geneNames.data.gene.find((x) => x.id === entry.gene).name, linkedBy: entry.assay, biosample: entry.celltype }], writable: true, enumerable: true, configurable: true })
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
 * @param biosample a biosample selection. If not specified or "undefined", will be marked as "null" in gql query
 * @param nearbygenesdistancethreshold the distance from cCRE that will be used for distance-linked genes
 * @param nearbygeneslimit limit of returned ditance-linked genes
 * @param accessions a list of accessions to fetch information on. Set chromosome, start, end to "undefined" if using so they're set to null
 * @returns cCREs matching the search
 */
export async function MainQuery(assembly: string = null, chromosome: string = null, start: number = null, end: number = null, biosample: string = null, nearbygenesdistancethreshold: number, nearbygeneslimit: number, accessions: string[] = null) {
  console.log("queried with: " + assembly, chromosome, start, end, biosample + `${accessions ? " with accessions" : " no accessions"}`)
  let data: ApolloQueryResult<any>
  try {
    data = await getClient().query({
      query: cCRE_QUERY,
      variables: cCRE_QUERY_VARIABLES(assembly, chromosome, start, end, biosample, nearbygenesdistancethreshold, nearbygeneslimit, accessions),
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
export async function getGlobals(assembly: "GRCh38" | "mm10"){
  console.log("called globals with" + assembly)
  let res: Response
  try {
    if (assembly === "GRCh38") {
        res = await fetch(Config.API.HumanGlobals)
      } else if (assembly === "mm10") {
        res = await fetch(Config.API.MouseGlobals)
      }
  } catch (error) {
    console.log(error)
  } finally {
    if (res) {
      return res.json()
    } else {
      return undefined
    }
  }
}
