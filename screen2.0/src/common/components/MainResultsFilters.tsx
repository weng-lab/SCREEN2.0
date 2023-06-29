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
  Checkbox,
  TextField,
  Tooltip,
} from "@mui/material/"

import SendIcon from "@mui/icons-material/Send"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

import Grid2 from "@mui/material/Unstable_Grid2"

import Link from "next/link"

import { RangeSlider } from "@weng-lab/psychscreen-ui-components"
import { useState } from "react"

//Need to go back and define the types in mainQueryParams object
export default function MainResultsFilters(props: { mainQueryParams: any, byCellType: any }) {
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
  function constructURL() {
    const url = `search?assembly=${props.mainQueryParams.assembly}&chromosome=${props.mainQueryParams.chromosome}&start=${props.mainQueryParams.start}&end=${props.mainQueryParams.end}&dnase_s=${DNaseStart}&dnase_e=${DNaseEnd}&h3k4me3_s=${H3K4me3Start}&h3k4me3_e=${H3K4me3End}&h3k27ac_s=${H3K27acStart}&h3k27ac_e=${H3K27acEnd}&ctcf_s=${CTCFStart}&ctcf_e=${CTCFEnd}&CA=${outputT_or_F(CA)}&CA_CTCF=${outputT_or_F(CA_CTCF)}&CA_H3K4me3=${outputT_or_F(CA_H3K4me3)}&CA_TF=${outputT_or_F(CA_TF)}&dELS=${outputT_or_F(dELS)}&pELS=${outputT_or_F(pELS)}&PLS=${outputT_or_F(PLS)}&TF=${outputT_or_F(TF)}`
    return url
  }

  function outputT_or_F(input: boolean) {
    if (input == true) { return 't' }
    else return 'f'
  }

  /**
     * Want: A sorted collection of elements grouped by "tissue" type.
     * Every element in each collection should have "value", "name" and "biosample type", and an "assay" array of assay types available
     * 
     * For each top-level element:
     * check element[0].tissue for tissue type
     * For each sub-item:
     * Add assay to assays array
     * Add name to summaryName
     * Add biosample_summary to verboseName
     * 
     * Each element:
     * assays: ["",""] - contains available assay types
     * summaryName: "" - contains element[1][0].name
     * verboseName: "" - contains element[1][0].biosample_summary
     * queryValue: "" - contains element[1][0].value
     * biosampleType: "" - contains element[1][0].biosample_type
     * 
     * Are all possible tissue types static?
     *
     */

  /**
   * This should probably be put into a server-rendered component
   * @param byCellType JSON of byCellType
   * @returns an object of sorted biosample types, grouped by tissue type
   */
  function parseByCellType(byCellType: any) {
    const biosamples = {}
    // make big json into array consisting of entries of the form ["LNCAP_ENCDO000ACX", [{"assay": "CTCF", "cellTypeDesc": "LNCAP", ...}, {...}]] and for each entry:
    Object.entries(byCellType.byCellType).forEach(entry => {
      // if the tissue catergory hasn't been catalogued, make a new blank array for it
      const experiments = entry[1]
      var tissueArr = []
      if (!biosamples[experiments[0].tissue]) {
        Object.defineProperty(biosamples, experiments[0].tissue,
          {
            value: [],
            enumerable: true,
            writable: true
          }
        )
      }
      //The existing tissues
      tissueArr = biosamples[experiments[0].tissue];
      tissueArr.push(
        {
          //display name
          summaryName: experiments[0].name,
          //hover name
          verboseName: experiments[0].biosample_summary,
          //for filtering
          biosampleType: experiments[0].biosample_type,
          //for query
          queryValue: experiments[0].value,
          //for filling in available assay wheels
          //THIS DATA IS MISSING ATAC DATA! ATAC will always be false
          assays: availableAssays(experiments)
        }
      )
      Object.defineProperty(biosamples, experiments[0].tissue, { value: tissueArr, enumerable: true, writable: true })
    })
    return biosamples
  }

  //This needs better typing, won't accept {}[] because byCellType isn't type defined
  /**
   * @param experiments Array of objects containing biosample experiments for a given biosample type
   * @returns an object with keys dnase, atac, h3k4me3, h3k27ac, ctcf with each marked true or false
   */
  function availableAssays(experiments: any) {
    const assays = { dnase: false, atac: false, h3k4me3: false, h3k27ac: false, ctcf: false }
    experiments.forEach(exp => 
      assays[exp['assay'].toLowerCase()] = true
    )
    return assays
  }

  const biosamples = parseByCellType(props.byCellType)
  console.log(biosamples)

  //Need to make this responsive
  return (
    <Paper elevation={4}>
      <Box sx={{ minHeight: "64px", display: "flex", alignItems: "center" }}>
        <Typography variant="h5" sx={{ pl: "16px" }}>
          Refine Your Search
        </Typography>
      </Box>
      {/* Biosample Activity */}
      <Accordion square defaultExpanded disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Typography>Biosample Activity</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid2 container spacing={2}>
            <Grid2 xs={6}>
              <Typography>
                Tissue/Organ
              </Typography>
            </Grid2>
            <Grid2 xs={6}>
              <TextField size="small" label="Filter Tissues" />
            </Grid2>
            <Grid2 xs={12} maxHeight={350} overflow={'auto'}>
              <Accordion>
                <AccordionSummary expandIcon={<KeyboardArrowRightIcon />}
                  sx={{
                    flexDirection: "row-reverse",
                    '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
                      transform: 'rotate(90deg)',
                    }
                  }}>
                  <Typography>Tisue/Organ</Typography>
                </AccordionSummary>
                <AccordionDetails sx={{ display: 'flex' }}>
                  <Tooltip title="Full tissue name here" arrow placement="right">
                    <FormGroup>
                      <FormControlLabel onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => null} control={<Checkbox defaultChecked />} label="Sub Tissue" />
                    </FormGroup>
                  </Tooltip>
                </AccordionDetails>
              </Accordion>
            </Grid2>
            <Grid2 xs={12}>
              <Typography>
                Biosample Type
              </Typography>
              <FormGroup>
                <FormControlLabel onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => null} control={<Checkbox defaultChecked />} label="Sub Tissue" />
              </FormGroup>
            </Grid2>
          </Grid2>
        </AccordionDetails>
      </Accordion>
      {/* Chromatin Signals */}
      <Accordion square defaultExpanded disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
          <Typography>Chromatin Signals (Z-Scores)</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid2 container spacing={3}>
            <Grid2 xs={6} lg={12} xl={6}>
              <RangeSlider
                title="DNase"
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
            <Grid2 xs={6} lg={12} xl={6}>
              <RangeSlider
                title="H3K4me3"
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
            <Grid2 xs={6} lg={12} xl={6}>
              <RangeSlider
                title="H3K27ac"
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
            <Grid2 xs={6} lg={12} xl={6}>
              <RangeSlider
                title="CTCF"
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
          <Grid2 container spacing={0}>
            <Grid2 xs={6} sm={6} xl={6}>
              <FormGroup>
                <FormControlLabel checked={CA} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setCA(checked)} control={<Checkbox />} label="CA" />
                <FormControlLabel checked={CA_CTCF} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setCA_CTCF(checked)} control={<Checkbox />} label="CA-CTCF" />
                <FormControlLabel checked={CA_H3K4me3} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setCA_H3K4me3(checked)} control={<Checkbox />} label="CA-H3K4me3" />
                <FormControlLabel checked={CA_TF} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setCA_TF(checked)} control={<Checkbox />} label="CA-TF" />
              </FormGroup>
            </Grid2>
            <Grid2 xs={6} sm={6} xl={6}>
              <FormGroup>
                <FormControlLabel checked={dELS} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setdELS(checked)} control={<Checkbox />} label="dELS" />
                <FormControlLabel checked={pELS} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setpELS(checked)} control={<Checkbox />} label="pELS" />
                <FormControlLabel checked={PLS} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setPLS(checked)} control={<Checkbox />} label="PLS" />
                <FormControlLabel checked={TF} onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setTF(checked)} control={<Checkbox />} label="TF" />
              </FormGroup>
            </Grid2>
          </Grid2>
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
