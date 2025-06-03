import React from "react";
import { DownloadButton, DownloadButtonProps } from "./NewAnnotationsUtils";
import Config from "../../../config.json";
import DownloadContentLayout from "./DownloadContentLayout";

const geneLinkDownloads: DownloadButtonProps[] = [
  {
    href: Config.Downloads.HumanGeneLinks,
    label: "cCRE-Gene Links (3D Chromatin, CRISPR, eQTLs) (.zip)",
    fileSize: "463.3 MB",
    bordercolor: "grey",
  },
  {
    href: Config.Downloads.HumanNearestPC,
    label: "Nearest Gene by cCRE (protein-coding only) (.tsv)",
    fileSize: "317.5 MB",
    bordercolor: "grey",
  },
  {
    href: Config.Downloads.HumanNearestAll,
    label: "Nearest Gene by cCRE (protein-coding and non protein-coding) (.tsv)",
    fileSize: "296.1 MB",
    bordercolor: "grey",
  },
];

const NewAnnotationsGeneLinks: React.FC = () => {
  return (
    <DownloadContentLayout title="cCRE-Gene Associations">
      {geneLinkDownloads.map((item) => (
        <DownloadButton key={item.label} {...item} />
      ))}
    </DownloadContentLayout>
  );
};

export default NewAnnotationsGeneLinks;
