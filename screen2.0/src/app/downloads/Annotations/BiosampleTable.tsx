import React from "react";
import { DataGridPro, GridColDef } from '@mui/x-data-grid-pro';
import { TreeViewBaseItem } from '@mui/x-tree-view/models';

interface BiosampleTableProps {
  items: TreeViewBaseItem[];
}

const columns: GridColDef[] = [
  {
    field: 'label',
    headerName: 'Label',
    flex: 1,
    minWidth: 150,
  },
];

const BiosampleTable: React.FC<BiosampleTableProps> = ({ items }) => {
  // DataGridPro expects each row to have a unique 'id' property
  const rows = items.map(item => ({ id: item.id, label: item.label }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <DataGridPro
        rows={rows}
        columns={columns}
        hideFooter
        disableColumnMenu
        disableColumnSelector
        disableRowSelectionOnClick
      />
    </div>
  );
};

export default BiosampleTable;
