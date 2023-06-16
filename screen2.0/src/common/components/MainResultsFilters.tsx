"use client"
import * as React from "react"

import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Box,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox
} from "@mui/material/"

import SendIcon from "@mui/icons-material/Send"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

import Grid2 from "@mui/material/Unstable_Grid2"

import Link from "next/link"

import { RangeSlider } from "@weng-lab/psychscreen-ui-components"
import { useState } from "react"

//Need to go back and define the types in mainQueryParams object
export default function MainResultsFilters(props: { mainQueryParams: any }) {
  //No alternatives provided for default, as all these attributes should exist and are given a default value in Search's page.tsx
  //Chromatin Filters
  const [DNaseStart, setDNaseStart] = useState<number>(props.mainQueryParams.dnase_s)
  const [DNaseEnd, setDNaseEnd] = useState<number>(props.mainQueryParams.dnase_e)
  const [H3K4me3Start, setH3K4me3Start] = useState<number>(props.mainQueryParams.h3k4me3_s)
  const [H3K4me3End, setH3K4me3End] = useState<number>(props.mainQueryParams.h3k4me3_e)
  const [H3K27acStart, setH3K27acStart] = useState<number>(props.mainQueryParams.h3k27ac_s)
  const [H3K27acEnd, setH3K27acEnd] = useState<number>(props.mainQueryParams.h3k27ac_e)
  const [CTCFStart, setCTCFStart] = useState<number>(props.mainQueryParams.ctcf_s)
  const [CTCFEnd, setCTCFEnd] = useState<number>(props.mainQueryParams.ctcf_e)

  //Classification Filters
  const [CA, setCA] = useState<boolean>(props.mainQueryParams.CA)
  const [CA_CTCF, setCA_CTCF] = useState<boolean>(props.mainQueryParams.CA_CTCF)
  const [CA_H3K4me3, setCA_H3K4me3] = useState<boolean>(props.mainQueryParams.CA_H3K4me3)
  const [CA_TF, setCA_TF] = useState<boolean>(props.mainQueryParams.CA_TF)
  const [dELS, setdELS] = useState<boolean>(props.mainQueryParams.dELS)
  const [pELS, setpELS] = useState<boolean>(props.mainQueryParams.pELS)
  const [PLS, setPLS] = useState<boolean>(props.mainQueryParams.PLS)
  const [TF, setTF] = useState<boolean>(props.mainQueryParams.TF)

  //IMPORTANT: This will wipe the current cCRE when Nishi puts it in. Need to preserve it once I know the param name of the cCRE
  function constructURL(){
    const url = `search?assembly=${props.mainQueryParams.assembly}&chromosome=${props.mainQueryParams.chromosome}&start=${props.mainQueryParams.start}&end=${props.mainQueryParams.end}&dnase_s=${DNaseStart}&dnase_e=${DNaseEnd}&h3k4me3_s=${H3K4me3Start}&h3k4me3_e=${H3K4me3End}&h3k27ac_s=${H3K27acStart}&h3k27ac_e=${H3K27acEnd}&ctcf_s=${CTCFStart}&ctcf_e=${CTCFEnd}&CA=${outputT_or_F(CA)}&CA_CTCF=${outputT_or_F(CA_CTCF)}&CA_H3K4me3=${outputT_or_F(CA_H3K4me3)}&CA_TF=${outputT_or_F(CA_TF)}&dELS=${outputT_or_F(dELS)}&pELS=${outputT_or_F(pELS)}&PLS=${outputT_or_F(PLS)}&TF=${outputT_or_F(TF)}`
    return url
  }

  function outputT_or_F(input: boolean){
    if (input == true) { return 't'}
    else return 'f'
  }

  return (
    <Paper elevation={4}>
      <Box sx={{ minHeight: "64px", display: "flex", alignItems: "center" }}>
        <Typography variant="h5" sx={{ pl: "16px" }}>
          Refine Your Search
        </Typography>
      </Box>
      {/* Biosample Activity */}
      <Accordion square disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Typography>Biosample Activity</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      {/* Chromatin Signals */}
      <Accordion square defaultExpanded disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
          <Typography>Chromatin Signals</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid2 container spacing={3}>
            <Grid2 xs={6}>
              <RangeSlider
                title="DNase Z-Score"
                width="100%"
                defaultStart={DNaseStart}
                defaultEnd={DNaseEnd}
                min={-10}
                max={10}
                minDistance={1}
                step={0.1}
                //How do I correctly type this? Doesn't like Number[]
                onChange={(value: any) => {
                  setDNaseStart(value[0])
                  setDNaseEnd(value[1])
                }}
              />
            </Grid2>
            <Grid2 xs={6}>
              <RangeSlider
                title="H3K4me3 Z-Score"
                width="100%"
                defaultStart={H3K4me3Start}
                defaultEnd={H3K4me3End}
                min={-10}
                max={10}
                minDistance={1}
                step={0.1}
                onChange={(value: any) => {
                  setH3K4me3Start(value[0])
                  setH3K4me3End(value[1])
                }}
              />
            </Grid2>
            <Grid2 xs={6}>
              <RangeSlider
                title="H3K27ac Z-Score"
                width="100%"
                defaultStart={H3K27acStart}
                defaultEnd={H3K27acEnd}
                min={-10}
                max={10}
                minDistance={1}
                step={0.1}
                onChange={(value: any) => {
                  setH3K27acStart(value[0])
                  setH3K27acEnd(value[1])
                }}
              />
            </Grid2>
            <Grid2 xs={6}>
              <RangeSlider
                title="CTCF Z-Score"
                width="100%"
                defaultStart={CTCFStart}
                defaultEnd={CTCFEnd}
                min={-10}
                max={10}
                minDistance={1}
                step={0.1}
                onChange={(value: any) => {
                  setCTCFStart(value[0])
                  setCTCFEnd(value[1])
                }}
              />
            </Grid2>
          </Grid2>
        </AccordionDetails>
      </Accordion>
      {/* Classification */}
      <Accordion square disableGutters defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3a-content" id="panel3a-header">
          <Typography>Classification</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            cCRE Classes
          </Typography>
          <FormGroup>
            <FormControlLabel checked={CA} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setCA(checked)} control={<Checkbox />} label="CA" />
            <FormControlLabel checked={CA_CTCF} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setCA_CTCF(checked)} control={<Checkbox />} label="CA-CTCF" />
            <FormControlLabel checked={CA_H3K4me3} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setCA_H3K4me3(checked)} control={<Checkbox />} label="CA-H3K4me3" />
            <FormControlLabel checked={CA_TF} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setCA_TF(checked)} control={<Checkbox />} label="CA-TF" />
            <FormControlLabel checked={dELS} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setdELS(checked)} control={<Checkbox />} label="dELS" />
            <FormControlLabel checked={pELS} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setpELS(checked)} control={<Checkbox />} label="pELS" />
            <FormControlLabel checked={PLS} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setPLS(checked)} control={<Checkbox />} label="PLS" />
            <FormControlLabel checked={TF} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setTF(checked)} control={<Checkbox />} label="TF" />
          </FormGroup>
        </AccordionDetails>
      </Accordion>
      {/* Linked Genes */}
      <Accordion square disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4a-content" id="panel4a-header">
          <Typography>Linked Genes</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      {/* Functional Characterization */}
      <Accordion square disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel5a-content" id="panel5a-header">
          <Typography>Functional Characterization</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      {/* Conservation */}
      <Accordion square disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel6a-content" id="panel6a-header">
          <Typography>Conservation</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
          </Typography>
        </AccordionDetails>
      </Accordion>
      <Link href={constructURL()}>
        <Button variant="contained" endIcon={<SendIcon />} sx={{ mt: "16px", mb: "16px", ml: "16px", mr: "16px" }}>
          Filter Results
        </Button>
      </Link>
    </Paper>
  )
}
