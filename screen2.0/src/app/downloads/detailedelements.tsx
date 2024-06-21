import { Button, ButtonProps, Paper, Typography, Divider, Stack } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Box } from "@mui/system"
import React, { useEffect, useState } from "react"
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
import { fetchFileSize } from "./downloads"

interface TabPanelProps {
  children?: React.ReactNode
  biosamples: ApolloQueryResult<BIOSAMPLE_Data>
}



//For all Human/Mouse cCREs
const DownloadButton = (props: ButtonProps & { label: string }) => {
  const [fileSize, setFileSize] = useState<number>(null)

  useEffect(() => {
    fetchFileSize(props.href, setFileSize)
  }, [props.href])

  return (
    <Button
      sx={{ textTransform: "none", justifyContent: "space-between" }}
      fullWidth
      variant="contained"
      color="primary"
      {...props}
      endIcon={<DownloadIcon />}
    >
      <Typography variant="body2" sx={{ flexGrow: 1 }}>{props.label}</Typography>
      {fileSize && (fileSize / 1000000).toFixed(1) + ' MB'}
    </Button>
  )
}

//Download tiles
const InlineDownloadButton = (props: ButtonProps & { label: string; bordercolor: string; mode: "download" | "search" }) => {
  const [fileSize, setFileSize] = useState<number>(null)

  useEffect(() => {
    fetchFileSize(props.href, setFileSize)
  }, [props.href])

  return (
    <Button
      sx={{ textTransform: "none", borderLeft: `0.375rem solid ${props.bordercolor}`, justifyContent: "space-between" }}
      variant="contained"
      color="secondary"
      href={props.href}
      endIcon={props.mode === "search" ? <SearchIcon /> : <DownloadIcon />}
      fullWidth
    >
      <Typography variant="body2" sx={{ flexGrow: 1 }}>{props.label}</Typography>
      {fileSize && (fileSize / 1000000).toFixed(1) + ' MB'}
    </Button>
  )
}

export function DetailedElements(props: TabPanelProps) {

  return (
    <Grid2 container spacing={3} mt={1}>
      <Grid2 xs={12} md={6} order={{ xs: 1, md: 1 }}>
        <Stack spacing={1}> {/* Use stack to provide even spacing horizonatally */}
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Stack>
              <Typography mt="auto" variant="h5" >Human (GRCh38/hg38)</Typography>
              <Typography variant="subtitle1">2,348,854 cCREs • 1,888 cell types</Typography>
            </Stack>
            <Image src={Human} alt={"Human Icon"} height={75} />
          </Stack>
          <DownloadButton href={Config.Downloads.HumanCCREs} label="All Human cCREs (2,348,854)" />
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
        </Stack>
      </Grid2>
      <Grid2 xs={12} md={6} order={{ xs: 3, md: 2 }}>
        <Stack spacing={1}> {/* Use stack to provide even spacing horizonatally */}
          <Stack direction={"row"} justifyContent={"space-between"}>
            <Stack>
              <Typography mt="auto" variant="h5" >Mouse (GRCm38/mm10)</Typography>
              <Typography variant="subtitle1">926,843 cCREs • 366 cell types</Typography>
            </Stack>
            <Image src={Mouse} alt={"Mouse Icon"} height={75} />
          </Stack>
          <DownloadButton href={Config.Downloads.MouseCCREs} label="Download All Mouse cCREs" />
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
        </Stack>
      </Grid2>
      <Grid2 xs={12} md={6} order={{ xs: 2, md: 3 }}>
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
      <Grid2 xs={12} md={6} order={{ xs: 3, md: 3 }}>
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
  )
}
