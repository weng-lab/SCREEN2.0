"use client";

import React, { useMemo } from 'react'
import {  Typography } from "@mui/material"
import { Umap } from './chart'
import { ParentSize } from '@visx/responsive';
import { client } from "../../search/_ccredetails/client"
import { useQuery } from "@apollo/client"
import { UMAP_QUERY } from "../../downloads/queries"

export default function Testing() {
    const {data: umapData, loading: umapLoading} = useQuery(UMAP_QUERY, {
        variables: { assembly: "grch38", assay: "DNase", a: "dnase" },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        client,
      })
      
      const fData = useMemo(() => {
        return (
            umapData &&
            umapData.ccREBiosampleQuery.biosamples
              .filter((x) => x.umap_coordinates)
              .map((x) => ({
                x: x.umap_coordinates![0], // Assume first value is the x coordinate
                y: x.umap_coordinates![1], // Assume second value is the y coordinate
              }))
          );
        }, [umapData]);
        
    return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
          <div style={{ height: '75vh', width: '75vw', position: 'relative', }}>
            <ParentSize>
              {({ width, height }) => <Umap width={width} height={height} data={fData} />}
            </ParentSize>
          </div>
        </div>
    );
  }