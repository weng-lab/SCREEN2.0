import {
  Typography,
  Button,
  Stack,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Autocomplete,
  TextField
} from "@mui/material";

import SearchIcon from '@mui/icons-material/Search';

import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Downloads from "./page";
import Config from "../../config.json"
import { useMemo, useState } from "react";

import { Biosample } from "../search/types";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  biosamples: any;
}

export function QuickStart(props: TabPanelProps) {
  const biosamples = props.biosamples.data

  const [hPromoterSelected, setHPromoterSelected] = useState<Biosample | null>(null)
  const [hEnhancerSelected, setHEnhancerSelected] = useState<Biosample | null>(null)
  const [hCTCFSelected, setHCTCFSelected] = useState<Biosample | null>(null)
  const [mPromoterSelected, setMPromoterSelected] = useState<Biosample | null>(null)
  const [mEnhancerSelected, setMEnhancerSelected] = useState<Biosample | null>(null)
  const [mCTCFSelected, setMCTCFSelected] = useState<Biosample | null>(null)

  const humanPromoters: Biosample[] = useMemo(() => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x) => x.h3k4me3 !== null), [biosamples])
  const humanEnhancers: Biosample[] = useMemo(() => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x) => x.h3k27ac !== null), [biosamples])
  const humanCTCF: Biosample[] = useMemo(() => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x) => x.ctcf !== null), [biosamples])
  const mousePromoters: Biosample[] = useMemo(() => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x) => x.h3k4me3 !== null), [biosamples])
  const mouseEnhancers: Biosample[] = useMemo(() => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x) => x.h3k27ac !== null), [biosamples])
  const mouseCTCF: Biosample[] = useMemo(() => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x) => x.ctcf !== null), [biosamples])

  console.log(biosamples)
  console.log(humanPromoters)

  function generateBiosampleURL(selected: Biosample){
    const r = [selected.dnase_signal, selected.h3k4me3_signal, selected.h3k27ac_signal, selected.ctcf_signal].filter((x) => !!x)
    return `https://downloads.wenglab.org/Registry-V4/${r.join("_")}.bed`
  }

  //So I don't forget, I think that using PascalCase is useful when defining JSX-returning functions since JSX elements are PascalCase
  function ComboBox(options: Biosample[], label: string, mode: "H-promoter" | "H-enhancer" | "H-ctcf" | "M-promoter" | "M-enhancer" | "M-ctcf") {
    return (
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={options}
        sx={{ width: 300 }}
        //This spread is giving a warning. Code comes from MUI. Can't remove it though or doesn't work...
        renderInput={(params) => <TextField {...params} label={label} />}
        //Replace underlines with space using regex. Can the logic be simplified it's kinda gross looking with all the parentheses? If not make separate function
        getOptionLabel={(biosample: Biosample) => biosample.name.replace(/_/g, " ") + " — Exp ID: " + ((((mode === "H-promoter") || (mode === "M-promoter")) && biosample.h3k4me3) || (((mode === "H-enhancer") || (mode === "M-enhancer")) && biosample.h3k27ac) || (((mode === "H-ctcf") || (mode === "M-ctcf")) && biosample.ctcf))}
        blurOnSelect
        onChange={(event, value: any) => {
          switch (mode) {
            case "H-promoter":
              setHPromoterSelected(value)
              break
            case "H-enhancer":
              setHEnhancerSelected(value)
              break
            case "H-ctcf":
              setHCTCFSelected(value)
              break
            case "M-promoter":
              setMPromoterSelected(value)
              break
            case "M-enhancer":
              setMEnhancerSelected(value)
              break
            case "M-ctcf":
              setMCTCFSelected(value)
              break
            default:
              console.log("Something went wrong in quick-start.tsx in ComboBox")
              break
          }

        }}
      />
    );
  }

  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${0}`}
      aria-labelledby={`simple-tab-${0}`}
    >
      {props.value === 0 &&
        <Grid2 container spacing={2}>
          <Grid2 xs={6}>
            <Stack spacing={2}>
              <Typography>Human</Typography>
              <Button href={Config.Downloads.HumanCCREs} variant="contained" color="primary">Download All Human cCREs (hg38)</Button>
              <Button href={Config.Downloads.HumanPromoters} variant="contained" color="primary">Download Human Candidate Promoters (hg38)</Button>
              {ComboBox(humanPromoters, "Search for a Biosample", "H-promoter")}
              {hPromoterSelected && <Button href={generateBiosampleURL(hPromoterSelected)} variant="contained" color="primary">New Link</Button>}
              <Button href={Config.Downloads.HumanEnhancers} variant="contained" color="primary">Download Human Candidate Enhancers (hg38)</Button>
              {ComboBox(humanEnhancers, "Search for a Biosample", "H-enhancer")}
              {hEnhancerSelected && <Button href={generateBiosampleURL(hEnhancerSelected)} variant="contained" color="primary">Download Link</Button>}
              <Button href="https://downloads.wenglab.org/Registry-V4/GRCh38-CTCF.bed" variant="contained" color="primary">Download Human CTCF-Bound cCREs (hg38)</Button>
              {ComboBox(humanCTCF, "Search for a Biosample", "H-ctcf")}
              {hCTCFSelected && <Button href={generateBiosampleURL(hCTCFSelected)} variant="contained" color="primary">Download Link</Button>}
              <Button href={Config.Downloads.HumanGeneLinks} variant="contained" color="primary">Download Human cCRE-Gene Links (hg38)</Button>
            </Stack>
          </Grid2>
          <Grid2 xs={6}>
            <Stack spacing={2}>
              <Typography>Mouse</Typography>
              <Button href={Config.Downloads.MouseCCREs} variant="contained" color="primary">Download All Mouse cCREs (hg38)</Button>
              <Button href={Config.Downloads.MousePromoters} variant="contained" color="primary">Download Mouse Candidate Promoters (hg38)</Button>
              {ComboBox(mousePromoters, "Search for a Biosample", "M-promoter")}
              {mPromoterSelected && <Button href={generateBiosampleURL(mPromoterSelected)} variant="contained" color="primary">New Link</Button>}
              <Button href={Config.Downloads.MouseEnhancers} variant="contained" color="primary">Download Mouse Candidate Enhancers (hg38)</Button>
              {ComboBox(mouseEnhancers, "Search for a Biosample", "M-enhancer")}
              {mEnhancerSelected && <Button href={generateBiosampleURL(mEnhancerSelected)} variant="contained" color="primary">New Link</Button>}
              <Button href={Config.Downloads.MouseCTCF} variant="contained" color="primary">Download Mouse CTCF-Bound cCREs (hg38)</Button>
              {ComboBox(mouseCTCF, "Search for a Biosample", "M-ctcf")}
              {mCTCFSelected && <Button href={generateBiosampleURL(mCTCFSelected)} variant="contained" color="primary">New Link</Button>}
            </Stack>
          </Grid2>
        </Grid2>
      }
    </div>
  );
}