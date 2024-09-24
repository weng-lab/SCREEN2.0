import { BigWigData, BigBedData, BigZoomData } from "bigwig-reader"
import { RequestError } from "umms-gb/dist/components/tracks/trackset/types"
import { ValuedPoint } from "umms-gb/dist/utils/types"


export type BigResponseData = BigWigData[] | BigBedData[] | BigZoomData[] | ValuedPoint[]

export type BigResponse = {
  data: BigResponseData
  error: RequestError
}

export type BigQueryResponse = {
  bigRequests: BigResponse[]
}

export type GenomicRange = {
    chromosome?: string
    start: number
    end: number
  }