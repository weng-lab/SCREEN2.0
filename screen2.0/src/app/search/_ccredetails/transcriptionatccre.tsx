"use client"
import React, { useMemo, useState, useEffect} from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { TSS_RAMPAGE_PEAKS } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { LoadingMessage, ErrorMessage, CreateLink } from "../../../common/lib/utility"
import { Typography, Stack, MenuItem, Select, InputLabel, SelectChangeEvent, Box, FormLabel, FormControl, ToggleButton, ToggleButtonGroup } from "@mui/material"
import { RampageToolTipInfo } from "./const"

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
  
  return loading ? (
    <LoadingMessage />
  ) : error ? (
    <ErrorMessage error={error} />
  ) : (
    <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
      <Grid2 xs={12} md={12} lg={12}>
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
          ]}
          highlighted={selectedRow}
          onRowClick={handleRowClick}
          rows={peakData}
          sortColumn={0}
          itemsPerPage={5}
        />
      </Grid2>
      <Grid2 xs={12} display={"flex"} gap={2}>
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
      </Grid2>
      {selectedRow && (
        <Grid2 xs={12} md={12} lg={12}>
          <Box
            sx={{
              mt: 2,
              p: 2,
              border: '1px solid',
              borderColor: 'primary.main',
              borderRadius: '8px',
              backgroundColor: 'background.paper',
              boxShadow: 1,
            }}
          >
            <Typography variant="h6">Selected Peak Details</Typography>
            <Typography>Peak ID: {selectedRow.peakId}</Typography>
            <Typography>Type: {selectedRow.peakType}</Typography>
            <Typography>Associated Gene: {selectedRow.gene}</Typography>
          </Box>
        </Grid2>
      )}
    </Grid2>
  )
}
