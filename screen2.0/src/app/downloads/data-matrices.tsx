import { Typography } from "@mui/material";
import { Box } from "@mui/system";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  biosamples: any;
}

export function DataMatrices(props: TabPanelProps) {
  const { children, value, ...other } = props;

  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${2}`}
      aria-labelledby={`simple-tab-${2}`}
      {...other}
    >
      {value === 2 &&
        <Box sx={{ p: 3 }}>
          <Typography>Data Matrices</Typography>
        </Box>
      }
    </div>
  );
}