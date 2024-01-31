import { Button, ButtonProps, Paper, Typography, Divider } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Box } from "@mui/system"
import React from "react"
import Config from "../../config.json"
import DownloadIcon from "@mui/icons-material/Download"
import SearchIcon from "@mui/icons-material/Search"
import { CA_CTCF, CA_H3K4me3, CA_TF, CA_only, PLS, TF_only, dELS, pELS } from "../../common/lib/colors"
import Image from "next/image"
import Human from "../../../public/Human2.png"
import Mouse from "../../../public/Mouse2.png"
import { ApolloQueryResult } from "@apollo/client"
import { BIOSAMPLE_Data } from "../../common/lib/queries"
import BiosampleTables from "../search/biosampletables"

interface TabPanelProps {
  children?: React.ReactNode
  biosamples: ApolloQueryResult<BIOSAMPLE_Data>
}

//For all Human/Mouse cCREs
const DownloadButton = (props: ButtonProps & { label: string }) => {
  return (
    <Button sx={{ textTransform: "none" }} fullWidth variant="contained" color="primary" {...props} endIcon={<DownloadIcon />}>
      {props.label}
    </Button>
  )
}

//Download tiles
const InlineDownloadButton = (props: ButtonProps & { label: string; bordercolor: string; mode: "download" | "search" }) => {
  return (
    <Paper sx={{ borderTop: `0.375rem solid ${props.bordercolor}`, marginBottom: "1rem" }} elevation={2}>
      <Button
        sx={{ textTransform: "none", maxWidth: "9rem" }}
        variant="text"
        color="primary"
        {...props}
        endIcon={props.mode === "search" ? <SearchIcon /> : <DownloadIcon />}
      >
        {props.label}
      </Button>
    </Paper>
  )
}

export function DetailedElements(props: TabPanelProps) {
  return (
    <div>
      <Grid2 container columnSpacing={6} rowSpacing={3} mt={1}>
        <Grid2 container xs={12} md={6}>
          <Grid2 display="flex" alignItems="flex-start" flexDirection="column" xs={10}>
            <Typography mt="auto" variant="h5">
              Human (GRCh38/hg38)
            </Typography>
            {/* These are not showing up because of the flex container */}
            <Divider />
            <Typography variant="subtitle1">2,348,854 cCREs • 1,888 cell types</Typography>
          </Grid2>
          <Grid2 xs={2}>
            <Image src={Human} alt={"Human Icon"} height={75} />
          </Grid2>
          <Grid2 xs={12}>
            <DownloadButton href={Config.Downloads.HumanCCREs} label="Download All Human cCREs" />
          </Grid2>
          <Grid2 display={"flex"} flexWrap={"wrap"} justifyContent={"space-between"} xs={12}>
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.HumanPromoters}
              label="Promoter-like (PLS) (47,532)"
              bordercolor={PLS}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.HumanProximalEnhancers}
              label="Proximal enhancer-like (pELS) (249,464)"
              bordercolor={pELS}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.HumanDistalEnhancers}
              label="Distal enhancer-like (dELS) (1,469,205)"
              bordercolor={dELS}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.HumanCA_CTCF}
              label="Chromatin Accessible with CTCF (126,034)"
              bordercolor={CA_CTCF}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.HumanCA_H3K4me3}
              label="Chromatin Accessible with H3K4me3 (79,246)"
              bordercolor={CA_H3K4me3}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.HumanCA_TF}
              label="Chromatin Accessible with TF (26,102)"
              bordercolor={CA_TF}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.HumanCA_only}
              label="Chromatin Accessible Only (245,985)"
              bordercolor={CA_only}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.HumanTF_only}
              label="TF Only (105,286)"
              bordercolor={TF_only}
            />
            {/* Box added to align last row */}
            <Box width={"9rem"}></Box>
          </Grid2>
        </Grid2>
        <Grid2 container xs={12} md={6}>
          <Grid2 display="flex" alignItems="flex-start" flexDirection="column" xs={10}>
            <Typography variant="h5">Mouse (GRCm38/mm10)</Typography>
            <Divider />
            <Typography variant="subtitle1">926,843 cCREs • 366 cell types</Typography>
          </Grid2>
          <Grid2 display="flex" justifyContent="flex-end" xs={2}>
            <Image src={Mouse} alt={"Mouse Icon"} height={75} />
          </Grid2>
          <Grid2 xs={12}>
            <DownloadButton href={Config.Downloads.MouseCCREs} label="Download All Mouse cCREs" />
          </Grid2>
          <Grid2 display={"flex"} flexWrap={"wrap"} justifyContent={"space-between"} xs={12}>
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.MousePromoters}
              label={`Promoter-like (PLS) (27,332)`}
              bordercolor={PLS}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.MouseProximalEnhancers}
              label="Proximal enhancer-like (pELS) (111,218)"
              bordercolor={pELS}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.MouseDistalEnhancers}
              label="Distal enhancer-like (dELS) (400,783)"
              bordercolor={dELS}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.MouseCA_CTCF}
              label="Chromatin Accessible with CTCF (45,933)"
              bordercolor={CA_CTCF}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.MouseCA_H3K4me3}
              label="Chromatin Accessible with H3K4me3 (23,832)"
              bordercolor={CA_H3K4me3}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.MouseCA_TF}
              label="Chromatin Accessible with TF (10,707)"
              bordercolor={CA_TF}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.MouseCA_only}
              label="Chromatin Accessible Only (291,800)"
              bordercolor={CA_only}
            />
            <InlineDownloadButton
              mode="download"
              href={Config.Downloads.MouseTF_only}
              label="TF Only (15,283)"
              bordercolor={TF_only}
            />
            {/* Box added to align last row */}
            <Box width={"9rem"}></Box>
          </Grid2>
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Typography variant="h6">Human cCREs by Cell Type</Typography>
          <BiosampleTables
            biosampleData={props.biosamples}
            assembly={"GRCh38"}
            selectedBiosamples={[]}
            setSelectedBiosamples={() => null}
            showRNAseq={false}
            showDownloads={true}
            biosampleSelectMode={"append"}
          />
        </Grid2>
        <Grid2 xs={12} md={6}>
          <Typography variant="h6">Mouse cCREs by Cell Type</Typography>
          <BiosampleTables
            biosampleData={props.biosamples}
            assembly={"mm10"}
            selectedBiosamples={[]}
            setSelectedBiosamples={() => null}
            showRNAseq={false}
            showDownloads={true}
            biosampleSelectMode={"append"}
          />
        </Grid2>
      </Grid2>
    </div>
  )
}
