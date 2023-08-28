import {
  Typography,
  Button,
  ButtonProps,
  Stack,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Autocomplete,
  TextField,
  Tooltip,
  Modal,
  Box,
  Divider,
} from "@mui/material"
import InfoIcon from "@mui/icons-material/Info"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import LoadingButton from "@mui/lab/LoadingButton"
import DownloadIcon from "@mui/icons-material/Download"
import Human from "../../../public/Human2.png"
import Mouse from "../../../public/Mouse2.png"
import Config from "../../config.json"
import { useEffect, useMemo, useState } from "react"
import { Biosample } from "./types"
import React from "react"
import Image from "next/image"
import { ApolloQueryResult } from "@apollo/client"
import { downloadTSV } from "./utils"

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  biosamples: -1 | ApolloQueryResult<any>
}

const PROMOTER_MESSAGE =
  "cCREs with promoter-like signatures have high DNase-seq signal, high H3K4me3 signal, and have centers within 200 bp of an annotated GENCODE TSS."
const ENHANCER_MESSAGE =
  "cCREs with enhancer-like signatures have high DNase-seq signal and high H3K27ac signal. These cCREs can either be TSS-proximal (within 2kb) or TSS-distal and do not include promoter annotations."
const CTCF_MESSAGE = "cCREs with high CTCF-signal. These cCRE may also be classified as promoters, enhancer, or CTCF-only elements."
const LINK_MESSAGE = "cCRE-gene links curated from Hi-C, ChIA-PET, CRISPR perturbations and eQTL data."

/**
 *
 * @param selected The selected biosample
 * @returns The link to download biosample-specific cCREs
 */
function generateBiosampleURL(selected: Biosample): URL {
  const r = [selected.dnase_signal, selected.h3k4me3_signal, selected.h3k27ac_signal, selected.ctcf_signal].filter((x) => !!x)
  return new URL(`https://downloads.wenglab.org/Registry-V4/${r.join("_")}.bed`)
}

const DownloadButton = (props: ButtonProps & { label: string }) => {
  return (
    <Button sx={{ textTransform: "none" }} fullWidth variant="contained" color="primary" {...props} endIcon={<DownloadIcon />}>
      {props.label}
    </Button>
  )
}

function ComboBox(props: {
  options: Biosample[]
  label: string
  mode: "H-promoter" | "H-enhancer" | "H-ctcf" | "M-promoter" | "M-enhancer" | "M-ctcf"
}): JSX.Element {
  const [toDownload, setToDownload] = useState<URL | null>(null)
  const [selectedBiosample, setSelectedBiosample] = useState<Biosample | null>(null)

  //Not sure if this is strictly necessary to use useMemo
  const stringToMatch: string = useMemo(() => {
    switch (props.mode) {
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
  }, [props.mode])

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
            `${selectedBiosample.name}.${
              props.mode === "H-promoter" || props.mode === "M-promoter"
                ? "promoters"
                : props.mode === "H-enhancer" || props.mode === "M-enhancer"
                ? "enhancers"
                : "CTCF-bound cCREs"
            }.bed`
          )
          setToDownload(null)
        })
  }, [toDownload, props.mode, selectedBiosample, stringToMatch])

  return (
    <React.Fragment>
      {/* As an important note, since all the biosample names are getting their underscores removed, you can't search with the original names with the underscores without customizing search function. Maybe we could look into being able to search for a tissue category also or group them */}
      <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={props.options}
        sx={{ width: 300 }}
        //This spread is giving a warning. Code comes from MUI. Can't remove it though or doesn't work...
        renderInput={(params) => <TextField {...params} label={props.label} />}
        getOptionLabel={(biosample: Biosample) =>
          biosample.name.replace(/_/g, " ") +
          " — Exp ID: " +
          (props.mode === "H-promoter" || props.mode === "M-promoter"
            ? biosample.h3k4me3
            : props.mode === "H-enhancer" || props.mode === "M-enhancer"
            ? biosample.h3k27ac
            : biosample.ctcf)
        }
        blurOnSelect
        onChange={(event, value: any) => setSelectedBiosample(value)}
        size="small"
      />
      {selectedBiosample && (
        <LoadingButton
          loading={toDownload !== null}
          loadingPosition="end"
          sx={{ textTransform: "none" }}
          fullWidth
          onClick={() => setToDownload(generateBiosampleURL(selectedBiosample))}
          variant="contained"
          color="primary"
          endIcon={<DownloadIcon />}
        >
          {`Download ${
            props.mode === "H-promoter" || props.mode === "M-promoter"
              ? "promoters"
              : props.mode === "H-enhancer" || props.mode === "M-enhancer"
              ? "enhancers"
              : "CTCF-bound cCREs"
          } active in ${selectedBiosample.name.replace(/_/g, " ")}`}
        </LoadingButton>
      )}
    </React.Fragment>
  )
}

export function QuickStart(props: TabPanelProps) {
  const biosamples = props.biosamples !== -1 && props.biosamples.data

  //Filter query return
  const humanPromoters: Biosample[] = useMemo(
    () => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x: Biosample) => x.h3k4me3 !== null),
    [biosamples]
  )
  const humanEnhancers: Biosample[] = useMemo(
    () => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x: Biosample) => x.h3k27ac !== null),
    [biosamples]
  )
  const humanCTCF: Biosample[] = useMemo(
    () => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x: Biosample) => x.ctcf !== null),
    [biosamples]
  )
  const mousePromoters: Biosample[] = useMemo(
    () => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x: Biosample) => x.h3k4me3 !== null),
    [biosamples]
  )
  const mouseEnhancers: Biosample[] = useMemo(
    () => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x: Biosample) => x.h3k27ac !== null),
    [biosamples]
  )
  const mouseCTCF: Biosample[] = useMemo(
    () => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x: Biosample) => x.ctcf !== null),
    [biosamples]
  )

  return (
    <div role="tabpanel" id={`simple-tabpanel-${0}`} aria-labelledby={`simple-tab-${0}`}>
      {props.value === 0 && (
        <Grid2 container columnSpacing={{ xs: 4, md: 6 }} rowSpacing={3} mt={1}>
          {/* Titles */}
          <Grid2 display="flex" alignItems="flex-start" flexDirection="column" xsOffset={2} xs={3.75}>
            <Typography mt="auto" variant="h5">
              Human (GRCh38/hg38)
            </Typography>
            {/* These are not showing up because of the flex container */}
            <Divider variant="fullWidth" />
            <Typography variant="subtitle1">2,348,854 cCREs • 1,678 cell types</Typography>
          </Grid2>
          <Grid2 justifyContent="flex-end" xs={1.25}>
            <Image src={Human} alt={"Human Icon"} height={75} />
          </Grid2>
          <Grid2 display="flex" alignItems="flex-start" flexDirection="column" xs={3.75}>
            <Typography variant="h5">Mouse (GRCm38/mm10)</Typography>
            <Divider />
            <Typography variant="subtitle1">926,843 cCREs • 366 cell types</Typography>
          </Grid2>
          <Grid2 justifyContent="flex-end" xs={1.25}>
            <Image src={Mouse} alt={"Mouse Icon"} height={75} />
          </Grid2>
          {/* All cCREs */}
          <Grid2 xs={2} borderLeft={"0.375rem solid #06DA93"}>
            <Typography>All cCREs</Typography>
          </Grid2>
          <Grid2 xs={5}>
            <DownloadButton href={Config.Downloads.HumanCCREs} label="Download All Human cCREs" />
          </Grid2>
          <Grid2 xs={5}>
            <DownloadButton href={Config.Downloads.MouseCCREs} label="Download All Mouse cCREs" />
          </Grid2>
          {/* Promoters */}
          <Grid2 xs={2} borderLeft={"0.375rem solid #FF0000"}>
            <span>
              <Typography display={"inline"}>Candidate Promoters</Typography>
              <Tooltip title={PROMOTER_MESSAGE}>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </span>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <DownloadButton href={Config.Downloads.HumanPromoters} label="Download Human Candidate Promoters" />
              <ComboBox options={humanPromoters} label="Search for a Biosample" mode="H-promoter" />
            </Stack>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <DownloadButton href={Config.Downloads.MousePromoters} label="Download Mouse Candidate Promoters" />
              <ComboBox options={mousePromoters} label="Search for a Biosample" mode="M-promoter" />
            </Stack>
          </Grid2>
          {/* Enhancers */}
          <Grid2 xs={2} borderLeft={"0.375rem solid #FFCD00"}>
            <span>
              <Typography display={"inline"}>Candidate Enhancers</Typography>
              <Tooltip title={ENHANCER_MESSAGE}>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </span>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <DownloadButton href={Config.Downloads.HumanProximalEnhancers} label="Download Human Candidate Enhancers" />
              <ComboBox options={humanEnhancers} label="Search for a Biosample" mode="H-enhancer" />
            </Stack>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <DownloadButton href={Config.Downloads.MouseProximalEnhancers} label="Download Mouse Candidate Enhancers" />
              <ComboBox options={mouseEnhancers} label="Search for a Biosample" mode="M-enhancer" />
            </Stack>
          </Grid2>
          {/* CTCF-Bound */}
          <Grid2 xs={2} borderLeft={"0.375rem solid #00B0F0"}>
            <span>
              <Typography display={"inline"}>CTCF-Bound</Typography>
              <Tooltip title={CTCF_MESSAGE}>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </span>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <DownloadButton href={Config.Downloads.HumanCA_CTCF} label="Download Human CTCF-Bound cCREs" />
              <ComboBox options={humanCTCF} label="Search for a Biosample" mode="H-ctcf" />
            </Stack>
          </Grid2>
          <Grid2 xs={5}>
            <Stack spacing={2}>
              <DownloadButton href={Config.Downloads.MouseCA_CTCF} label="Download Mouse CTCF-Bound cCREs" />
              <ComboBox options={mouseCTCF} label="Search for a Biosample" mode="M-ctcf" />
            </Stack>
          </Grid2>
          {/* Gene Links */}
          <Grid2 xs={2} borderLeft={"0.375rem solid #A872E5"}>
            <span>
              <Typography display={"inline"}>Gene Links</Typography>
              <Tooltip title={LINK_MESSAGE}>
                <IconButton>
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </span>
          </Grid2>
          <Grid2 xs={5}>
            <DownloadButton href={Config.Downloads.HumanGeneLinks} label="Download Human cCRE-Gene Links" />
          </Grid2>
        </Grid2>
      )}
    </div>
  )
}
