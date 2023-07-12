"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { TF_INTERSECTION_QUERY } from "./queries"

export const TfIntersection: React.FC<{assembly: string, coordinates:{chromosome: string, start: number, end: number}}> = ({assembly,coordinates}) =>{
    const { loading: loading, data: data } = useQuery(TF_INTERSECTION_QUERY, {
        variables: {
          assembly: assembly.toLowerCase(),
          range: {
            chrom: coordinates.chromosome,
            chrom_start: coordinates.start,
            chrom_end: coordinates.end
          },
          species: assembly.toLowerCase()==="grch38" ? "Homo sapiens" : "Mus musculus"
        },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        client,
      })
      console.log(loading,data)
    let peakmap = {}
    data && data.peaks.peaks.forEach(d=>{
        if(!peakmap[d.dataset.target])
        {
            peakmap[d.dataset.target] = new Set()
        }
        peakmap[d.dataset.target].add(d.dataset.accession)
    })
    console.log(peakmap)

return (<>
    {'Tf Intersection'}
    </>)

}