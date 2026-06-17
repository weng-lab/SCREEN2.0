/**
 * Send the request to our Server from a server component
 */
'use server'
import { getClient } from "../lib/client"
import { MainQueryData, RegistryBiosample, SCREENCellTypeSpecificResponse } from "../../app/search/types"
import { gql } from "../../graphql/__generated__"
import { parseZScoresArray, ZScoresEntry } from "./zscores"

const NULL_CTSPECIFIC: SCREENCellTypeSpecificResponse = {
  ct: null,
  dnase_zscore: null,
  h3k4me3_zscore: null,
  h3k27ac_zscore: null,
  ctcf_zscore: null,
  atac_zscore: null,
}

const BASE_CCRE_QUERY = gql(`
  query GetBaseCcreData(
    $assembly: String!
    $accession: [String!]
    $coordinates: [GenomicRangeInput]
    $nearbygeneslimit: Int
    $nearbygenesdistancethreshold: Int
    $limit: Int
  ) {
    getmaxZScoresQuery(
      assembly: $assembly
      accession: $accession
      coordinates: $coordinates
      nearbygeneslimit: $nearbygeneslimit
      nearbygenesdistancethreshold: $nearbygenesdistancethreshold
      limit: $limit
    ) {
      accession
      ccre_group
      chromosome
      start
      stop
      dnase_max_zscore
      h3k4me3_max_zscore
      h3k27ac_max_zscore
      ctcf_max_zscore
      atac_max_zscore
      nearestgenes {
        gene
        distance
      }
      mammals
      vertebrates
      primates
    }
  }
`)

const GET_BIOSAMPLE_Z = gql(`
  query GetBiosampleZ(
    $assembly: String!
    $accession: [String]
    $coordinates: [GenomicRangeInput]
    $limit: Int
    $biosampleValue: [String]
  ) {
    getcCREZScoresQuery(
      assembly: $assembly
      accession: $accession
      coordinates: $coordinates
      limit: $limit
      biosample_value: $biosampleValue
    ) {
      accession
      zscores
    }
  }
`)

export async function MainQuery(
  assembly: string = null,
  chromosome: string = null,
  start: number = null,
  end: number = null,
  biosample: string = null,
  nearbygenesdistancethreshold: number,
  nearbygeneslimit: number,
  accessions: string[] = null,
  noLimit?: boolean,
): Promise<MainQueryData> {
  try {
    const client = getClient()
    const accession = accessions ?? undefined
    const coordinates = chromosome ? [{ chromosome, start, end }] : undefined;
    const limit = noLimit ? undefined : 25000


    const getBaseCcreData = client.query({
      query: BASE_CCRE_QUERY,
      variables: {
        assembly,
        accession,
        coordinates,
        nearbygenesdistancethreshold: nearbygenesdistancethreshold ?? undefined,
        nearbygeneslimit,
        limit
      },
      fetchPolicy: "no-cache"
    });

    const getBiosampleZ = biosample
      ? client.query({
          query: GET_BIOSAMPLE_Z,
          variables: {
            assembly,
            accession,
            coordinates,
            limit,
            biosampleValue: [biosample]
          },
          fetchPolicy: "no-cache"
        })
      : null

    const [baseCcreData, biosampleZScores] = await Promise.all([getBaseCcreData, getBiosampleZ])

    const biosampleScoreLookup: Record<
      string,
      SCREENCellTypeSpecificResponse
    > = Object.fromEntries(
      biosampleZScores?.data
        ? biosampleZScores.data.getcCREZScoresQuery.map((item) => [
            item.accession,
            parseZScoresArray(item.zscores as ZScoresEntry<null>[]),
          ])
        : [],
    );

    return {
      data: {
        cCRESCREENSearch: baseCcreData?.data?.getmaxZScoresQuery.map((item) => ({
          chrom: item.chromosome,
          start: item.start,
          len: item.stop - item.start,
          pct: item.ccre_group,
          vertebrates: item.vertebrates,
          mammals: item.mammals,
          primates: item.primates,
          dnase_zscore: item.dnase_max_zscore,
          promoter_zscore: item.h3k4me3_max_zscore,
          enhancer_zscore: item.h3k27ac_max_zscore,
          ctcf_zscore: item.ctcf_max_zscore,
          atac_zscore: item.atac_max_zscore,
          ctspecific: biosampleScoreLookup[item.accession] ?? NULL_CTSPECIFIC,
          info: { accession: item.accession },
          nearestgenes: item.nearestgenes,
        })),
      },
    };
  } catch (error) {
    console.log("error fetching main cCRE data");
    console.log(error);
    throw error;
  }
}




export type BIOSAMPLE_Data = {
  human: { biosamples: RegistryBiosample[]},
  mouse: {biosamples: RegistryBiosample[]}
}

const BIOSAMPLE_QUERY = gql(`
  query biosamples_3 {
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
`)

export async function biosampleQuery() {
  try {
    const res = await getClient().query({
      query: BIOSAMPLE_QUERY,
    })
    return { data: res.data, loading: res.loading, networkStatus: res.networkStatus, error: res.error }
  } catch (error) {
    console.log(error)
    throw error
  }
}

