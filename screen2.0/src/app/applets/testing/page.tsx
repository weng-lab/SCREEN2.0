"use client";

import React, { useMemo, useState, useEffect } from 'react'
import { Umap } from './chart'
import { ParentSize } from '@visx/responsive';
import { client } from "../../search/_ccredetails/client"
import { useQuery } from "@apollo/client"
import { UMAP_QUERY } from "../../downloads/queries"
import { tissueColors } from "../../../common/lib/colors"

// Direct copy from old SCREEN
function colorMap(strings) {
    const counts = {}
    //Count the occurences of each tissue/sample
    strings.forEach((x) => (counts[x] = counts[x] ? counts[x] + 1 : 1))
    //Removes duplicate elements in the array
    strings = [...new Set(strings)]
    const colors = {}
    //For each tissue/sample type
    strings.forEach((x) => {
      colors[x] = tissueColors[x] ?? tissueColors.missing
    })
    return [colors, counts]
  }

export default function Testing() {
    const [selectionType, setSelectionType] = useState<"select" | "pan">('select');

    const {data: umapData, loading: umapLoading} = useQuery(UMAP_QUERY, {
        variables: { assembly: "grch38", assay: "DNase", a: "dnase" },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        client,
    })

    const handleClick = () => {
        setSelectionType((prev) => (prev === 'select' ? 'pan' : 'select'));
    };

    const [sampleTypeColors, sampleTypeCounts] = useMemo(
        () =>
          colorMap(
            (umapData && umapData.ccREBiosampleQuery &&
              umapData.ccREBiosampleQuery.biosamples.filter((x) => x.umap_coordinates).map((x) => x.sampleType)) ||
            []
          ),
        [umapData]
      )
      const [ontologyColors, ontologyCounts] = useMemo(
        () =>
          colorMap(
            (umapData && umapData.ccREBiosampleQuery &&
              //Check if umap coordinates exist, then map each entry to it's ontology (tissue type). This array of strings is passed to colorMap
              umapData.ccREBiosampleQuery.biosamples.filter((x) => x.umap_coordinates).map((x) => x.ontology)) ||
            []
          ),
        [umapData]
      )
      
    const fData = useMemo(() => {
    return (
        umapData &&
        umapData.ccREBiosampleQuery.biosamples
            .filter((x) => x.umap_coordinates)
            .map((x) => ({
                x: x.umap_coordinates![0],
                y: x.umap_coordinates![1],
                color: ontologyColors[x.ontology],
                name: x.displayname,
                accession: x.experimentAccession
            }))
        );
    }, [umapData, ontologyColors]);

    useEffect(() => {
        // Function to handle key press
        const handleKeyDown = (e) => {
          if (e.key === 'Shift') {
            setSelectionType('pan'); // Switch to pan mode when Shift is pressed
          }
        };
    
        // Function to handle key release
        const handleKeyUp = (e) => {
          if (e.key === 'Shift') {
            setSelectionType('select'); // Switch back to select mode when Shift is released
          }
        };
    
        // Add event listeners for key press and release
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    
        // Clean up event listeners on unmount
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
        };
      }, []);

    return (
        <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', }}>
            <div style={{ height: '75vh', width: '75vh', position: 'relative', }}>
            <ParentSize>
                {({ width, height }) => <Umap width={width} height={height} pointData={fData} loading={umapLoading} selectionType={selectionType}/>}
            </ParentSize>
            <button onClick={handleClick}>Pan/Select</button>
            </div>
        </div>
);
}