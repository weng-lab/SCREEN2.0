"use client"
import React, { useMemo, useState, useEffect} from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { TSS_RAMPAGE_PEAKS } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { LoadingMessage, ErrorMessage, CreateLink } from "../../../common/lib/utility"
import { Typography, Stack, MenuItem, Select, InputLabel, SelectChangeEvent } from "@mui/material"
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
  const [peakID, setPeakID] = useState<string>('');

  const handlePeakIdChange = (event: SelectChangeEvent<string>) => {
    setPeakID(event.target.value as string);
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
    if (peakData.length > 0 && !peakID) {
      setPeakID(peakData[0].peakId);
    }
  }, [peakData, peakID]);

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
            // {
            //   header: "Expression",
            //   value: (row: PeakRow) => row.locustype,
            //   render: (row: PeakRow) => <b>Insert Table Here</b>
            // },
          ]}
          rows={peakData}
          sortColumn={0}
          itemsPerPage={5}
        />
      </Grid2>
      <Stack>
        <InputLabel>Peak</InputLabel>
          <Select
              id="peak"
              value={peakID || ''}
              onChange={handlePeakIdChange}
              disabled={peakData.length === 0}
            >
          {peakData.length === 0 ? (
            <MenuItem value="" disabled>
              No Peaks Found
            </MenuItem>
          ) : (
            peakData.map((peak) => (
              <MenuItem key={peak.peakId} value={peak.peakId}>
                {peak.peakId}
              </MenuItem>
            ))
          )}
          </Select>
      </Stack>
    </Grid2>
  )
}
