import React from "react";
import { DownloadButton, DownloadButtonProps } from "./DownloadButton";
import Config from "../../../config.json";
import DownloadContentLayout from "./DownloadContentLayout";

const geneLinkDownloads: DownloadButtonProps[] = [
  {
    href: Config.Downloads.HumanGeneLinks1,
    label: "cCRE-Gene Links (3D Chromatin, CRISPR, eQTLs) (.zip)",
    fileSize: "463.3 MB",
    bordercolor: "gray",
  },
  {
    href: Config.Downloads.HumanGeneLinks2,
    label: "cCRE-Gene-Links (ABC, EPIraction, GraphRegLR, rE2G) (.zip)",
    fileSize: "8.9 GB",
    bordercolor: "gray",
  },
  {
    href: Config.Downloads.HumanNearestPC,
    label: "Nearest Gene by cCRE (protein-coding only) (.tsv)",
    fileSize: "317.5 MB",
    bordercolor: "gray",
  },
  {
    href: Config.Downloads.HumanNearestAll,
    label: "Nearest Gene by cCRE (protein-coding and non protein-coding) (.tsv)",
    fileSize: "296.1 MB",
    bordercolor: "gray",
  },
];

const AnnotationsGeneLinks: React.FC = () => {
  return (
    <DownloadContentLayout title="cCRE-Gene Associations">
      {geneLinkDownloads.map((item) => (
        <DownloadButton key={item.label} {...item} />
      ))}
    </DownloadContentLayout>
  );
};

export default AnnotationsGeneLinks;
