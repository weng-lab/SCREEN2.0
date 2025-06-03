import React from "react";
import { Divider, Stack, Typography } from "@mui/material";
import { InlineDownloadButton } from "./NewAnnotationsUtils";
import Config from "../../../config.json";

const geneLinkDownloads = [
  {
    href: Config.Downloads.HumanGeneLinks,
    label: "cCRE-Gene Links (3D Chromatin, CRISPR, eQTLs) (.zip)",
    bordercolor: "grey",
  },
  {
    href: Config.Downloads.HumanNearestPC,
    label: "Nearest Gene by cCRE (protein-coding only) (.tsv)",
    bordercolor: "grey",
  },
  {
    href: Config.Downloads.HumanNearestAll,
    label: "Nearest Gene by cCRE (protein-coding and non protein-coding) (.tsv)",
    bordercolor: "grey",
  },
];

const NewAnnotationsGeneLinks: React.FC = () => {
  return (
    <Stack gap={1}>
      <Typography variant="subtitle1" fontWeight={600}>
        cCRE-Gene Associations
      </Typography>
      <Divider />
      {geneLinkDownloads.map((item) => (
        <InlineDownloadButton key={item.label} {...item} />
      ))}
    </Stack>
  );
};

export default NewAnnotationsGeneLinks;
