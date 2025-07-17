import { useEffect, useMemo, useState } from "react";
import { styled, Tab, Tabs } from "@mui/material";
import { useQuery } from "@apollo/client";
import { BigQueryResponse } from "../../_gbview/types";
import { BIG_QUERY } from "../../_gbview/queries";
import { BigBedData } from "bigwig-reader";
import config from "../../../../config.json";
import ChromHMMBrowser from "./browserView";
import ChromHMMTable from "./tableView";
import { useChromHMMData } from "./fetch";

const StyledTab = styled(Tab)(() => ({
  textTransform: "none",
}));

export default function ChromHMM({ coordinates }) {
  const [page, setPage] = useState(0);
  const { tracks, processedTableData, loading } = useChromHMMData(coordinates);
  const handlePageChange = (_, newValue: number) => {
    setPage(newValue);
  };

  if (!tracks) return null;

  return (
    <div>
      <Tabs value={page} onChange={handlePageChange}>
        <StyledTab value={0} label="Genome Browser View" />
        <StyledTab value={1} label="Table View" />
      </Tabs>
      {page === 0 &&
        (loading ? (
          <div>Loading...</div>
        ) : (
          <ChromHMMBrowser tracks={tracks} coordinates={coordinates} />
        ))}
      {page === 1 &&
        (loading ? (
          <div>Loading...</div>
        ) : (
          <ChromHMMTable data={processedTableData} />
        ))}
    </div>
  );
}

export type ChromTrack = {
  sample: string;
  displayName: string;
  url: string;
};

export const stateDetails = {
  ["TssFlnk"]: { description: "Flanking TSS", stateno: "E1", color: "#FF4500" },
  ["TssFlnkD"]: {
    description: "Flanking TSS downstream",
    stateno: "E2",
    color: "#FF4500",
  },
  ["TssFlnkU"]: {
    description: "Flanking TSS upstream",
    stateno: "E3",
    color: "#FF4500",
  },
  ["Tss"]: { description: "Active TSS", stateno: "E4", color: "#FF0000" },
  ["Enh1"]: { description: "Enhancer", stateno: "E5", color: "#FFDF00" },
  ["Enh2"]: { description: "Enhancer", stateno: "E6", color: "#FFDF00" },
  ["EnhG1"]: {
    description: "Enhancer in gene",
    stateno: "E7",
    color: "#AADF07",
  },
  ["EnhG2"]: {
    description: "Enhancer in gene",
    stateno: "E8",
    color: "#AADF07",
  },
  ["TxWk"]: {
    description: "Weak transcription",
    stateno: "E9",
    color: "#3F9A50",
  },
  ["Biv"]: { description: "Bivalent", stateno: "E10", color: "#CD5C5C" },
  ["ReprPC"]: {
    description: "Repressed by Polycomb",
    stateno: "E11",
    color: "#8937DF",
  },
  ["Quies"]: { description: "Quiescent", stateno: "E12", color: "#DCDCDC" },
  ["Het"]: { description: "Heterochromatin", stateno: "E13", color: "#4B0082" },
  ["ZNF/Rpts"]: {
    description: "ZNF genes repreats",
    stateno: "E14",
    color: "#68cdaa",
  },
  ["Tx"]: { description: "Transcription", stateno: "E15", color: "#008000" },
};
