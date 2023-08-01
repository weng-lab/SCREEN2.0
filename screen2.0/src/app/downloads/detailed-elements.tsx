import { Button, ButtonProps, IconButton, Paper, Tooltip, Typography, Modal } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { Box } from "@mui/system";
import React from "react";
import InfoIcon from '@mui/icons-material/Info';
import Config from "../../config.json"
import { DownloadButton } from "./quick-start";
import DownloadIcon from '@mui/icons-material/Download';
import SearchIcon from '@mui/icons-material/Search';
import { CA_CTCF, CA_H3K4me3, CA_TF, CA_only, PLS, TF_only, dELS, pELS } from "../../common/lib/colors";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
}

const InlineDownloadButton = (props: ButtonProps & { label: string, borderColor: string , search?: boolean}) => {
  return (
    <Paper sx={{ borderTop: `0.375rem solid ${props.borderColor}`, marginBottom: '1rem'}} elevation={2} >
      <Button
        sx={{ textTransform: "none", maxWidth: "9rem" }}
        variant="text"
        color="primary"
        {...props}
        endIcon={props.search ? <SearchIcon /> : <DownloadIcon />}
      >
        {props.label}
      </Button>
    </Paper>

  )
}

export function DetailedElements(props: TabPanelProps) {
  const { children, value, ...other } = props;

  return (
    <React.Fragment>
      {value === 1 &&
        <Grid2 container columnSpacing={6} rowSpacing={3} mt={1}>
          {/* Titles */}
          <Grid2 xs={6}>
            <Typography variant="h5">Human (GRCh38/hg38)</Typography>
            <Typography variant="subtitle1">2,348,854 cCREs • 1,678 cell types</Typography>
          </Grid2>
          <Grid2 xs={6}>
            <Typography variant="h5">Mouse (GRCm38/mm10)</Typography>
            <Typography variant="subtitle1">926,843 cCREs • 366 cell types</Typography>
          </Grid2>
          <Grid2 xs={6}>
            <DownloadButton href={Config.Downloads.HumanCCREs} label="Download All Human cCREs" />
          </Grid2>
          <Grid2 xs={6}>
            <DownloadButton href={Config.Downloads.MouseCCREs} label="Download All Mouse cCREs" />
          </Grid2>
          <Grid2 display={"flex"} flexWrap={"wrap"} justifyContent={"space-between"} xs={6}>
            <InlineDownloadButton href={Config.Downloads.HumanPromoters} label="Promoter-like (PLS) (47,532)" borderColor={PLS} />
            <InlineDownloadButton href={Config.Downloads.HumanProximalEnhancers} label="Proximal enhancer-like (pELS) (249,464)" borderColor={pELS}/>
            <InlineDownloadButton href={Config.Downloads.HumanDistalEnhancers} label="Distal enhancer-like (dELS) (1,469,205)" borderColor={dELS}/>
            <InlineDownloadButton href={Config.Downloads.HumanCA_CTCF} label="Chromatin Accessible with CTCF (126,034)" borderColor={CA_CTCF}/>
            <InlineDownloadButton href={Config.Downloads.HumanCA_H3K4me3} label="Chromatin Accessible with H3K4me3 (79,246)" borderColor={CA_H3K4me3}/>
            <InlineDownloadButton href={Config.Downloads.HumanCA_TF} label="Chromatin Accessible with TF (26,102)" borderColor={CA_TF}/>
            <InlineDownloadButton href={Config.Downloads.HumanCA_only} label="Chromatin Accessible Only (245,985)" borderColor={CA_only}/>
            <InlineDownloadButton href={Config.Downloads.HumanTF_only} label="TF Only (105,286)" borderColor={TF_only}/>
            {/* Box added to align last row */}
            <Box width={"9rem"}></Box>
          </Grid2>
          <Grid2 display={"flex"} flexWrap={"wrap"} justifyContent={"space-between"} xs={6}>
            <InlineDownloadButton href={Config.Downloads.MousePromoters} label={`Promoter-like (PLS) (47,532)`} borderColor={PLS} />
            <InlineDownloadButton href={Config.Downloads.MouseProximalEnhancers} label="Proximal enhancer-like (pELS) (249,464)" borderColor={pELS} />
            <InlineDownloadButton href={Config.Downloads.MouseDistalEnhancers} label="Distal enhancer-like (dELS) (1,469,205)" borderColor={dELS} />
            <InlineDownloadButton href={Config.Downloads.MouseCA_CTCF} label="Chromatin Accessible with CTCF (126,034)" borderColor={CA_CTCF} />
            <InlineDownloadButton href={Config.Downloads.MouseCA_H3K4me3} label="Chromatin Accessible with H3K4me3 (79,246)" borderColor={CA_H3K4me3} />
            <InlineDownloadButton href={Config.Downloads.MouseCA_TF} label="Chromatin Accessible with TF (26,102)" borderColor={CA_TF} />
            <InlineDownloadButton href={Config.Downloads.MouseCA_only} label="Chromatin Accessible Only (245,985)" borderColor={CA_only} />
            <InlineDownloadButton href={Config.Downloads.MouseTF_only} label="TF Only (105,286)" borderColor={TF_only} />
            {/* Box added to align last row */}
            <Box width={"9rem"}></Box>
          </Grid2>
          <Grid2 xs={6}>
            <Typography variant="h6">Human cCREs by Cell Type</Typography>
          </Grid2>
          <Grid2 xs={6}>
            <Typography variant="h6">Mouse cCREs by Cell Type</Typography>
          </Grid2>
          <Grid2 display={"flex"} flexWrap={"wrap"} justifyContent={"space-between"} xs={6}>
            <InlineDownloadButton search href={Config.Downloads.HumanCCREs} label="Cell Lines (206 Cell Types)" borderColor={"#333333"} />
            <InlineDownloadButton search href={Config.Downloads.HumanCCREs} label="Adult Primary Cells and Tissues (1093 cell types)" borderColor={"#333333"}/>
            <InlineDownloadButton search href={Config.Downloads.HumanCCREs} label="Embryonic Tissues (379 cell types)" borderColor={"#333333"}/>
          </Grid2>
          <Grid2 display={"flex"} flexWrap={"wrap"} justifyContent={"space-between"} xs={6}>
            <InlineDownloadButton search href={Config.Downloads.HumanCCREs} label="Cell Lines (27 Cell Types)" borderColor={"#333333"} />
            <InlineDownloadButton search href={Config.Downloads.HumanCCREs} label="Adult Primary Cells and Tissues (244 cell types)" borderColor={"#333333"}/>
            <InlineDownloadButton search href={Config.Downloads.HumanCCREs} label="Embryonic Tissues (96 cell types)" borderColor={"#333333"}/>
          </Grid2>
        </Grid2>
      }
    </React.Fragment>
  );
}