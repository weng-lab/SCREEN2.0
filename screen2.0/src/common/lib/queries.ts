/**
 * Send the request to our Server from a server component
 */
'use server'
import { getClient } from "../lib/client"
import { ApolloQueryResult, TypedDocumentNode, gql } from "@apollo/client"
import Config from "../../config.json"
import { CellTypeData, RegistryBiosample } from "../../app/search/types"

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
    $rank_ctcf_end: Float
    $rank_ctcf_start: Float
    $rank_dnase_end: Float
    $rank_dnase_start: Float
    $rank_enhancer_end: Float
    $rank_enhancer_start: Float
    $rank_promoter_end: Float
    $rank_promoter_start: Float
    $rank_atac_end: Float
    $rank_atac_start: Float
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

function cCRE_QUERY_VARIABLES(assembly: string, chromosome: string, start: number, end: number, biosample: string, nearbygenesdistancethreshold: number, nearbygeneslimit: number, accessions: string[], noLimit?: boolean) {
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
    rank_dnase_end: 11,
    rank_atac_start: -10,
    rank_atac_end: 11,
    rank_promoter_start: -10,
    rank_promoter_end: 11,
    rank_enhancer_start: -10,
    rank_enhancer_end: 11,
    rank_ctcf_start: -10,
    rank_ctcf_end: 11,
    cellType: biosample,
    element_type: null,
    limit: noLimit ? null : 25000,
    nearbygenesdistancethreshold: nearbygenesdistancethreshold,
    nearbygeneslimit: nearbygeneslimit
  }
  //Can't just null out accessions field if not using due to API functionality as of writing this, so push to vars only if using
  if (accessions) {
    vars["accessions"] = accessions
  }

  return vars
}

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
/**
 * 
 * @param assembly "GRCh38" | "mm10"
 * @param accessions string[]
 * @returns an object with key/value pairs of: accession id/linked genes data (non distance-linked)
 */
export async function fetchLinkedGenes(assembly: "GRCh38" | "mm10", accessions: string[]) {
  let returnData: { [key: string]: { genes: { geneName: string, linkedBy: "CTCF-ChIAPET" | "RNAPII-ChIAPET", biosample: string }[] } } = {}
  let geneIDs: string[] = []
  let linkedGenes: ApolloQueryResult<any>
  let geneNames: ApolloQueryResult<any>
  //Attempt first linked genes query
  try {
    linkedGenes = await getClient().query({
      query: LINKED_GENES_QUERY,
      variables: { assembly: assembly, accession: accessions },
      fetchPolicy: "no-cache"
    })
    linkedGenes.data.linkedGenesQuery.forEach((entry) => {
      !geneIDs.includes(entry.gene.split(".")[0]) && geneIDs.push(entry.gene.split(".")[0])
    })
    //Attempt to lookup gene names
    try {
      geneNames = await getClient().query({
        query: GENE_QUERY,
        variables: { assembly: assembly, name_prefix: geneIDs },
        fetchPolicy: "no-cache"
      })
      //If both queries are successful, go through each of linkedGenes.data.linkedGenesQuery and assemble return data
      linkedGenes.data.linkedGenesQuery.forEach((entry) => {
        const hasEntry: boolean = Object.hasOwn(returnData, entry.accession)
        const matchingGeneName = geneNames.data.gene.find((x) => x.id.split('.')[0] === entry.gene.split('.')[0])?.name
        // If there is no entry for that accession, create new one
        if (geneNames.data && !hasEntry && matchingGeneName) {
          returnData[entry.accession] = { genes: [{ geneName: matchingGeneName, linkedBy: entry.assay, biosample: entry.celltype }] }
        }
        // if entry for accession already exists, add to linked genes
        else if (geneNames.data && hasEntry && matchingGeneName) {
          returnData[entry.accession].genes = [...returnData[entry.accession].genes, { geneName: matchingGeneName, linkedBy: entry.assay, biosample: entry.celltype }]
        }
      })
    } catch (error) {
      console.log("Gene Name Lookup Failed")
      console.log(error)
    }
  } catch (error) {
    console.log("linked gene query failed:")
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
export async function MainQuery(assembly: string = null, chromosome: string = null, start: number = null, end: number = null, biosample: string = null, nearbygenesdistancethreshold: number, nearbygeneslimit: number, accessions: string[] = null, noLimit?: boolean) {
  console.log("queried with: " + assembly, chromosome, start, end, biosample + `${accessions ? " with accessions" : " no accessions"}`)
  let data: ApolloQueryResult<any>
  try {
    data = await getClient().query({
      query: cCRE_QUERY,
      variables: cCRE_QUERY_VARIABLES(assembly, chromosome, start, end, biosample, nearbygenesdistancethreshold, nearbygeneslimit, accessions),
      //Telling it to not cache, next js caches also and for things that exceed the 2mb cache limit it slows down substantially for some reason
      fetchPolicy: "no-cache",
    })
  } catch (error) {
    console.log("error fetching main cCRE data")
    console.log(error)
    throw error
  }
  
  return data
}


export type BIOSAMPLE_Data = {
  human: { biosamples: RegistryBiosample[] },
  mouse: {biosamples: RegistryBiosample[]}
}

const BIOSAMPLE_QUERY: TypedDocumentNode<BIOSAMPLE_Data> = gql`
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
        atac: experimentAccession(assay: "ATAC")
        dnase_signal: fileAccession(assay: "DNase")
        h3k4me3_signal: fileAccession(assay: "H3K4me3")
        h3k27ac_signal: fileAccession(assay: "H3K27ac")
        ctcf_signal: fileAccession(assay: "CTCF")
        atac_signal: fileAccession(assay: "ATAC")
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
        atac: experimentAccession(assay: "ATAC")
        dnase_signal: fileAccession(assay: "DNase")
        h3k4me3_signal: fileAccession(assay: "H3K4me3")
        h3k27ac_signal: fileAccession(assay: "H3K27ac")
        ctcf_signal: fileAccession(assay: "CTCF")
        atac_signal: fileAccession(assay: "ATAC")
      }
    }
  }
`

export async function biosampleQuery() {
  let returnData: ApolloQueryResult<BIOSAMPLE_Data>
  try {
    const res = await getClient().query({
      query: BIOSAMPLE_QUERY,
    })
    returnData = { data: res.data, loading: res.loading, networkStatus: res.networkStatus, error: res.error }
  } catch (error) {
    console.log(error)
  } finally {
    return returnData
  }
}

export async function UMAPQuery(assembly: "grch38" | "mm10", assay: "DNase" | "H3K4me3" | "H3K27ac" | "CTCF") {
  let data: ApolloQueryResult<any> | -1
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
