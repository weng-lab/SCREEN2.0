import React, { useCallback } from "react";
import { Button, IconButton, Grid, Stack, Typography } from "@mui/material";
import { Search } from "@mui/icons-material";
import { GenomeSearch, Result } from "@weng-lab/ui-components";
import { useTheme } from "@mui/material/styles";
import {
  Domain,
  BrowserStoreInstance,
  Cytobands,
} from "@weng-lab/genomebrowser";
import { expandCoordinates } from "../app/search/_gbview/SearchBrowserView";

export interface GBControlsProps {
  browserStore: BrowserStoreInstance;
  assembly: string;
}

interface ShiftButtonProps {
  browserStore: BrowserStoreInstance;
  text: string;
  shift: number;
  domain: Domain;
  onClick: (domain: Domain) => void;
}

interface ZoomButtonProps {
  browserStore: BrowserStoreInstance;
  text: string;
  factor: number;
  domain: Domain;
  onClick: (domain: Domain) => void;
}

const ShiftButton: React.FC<ShiftButtonProps> = ({
  browserStore,
  text,
  shift,
  domain,
}) => {
  const setDomain = browserStore((state) => state.setDomain);
  const handleClick = () => {
    setDomain({
      ...domain,
      start: Math.max(0, Math.floor(domain.start + shift)),
      end: Math.ceil(domain.end + shift),
    });
  };
  return (
    <Button
      variant="outlined"
      sx={{
        minWidth: "0px",
        width: { xs: "100%", sm: "80%" },
        maxWidth: "120px",
        fontSize: "0.8rem",
        padding: "4px 8px",
      }}
      onClick={handleClick}
    >
      {text}
    </Button>
  );
};

const ZoomButton: React.FC<ZoomButtonProps> = ({
  browserStore,
  text,
  factor,
  domain,
}) => {
  const setDomain = browserStore((state) => state.setDomain);

  const handleClick = () => {
    const midPoint = (domain.end + domain.start) / 2.0;
    const width = (domain.end - domain.start) * factor;
    setDomain({
      ...domain,
      start: Math.max(0, Math.floor(midPoint - width / 2)),
      end: Math.ceil(midPoint + width / 2),
    });
  };

  return (
    <Button
      variant="outlined"
      sx={{
        minWidth: "0px",
        width: { xs: "100%", sm: "80%" },
        maxWidth: "120px",
        fontSize: "0.8rem",
        padding: "4px 8px",
      }}
      onClick={handleClick}
    >
      {text}
    </Button>
  );
};

const GBControls: React.FC<GBControlsProps> = ({ assembly, browserStore }) => {
  const domain = browserStore((state) => state.domain);
  const setDomain = browserStore((state) => state.setDomain);

  const theme = useTheme();

  const handleDomainChange = useCallback(
    (newDomain: Domain) => {
      setDomain(newDomain);
    },
    [setDomain]
  );

  const handeSearchSubmit = (r: Result) => {
    setDomain(
      expandCoordinates({
        assembly: assembly as "GRCh38" | "mm10",
        ...r.domain,
      }) as Domain
    );
  };

  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={2}
      sx={{
        padding: "12px 16px",
        width: "100%",
      }}
    >
      {/* Cytoband Section - Centered at top */}
      <svg width={700} height={20}>
        <Cytobands
          assembly={assembly === "GRCh38" ? "hg38" : "mm10"}
          currentDomain={domain}
        />
      </svg>
      
      {/* Control Buttons - Horizontal layout */}
      <Grid
        container
        spacing={3}
        justifyContent="center"
        alignItems="center"
        sx={{ flexWrap: "nowrap" }}
      >
        {/* Move Left Section */}
      <Grid size="auto">
        <Stack direction="column" alignItems="center" spacing={1}>
          <Typography variant="caption" fontWeight="500">
            Move Left
          </Typography>
          <Stack direction="row" spacing={0.25}>
            <ShiftButton
              text="<<<"
              shift={domain.start - domain.end}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
            <ShiftButton
              text="<<"
              shift={(domain.start - domain.end) / 2}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
            <ShiftButton
              text="<"
              shift={(domain.start - domain.end) / 4}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
          </Stack>
        </Stack>
      </Grid>

      {/* Move Right Section */}
      <Grid size="auto">
        <Stack direction="column" alignItems="center" spacing={1}>
          <Typography variant="caption" fontWeight="500">
            Move Right
          </Typography>
          <Stack direction="row" spacing={0.25}>
            <ShiftButton
              text=">"
              shift={(domain.end - domain.start) / 4}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
            <ShiftButton
              text=">>"
              shift={(domain.end - domain.start) / 2}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
            <ShiftButton
              text=">>>"
              shift={domain.end - domain.start}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
          </Stack>
        </Stack>
      </Grid>

      {/* Zoom In Section */}
      <Grid size="auto">
        <Stack direction="column" alignItems="center" spacing={1}>
          <Typography variant="caption" fontWeight="500">
            Zoom In
          </Typography>
          <Stack direction="row" spacing={0.25}>
            <ZoomButton
              text="+1.5x"
              factor={1.0 / 1.5}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
            <ZoomButton
              text="+3x"
              factor={1.0 / 3}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
            <ZoomButton
              text="+10x"
              factor={1.0 / 10}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
          </Stack>
        </Stack>
      </Grid>

      {/* Zoom Out Section */}
      <Grid size="auto">
        <Stack direction="column" alignItems="center" spacing={1}>
          <Typography variant="caption" fontWeight="500">
            Zoom Out
          </Typography>
          <Stack direction="row" spacing={0.25}>
            <ZoomButton
              text="-1.5x"
              factor={1.5}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
            <ZoomButton
              text="-3x"
              factor={3}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
            <ZoomButton
              text="-10x"
              factor={10}
              domain={domain}
              onClick={handleDomainChange}
              browserStore={browserStore}
            />
          </Stack>
        </Stack>
      </Grid>

      {/* Search Section */}
      <Grid size="auto">
        <Stack direction="column" alignItems="center" spacing={1}>
          <Typography
            variant="caption"
            fontWeight="500"
            sx={{ visibility: "hidden" }}
          >
            Search
          </Typography>
          <GenomeSearch
            size="small"
            assembly={assembly as "GRCh38" | "mm10"}
            onSearchSubmit={handeSearchSubmit}
            queries={["Gene", "SNP", "cCRE", "Coordinate"]}
            geneLimit={3}
            sx={{ width: "400px" }}
            slots={{
              button: (
                <IconButton sx={{ color: theme.palette.primary.main }}>
                  <Search />
                </IconButton>
              ),
            }}
            slotProps={{
              input: {
                label: "Change browser region",
                sx: {
                  backgroundColor: "white",
                  "& label.Mui-focused": {
                    color: theme.palette.primary.main,
                  },
                  "& .MuiOutlinedInput-root": {
                    "&.Mui-focused fieldset": {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                },
              },
            }}
          />
        </Stack>
      </Grid>
      </Grid>
    </Stack>
  );
};

export default GBControls;
