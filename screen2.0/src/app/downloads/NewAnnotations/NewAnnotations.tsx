import { TabContext, TabPanel } from "@mui/lab";
import { Stack } from "@mui/material";
import React, { useState } from "react";
import NewAnnotationsTabs, { TabValue } from "./NewAnnotationsTabs";
import NewAnnotationsHeader from "./NewAnnotationsHeader";
import NewAnnotationsByClass from "./NewAnnotationsByClass";
import { encodeTabValue } from "./NewAnnotationsUtils";
import NewAnnotationsGeneLinks from "./NewAnnotationsGeneLinks";
import NewAnnotationsByCelltype from "./NewAnnotationsByCelltype";

const NewAnnotations = () => {
  const [selectedTab, setSelectedTab] = useState<TabValue>({
    assembly: "GRCh38",
    value: "byClass",
  });

  const Content = ({selectedTab} : {selectedTab: TabValue}) => {
    switch (selectedTab.value) {
      case("byClass"): return <NewAnnotationsByClass assembly={selectedTab.assembly} />
      case("byCelltype"): return <NewAnnotationsByCelltype assembly={selectedTab.assembly} />
      case("geneLinks"): return <NewAnnotationsGeneLinks />
    }
  }

  return (
    <TabContext value={encodeTabValue(selectedTab)}>
      <Stack direction={{ xs: "column", md: "row" }} gap={2}>
        <NewAnnotationsTabs onTabChange={setSelectedTab} />
        <Stack flexGrow={1} gap={2}>
          <NewAnnotationsHeader assembly={selectedTab.assembly} />
          <TabPanel value={encodeTabValue(selectedTab)} sx={{ p: 0 }}>
            <Content selectedTab={selectedTab} />
          </TabPanel>
        </Stack>
      </Stack>
    </TabContext>
  );
};

export default NewAnnotations;
