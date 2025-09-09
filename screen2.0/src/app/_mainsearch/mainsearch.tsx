"use client"
import React, { useState } from "react"
import { Stack, InputBaseProps, Typography, Box, IconButton } from "@mui/material"
import MenuItem from "@mui/material/MenuItem"
import FormControl from "@mui/material/FormControl"
import Select, { SelectChangeEvent } from "@mui/material/Select"
import BedUpload from "./bedupload"
import AutoComplete from "./Autocomplete"
import { Search } from "@mui/icons-material"

export type MainSearchProps = InputBaseProps & {
  header?: boolean
}

export const MainSearch: React.FC<MainSearchProps> = (props: MainSearchProps) => {
  const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
  const [selectedSearch, setSelectedSearch] = useState<"entity" | "bed">("entity")

  const handleSearchChange = (event: SelectChangeEvent) => {
    setSelectedSearch(event.target.value as "entity" | "bed")
  }

  const handleAssemblyChange = (event: SelectChangeEvent) => {
    if (event.target.value === "GRCh38" || event.target.value === "mm10") {
      setAssembly(event.target.value);
    }
  };

  return (
    <Stack direction={props.header ? "row" : "column"} spacing={3}>
      <Stack direction={"row"} alignItems={"center"} flexWrap={"wrap"}>
        {!props.header && (
          <Typography variant={"h5"} mr={1} alignSelf="center">
            Search by
          </Typography>
        )}
        <Stack
          direction={"row"}
          alignItems={"center"}
          flexWrap={props.header ? "nowrap" : "wrap"}
        >
          <FormControl variant="standard" size="medium">
            <Select
              fullWidth
              id="select-search"
              value={selectedSearch}
              onChange={handleSearchChange}
              //Manually aligning like this isn't ideal
              SelectDisplayProps={{
                style: { paddingBottom: "0px", paddingTop: "1px" },
              }}
              sx={
                props.header
                  ? {
                      color: "white",
                      "&:before": {
                        borderColor: "white",
                      },
                      "&:after": {
                        borderColor: "white",
                      },
                      "&:not(.Mui-disabled):hover::before": {
                        borderColor: "white",
                      },
                      "& .MuiSvgIcon-root": { color: "white" },
                    }
                  : { fontSize: "1.5rem" }
              }
            >
              <MenuItem value={"entity"}>{`Gene, cCRE,${
                assembly === "GRCh38" ? " Variant," : ""
              } Locus`}</MenuItem>
              <MenuItem value={"bed"}>.BED Intersect</MenuItem>
            </Select>
          </FormControl>
          <Typography
            variant={props.header ? "body1" : "h5"}
            ml={1}
            mr={1}
            alignSelf="center"
          >
            in
          </Typography>
          <FormControl variant="standard" size="medium">
            <Select
              fullWidth
              id="select-search"
              value={assembly}
              onChange={handleAssemblyChange}
              SelectDisplayProps={{
                style: { paddingBottom: "0px", paddingTop: "1px" },
              }}
              sx={
                props.header
                  ? {
                      color: "white",
                      "&:before": {
                        borderColor: "white",
                      },
                      "&:after": {
                        borderColor: "white",
                      },
                      "&:not(.Mui-disabled):hover::before": {
                        borderColor: "white",
                      },
                      "& .MuiSvgIcon-root": { color: "white" },
                    }
                  : { fontSize: "1.5rem" }
              }
            >
              <MenuItem value={"GRCh38"}>GRCh38</MenuItem>
              <MenuItem value={"mm10"}>mm10</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Stack>
      <Box>
        {selectedSearch === "entity" ? (
          <AutoComplete
            style={{ width: 400 }}
            slots={{
              button: (
                <IconButton sx={props.header && { color: "white" }}>
                  <Search />
                </IconButton>
              ),
            }}
            assembly={assembly}
            slotProps={{
              box: { gap: 1 },
              input: {
                size: "small",
                label: `Enter a gene, cCRE${
                  assembly === "GRCh38" ? ", variant" : ""
                } or locus`,
                placeholder: `Enter a gene, cCRE${
                  assembly === "GRCh38" ? ", variant" : ""
                } or locus`,
                sx: props.header && {
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#ffffff",
                    "& fieldset": { border: "none" },
                    "&:hover fieldset": { border: "none" },
                    "&.Mui-focused fieldset": { border: "none" },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#666666",
                    "&.Mui-focused": { color: "#444444" },
                  },
                  "& .MuiInputLabel-shrink": {
                    display: "none",
                  },
                },
              },
            }}
          />
        ) : (
          <BedUpload assembly={assembly} header={props.header} />
        )}
      </Box>
    </Stack>
  );
}
