import React from "react";
import Config from "../../../config.json";
import { DownloadButton, DownloadButtonProps } from "./DownloadButton";
import DownloadContentLayout from "./DownloadContentLayout";
import { Assembly } from "./Annotations";

const classDownloads: {
  GRCh38: DownloadButtonProps[];
  mm10: DownloadButtonProps[];
} = {
  GRCh38: [
    {
      href: Config.Downloads.HumanCAPRA,
      label: "CAPRA",
      fileSize: "1.79 GB (unzipped)",
      bordercolor: "gray",
    },
    {
      href: Config.Downloads.HumanMPRA,
      label: "MPRA",
      fileSize: "360.3 MB (unzipped)",
      bordercolor: "gray",
    },
    {
      href: Config.Downloads.HumanCRISPR,
      label: "CRISPR",
      fileSize: "35.7 MB (unzipped)",
      bordercolor: "gray",
    },
    {
      href: Config.Downloads.HumanVISTA,
      label: "VISTA",
      fileSize: "123 KB",
      bordercolor: "gray",
    },
  ],
  mm10: [
    {
      href: Config.Downloads.MouseVISTA,
      label: "VISTA",
      fileSize: "90 KB",
      bordercolor: "gray",
    },
  ],
};

interface NewAnnotationsByClassProps {
  assembly: Assembly;
}

const AnnotationsFunctional: React.FC<NewAnnotationsByClassProps> = ({
  assembly,
}) => {
  return (
    <DownloadContentLayout title="Functional Characterization">
      {classDownloads[assembly].map((item) => (
        <DownloadButton key={item.label} {...item} />
      ))}
    </DownloadContentLayout>
  );
};

export default AnnotationsFunctional;