import React from "react";
import { DownloadButton, DownloadButtonProps } from "./DownloadButton";
import Config from "../../../config.json";
import DownloadContentLayout from "./DownloadContentLayout";

const orthologousDownloads: DownloadButtonProps[] = [
  {
    href: Config.Downloads.HumanMouseOrtholog,
    label: "Human/Mouse Orthologous cCREs (.tsv)",
    fileSize: "13.3 MB",
    bordercolor: "gray",
  }
];

const AnnotationsOtherOrthologous: React.FC = () => {
  return (
    <DownloadContentLayout title="Orthologous cCREs">
      {orthologousDownloads.map((item) => (
        <DownloadButton key={item.label} {...item} />
      ))}
    </DownloadContentLayout>
  );
};

export default AnnotationsOtherOrthologous;
