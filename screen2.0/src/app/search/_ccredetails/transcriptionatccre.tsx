"use client"
import React, { useMemo, useState, useEffect} from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { TSS_RAMPAGE_PEAKS, TSS_RAMPAGE_QUERY } from "./queries"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { LoadingMessage, ErrorMessage, CreateLink } from "../../../common/lib/utility"
import { Typography, Stack, Box, FormLabel, FormControl, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { RampageToolTipInfo } from "./const"
import { PlotActivityProfiles } from "./utils"

export type PeakData = {
  gettssRampagePeaks: {
      peakType: string,
      start: number,
      chrom: string,
      end: number
      peakId: string
      genes: [{
        geneName: string
        locusType: string
      }]
  }[]
}

export type PeakVars = {
  coordinates: {
    chromosome: string
    start: number
    stop: number
  }
}

export const OverlappingPeaks: React.FC<PeakVars> = ({ coordinates }) => {
  const [selectedRow, setSelectedRow] = useState<PeakRow | null>(null);
  const [sort, setSort] = useState<"byValue" | "byTissueMax" | "byTissue">("byValue")
  const handleRowClick = (row: PeakRow) => {
    setSelectedRow(row);
  };

  const { loading, error, data } = useQuery<PeakData, PeakVars>(TSS_RAMPAGE_PEAKS,
    {
    variables: {
      coordinates: coordinates,
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  const peakData = useMemo(() => {
    return data?.gettssRampagePeaks.map((x) => ({
      peakType: x.peakType,
      start: x.start,
      chrom: x.chrom,
      end: x.end,
      peakId: x.peakId,
      gene: x.genes[0]?.geneName || "N/A",
      locustype: x.genes[0]?.locusType || "N/A",
    })) || [];
  }, [data]);

  useEffect(() => {
    if (peakData.length > 0) {
      setSelectedRow(peakData[peakData.length-1]);
    }
  }, [peakData]);

  type PeakRow = {
    peakType: string;
    start: number;
    chrom: string;
    end: number;
    peakId: string;
    gene: string;
    locustype: string;
  };

  type RampageData = {
    tssrampageQuery: {
      start: number,
      organ: string,
      strand: string,
      peakId: string,
      biosampleName: string,
      biosampleType: string,
      bisampleSummary: string,
      peakType: string,
      expAccession: string,
      value: number,
      end: number,
      chrom: string,
      genes: [{
        geneName: string
        locusType: string
      }]
  }[]
  }

  type RampageVars = {
    peak: string;
  }

  const { loading: rampageloading, error: rampageerror, data: rampagedata } = useQuery<RampageData, RampageVars>(
    TSS_RAMPAGE_QUERY, 
    {
      variables: {
        peak: selectedRow?.peakId || "",
      },
      skip: !selectedRow,
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      client,
    }
  )

  const rampageData = useMemo(() => {
    if (!rampagedata) return [];
  
    return rampagedata.tssrampageQuery.map((t) => ({
      value: t.value,
      peakId: t.peakId,
      biosampleType: t.biosampleType,
      name: t.biosampleName,
      locusType: t.genes[0].locusType,
      expAccession: t.expAccession,
      start: String(t.start),
      end: String(t.end),
      chrom: t.chrom,
      peakType: t.peakType,
      organ: t.organ,
      strand: t.strand,
      tissue: t.organ,
    }));
  }, [rampagedata]);
  
  return loading ? (
    <LoadingMessage />
  ) : error ? (
    <ErrorMessage error={error} />
  ) : (
    <Stack spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
        <DataTable
          tableTitle="RAMPAGE Peaks Directly Overlapping cCREs"
          titleHoverInfo={RampageToolTipInfo}
          columns={[
            {
              header: "RAMPAGE Peak ID",
              value: (row: PeakRow) => row.peakId,
            },
            {
              header: "Type of Peak",
              value: (row: PeakRow) => row.peakType,
            },
            {
              header: "Associated Gene",
              value: (row: PeakRow) => row.gene,
              render: (row: PeakRow) => <i><CreateLink linkPrefix={"/applets/gene-expression?assembly=GRCh38&gene="} linkArg={row.gene} label={row.gene} underline={"none"} /></i>
            },
            {
              header: "Genomic Region",
              value: (row: PeakRow) => row.chrom + ":" + row.start.toLocaleString() + "-" + row.end.toLocaleString(),
            },
          ]}
          highlighted={selectedRow}
          onRowClick={handleRowClick}
          rows={peakData}
          sortColumn={0}
          itemsPerPage={5}
        />
      <Stack direction="row" gap={2} flexWrap={"wrap"}>
      <FormControl>
          <FormLabel>Sort By</FormLabel>
          <ToggleButtonGroup
            color="primary"
            value={sort}
            exclusive
            onChange={(event: React.MouseEvent<HTMLElement>, newValue: string) => {
              if (newValue !== null) {
                setSort(newValue as "byValue" | "byTissueMax" | "byTissue");
              }
            }}
            aria-label="View By"
            size="small"
          >
            <ToggleButton sx={{ textTransform: "none" }} value="byValue">Value</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="byTissue">Tissue</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="byTissueMax">Tissue Max</ToggleButton>
          </ToggleButtonGroup>
        </FormControl>
      </Stack>
        {peakData && peakData.length === 0 ? (
          <Typography>No data available</Typography>
        ) : selectedRow ? (
          <Box maxWidth={{ xl: '75%', xs: '100%' }}>
            <PlotActivityProfiles
              data={rampageData}
              sort={sort}
              range={{
                x: { start: 0, end: 4 },
                y: { start: 0, end: 0 },
              }}
              dimensions={{
                x: { start: 0, end: 650 },
                y: { start: 200, end: 0 },
              }}
              peakID={selectedRow.peakId}
            />
          </Box>
        ) : (
          null
        )}
    </Stack>
  )
}
