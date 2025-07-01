import React from "react";
import BiosampleTables from "../../_biosampleTables/BiosampleTables";
import DownloadContentLayout from "./DownloadContentLayout";
import { Assembly } from "./Annotations";

interface NewAnnotationsByCelltypeProps {
  assembly: Assembly;
}

const AnnotationsByCelltype: React.FC<NewAnnotationsByCelltypeProps> = ({
  assembly,
}) => {
  return (
    <DownloadContentLayout title="cCREs by Cell and Tissue Type">
      <BiosampleTables
        assembly={assembly as "GRCh38" | "mm10"}
        showDownloads
        slotProps={{
          paperStack: { overflow: "auto", flexGrow: 1, height:'auto' },
        }}
      />
    </DownloadContentLayout>
  );
};

export default AnnotationsByCelltype;
