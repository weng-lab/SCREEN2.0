import { Button, ButtonProps, Typography, Stack, Tabs, Tab, Divider } from "@mui/material"
import Grid from "@mui/material/Grid2"
import React, { useEffect, useState } from "react"
import Config from "../../config.json"
import DownloadIcon from "@mui/icons-material/Download"
import { CA_CTCF, CA_H3K4me3, CA_TF, CA_only, PLS, TF_only, dELS, pELS, CTCF_Bound, ELS } from "../../common/lib/colors"
import Image from "next/image"
import humanTransparentIcon from "../../../public/Transparent_HumanIcon.png"
import mouseTransparentIcon from "../../../public/Transparent_MouseIcon.png"
import BiosampleTables from "../_biosampleTables/BiosampleTables"

export const fetchFileSize = async (url: string, setFileSize: React.Dispatch<React.SetStateAction<number>>) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      setFileSize(parseInt(contentLength, 10));
    }
  } catch (error) {
    console.log("error fetching file size for ", url)
  }
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
const InlineDownloadButton = (props: ButtonProps & { label: string; bordercolor?: string }) => {
  const [fileSize, setFileSize] = useState<number>(null)

  useEffect(() => {
    fetchFileSize(props.href, setFileSize)
  }, [props.href])

  return (
    <Button
      sx={{ textTransform: "none", borderLeft: props.bordercolor && `0.375rem solid ${props.bordercolor}`, justifyContent: "space-between", backgroundColor: "white", color: "black" }}
      variant="contained"
      href={props.href}
      endIcon={<DownloadIcon />}
      fullWidth
    >
      <Typography variant="body2" sx={{ flexGrow: 1 }}>{props.label}</Typography>
      {fileSize && (fileSize / 1000000).toFixed(1) + ' MB'}
    </Button>
  )
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  }
}

export function Annotations() {
  const [species, setSpecies] = useState(0)
  const handleChange = (_, newValue: number) => {
    setSpecies(newValue)
  }

  return (
    <Stack spacing={1} paddingX={6}>
      <Tabs value={species} onChange={handleChange} aria-label="basic tabs example" variant="scrollable" allowScrollButtonsMobile>
        <Tab label="Human" sx={{ textTransform: "none" }} {...a11yProps(0)} />
        <Tab label="Mouse" sx={{ textTransform: "none" }} {...a11yProps(1)} />
      </Tabs>
      {species === 0 && (
        <Grid container spacing={3} justifyContent={"center"}>
          <Grid size={{ xs: 12, md: 6}}>
            <Stack spacing={1} flexGrow={1}>
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Stack>
                  <Typography mt="auto" variant="h5">Human (GRCh38/hg38)</Typography>
                  <Typography variant="subtitle1">2,348,854 cCREs • 1,888 cell types</Typography>
                </Stack>
                <Image src={humanTransparentIcon} alt={"Human Icon"} height={75} />
              </Stack>
              <DownloadButton href={Config.Downloads.HumanCCREs} label="All Human cCREs (2,348,854)" />
              <Typography pt={1}>
                cCREs by Class (.bed)
              </Typography>
              <Divider />
              <InlineDownloadButton href={Config.Downloads.HumanPromoters} label="Promoter-like (PLS) (47,532)" bordercolor={PLS} />
              <InlineDownloadButton href={Config.Downloads.HumanEnhancers} label="All Candidate Enhancers (pELS & dELS) (1,718,669)" bordercolor={ELS} />
              <InlineDownloadButton href={Config.Downloads.HumanProximalEnhancers} label="Proximal enhancer-like (pELS) (249,464)" bordercolor={pELS} />
              <InlineDownloadButton href={Config.Downloads.HumanDistalEnhancers} label="Distal enhancer-like (dELS) (1,469,205)" bordercolor={dELS} />
              <InlineDownloadButton href={Config.Downloads.HumanCA_CTCF} label="Chromatin Accessible with CTCF (CA-CTCF) (126,034)" bordercolor={CA_CTCF} />
              <InlineDownloadButton href={Config.Downloads.HumanCA_H3K4me3} label="Chromatin Accessible with H3K4me3 (CA-H3K4me3) (79,246)" bordercolor={CA_H3K4me3} />
              <InlineDownloadButton href={Config.Downloads.HumanCA_TF} label="Chromatin Accessible with TF (CA-TF) (26,102)" bordercolor={CA_TF} />
              <InlineDownloadButton href={Config.Downloads.HumanCA_only} label="Chromatin Accessible Only (CA) (245,985)" bordercolor={CA_only} />
              <InlineDownloadButton href={Config.Downloads.HumanTF_only} label="TF Only (TF) (105,286)" bordercolor={TF_only} />
              <InlineDownloadButton href={Config.Downloads.HumanCA_Bound} label="CTCF-Bound cCREs (948,642)" bordercolor={CTCF_Bound} />
              <Typography pt={1}>
                cCRE-Gene Associations
              </Typography>
              <Divider />
              <InlineDownloadButton href={Config.Downloads.HumanGeneLinks} label="cCRE-Gene Links (3D Chromatin, CRISPR, eQTLS) (.zip)" bordercolor="grey" />
              <InlineDownloadButton href={Config.Downloads.HumanNearestPC} label="Nearest Gene by cCRE (protein-coding only) (.tsv)" bordercolor="grey" />
              <InlineDownloadButton href={Config.Downloads.HumanNearestAll} label="Nearest Gene by cCRE (protein-coding and non protein-coding) (.tsv)" bordercolor="grey" />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6}} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Typography variant="h6" mt={6.5}>Human cCREs by cell and tissue types</Typography>
            <BiosampleTables
              assembly={"GRCh38"}
              showDownloads
              slotProps={{
                paperStack: { overflow: 'hidden', flexGrow: 1 }
              }}
            />
          </Grid>
        </Grid>
      )}
      {species === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6}}>
            <Stack spacing={1} flexGrow={1}>
              <Stack direction={"row"} justifyContent={"space-between"}>
                <Stack>
                  <Typography mt="auto" variant="h5">Mouse (GRCm38/mm10)</Typography>
                  <Typography variant="subtitle1">926,843 cCREs • 366 cell types</Typography>
                </Stack>
                <Image src={mouseTransparentIcon} alt={"Mouse Icon"} height={75} />
              </Stack>
              <DownloadButton href={Config.Downloads.MouseCCREs} label="All Mouse cCREs" />
              <Typography pt={1}>
                cCREs by Class (.bed)
              </Typography>
              <Divider />
              <InlineDownloadButton href={Config.Downloads.MousePromoters} label={`Promoter-like (PLS) (27,332)`} bordercolor={PLS} />
              <InlineDownloadButton href={Config.Downloads.MouseEnhancers} label="All Candidate Enhancers (pELS & dELS) (512,001)" bordercolor={ELS} />
              <InlineDownloadButton href={Config.Downloads.MouseProximalEnhancers} label="Proximal enhancer-like (pELS) (111,218)" bordercolor={pELS} />
              <InlineDownloadButton href={Config.Downloads.MouseDistalEnhancers} label="Distal enhancer-like (dELS) (400,783)" bordercolor={dELS} />
              <InlineDownloadButton href={Config.Downloads.MouseCA_CTCF} label="Chromatin Accessible with CTCF (CA-CTCF) (45,933)" bordercolor={CA_CTCF} />
              <InlineDownloadButton href={Config.Downloads.MouseCA_H3K4me3} label="Chromatin Accessible with H3K4me3 (CA-H3K4me3) (23,832)" bordercolor={CA_H3K4me3} />
              <InlineDownloadButton href={Config.Downloads.MouseCA_TF} label="Chromatin Accessible with TF (CA-TF) (10,707)" bordercolor={CA_TF} />
              <InlineDownloadButton href={Config.Downloads.MouseCA_only} label="Chromatin Accessible Only (CA) (291,800)" bordercolor={CA_only} />
              <InlineDownloadButton href={Config.Downloads.MouseTF_only} label="TF Only (TF) (15,283)" bordercolor={TF_only} />
              <InlineDownloadButton href={Config.Downloads.MouseCA_Bound} label="CTCF-Bound cCREs (139,894)" bordercolor={CTCF_Bound} />
            </Stack>
          </Grid>
          <Grid size={{ xs: 12, md: 6 }} sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <Typography variant="h6" mt={6.5}>Mouse cCREs by cell and tissue types</Typography>
            <BiosampleTables
              assembly={"mm10"}
              showDownloads
              slotProps={{
                paperStack: { overflow: 'hidden', flexGrow: 1 }
              }}
            />
          </Grid>
        </Grid>
      )}
    </Stack>
  );
}

