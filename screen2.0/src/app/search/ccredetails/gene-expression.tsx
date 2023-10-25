"use client"
import React, { useState, useEffect } from "react"
import { LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
import { PlotGeneExpression } from "../../applets/gene-expression/utils"
import { useQuery } from "@apollo/client"
import { Box, Button, Typography, IconButton, Drawer, Toolbar, AppBar, Stack, Paper, TextField, MenuItem, Tooltip, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, SelectChangeEvent, Checkbox, InputLabel, ListItemText, OutlinedInput, Select } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { ThemeProvider } from "@mui/material/styles"
import { defaultTheme } from "../../../common/lib/themes"
import InfoIcon from "@mui/icons-material/Info"
import Image from "next/image"
import { client } from "./client"
import { GeneExpressionInfoTooltip, HUMAN_GENE_EXP, MOUSE_GENE_EXP } from "../../applets/gene-expression/const"
import { LinkedGenesData } from "../types"
import { GENE_EXP_QUERY, GENE_QUERY } from "../../applets/gene-expression/queries"

/**
 * @todo
 * Error when deselecting all options for checkboxes
 * Able to deselect radio button?
 * What should the behavior be. Is using toggle buttons, not radio?
 * Log2 scale is all messed up
 * 
 * 
 * Big Data issues in Gene Expression
 * Discrepancy between new/old screen
 * 
 */

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 8.5 + ITEM_PADDING_TOP,
      width: 200,
    },
  },
};

const biosampleTypes = ["cell line", "in vitro differentiated cells", "primary cell", "tissue"];

export function GeneExpression(props: {
  accession: string
  assembly: string
  genes: LinkedGenesData
  hamburger: boolean
}) {
  const [options, setOptions] = useState<string[]>([])
  const [current_gene, setGene] = useState<string>(props.genes.distancePC[0].name)
  const [biosamples, setBiosamples] = useState<string[]>(["cell line", "in vitro differentiated cells", "primary cell", "tissue"])
  const [group, setGroup] = useState<"byTissueMaxTPM" | "byExperimentTPM" | "byTissueTPM">("byTissueTPM") // experiment, tissue, tissue max
  const [RNAtype, setRNAType] = useState<"all" | "polyA plus RNA-seq" | "total RNA-seq">("all") // any, polyA plus RNA-seq, total RNA-seq
  const [scale, setScale] = useState<"linearTPM" | "logTPM">("linearTPM") // linear or log2
  const [replicates, setReplicates] = useState<"mean" | "all">("mean") // single or mean

  //Fetch Gene info to get ID
  const {
    data: data_gene,
    loading: gene_loading
  } = useQuery(GENE_QUERY, {
    variables: {
      assembly: props.assembly.toLowerCase(),
      name: [props.assembly === "mm10" ? current_gene : current_gene.toUpperCase()]
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  //Fetch Gene Exp data
  const {
    data: data_geneexp,
    loading: geneexp_loading
  } = useQuery(GENE_EXP_QUERY, {
    variables: {
      assembly: props.assembly,
      gene_id: data_gene && data_gene.gene.length > 0 && data_gene.gene[0].id.split(".")[0],
      accessions: props.assembly.toLowerCase() === "grch38" ? HUMAN_GENE_EXP : MOUSE_GENE_EXP
    },
    skip: !data_gene || (data_gene && data_gene.gene.length === 0),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  //Set Gene list. Why is this wrapped in useEffect?
  useEffect(() => {
    let geneList: string[] = []
    for (let g of props.genes.distancePC) if (!geneList.includes(g.name)) geneList.push(g.name)
    for (let g of props.genes.distanceAll) if (!geneList.includes(g.name)) geneList.push(g.name)
    setOptions(geneList)
  }, [props.genes])

  //Gene expression Data
  //Filter it based on biosample types and RNA types selections
  let geneExpData = (data_geneexp && data_geneexp.gene_dataset.length > 0) &&
    (RNAtype === "all" ?
      data_geneexp.gene_dataset
        .filter(d => biosamples.includes(d.biosample_type))
      :
      data_geneexp.gene_dataset
        .filter(d => biosamples.includes(d.biosample_type))
        .filter(r => r.assay_term_name === RNAtype))

  const handleGroupChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value
    if ((newVal === "byTissueMaxTPM") || (newVal === "byExperimentTPM") || (newVal === "byTissueTPM")) {
      setGroup(newVal)
    }
  };

  const handleScaleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value
    if ((newVal === "linearTPM") || (newVal === "logTPM")) {
      setScale(newVal)
    }
  };

  const handleReplicatesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value
    if ((newVal === "mean") || (newVal === "all")) {
      setReplicates(newVal)
    }
  };

  const handleRNATypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value
    if ((newVal === "all") || (newVal === "polyA plus RNA-seq") || (newVal === "total RNA-seq")) {
      setRNAType(newVal)
    }
  };

  const handleBiosampleChange = (event: SelectChangeEvent<typeof biosampleTypes>) => {
    const {
      target: { value },
    } = event;
    setBiosamples(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  return (
    //Only reaosn that theme is used is to color buttons white
    <ThemeProvider theme={defaultTheme}>
      <Grid2 container spacing={3} sx={{ ml: 2, mr: 2 }}>
        <Grid2 mb={2} xs={12} md={12} lg={12}>
          <AppBar position="static" color="secondary">
            <Toolbar style={{ height: "120px" }}>
              <Grid2 xs={5} md={8} lg={9}>
                <Box mt={0.5}>
                  <Typography variant="h4" sx={{ fontSize: 28, fontStyle: "italic", display: "inline" }}>
                    {current_gene}
                  </Typography>
                  <Typography variant="h4" sx={{ fontSize: 28, display: "inline" }}>
                    {" "}
                    Gene Expression Profiles by RNA-seq
                  </Typography>
                  <Tooltip title={GeneExpressionInfoTooltip}>
                    <IconButton>
                      <InfoIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Grid2>
              <Grid2 xs={1.5} sx={{ mt: 2, height: 100, width: 190 }}>
                <Button variant="contained" href={"https://genome.ucsc.edu/"} color="secondary">
                  <Image src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" width={150} height={100} alt="ucsc-button" />
                </Button>
              </Grid2>
              <Grid2 xs={1.5} sx={{ mt: 2, height: 100, width: 214 }}>
                <Button
                  variant="contained"
                  href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + current_gene}
                  color="secondary"
                >
                  <Image src="https://geneanalytics.genecards.org/media/81632/gc.png" width={150} height={100} alt="gene-card-button" />
                </Button>
              </Grid2>
            </Toolbar>
          </AppBar>
        </Grid2>
      </Grid2>
      <Grid2 container spacing={3}>
        <TextField label="Gene" sx={{m:1}} select value={current_gene}>
          {options.map((option: string) => {
            return (
              <MenuItem key={option} value={option} onClick={() => setGene(option)}>
                {option}
              </MenuItem>
            )
          })}
        </TextField>
        {/* Biosample Types */}
        <FormControl sx={{ m: 1, width: 300 }}>
          <InputLabel id="demo-multiple-checkbox-label">Biosample Types</InputLabel>
          <Select
            labelId="demo-multiple-checkbox-label"
            id="demo-multiple-checkbox"
            multiple
            value={biosamples}
            onChange={handleBiosampleChange}
            input={<OutlinedInput label="Biosample Types" />}
            renderValue={(selected) => selected.join(', ')}
            MenuProps={MenuProps}
          >
            {biosampleTypes.map((name) => (
              <MenuItem key={name} value={name}>
                <Checkbox checked={biosamples.indexOf(name) > -1} />
                <ListItemText primary={name} />
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        {/* Group By */}
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">Group By</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            value={group}
            onChange={handleGroupChange}
          >
            <FormControlLabel value="byExperimentTPM" control={<Radio />} label="Experiment" />
            <FormControlLabel value="byTissueTPM" control={<Radio />} label="Tissue" />
            <FormControlLabel value="byTissueMaxTPM" control={<Radio />} label="Tissue Max" />
          </RadioGroup>
        </FormControl>
        {/* RNA Type, hide for human as all data is total RNA-seq */}
        {props.assembly === "mm10" && <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">RNA Type</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            value={RNAtype}
            onChange={handleRNATypeChange}
          >
            <FormControlLabel value="total RNA-seq" control={<Radio />} label="Total RNA-seq" />
            <FormControlLabel value="polyA plus RNA-seq" control={<Radio />} label="PolyA plus RNA-seq" />
            <FormControlLabel value="all" control={<Radio />} label="Any" />
          </RadioGroup>
        </FormControl>}
        {/* Scale */}
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">Scale</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            value={scale}
            onChange={handleScaleChange}
          >
            <FormControlLabel value="linearTPM" control={<Radio />} label="Linear TPM" />
            <FormControlLabel value="logTPM" control={<Radio />} label="Log10(TPM + 1)" />
          </RadioGroup>
        </FormControl>
        {/* Replicates */}
        <FormControl>
          <FormLabel id="demo-radio-buttons-group-label">Replicates</FormLabel>
          <RadioGroup
            aria-labelledby="demo-radio-buttons-group-label"
            name="radio-buttons-group"
            value={replicates}
            onChange={handleReplicatesChange}
          >
            <FormControlLabel value="mean" control={<Radio />} label="Average" />
            <FormControlLabel value="all" control={<Radio />} label="Show All" />
          </RadioGroup>
        </FormControl>
        {geneexp_loading || gene_loading ? (
          <Grid2 xs={12} md={12} lg={12}>
            <LoadingMessage />
          </Grid2>
        ) : (
          //The Main Chart
          geneExpData &&
          (
            <PlotGeneExpression
              data={geneExpData}
              range={{
                x: { start: 0, end: 4 },
                y: { start: 0, end: 0 },
              }}
              dimensions={{
                // x: { start: 125, end: 650 },
                x: { start: 0, end: 650 },
                y: { start: 250, end: 0 },
              }}
              // RNAtype={RNAtype}
              group={group}
              scale={scale}
              replicates={replicates}
            />
          )
        )}
      </Grid2>
    </ThemeProvider>
  )
}
