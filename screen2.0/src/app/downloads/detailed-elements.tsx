import { Typography } from "@mui/material";
import { Box } from "@mui/system";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
}

export function DetailedElements(props: TabPanelProps) {
  const { children, value, ...other } = props;

  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${1}`}
      aria-labelledby={`simple-tab-${1}`}
      {...other}
    >
      {value === 1 &&
        <Box sx={{ p: 3 }}>
          <Typography>Detailed Elements</Typography>
        </Box>
      }
    </div>
  );
}