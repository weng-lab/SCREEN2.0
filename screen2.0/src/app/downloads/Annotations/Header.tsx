import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import Config from "../../../config.json"
import { Assembly } from "./Annotations";


const ASSEMBLY_CONFIG = {
  GRCh38: {
    img: "/Transparent_HumanIcon.png",
    title: "Human (GRCh38/hg38)",
    subtitle: "2,348,854 cCREs • 1,888 cell types",
    downloadUrl: Config.Downloads.HumanCCREs,
    buttonLabel: "All Human cCREs (129.1 MB)",
  },
  mm10: {
    img: "/Transparent_MouseIcon.png",
    title: "Mouse (GRCm38/mm10)",
    subtitle: "926,843 cCREs • 366 cell types",
    downloadUrl: Config.Downloads.MouseCCREs,
    buttonLabel: "All Mouse cCREs (50.6 MB)",
  },
} as const;

type AnnotationsHeaderProps = {
  assembly: Assembly;
};

const AnnotationsHeader: React.FC<AnnotationsHeaderProps> = ({ assembly }) => {
  const config = ASSEMBLY_CONFIG[assembly];

  return (
    <Stack direction={"row"} border={(theme) => `1px solid ${theme.palette.divider}`} borderRadius={2} flexWrap={"wrap"} display="flex" alignItems="center" gap={2} p={1}>
      <Box
        component="img"
        src={config.img}
        alt={config.title}
        sx={{ width: 72, height: 72 }}
      />
      <Stack flexGrow={1} spacing={0.5} minWidth={0}>
        <Typography variant="subtitle1" fontWeight={600} noWrap>{config.title}</Typography>
        <Typography variant="body2" color="text.secondary" noWrap>{config.subtitle}</Typography>
      </Stack>
      <Button
        variant="contained"
        color="primary"
        href={config.downloadUrl}
        endIcon={<DownloadIcon />}
        download
        sx={{ whiteSpace: 'nowrap' }}
      >
        {config.buttonLabel}
      </Button>
    </Stack>
  );
};

export default AnnotationsHeader;
