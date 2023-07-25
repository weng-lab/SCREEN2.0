import {
  Typography,
  Button,
  Stack,
  OutlinedInput,
  InputAdornment,
  IconButton
} from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Downloads from "./page";
import Config from "../../config.json"

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
}

export function QuickStart(props: TabPanelProps) {
  const { children, value, ...other } = props;

  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${0}`}
      aria-labelledby={`simple-tab-${0}`}
      {...other}
    >
      {value === 0 &&
        <Grid2 container spacing={2}>
          <Grid2 xs={6}>
            <Stack spacing={2}>
              <Typography>Human</Typography>
              <Button href={Config.Downloads.HumanCCREs} variant="contained" color="primary">Download All Human cCREs (hg38)</Button>
              <Button href={Config.Downloads.HumanPromoters} variant="contained" color="primary">Download Human Candidate Promoters (hg38)</Button>
              <OutlinedInput
                startAdornment={<InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={null}
                    onMouseDown={null}
                    edge="start"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>}
              />
              <Button href={Config.Downloads.HumanEnhancers} variant="contained" color="primary">Download Human Candidate Enhancers (hg38)</Button>
              <OutlinedInput
                startAdornment={<InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={null}
                    onMouseDown={null}
                    edge="start"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>}
              />
              <Button href="https://downloads.wenglab.org/Registry-V4/GRCh38-CTCF.bed" variant="contained" color="primary">Download Human CTCF-Bound cCREs (hg38)</Button>
              <OutlinedInput
                startAdornment={<InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={null}
                    onMouseDown={null}
                    edge="start"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>}
              />
              <Button href={Config.Downloads.HumanGeneLinks} variant="contained" color="primary">Download Human cCRE-Gene Links (hg38)</Button>
            </Stack>
          </Grid2>
          <Grid2 xs={6}>
          <Stack spacing={2}>
              <Typography>Mouse</Typography>
              <Button href={Config.Downloads.MouseCCREs} variant="contained" color="primary">Download All Mouse cCREs (hg38)</Button>
              <Button href={Config.Downloads.MousePromoters} variant="contained" color="primary">Download Mouse Candidate Promoters (hg38)</Button>
              <OutlinedInput
                startAdornment={<InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={null}
                    onMouseDown={null}
                    edge="start"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>}
              />
              <Button href={Config.Downloads.MouseEnhancers} variant="contained" color="primary">Download Mouse Candidate Enhancers (hg38)</Button>
              <OutlinedInput
                startAdornment={<InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={null}
                    onMouseDown={null}
                    edge="start"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>}
              />
              <Button href={Config.Downloads.MouseCTCF} variant="contained" color="primary">Download Mouse CTCF-Bound cCREs (hg38)</Button>
              <OutlinedInput
                startAdornment={<InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={null}
                    onMouseDown={null}
                    edge="start"
                  >
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>}
              />
            </Stack>
          </Grid2>
        </Grid2>
      }
    </div>
  );
}