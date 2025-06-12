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
        assembly={assembly}
        showDownloads
        slotProps={{
          paperStack: { overflow: "hidden", flexGrow: 1, height: "auto" },
        }}
      />
    </DownloadContentLayout>
  );
};

export default AnnotationsByCelltype;
