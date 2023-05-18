// Search Results Page

'use client'
import { Typography } from "@mui/material"

import { DataTable, DataTableColumn, DataTableProps } from "@weng-lab/psychscreen-ui-components"
import { Slider } from "@mui/material"

type Row = {
  index: number;
  text: string;
  color: string;
  description: string;
};

const COLUMNS: DataTableColumn<Row>[] = [{
  header: "Index",
  value: row => row.index
},{
  header: "Text",
  value: row => row.text
}, {
  header: "Color",
  value: row => row.color,
  render: (row: Row) => <div style={{ width: "100%", height: "100%", backgroundColor: row.color }}>&nbsp;</div>
},
{
header: "Description",
value: row => row.description
}];

const ROWS = [
  { index: 0, text: "this is row 0", color: "#ff0000", description: "this is row 0"},
  { index: 1, text: "this is row 1", color: "#dd0000", description: "this is row 1" },
  { index: 2, text: "this is row 2", color: "#bb0000", description: "this is row 2" },
  { index: 3, text: "this is row 3", color: "#990000", description: "this is row 3" },
  { index: 4, text: "this is row 4", color: "#770000", description: "this is row 4" },
  { index: 5, text: "this is row 5", color: "#550000", description: "this is row 5" },
  { index: 6, text: "this is row 6", color: "#330000", description: "this is row 6" },
  { index: 7, text: "this is row 7", color: "#110000", description: "this is row 7" }
];

export default function Search() {
    return (
      <main>
        <Typography>
            This is the search results page
        </Typography>
        <DataTable columns={COLUMNS} rows={ROWS} tableTitle="Search Results"/>
        {/* Is this throwing an error because the state of the columns are undefined. Does the typing need to prevent passing an empty column here */}
      </main>
    )
  }