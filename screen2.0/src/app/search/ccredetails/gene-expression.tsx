"use client"
import React, { useState, useEffect } from "react"
import { LoadingMessage, ErrorMessage } from "../../../common/lib/utility"
import { PlotGeneExpression } from "../../applets/gene-expression/utils"
import { useQuery } from "@apollo/client"
import { Box, Button, Typography, IconButton, Drawer, Toolbar, AppBar, Stack, Paper, TextField, MenuItem, Tooltip, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, SelectChangeEvent, Checkbox, InputLabel, ListItemText, OutlinedInput, Select, ToggleButton, ToggleButtonGroup } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { ThemeProvider } from "@mui/material/styles"
import { defaultTheme } from "../../../common/lib/themes"
import InfoIcon from "@mui/icons-material/Info"
import Image from "next/image"
import { client } from "./client"
import { GeneExpressionInfoTooltip, HUMAN_GENE_EXP, MOUSE_GENE_EXP } from "../../applets/gene-expression/const"
import { LinkedGenesData } from "../types"
import { GENE_EXP_QUERY, GENE_QUERY } from "../../applets/gene-expression/queries"
import { OptionsGroupBy, OptionsRNAType, OptionsScale, OptionsReplicates } from "../../applets/gene-expression/options"

/**
 * @todo
 * Header
 * Mouse over "hand" thing for cursor over bars
 * Gene Name in Title
 * Label for switches
 * Default Values Total, tissue, Log, Average
 * Align tissue name with middle
 * Download
 * 
 * 
 * Big Data issues in Gene Expression
 * Discrepancy between new/old screen
 * 
 * Standup:
 * Sort Tissue Max in Descending Order?
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
  const [group, setGroup] = useState<"byTissueMaxTPM" | "byExperimentTPM" | "byTissueTPM">("byExperimentTPM") // experiment, tissue, tissue max
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

  const handleGroupChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: string | null,
  ) => {
    if ((newView !== null) && ((newView === "byTissueMaxTPM") || (newView === "byExperimentTPM") || (newView === "byTissueTPM"))) {
      setGroup(newView)
    }
  };

  const handleRNATypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newRNA: string | null,
  ) => {
    if ((newRNA !== null) && ((newRNA === "all") || (newRNA === "polyA plus RNA-seq") || (newRNA === "total RNA-seq"))) {
      setRNAType(newRNA)
    }
  };

  const handleScaleChange = (
    event: React.MouseEvent<HTMLElement>,
    newScale: string | null,
  ) => {
    if ((newScale !== null) && ((newScale === "linearTPM") || (newScale === "logTPM"))) {
      setScale(newScale)
    }
  };

  const handleReplicatesChange = (
    event: React.MouseEvent<HTMLElement>,
    newReplicates: string | null,
  ) => {
    if ((newReplicates !== null) && ((newReplicates === "mean") || (newReplicates === "all"))) {
      setReplicates(newReplicates)
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
    //Only reason that theme is used is to color buttons white
    <ThemeProvider theme={defaultTheme}>
      <Stack mb={4} direction="row" justifyContent={"space-between"}>
        <Typography variant="h5">Gene Expression Profiles by RNA-seq</Typography>
        <Stack direction="row" spacing={3}>
          <Button
            variant="contained"
            href={"https://genome.ucsc.edu/"}
            color="secondary"
            sx={{ minWidth: 125, minHeight: 50 }}
          >
            <Image style={{ objectFit: "contain" }} src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" fill alt="ucsc-button" />
          </Button>
          <Button
            variant="contained"
            href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + current_gene}
            color="secondary"
            sx={{ minWidth: 125, minHeight: 50 }}
          >
            <Image style={{ objectFit: "contain" }} src="https://geneanalytics.genecards.org/media/81632/gc.png" fill alt="gene-card-button" />
          </Button>
        </Stack>
      </Stack>
      <Grid2 container spacing={3}>
        <TextField label="Gene" sx={{ m: 1 }} select value={current_gene}>
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
        {/* RNA Type, hide for human as all data is total RNA-seq */}
        {props.assembly === "mm10" &&
          <ToggleButtonGroup
            color="primary"
            value={RNAtype}
            exclusive
            onChange={handleRNATypeChange}
            aria-label="RNA Type"
            size="medium"
            sx={{ m: 1 }}
          >
            <ToggleButton sx={{ textTransform: "none" }} value="all">Any</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="total RNA-seq">Total RNA-seq</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="polyA plus RNA-seq">PolyA plus RNA-seq</ToggleButton>
          </ToggleButtonGroup>
        }
        {/* View By */}
        <ToggleButtonGroup
          color="primary"
          value={group}
          exclusive
          onChange={handleGroupChange}
          aria-label="View By"
          size="medium"
          sx={{ m: 1 }}
        >
          <ToggleButton sx={{ textTransform: "none" }} value="byExperimentTPM">Experiment</ToggleButton>
          <ToggleButton sx={{ textTransform: "none" }} value="byTissueTPM">Tissue</ToggleButton>
          <ToggleButton sx={{ textTransform: "none" }} value="byTissueMaxTPM">Tissue Max</ToggleButton>
        </ToggleButtonGroup>
        {/* Scale */}
        <ToggleButtonGroup
          color="primary"
          value={scale}
          exclusive
          onChange={handleScaleChange}
          aria-label="Scale"
          size="medium"
          sx={{ m: 1, textTransform: "none" }}
        >
          <ToggleButton sx={{ textTransform: "none" }} value="linearTPM">Linear TPM</ToggleButton>
          <ToggleButton sx={{ textTransform: "none" }} value="logTPM">Log10(TPM + 1)</ToggleButton>
        </ToggleButtonGroup>
        {/* Replicates */}
        <ToggleButtonGroup
          color="primary"
          value={replicates}
          exclusive
          onChange={handleReplicatesChange}
          aria-label="Scale"
          size="medium"
          sx={{ m: 1 }}
        >
          <ToggleButton sx={{ textTransform: "none" }} value="mean">Average</ToggleButton>
          <ToggleButton sx={{ textTransform: "none" }} value="all">Show All</ToggleButton>
        </ToggleButtonGroup>
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
