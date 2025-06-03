import React from "react";
import { Divider, Stack, Typography } from "@mui/material";
import BiosampleTables from "../../_biosampleTables/BiosampleTables";
import { Assembly } from "./NewAnnotationsHeader";

interface NewAnnotationsByCelltypeProps {
  assembly: Assembly;
}

const NewAnnotationsByCelltype: React.FC<NewAnnotationsByCelltypeProps> = ({ assembly }) => {
  return (
    <Stack gap={1}>
      <Typography variant="subtitle1" fontWeight={600}>
        cCREs by Cell and Tissue Type
      </Typography>
      <Divider />
      <BiosampleTables
        assembly={assembly}
        showDownloads
        slotProps={{
          paperStack: { overflow: 'hidden', flexGrow: 1, height: 'auto' }
        }}
      />
    </Stack>
  );
};

export default NewAnnotationsByCelltype;
