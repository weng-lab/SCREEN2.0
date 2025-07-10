import { DataTable } from "psychscreen-legacy-components";
import Grid from "@mui/material/Grid2";

export default function ChromHMMTable({
  data,
}: {
  data: {
    start: number;
    end: number;
    name: string;
    chr: string;
    color: string;
    tissue: string;
    biosample: string;
  }[];
}) {
  return (
    <Grid
      size={{
        xs: 12,
        lg: 12,
      }}
    >
      <DataTable
        tableTitle={`ChromHMM states`}
        columns={[
          {
            header: "Tissue",
            HeaderRender: () => <b>Tissue</b>,
            value: (row) => row.tissue,
          },
          {
            header: "Biosample",
            HeaderRender: () => <b>Biosample</b>,
            value: (row) => row.biosample,
          },
          {
            header: "State",
            HeaderRender: () => <b>States</b>,
            value: (row) => row.name,
            render: (row) => <b style={{ color: row.color }}>{row.name}</b>,
          },
          {
            header: "Chromosome",
            HeaderRender: () => <b>Chromosome</b>,
            value: (row) => row.chr,
          },
          {
            header: "Start",
            HeaderRender: () => <b>Start</b>,
            value: (row) => row.start,
          },
          {
            header: "End",
            HeaderRender: () => <b>End</b>,
            value: (row) => row.end,
          },
        ]}
        rows={data || []}
        sortColumn={0}
        sortDescending
        itemsPerPage={10}
      />
    </Grid>
  );
}
