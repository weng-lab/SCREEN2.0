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
import { useEffect, useMemo, useState } from "react";

import { Biosample } from "../search/types";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  biosamples: any;
}

export function QuickStart(props: TabPanelProps) {
  const biosamples = props.biosamples.data

  const humanPromoters: Biosample[] = useMemo(() => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x) => x.h3k4me3 !== null), [biosamples])
  const humanEnhancers: Biosample[] = useMemo(() => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x) => x.h3k27ac !== null), [biosamples])
  const humanCTCF: Biosample[] = useMemo(() => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x) => x.ctcf !== null), [biosamples])
  const mousePromoters: Biosample[] = useMemo(() => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x) => x.h3k4me3 !== null), [biosamples])
  const mouseEnhancers: Biosample[] = useMemo(() => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x) => x.h3k27ac !== null), [biosamples])
  const mouseCTCF: Biosample[] = useMemo(() => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x) => x.ctcf !== null), [biosamples])

  function generateBiosampleURL(selected: Biosample): URL {
    const r = [selected.dnase_signal, selected.h3k4me3_signal, selected.h3k27ac_signal, selected.ctcf_signal].filter((x) => !!x)
    return new URL(`https://downloads.wenglab.org/Registry-V4/${r.join("_")}.bed`)
  }

  //So I don't forget, I think that using PascalCase is useful when defining JSX-returning functions since JSX elements are PascalCase
  function ComboBox(options: Biosample[], label: string, mode: "H-promoter" | "H-enhancer" | "H-ctcf" | "M-promoter" | "M-enhancer" | "M-ctcf"): JSX.Element {
    const [toDownload, setToDownload] = useState<URL | null>(null)
    const [selectedBiosample, setSelectedBiosample] = useState<Biosample | null>(null)

    //Imported from old SCREEN
    function downloadBlob(blob, filename) {
      const url = URL.createObjectURL(blob)
      const downloadLink = document.createElement("a")
      downloadLink.href = url
      downloadLink.download = filename
      document.body.appendChild(downloadLink)
      downloadLink.click()
      document.body.removeChild(downloadLink)
    }

    //Imported from old SCREEN
    function downloadTSV(text, filename) {
      downloadBlob(new Blob([text], { type: "text/plain" }), filename)
    }

    //Not sure if this is necessary. All I want is to prevent this switch case block from being executed for each line of the file
    const stringToMatch: string = useMemo(() => {
      switch (mode) {
        case "H-promoter":
          return "PLS"
        case "M-promoter":
          return "PLS"
        case "H-enhancer":
          return "ELS"
        case "M-enhancer":
          return "ELS"
        case "H-ctcf":
          return "CTCF"
        case "M-ctcf":
          return "CTCF"
      }
    }, [mode]
    )

    useEffect(() => {
      toDownload &&
        fetch(toDownload)
          .then((x) => x.text())
          .then((x) => {
            downloadTSV(
              x
                .split("\n")
                .filter((x) => x.includes(stringToMatch))
                .join("\n"),
              // `${result.name}.${props.title}.bed`
              //Need to customize this file name
              "testPromoter.bed"
            )
            setToDownload(null)
          })
    }, [toDownload])

    return (
      <>
      {/* As an important note, since all the biosample names are getting their underscores removed, you can't search with the original names with the underscores without customizing search function. Maybe we could look into being able to search for a tissue category also or group them */}
        <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={options}
          sx={{ width: 300 }}
          //This spread is giving a warning. Code comes from MUI. Can't remove it though or doesn't work...
          renderInput={(params) => <TextField {...params} label={label} />}
          //Replace underlines with space using regex. Can the logic be simplified it's kinda gross looking with all the parentheses? If not make separate function. Yes! change to the logic used un the button template string
          getOptionLabel={(biosample: Biosample) => biosample.name.replace(/_/g, " ") + " — Exp ID: " + (mode === "H-promoter" || mode === "M-promoter" ? biosample.h3k4me3 : mode === "H-enhancer" || mode === "M-enhancer" ? biosample.h3k27ac : biosample.ctcf)}
          blurOnSelect
          onChange={(event, value: any) => setSelectedBiosample(value)}
        />
        {selectedBiosample &&
          <Button
            sx={{textTransform: "none"}}
            fullWidth
            onClick={() => setToDownload(generateBiosampleURL(selectedBiosample))}
            variant="contained"
            color="primary"
          >
            {`Download ${mode === "H-promoter" || mode === "M-promoter" ? "promoters" : mode === "H-enhancer" || mode === "M-enhancer" ? "enhancers" : "CTCF-bound cCREs"} active in ${selectedBiosample.name.replace(/_/g, " ")}`}
          </Button>
        }
        {toDownload &&
          <Typography>Loading...</Typography>
        }
      </>
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
          {/* Titles */}
          <Grid2 xsOffset={2} xs={5}>
            <Typography>Human</Typography>
          </Grid2>
          <Grid2 xs={5}>
            <Typography>Mouse</Typography>
          </Grid2>
          {/* All cCREs */}
          <Grid2 xs={2}>
            <Typography>All cCREs</Typography>
          </Grid2>
          <Grid2 xs={5}>
            <Button fullWidth href={Config.Downloads.HumanCCREs} variant="contained" color="primary">Download All Human cCREs (hg38)</Button>
          </Grid2>
          <Grid2 xs={5}>
            <Button fullWidth href={Config.Downloads.MouseCCREs} variant="contained" color="primary">Download All Mouse cCREs (hg38)</Button>
          </Grid2>
          {/* Promoters */}
          <Grid2 xs={2}>
            <Typography>Candidate Promoters</Typography>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <Button fullWidth href={Config.Downloads.HumanPromoters} variant="contained" color="primary">Download Human Candidate Promoters (hg38)</Button>
              {ComboBox(humanPromoters, "Search for a Biosample", "H-promoter")}
            </Stack>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <Button fullWidth href={Config.Downloads.MousePromoters} variant="contained" color="primary">Download Mouse Candidate Promoters (hg38)</Button>
              {ComboBox(mousePromoters, "Search for a Biosample", "M-promoter")}
            </Stack>
          </Grid2>
          {/* Enhancers */}
          <Grid2 xs={2}>
            <Typography>Candidate Enhancers</Typography>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <Button fullWidth href={Config.Downloads.HumanEnhancers} variant="contained" color="primary">Download Human Candidate Enhancers (hg38)</Button>
              {ComboBox(humanEnhancers, "Search for a Biosample", "H-enhancer")}
            </Stack>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <Button fullWidth href={Config.Downloads.MouseEnhancers} variant="contained" color="primary">Download Mouse Candidate Enhancers (hg38)</Button>
              {ComboBox(mouseEnhancers, "Search for a Biosample", "M-enhancer")}
            </Stack>
          </Grid2>
          {/* CTCF-Bound */}
          <Grid2 xs={2}>
            <Typography>CTCF-Bound</Typography>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <Button fullWidth href="https://downloads.wenglab.org/Registry-V4/GRCh38-CTCF.bed" variant="contained" color="primary">Download Human CTCF-Bound cCREs (hg38)</Button>
              {ComboBox(humanCTCF, "Search for a Biosample", "H-ctcf")}
            </Stack>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <Button fullWidth href={Config.Downloads.MouseCTCF} variant="contained" color="primary">Download Mouse CTCF-Bound cCREs (hg38)</Button>
              {ComboBox(mouseCTCF, "Search for a Biosample", "M-ctcf")}
            </Stack>
          </Grid2>
          {/* Gene Links */}
          <Grid2 xs={2}>
            <Typography>Gene Links</Typography>
          </Grid2>
          <Grid2 xs={5}>
            <Button fullWidth href={Config.Downloads.HumanGeneLinks} variant="contained" color="primary">Download Human cCRE-Gene Links (hg38)</Button>
          </Grid2>
        </Grid2>
      }
    </div>
  );
}