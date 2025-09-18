"use client";
import React, { useMemo, useRef, useState } from "react";
import {
  Stack,
  InputBaseProps,
  IconButton,
  Menu,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import BedUpload from "./bedupload";
import AutoComplete from "./Autocomplete";
import { ArrowDropDown, ExpandMore, KeyboardArrowRight, Search } from "@mui/icons-material";
import HumanIcon from "../_utility/humanIcon";
import MouseIcon from "../_utility/mouseIcon";
import { Result } from "@weng-lab/ui-components";

export type MainSearchProps = InputBaseProps & {
  header?: boolean;
};

export const MainSearch: React.FC<MainSearchProps> = (
  props: MainSearchProps
) => {
  const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38");
  const [iconMenuAnchor, setIconMenuAnchor] =
    React.useState<null | HTMLElement>(null);
  const dropdownRef = useRef<HTMLButtonElement | null>(null);


  const handleIconMenuOpen = () => {
    if (dropdownRef.current) {
      setIconMenuAnchor(dropdownRef.current);
    }
  };

  const handleIconMenuClose = () => {
    setIconMenuAnchor(null);
  };

  const handleIconSelect = (icon: "GRCh38" | "mm10") => {
    setAssembly(icon);
    handleIconMenuClose();
  };

  const defaultResults: Result[] = useMemo(() => {
    if (assembly === "GRCh38") {
      return [
        {
          title: "chr19:44,905,754-44,909,393",
          domain: {
            chromosome: "chr19",
            start: 44905754,
            end: 44909393,
          },
          description: "chr19:44,905,754-44,909,393",
          type: "Coordinate",
        },
        {
          title: "SP1",
          description:
            "Sp1 Transcription Factor\nENSG00000185591.10\nchr12:53380176-53416446",
          domain: {
            chromosome: "chr12",
            start: 53380176,
            end: 53416446,
          },
          type: "Gene",
        },
        {
          title: "EH38E3314260",
          description: "chr19:50417519-50417853",
          domain: {
            chromosome: "chr19",
            start: 50417519,
            end: 50417853,
          },
          type: "cCRE",
        },
        {
          title: "rs9466027",
          description: "chr6:21298226-21298227",
          domain: {
            chromosome: "chr6",
            start: 21298226,
            end: 21298227,
          },
          type: "SNP",
        },
      ];
    } else return [
      {
        title: "chr7:19,696,109-19,699,188",
        domain: {
          chromosome: "chr7",
          start: 19696109,
          end: 19699188,
        },
        description: "chr7:19,696,109-19,699,188",
        type: "Coordinate",
      },
      {
        title: "Sp1",
        description:
          "Sp1 Transcription Factor\nENSMUSG00000001280.13\nchr15:102406143-102436404",
        domain: {
          chromosome: "chr15",
          start: 102406143,
          end: 102436404,
        },
        type: "Gene",
      },
      {
        title: "EM10E1179536",
        description: "chr7:19698911-19699257",
        domain: {
          chromosome: "chr7",
          start: 19698911,
          end: 19699257,
        },
        type: "cCRE",
      },
    ];
  }, [assembly]);

  return (
    <Stack
      direction={props.header ? "row" : "column"}
      spacing={1}
      alignItems={props.header ? "center" : "flex-start"}
    >
      {props.header ? (
        <IconButton
          ref={dropdownRef}
          onClick={handleIconMenuOpen}
          size="small"
          sx={{ color: props.header ? "white" : "black" }}
          aria-controls={iconMenuAnchor ? "icon-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={iconMenuAnchor ? "true" : undefined}
          edge="start"
        >
          {assembly === "GRCh38" ? (
            <HumanIcon color={props.header ? "white" : "black"} size={40} />
          ) : (
            <MouseIcon color={props.header ? "white" : "black"} size={40} />
          )}
          <ArrowDropDown />
        </IconButton>
      ) : (
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">
            Search in
          </FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            defaultValue="GRCh38"
            name="radio-buttons-group"
            row
            value={assembly}
            onChange={(_, value) => setAssembly(value as "GRCh38" | "mm10")}
          >
            <FormControlLabel
              value="GRCh38"
              control={<Radio />}
              label="Human"
            />
            <FormControlLabel value="mm10" control={<Radio />} label="Mouse" />
          </RadioGroup>
        </FormControl>
      )}
      <AutoComplete
        sx={{ width: 400 }}
        slots={{
          button: (
            <IconButton sx={props.header && { color: "white" }}>
              <Search />
            </IconButton>
          ),
        }}
        defaultResults={defaultResults}
        assembly={assembly}
        slotProps={{
          box: { gap: 1 },
          input: {
            size: props.header ? "small" : "medium",
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
      {!props.header && (
        <div>
          <Accordion elevation={0} disableGutters>
            <AccordionSummary
              expandIcon={<KeyboardArrowRight />}
              sx={{
                paddingX: 0,
                flexDirection: "row-reverse",
                "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                  transform: "rotate(90deg)",
                },
              }}
            >
              <Typography variant="caption">Intersect cCREs by .bed</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <BedUpload assembly={assembly} header={props.header} />
            </AccordionDetails>
          </Accordion>
        </div>
      )}
      <Menu
        id="icon-menu"
        anchorEl={iconMenuAnchor}
        open={Boolean(iconMenuAnchor)}
        onClose={handleIconMenuClose}
        slotProps={{ paper: { sx: { minWidth: 120, mt: 1 } } }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        <MenuItem
          selected={assembly === "GRCh38"}
          onClick={() => handleIconSelect("GRCh38")}
        >
          Human
        </MenuItem>
        <MenuItem
          selected={assembly === "mm10"}
          onClick={() => handleIconSelect("mm10")}
        >
          Mouse
        </MenuItem>
      </Menu>
    </Stack>
  );
};
