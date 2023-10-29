"use client"
import React, { useState, useEffect } from "react"
import { LoadingMessage } from "../../../common/lib/utility"
import { PlotGeneExpression } from "../../applets/gene-expression/PlotGeneExpression"
import { useQuery } from "@apollo/client"
import { Button, Typography, Stack, TextField, MenuItem, FormControl, SelectChangeEvent, Checkbox, InputLabel, ListItemText, OutlinedInput, Select, ToggleButton, ToggleButtonGroup } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { ThemeProvider } from "@mui/material/styles"
import { defaultTheme } from "../../../common/lib/themes"
import Image from "next/image"
import { client } from "./client"
import { HUMAN_GENE_EXP, MOUSE_GENE_EXP } from "../../applets/gene-expression/const"
import { LinkedGenesData } from "../types"
import { GENE_EXP_QUERY, GENE_QUERY } from "../../applets/gene-expression/queries"
import { Download } from "@mui/icons-material"

//Replace this when Gene Autocomplete extracted into componenet
import GeneAutoComplete from "../../applets/gene-expression/gene-autocomplete"
import GenomeSwitch from "../../../common/components/GenomeSwitch"

/**
 * @todo
 * Download
 * Tooltip with correct info
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
  assembly: "GRCh38" | "mm10"
  genes?: LinkedGenesData
  applet?: boolean
}) {
  const [options, setOptions] = useState<string[]>([])
  const [currentGene, setCurrentGene] = useState<string>(props.genes ? props.genes.distancePC[0].name : null)
  const [biosamples, setBiosamples] = useState<string[]>(["cell line", "in vitro differentiated cells", "primary cell", "tissue"])
  const [group, setGroup] = useState<"byTissueMaxTPM" | "byExperimentTPM" | "byTissueTPM">("byTissueTPM")
  const [RNAtype, setRNAType] = useState<"all" | "polyA plus RNA-seq" | "total RNA-seq">("total RNA-seq")
  const [scale, setScale] = useState<"linearTPM" | "logTPM">("logTPM")
  const [replicates, setReplicates] = useState<"mean" | "all">("mean")
  const [assembly, setAssembly] = useState<"GRCh38" | "mm10">(props.assembly)

  //Change RNA type back when switching between assemblies, wipe data
  useEffect(() => {
    if (props.applet) {
      if (assembly === "GRCh38") {
        setRNAType("total RNA-seq")
      }
      geneExpData = null
      setCurrentGene(null)
    }
  }, [assembly])

  console.log("current gene: " + currentGene)

  //Skip fetches when no gene selected
  //Fetch Gene info to get ID
  const {
    data: data_gene,
    loading: loading_gene
  } = useQuery(GENE_QUERY, {
    variables: {
      assembly: assembly.toLowerCase(),
      name: [currentGene && assembly === "mm10" ? currentGene : currentGene?.toUpperCase()]
    },
    skip: !currentGene,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  //Fetch Gene Exp data
  const {
    data: data_geneexp,
    loading: loading_geneexp
  } = useQuery(GENE_EXP_QUERY, {
    variables: {
      assembly: assembly,
      gene_id: data_gene && data_gene.gene.length > 0 && data_gene.gene[0].id.split(".")[0],
      accessions: assembly === "GRCh38" ? HUMAN_GENE_EXP : MOUSE_GENE_EXP
    },
    skip: !currentGene || !data_gene || (data_gene && data_gene.gene.length === 0),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

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

  //Set Gene list. Why is this wrapped in useEffect?
  useEffect(() => {
    if (props.genes) {
      let geneList: string[] = []
      for (let g of props.genes.distancePC) if (!geneList.includes(g.name)) geneList.push(g.name)
      for (let g of props.genes.distanceAll) if (!geneList.includes(g.name)) geneList.push(g.name)
      setOptions(geneList)
    }
  }, [props.genes])


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
      <Stack mb={3} direction="row" justifyContent={"space-between"}>
        <Typography alignSelf={"flex-end"} variant={props.applet ? "h4" : "h5"}>{`${currentGene ? currentGene + " " : ""}Gene Expression Profiles by RNA-seq`}</Typography>
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
            href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + currentGene}
            color="secondary"
            sx={{ minWidth: 125, minHeight: 50 }}
          >
            <Image style={{ objectFit: "contain" }} src="https://geneanalytics.genecards.org/media/81632/gc.png" fill alt="gene-card-button" />
          </Button>
          {/* <Button 
            variant="contained"
            color="secondary"
            // onClick={() => downloadSVG(null, `${current_gene}_gene_expression.svg`)}
            sx={{ minWidth: 125, minHeight: 50 }}
            endIcon={<Download />}
          >
            Download Figure
          </Button> */}
        </Stack>
      </Stack>
      <Grid2 container spacing={3}>
        {props.applet ?
          <Stack direction="row">
            <GenomeSwitch
              // On switch change, change assembly and wipe data
              onSwitchChange={(checked: boolean) => {
                checked ? setAssembly("mm10") : setAssembly("GRCh38")
              }}
            />
            <GeneAutoComplete assembly={assembly} gene={currentGene} setGene={(gene) => setCurrentGene(gene)} />
          </Stack>
          :
          <TextField label="Gene" sx={{ m: 1 }} select value={currentGene}>
            {options.map((option: string) => {
              return (
                <MenuItem key={option} value={option} onClick={() => setCurrentGene(option)}>
                  {option}
                </MenuItem>
              )
            })}
          </TextField>
        }
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
        {assembly === "mm10" &&
          <ToggleButtonGroup
            color="primary"
            value={RNAtype}
            exclusive
            onChange={handleRNATypeChange}
            aria-label="RNA Type"
            size="medium"
            sx={{ m: 1 }}
          >
            <ToggleButton sx={{ textTransform: "none" }} value="total RNA-seq">Total RNA-seq</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="polyA plus RNA-seq">PolyA plus RNA-seq</ToggleButton>
            <ToggleButton sx={{ textTransform: "none" }} value="all">All</ToggleButton>
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
          <ToggleButton sx={{ textTransform: "none" }} value="byTissueTPM">By Tissue</ToggleButton>
          <ToggleButton sx={{ textTransform: "none" }} value="byTissueMaxTPM">By Tissue Max</ToggleButton>
          <ToggleButton sx={{ textTransform: "none" }} value="byExperimentTPM">By Experiment</ToggleButton>
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
          <ToggleButton sx={{ textTransform: "none" }} value="logTPM">Log10(TPM + 1)</ToggleButton>
          <ToggleButton sx={{ textTransform: "none" }} value="linearTPM">Linear TPM</ToggleButton>
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
          <ToggleButton sx={{ textTransform: "none" }} value="mean">Average Out Duplicates</ToggleButton>
          <ToggleButton sx={{ textTransform: "none" }} value="all">Show Duplicates</ToggleButton>
        </ToggleButtonGroup>
        <Grid2 xs={12}>
          {loading_gene || loading_geneexp ?
            <Grid2 xs={12} md={12} lg={12}>
              <LoadingMessage />
            </Grid2>
            :
            geneExpData ?
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
              :
              <Typography variant="h4">
                Please Select a Gene
              </Typography>
          }
        </Grid2>
      </Grid2>
    </ThemeProvider>
  )
}
