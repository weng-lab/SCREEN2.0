import React from "react";
import Config from "../../../config.json";
import { DownloadButton, DownloadButtonProps } from "./DownloadButton";
import {
  CA_CTCF,
  CA_H3K4me3,
  CA_TF,
  CA_only,
  PLS,
  TF_only,
  dELS,
  pELS,
  CTCF_Bound,
  ELS,
} from "../../../common/lib/colors";
import DownloadContentLayout from "./DownloadContentLayout";
import { Assembly } from "./Annotations";

const classDownloads: {
  GRCh38: DownloadButtonProps[];
  mm10: DownloadButtonProps[];
} = {
  GRCh38: [
    {
      href: Config.Downloads.HumanPromoters,
      label: "Promoter-like (PLS) (47,532)",
      fileSize: "2.6 MB",
      bordercolor: PLS,
    },
    {
      href: Config.Downloads.HumanEnhancers,
      label: "All Candidate Enhancers (pELS & dELS) (1,718,669)",
      fileSize: "94.4 MB",
      bordercolor: ELS,
    },
    {
      href: Config.Downloads.HumanProximalEnhancers,
      label: "Proximal enhancer-like (pELS) (249,464)",
      fileSize: "13.7 MB",
      bordercolor: pELS,
    },
    {
      href: Config.Downloads.HumanDistalEnhancers,
      label: "Distal enhancer-like (dELS) (1,469,205)",
      fileSize: "80.7 MB",
      bordercolor: dELS,
    },
    {
      href: Config.Downloads.HumanCA_CTCF,
      label: "Chromatin Accessible with CTCF (CA-CTCF) (126,034)",
      fileSize: "7.3 MB",
      bordercolor: CA_CTCF,
    },
    {
      href: Config.Downloads.HumanCA_H3K4me3,
      label: "Chromatin Accessible with H3K4me3 (CA-H3K4me3) (79,246)",
      fileSize: "4.8 MB",
      bordercolor: CA_H3K4me3,
    },
    {
      href: Config.Downloads.HumanCA_TF,
      label: "Chromatin Accessible with TF (CA-TF) (26,102)",
      fileSize: "1.5 MB",
      bordercolor: CA_TF,
    },
    {
      href: Config.Downloads.HumanCA_only,
      label: "Chromatin Accessible Only (CA) (245,985)",
      fileSize: "13.0 MB",
      bordercolor: CA_only,
    },
    {
      href: Config.Downloads.HumanTF_only,
      label: "TF Only (TF) (105,286)",
      fileSize: "5.6 MB",
      bordercolor: TF_only,
    },
    {
      href: Config.Downloads.HumanCA_Bound,
      label: "CTCF-Bound cCREs (948,642)",
      fileSize: "63.0 MB",
      bordercolor: CTCF_Bound,
    },
    {
      href: Config.Downloads.HumanSilencers,
      label: "Silencer Sets (.tar.gz)",
      fileSize: "14.3 MB (unzipped)",
      bordercolor: "gray"
    }
  ],
  mm10: [
    {
      href: Config.Downloads.MousePromoters,
      label: "Promoter-like (PLS) (27,332)",
      fileSize: "1.5 MB",
      bordercolor: PLS,
    },
    {
      href: Config.Downloads.MouseEnhancers,
      label: "All Candidate Enhancers (pELS & dELS) (512,001)",
      fileSize: "28.2 MB",
      bordercolor: ELS,
    },
    {
      href: Config.Downloads.MouseProximalEnhancers,
      label: "Proximal enhancer-like (pELS) (111,218)",
      fileSize: "6.1 MB",
      bordercolor: pELS,
    },
    {
      href: Config.Downloads.MouseDistalEnhancers,
      label: "Distal enhancer-like (dELS) (400,783)",
      fileSize: "22.0 MB",
      bordercolor: dELS,
    },
    {
      href: Config.Downloads.MouseCA_CTCF,
      label: "Chromatin Accessible with CTCF (CA-CTCF) (45,933)",
      fileSize: "2.7 MB",
      bordercolor: CA_CTCF,
    },
    {
      href: Config.Downloads.MouseCA_H3K4me3,
      label: "Chromatin Accessible with H3K4me3 (CA-H3K4me3) (23,832)",
      fileSize: "1.5 MB",
      bordercolor: CA_H3K4me3,
    },
    {
      href: Config.Downloads.MouseCA_TF,
      label: "Chromatin Accessible with TF (CA-TF) (10,707)",
      fileSize: "0.6 MB",
      bordercolor: CA_TF,
    },
    {
      href: Config.Downloads.MouseCA_only,
      label: "Chromatin Accessible Only (CA) (291,800)",
      fileSize: "15.4 MB",
      bordercolor: CA_only,
    },
    {
      href: Config.Downloads.MouseTF_only,
      label: "TF Only (TF) (15,283)",
      fileSize: "0.8 MB",
      bordercolor: TF_only,
    },
    {
      href: Config.Downloads.MouseCA_Bound,
      label: "CTCF-Bound cCREs (139,894)",
      fileSize: "9.4 MB",
      bordercolor: CTCF_Bound,
    },
  ],
};

interface NewAnnotationsByClassProps {
  assembly: Assembly;
}

const AnnotationsByClass: React.FC<NewAnnotationsByClassProps> = ({
  assembly,
}) => {
  return (
    <DownloadContentLayout title="cCREs by Class (.bed)">
      {classDownloads[assembly].map((item) => (
        <DownloadButton key={item.label} {...item} />
      ))}
    </DownloadContentLayout>
  );
};

export default AnnotationsByClass;
