import React from "react";
import BiosampleTables from "../../_biosampleTables/BiosampleTables";
import { Assembly } from "./NewAnnotationsHeader";
import DownloadContentLayout from "./DownloadContentLayout";

interface NewAnnotationsByCelltypeProps {
  assembly: Assembly;
}

const NewAnnotationsByCelltype: React.FC<NewAnnotationsByCelltypeProps> = ({ assembly }) => {
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

export default NewAnnotationsByCelltype;
