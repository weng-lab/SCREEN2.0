import React, { useState, useMemo, useCallback } from "react";
import { Button, TextField, IconButton } from "@mui/material";
import { Search } from "@mui/icons-material";
import { Domain } from "@weng-lab/genomebrowser";
import { BrowserStoreInstance } from "@weng-lab/genomebrowser/dist/store/browserStore";

export interface GBControlsProps {
  browserStore: BrowserStoreInstance;
  assembly: "GRCh38" | "mm10";
  onDomainChanged?: (domain: Domain) => void;
  style?: React.CSSProperties;
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

const SearchInput: React.FC<{
  placeholder: string;
  onSearch: (region: string) => void;
}> = ({ placeholder, onSearch }) => {
  const [searchValue, setSearchValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      onSearch(searchValue.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", alignItems: "center" }}
    >
      <TextField
        variant="outlined"
        id="region-input"
        label="Enter a genomic region"
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
        slotProps={{
          inputLabel: {
            shrink: true,
            htmlFor: "region-input",
            style: {
              color: "#000F9F",
              fontSize: "0.8rem",
            },
          },
          input: {
            style: {
              color: "#000F9F",
              fontSize: "0.8rem",
            },
          },
        }}
        sx={{
          mr: "0.5rem",
          minWidth: "14rem",
          maxWidth: "250px",
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: "#000F9F",
          },
          mb: "5px",
        }}
        size="small"
      />
      <IconButton
        type="submit"
        sx={{
          color: "black",
          maxHeight: "100%",
          padding: "4px",
        }}
      >
        <Search fontSize="small" />
      </IconButton>
    </form>
  );
};

const GBControls: React.FC<GBControlsProps> = ({
  browserStore,
  onDomainChanged,
  style,
}) => {
  const domain = browserStore((state) => state.domain);
  const updateDomain = browserStore((state) => state.setDomain);

  const handleDomainChange = useCallback(
    (newDomain: Domain) => {
      updateDomain(newDomain);
      if (onDomainChanged) {
        onDomainChanged(newDomain);
      }
    },
    [updateDomain, onDomainChanged]
  );

  const handleSearch = useCallback(
    (region: string) => {
      // Parse genomic region format like "chr1:1000-2000"
      const match = region.match(/^(.+?):(\d+)-(\d+)$/);
      if (match) {
        const [, chromosome, start, end] = match;
        const newDomain = {
          chromosome: chromosome.startsWith("chr")
            ? chromosome
            : `chr${chromosome}`,
          start: parseInt(start, 10),
          end: parseInt(end, 10),
        };
        handleDomainChange(newDomain as Domain);
      }
    },
    [handleDomainChange]
  );

  const currentRegionString = useMemo(
    () =>
      domain.chromosome
        ? `${
            domain.chromosome
          }:${domain.start.toLocaleString()}-${domain.end.toLocaleString()}`
        : `${domain.start.toLocaleString()}-${domain.end.toLocaleString()}`,
    [domain.chromosome, domain.start, domain.end]
  );

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
        ...style,
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
        <SearchInput
          placeholder={currentRegionString}
          onSearch={handleSearch}
        />
      </div>
    </div>
  );
};

export default GBControls;
