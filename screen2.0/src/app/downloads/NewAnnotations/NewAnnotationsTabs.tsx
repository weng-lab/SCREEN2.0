import { TabList } from "@mui/lab";
import { Divider, Typography, Tab, styled } from "@mui/material";
import React from "react";
import { decodeTabValue, encodeTabValue } from "./NewAnnotationsUtils";

const DATASETS = {
  GRCh38: ["byClass", "byCelltype", "geneLinks"],
  mm10: ["byClass", "byCelltype"],
} as const;

export type Assembly = keyof typeof DATASETS;
export type Dataset = (typeof DATASETS)[Assembly][number];

export type TabValue = {
  assembly: Assembly;
  value: Dataset;
};

const getDatasetLabel = (x: Dataset) => {
  switch (x) {
    case "byCelltype":
      return "By Cell and Tissue Type";
    case "byClass":
      return "By Class";
    case "geneLinks":
      return "cCRE-Gene Links";
  }
};

const StyledTab = styled(Tab)(({ theme }) => ({
  alignItems: "flex-start",
  textAlign: 'left',
  maxWidth: 'none',
  paddingTop: 4,
  paddingBottom: 4,
  minHeight: 0,
  borderRadius: 4,
  "&.Mui-selected": {
    color: theme.palette.primary.main,
    backgroundColor: theme.palette.action.selected,
  },
}));



type NewAnnotationsTabsProps = {
  onTabChange: (newTab: TabValue) => void;
};

const NewAnnotationsTabs: React.FC<NewAnnotationsTabsProps> = ({  onTabChange }) => {
  const handleTabChange = (_, newTabValue: string) => {
    onTabChange(decodeTabValue(newTabValue));
  };

  return (
    <TabList orientation="vertical" onChange={handleTabChange} sx={{flexShrink: 0}}>
      <Typography variant="caption" mb={1}>Download cCRE Data for</Typography>
      <Typography variant="h6">Human</Typography>
      {DATASETS.GRCh38.map((dataset) => (
        <StyledTab
          key={"GRCh38-" + dataset}
          label={getDatasetLabel(dataset)}
          value={encodeTabValue({ assembly: "GRCh38", value: dataset })}
        />
      ))}
      <Divider sx={{ marginY: 1 }} />
      <Typography variant="h6">Mouse</Typography>
      {DATASETS.mm10.map((dataset) => (
        <StyledTab
          key={"mm10-" + dataset}
          label={getDatasetLabel(dataset)}
          value={encodeTabValue({ assembly: "mm10", value: dataset })}
        />
      ))}
    </TabList>
  );
};

export default NewAnnotationsTabs;
