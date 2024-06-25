"use client"
import React, { useState } from "react"
import { LoadingMessage } from "../../../common/lib/utility"
import { PlotGeneExpression } from "../../applets/gene-expression/geneexpressionplot"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { Button, Typography, Stack, MenuItem, FormControl, SelectChangeEvent, Checkbox, InputLabel, ListItemText, OutlinedInput, Select, ToggleButton, ToggleButtonGroup, FormLabel, Box } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import Image from "next/image"
import { HUMAN_GENE_EXP, MOUSE_GENE_EXP } from "../../applets/gene-expression/const"
import { GENE_EXP_QUERY, GENE_QUERY } from "../../applets/gene-expression/queries"

//Replace this when Gene Autocomplete extracted into componenet
import GeneAutoComplete from "../../applets/gene-expression/geneautocomplete"
import GenomeSwitch from "./genomeswitch"
import { ReadonlyURLSearchParams, usePathname, useSearchParams, useRouter } from "next/navigation"
import ConfigureGBModal from "./configuregbmodal"
import { ApolloQueryResult } from "@apollo/client"
import { BIOSAMPLE_Data } from "../../../common/lib/queries"

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
  genes?: {name: string, linkedBy?: string[]}[]
  applet?: boolean
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>
}) {
  const searchParams: ReadonlyURLSearchParams = useSearchParams()
  const urlAssembly = searchParams.get("assembly")
  const urlGene = searchParams.get("gene")
  const router = useRouter()
  const pathname = usePathname()

  //Use gene from url if specified
  const [currentHumanGene, setCurrentHumanGene] = useState<string>(props.genes ? props.genes[0].name : (urlAssembly === "GRCh38" && urlGene) ? urlGene : "APOE")
  const [currentMouseGene, setCurrentMouseGene] = useState<string>(props.genes ? props.genes[0].name : (urlAssembly === "mm10" && urlGene) ? urlGene : "Emid1")

  const [biosamples, setBiosamples] = useState<string[]>(["cell line", "in vitro differentiated cells", "primary cell", "tissue"])
  const [group, setGroup] = useState<"byTissueMaxTPM" | "byExperimentTPM" | "byTissueTPM">("byTissueTPM")
  const [RNAtype, setRNAType] = useState<"all" | "polyA plus RNA-seq" | "total RNA-seq">("total RNA-seq")
  const [scale, setScale] = useState<"linearTPM" | "logTPM">("logTPM")
  const [replicates, setReplicates] = useState<"mean" | "all">("mean")
  const [assembly, setAssembly] = useState<"GRCh38" | "mm10">(((urlAssembly === "GRCh38") || (urlAssembly === "mm10")) ? urlAssembly : props.assembly)
  const [configGBopen, setConfigGBOpen] = useState(false);

  const handleOpenConfigGB = () => {
    (assembly === "GRCh38" ? dataHumanGene?.gene[0] : dataMouseGene?.gene[0]) && setConfigGBOpen(true)
  }

  //Fetch Gene info to get ID
  const {
    data: dataHumanGene,
    loading: loadingHumanGene
  } = useQuery(GENE_QUERY, {
    variables: {
      assembly: "grch38",
      name: [currentHumanGene && currentHumanGene],
      version: 40
    },
    skip: !currentHumanGene,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  //Fetch Gene info to get ID
  const {
    data: dataMouseGene,
    loading: loadingMouseGene
  } = useQuery(GENE_QUERY, {
    variables: {
      assembly: "mm10",
      name: [currentMouseGene && currentMouseGene],
      version: 25
    },
    skip: !currentMouseGene,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  //Fetch Gene Exp data
  const {
    data: dataHumanExp,
    loading: loadingHumanExp
  } = useQuery(GENE_EXP_QUERY, {
    variables: {
      assembly: "GRCh38",
      gene_id: dataHumanGene && dataHumanGene.gene.length > 0 && dataHumanGene.gene[0].id.split(".")[0],
      accessions: HUMAN_GENE_EXP
    },
    skip: !currentHumanGene || !dataHumanGene || (dataHumanGene && dataHumanGene.gene.length === 0),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  const {
    data: dataMouseExp,
    loading: loadingMouseExp
  } = useQuery(GENE_EXP_QUERY, {
    variables: {
      assembly: "mm10",
      gene_id: dataMouseGene && dataMouseGene.gene.length > 0 && dataMouseGene.gene[0].id.split(".")[0],
      accessions: MOUSE_GENE_EXP
    },
    skip: !currentMouseGene || !dataMouseGene || (dataMouseGene && dataMouseGene.gene.length === 0),
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  })

  //Gene expression Data for chart
  //Filter it based on biosample types and RNA types selections
  let humanGeneExpData = (dataHumanExp && dataHumanExp.gene_dataset.length > 0) &&
    (RNAtype === "all" ?
      dataHumanExp.gene_dataset
        .filter(d => biosamples.includes(d.biosample_type))
      :
      dataHumanExp.gene_dataset
        .filter(d => biosamples.includes(d.biosample_type))
        .filter(r => r.assay_term_name === RNAtype))

  let mouseGeneExpData = (dataMouseExp && dataMouseExp.gene_dataset.length > 0) &&
    (RNAtype === "all" ?
      dataMouseExp.gene_dataset
        .filter(d => biosamples.includes(d.biosample_type))
      :
      dataMouseExp.gene_dataset
        .filter(d => biosamples.includes(d.biosample_type))
        .filter(r => r.assay_term_name === RNAtype))

  //Handle assembly switch change (for applet only)
  const handleAssemblyChange = (checked: boolean) => {
    if (props.applet) {
      checked ? setAssembly("mm10") : setAssembly("GRCh38")
      router.push(`${pathname}?assembly=${checked ? "mm10" : "GRCh38"}&gene=${checked ? currentMouseGene : currentHumanGene}`)
      //Switch back RNA type if going from mouse to human, as all data there is total
      if (assembly === "GRCh38") {
        setRNAType("total RNA-seq")
      }
    }
  }

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
    <>
      <Stack mb={3} direction="row" justifyContent={"space-between"}>
        <Typography
          alignSelf={"flex-end"}
          variant={props.applet ? "h4" : "h5"}>
          {assembly === "GRCh38" ? currentHumanGene : currentMouseGene} Gene Expression Profiles by RNA-seq
        </Typography>
        <Stack direction="row" spacing={3}>
          <Button
            variant="contained"
            color="secondary"
            sx={{ minWidth: 125, minHeight: 50 }}
            onClick={handleOpenConfigGB}
          >
            <Image style={{ objectFit: "contain" }} src="https://genome-euro.ucsc.edu/images/ucscHelixLogo.png" fill alt="ucsc-button" />
          </Button>
          <Button
            variant="contained"
            href={"https://www.genecards.org/cgi-bin/carddisp.pl?gene=" + `${assembly === "GRCh38" ? currentHumanGene : currentMouseGene}`}
            color="secondary"
            sx={{ minWidth: 125, minHeight: 50 }}
          >
            <Image style={{ objectFit: "contain" }} src="https://geneanalytics.genecards.org/media/81632/gc.png" fill alt="gene-card-button" />
          </Button>
        </Stack>
      </Stack>
      <Grid2 container alignItems={"flex-end"} spacing={2}>
        {props.applet ?
          <>
            <Grid2>
              <GenomeSwitch
                initialChecked={urlAssembly === "mm10"}
                onSwitchChange={(checked: boolean) => handleAssemblyChange(checked)}
              />
            </Grid2>
            <Grid2>
              <InputLabel>Gene</InputLabel>
              <GeneAutoComplete
                assembly={assembly}
                gene={assembly === "GRCh38" ? currentHumanGene : currentMouseGene}
                setGene={(gene) => {
                  if (assembly === "GRCh38") {
                    setCurrentHumanGene(gene)
                    router.push(`${pathname}?assembly=GRCh38&gene=${gene}`)
                  } else {
                    setCurrentMouseGene(gene)
                    router.push(`${pathname}?assembly=mm10&gene=${gene}`)
                  }
                }}
              />
            </Grid2>
          </>
          :
          <Grid2>
            <InputLabel>Gene</InputLabel>
            <Select
              value={assembly === "GRCh38" ? currentHumanGene : currentMouseGene}
              renderValue={(value) => (<Typography><i>{value}</i></Typography>)}
            >
              {props.genes.map((gene) => {
                return (
                  <MenuItem sx={{ display: "block" }} key={gene.name} value={gene.name} onClick={() => assembly === "GRCh38" ? setCurrentHumanGene(gene.name) : setCurrentMouseGene(gene.name)}>
                    <Typography><i>{gene.name}</i></Typography>
                    {gene?.linkedBy && <Typography variant="body2" color={"text.secondary"}>{gene.linkedBy.join(', ')}</Typography>}
                  </MenuItem>
                )
              })}
            </Select>
          </Grid2>
        }
        <Grid2>
          {/* Biosample Types */}
          <Stack>
            <InputLabel id="demo-multiple-checkbox-label">Biosample Types</InputLabel>
            <FormControl sx={{ width: 300 }}>
              <Select
                labelId="demo-multiple-checkbox-label"
                id="demo-multiple-checkbox"
                multiple
                value={biosamples}
                onChange={handleBiosampleChange}
                input={<OutlinedInput size="medium"/>}
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
          </Stack>
        </Grid2>
        {assembly === "mm10" &&
          <Grid2>
            {/* RNA Type, hide for human as all data is total RNA-seq */}
            <Stack>
              <FormLabel>RNA Type</FormLabel>
              <ToggleButtonGroup
                color="primary"
                value={RNAtype}
                exclusive
                onChange={handleRNATypeChange}
                aria-label="RNA Type"
                size="medium"
              >
                <ToggleButton sx={{ textTransform: "none" }} value="total RNA-seq">Total RNA-seq</ToggleButton>
                <ToggleButton sx={{ textTransform: "none" }} value="polyA plus RNA-seq">PolyA plus RNA-seq</ToggleButton>
                <ToggleButton sx={{ textTransform: "none" }} value="all">All</ToggleButton>
              </ToggleButtonGroup>
            </Stack>
          </Grid2>
        }
        <Grid2>
          {/* Scale */}
          <Stack>
            <FormLabel>Scale</FormLabel>
            <ToggleButtonGroup
              color="primary"
              value={scale}
              exclusive
              onChange={handleScaleChange}
              aria-label="Scale"
              size="medium"
            >
              <ToggleButton sx={{ textTransform: "none" }} value="logTPM">Log<sub>10</sub>(TPM + 1)</ToggleButton>
              <ToggleButton sx={{ textTransform: "none" }} value="linearTPM">Linear TPM</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Grid2>
        <Grid2>
          {/* View By */}
          <Stack>
            <FormLabel>View By</FormLabel>
            <ToggleButtonGroup
              color="primary"
              value={group}
              exclusive
              onChange={handleGroupChange}
              aria-label="View By"
              size="medium"
            >
              <ToggleButton sx={{ textTransform: "none" }} value="byTissueTPM">Tissue</ToggleButton>
              <ToggleButton sx={{ textTransform: "none" }} value="byTissueMaxTPM">Tissue Max</ToggleButton>
              <ToggleButton sx={{ textTransform: "none" }} value="byExperimentTPM">Experiment</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Grid2>
        <Grid2>
          {/* Replicates */}
          <Stack direction="column">
            <FormLabel>Replicates</FormLabel>
            <ToggleButtonGroup
              color="primary"
              value={replicates}
              exclusive
              onChange={handleReplicatesChange}
              aria-label="Scale"
              size="medium"
            >
              <ToggleButton sx={{ textTransform: "none" }} value="mean">Average Replicates</ToggleButton>
              <ToggleButton sx={{ textTransform: "none" }} value="all">Individual Replicates</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Grid2>

        {assembly === "GRCh38" ?
          loadingHumanGene || loadingHumanExp ?
            <Grid2 xs={12} md={12} lg={12}>
              <LoadingMessage />
            </Grid2>
            :
            humanGeneExpData ?
              <Grid2 xs={12}>
                <Box maxWidth={props.applet ? { xl: '75%', xs: '100%' } : { xl: '75%', xs: '100%' }}>
                  <PlotGeneExpression
                    data={humanGeneExpData}
                    range={{
                      x: { start: 0, end: 4 },
                      y: { start: 0, end: 0 },
                    }}
                    dimensions={{
                      x: { start: 0, end: 650 },
                      y: { start: 250, end: 0 },
                    }}
                    group={group}
                    scale={scale}
                    replicates={replicates}
                  />
                </Box>
              </Grid2>
              :
              <Typography variant="h5">
                Please Select a Gene
              </Typography>
          :
          loadingMouseGene || loadingMouseExp ?
            <Grid2 xs={12} md={12} lg={12}>
              <LoadingMessage />
            </Grid2>
            :
            mouseGeneExpData ?
            <Grid2 xs={12}>
              <Box maxWidth={props.applet ? {xl: '75%', xs: '100%'} : { xl: '75%', xs: '100%' }}>
                <PlotGeneExpression
                data={mouseGeneExpData}
                range={{
                  x: { start: 0, end: 4 },
                  y: { start: 0, end: 0 },
                }}
                dimensions={{
                  x: { start: 0, end: 650 },
                  y: { start: 250, end: 0 },
                }}
                group={group}
                scale={scale}
                replicates={replicates}
              />
              </Box>
            </Grid2>
              :
              <Typography variant="h5">
                Please Select a Gene
              </Typography>
        }
      </Grid2>
      {/* Configure Trackhub */}
      <ConfigureGBModal
        biosampleData={props.biosampleData}
        coordinates={{
          assembly: props.assembly,
          chromosome: assembly === "GRCh38" ? dataHumanGene?.gene[0]?.coordinates.chromosome : dataMouseGene?.gene[0]?.coordinates.chromosome,
          start: assembly === "GRCh38" ? dataHumanGene?.gene[0]?.coordinates.start : dataMouseGene?.gene[0]?.coordinates.start,
          end: assembly === "GRCh38" ? dataHumanGene?.gene[0]?.coordinates.end : dataMouseGene?.gene[0]?.coordinates.end,
        }}
        accession={assembly === "GRCh38" ? currentHumanGene : currentMouseGene}
        open={configGBopen}
        setOpen={setConfigGBOpen}
      />
    </>
  )
}
