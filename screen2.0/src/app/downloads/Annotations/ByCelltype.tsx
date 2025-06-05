import React, { Children } from "react";
import BiosampleTables from "../../_biosampleTables/BiosampleTables";
import DownloadContentLayout from "./DownloadContentLayout";
import { Assembly } from "./Annotations";
import {
  TreeViewBaseItem,
  TreeViewDefaultItemModelProperties,
} from "@mui/x-tree-view/models";
import {
  RichTreeView,
  TreeItemCheckbox,
  TreeItemContent,
  TreeItemDragAndDropOverlay,
  TreeItemGroupTransition,
  TreeItemIcon,
  TreeItemIconContainer,
  TreeItemLabel,
  TreeItemProvider,
  TreeItemRoot,
  useTreeItem,
  useTreeItemModel,
  UseTreeItemParameters,
} from "@mui/x-tree-view";
import { Typography } from "@mui/material";

interface NewAnnotationsByCelltypeProps {
  assembly: Assembly;
}

type TreeItemWithChildren = TreeViewDefaultItemModelProperties & {
  //This will definitely need to change based on how the data is packaged.
  downloadType: "single" | "multi";
  children: TreeItem[];
};

type TreeItemNoChildren = TreeViewBaseItem & {
  children?: undefined;
  downloadType?: never;
};

type TreeItem = TreeItemWithChildren | TreeItemNoChildren;

const ITEMS: TreeItem[] = [
  {
    id: "heart",
    label: "Heart",
    downloadType: "multi",
    children: [
      {
        id: "adult",
        label: "Adult",
        downloadType: "single",
        children: [
          {
            id: "heart_left_ventricle",
            label: "heart left ventricle",
            downloadType: "single",
            children: [
              {
                id: "sample_biosample1",
                label: "Sample Biosample 1",
              },
              {
                id: "sample_biosample2",
                label: "Sample Biosample 2",
              },
            ],
          },
          {
            id: "sample_biosample3",
            label: "Sample Biosample 3",
          },
        ],
      },
    ],
  },
];

interface CustomTreeItemProps
  extends Omit<UseTreeItemParameters, "rootRef">,
    Omit<React.HTMLAttributes<HTMLLIElement>, "onFocus"> {}

const CustomTreeItem = React.forwardRef(function CustomTreeItem(
  props: CustomTreeItemProps,
  ref: React.Ref<HTMLLIElement>
) {
  const { id, itemId, label, disabled, children, ...other } = props;

  /**
   * This level of customization is probably not needed
   */

  const {
    getContextProviderProps,
    getRootProps,
    getContentProps,
    getIconContainerProps,
    getCheckboxProps,
    getLabelProps,
    getGroupTransitionProps,
    getDragAndDropOverlayProps,
    status,
  } = useTreeItem({ id, itemId, children, label, disabled, rootRef: ref });

  const item = useTreeItemModel(itemId);
  const tableItems = item.children?.filter(x => !x.children)
  console.log(item.label)
  console.log(tableItems)

  const shouldRenderTable = tableItems?.length > 0

  const {children: transitionChildren, ...rest} = getGroupTransitionProps()

  return (
    <TreeItemProvider {...getContextProviderProps()}>
      <TreeItemRoot {...getRootProps(other)}>
        <TreeItemContent {...getContentProps()}>
          <TreeItemIconContainer {...getIconContainerProps()}>
            <TreeItemIcon status={status} />
          </TreeItemIconContainer>
          <TreeItemCheckbox {...getCheckboxProps()} />
          {/* The label should only appear if the item has children (and thus can be expanded) */}
          <TreeItemLabel {...getLabelProps()} />
          <TreeItemDragAndDropOverlay {...getDragAndDropOverlayProps()} />
        </TreeItemContent>
        {/* This is the children of the item */}
        {children && (
          <TreeItemGroupTransition {...rest}>
            {transitionChildren}
            {shouldRenderTable && <Typography>These will be in table</Typography>}
            {tableItems?.map((x) => (
              <Typography>{x.label}</Typography>
            ))}
          </TreeItemGroupTransition>
        )}
      </TreeItemRoot>
    </TreeItemProvider>
  );
});

//The parent needs to override the rendering of it's children

//We need access to the node's children.
//For each child:
//If the child has children of it's own, render an element normally with the download button. Remove from list
//Take rest of childless children, and put into a table

//To get an item's children: https://mui.com/x/react-tree-view/rich-tree-view/items/#get-an-items-children-by-id
//Need to use apiRef, and call method on that to recieve

const AnnotationsByCelltype: React.FC<NewAnnotationsByCelltypeProps> = ({
  assembly,
}) => {
  return (
    <DownloadContentLayout title="cCREs by Cell and Tissue Type">
      <RichTreeView
        items={ITEMS}
        disableSelection
        slots={{ item: CustomTreeItem }}
      />
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
