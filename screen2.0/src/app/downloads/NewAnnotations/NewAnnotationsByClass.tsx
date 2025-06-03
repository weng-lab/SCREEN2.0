import React from "react";
import { Assembly } from "./NewAnnotationsHeader";
import { Divider, Stack, Typography } from "@mui/material";
import Config from "../../../config.json";
import { InlineDownloadButton } from "./NewAnnotationsUtils";
import { CA_CTCF, CA_H3K4me3, CA_TF, CA_only, PLS, TF_only, dELS, pELS, CTCF_Bound, ELS } from "../../../common/lib/colors"

const classDownloads = {
  GRCh38: [
    {
      href: Config.Downloads.HumanPromoters,
      label: "Promoter-like (PLS) (47,532)",
      bordercolor: PLS,
    },
    {
      href: Config.Downloads.HumanEnhancers,
      label: "All Candidate Enhancers (pELS & dELS) (1,718,669)",
      bordercolor: ELS,
    },
    {
      href: Config.Downloads.HumanProximalEnhancers,
      label: "Proximal enhancer-like (pELS) (249,464)",
      bordercolor: pELS,
    },
    {
      href: Config.Downloads.HumanDistalEnhancers,
      label: "Distal enhancer-like (dELS) (1,469,205)",
      bordercolor: dELS,
    },
    {
      href: Config.Downloads.HumanCA_CTCF,
      label: "Chromatin Accessible with CTCF (CA-CTCF) (126,034)",
      bordercolor: CA_CTCF,
    },
    {
      href: Config.Downloads.HumanCA_H3K4me3,
      label: "Chromatin Accessible with H3K4me3 (CA-H3K4me3) (79,246)",
      bordercolor: CA_H3K4me3,
    },
    {
      href: Config.Downloads.HumanCA_TF,
      label: "Chromatin Accessible with TF (CA-TF) (26,102)",
      bordercolor: CA_TF,
    },
    {
      href: Config.Downloads.HumanCA_only,
      label: "Chromatin Accessible Only (CA) (245,985)",
      bordercolor: CA_only,
    },
    {
      href: Config.Downloads.HumanTF_only,
      label: "TF Only (TF) (105,286)",
      bordercolor: TF_only,
    },
    {
      href: Config.Downloads.HumanCA_Bound,
      label: "CTCF-Bound cCREs (948,642)",
      bordercolor: CTCF_Bound,
    },
  ],
  mm10: [
    {
      href: Config.Downloads.MousePromoters,
      label: "Promoter-like (PLS) (27,332)",
      bordercolor: PLS,
    },
    {
      href: Config.Downloads.MouseEnhancers,
      label: "All Candidate Enhancers (pELS & dELS) (512,001)",
      bordercolor: ELS,
    },
    {
      href: Config.Downloads.MouseProximalEnhancers,
      label: "Proximal enhancer-like (pELS) (111,218)",
      bordercolor: pELS,
    },
    {
      href: Config.Downloads.MouseDistalEnhancers,
      label: "Distal enhancer-like (dELS) (400,783)",
      bordercolor: dELS,
    },
    {
      href: Config.Downloads.MouseCA_CTCF,
      label: "Chromatin Accessible with CTCF (CA-CTCF) (45,933)",
      bordercolor: CA_CTCF,
    },
    {
      href: Config.Downloads.MouseCA_H3K4me3,
      label: "Chromatin Accessible with H3K4me3 (CA-H3K4me3) (23,832)",
      bordercolor: CA_H3K4me3,
    },
    {
      href: Config.Downloads.MouseCA_TF,
      label: "Chromatin Accessible with TF (CA-TF) (10,707)",
      bordercolor: CA_TF,
    },
    {
      href: Config.Downloads.MouseCA_only,
      label: "Chromatin Accessible Only (CA) (291,800)",
      bordercolor: CA_only,
    },
    {
      href: Config.Downloads.MouseTF_only,
      label: "TF Only (TF) (15,283)",
      bordercolor: TF_only,
    },
    {
      href: Config.Downloads.MouseCA_Bound,
      label: "CTCF-Bound cCREs (139,894)",
      bordercolor: CTCF_Bound,
    },
  ],
};

interface NewAnnotationsByClassProps {
  assembly: Assembly;
}

const NewAnnotationsByClass: React.FC<NewAnnotationsByClassProps> = ({ assembly }) => {
  return (
    <Stack gap={1}>
      <Typography variant="subtitle1" fontWeight={600}>
        cCREs by Class (.bed)
      </Typography>
      <Divider />
      {classDownloads[assembly].map((item) => (
        <InlineDownloadButton key={item.label} {...item} />
      ))}
    </Stack>
  );
};

export default NewAnnotationsByClass;
