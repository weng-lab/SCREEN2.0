import React, { useCallback } from "react";
import { Button, IconButton } from "@mui/material";
import { Search } from "@mui/icons-material";
import { GenomeSearch, Result } from "@weng-lab/ui-components";
import { useTheme } from "@mui/material/styles";
import { Domain, BrowserStoreInstance } from "@weng-lab/genomebrowser";
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
    setDomain(expandCoordinates({ assembly: "GRCh38", ...r.domain }) as Domain);
  };

  return (
    <div
      style={{
        padding: "12px 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        gap: "24px",
        flexWrap: "nowrap",
      }}
    >
      {/* Move Left Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{ fontSize: "0.8rem", marginBottom: "4px", fontWeight: "500" }}
        >
          Move Left
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
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
        </div>
      </div>

      {/* Move Right Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{ fontSize: "0.8rem", marginBottom: "4px", fontWeight: "500" }}
        >
          Move Right
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
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
        </div>
      </div>

      {/* Zoom In Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{ fontSize: "0.8rem", marginBottom: "4px", fontWeight: "500" }}
        >
          Zoom In
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
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
        </div>
      </div>

      {/* Zoom Out Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{ fontSize: "0.8rem", marginBottom: "4px", fontWeight: "500" }}
        >
          Zoom Out
        </div>
        <div style={{ display: "flex", gap: "2px" }}>
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
        </div>
      </div>

      {/* Search Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: "0.8rem",
            marginBottom: "4px",
            fontWeight: "500",
            visibility: "hidden",
          }}
        >
          Search
        </div>
        <GenomeSearch
          size="small"
          assembly="GRCh38"
          onSearchSubmit={handeSearchSubmit}
          queries={["Gene", "SNP", "iCRE", "Coordinate"]}
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
      </div>
    </div>
  );
};

export default GBControls;
