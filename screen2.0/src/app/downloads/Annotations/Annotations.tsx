import { Stack, styled } from "@mui/material";
import React, { useState } from "react";
import AnnotationsHeader from "./Header";
import AnnotationsByClass from "./AnnotationsByClass";
import AnnotationsGeneLinks from "./AnnotationsCcreGeneLinks";
import AnnotationsByCelltype from "./AnnotationsByCelltype";
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView';
import { TreeItem, TreeItemProps } from "@mui/x-tree-view";

const StyledTreeItem = styled(TreeItem)<TreeItemProps>(({ theme }) => ({
  '& .MuiTreeItem-label': {
    fontSize: '14px',
  },
  //no space after '&' applies selector to root element
  '&.tree-category > .MuiTreeItem-content .MuiTreeItem-label': {
    fontSize: '16px',
    fontWeight: 600,
  },
  '& .Mui-selected': {
    color: theme.palette.primary.main,
    fontWeight: 900
  }
}));

export type Assembly = "GRCh38" | "mm10";


const Annotations = () => {
  const [selectedTab, setSelectedTab] = useState<string>("GRCh38/byClass");
  const [assembly, tab]  = selectedTab.split('/') as [Assembly, string]

  const Content = () => {
    switch (tab) {
      case("byClass"): return <AnnotationsByClass assembly={assembly} />
      case("byCelltype"): return <AnnotationsByCelltype assembly={assembly} />
      case("geneLinks"): return <AnnotationsGeneLinks />
    }
  }

  return (
    <Stack direction={{ xs: "column", md: "row" }} gap={4}>
      <SimpleTreeView
        multiSelect={false}
        selectedItems={selectedTab}
        // disable selecting human and mouse, they do not have the '/'
        onSelectedItemsChange={(_, id) =>
          id.includes("/") && setSelectedTab(id)
        }
        defaultExpandedItems={["human", "mouse"]}
      >
        <StyledTreeItem
          className="tree-category"
          itemId="human"
          label="Human"
        >
          <StyledTreeItem itemId="GRCh38/byClass" label={"By Class"} />
          <StyledTreeItem
            itemId="GRCh38/byCelltype"
            label="By Cell and Tissue Type"
          />
          <StyledTreeItem itemId="GRCh38/geneLinks" label="cCRE-Gene Links" />
        </StyledTreeItem>
        <StyledTreeItem
          className="tree-category"
          itemId="mouse"
          label="Mouse"
        >
          <StyledTreeItem itemId="mm10/byClass" label="By Class" />
          <StyledTreeItem itemId="mm10/byCelltype" label="By Cell and Tissue Type" />
        </StyledTreeItem>
      </SimpleTreeView>
      <Stack flexGrow={1} gap={2}>
        <AnnotationsHeader assembly={assembly} />
        <Content />
      </Stack>
    </Stack>
  );
};

export default Annotations;
