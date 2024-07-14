"use client"

import React, { useState, useEffect, Dispatch, SetStateAction, useContext, useCallback, useMemo } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Button,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
  Box,
  Slider,
  FormLabel,
  Stack,
  CircularProgress,
  IconButton,
  Divider,
} from "@mui/material/"

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Grid2 from "@mui/material/Unstable_Grid2"
import { RangeSlider } from "@weng-lab/psychscreen-ui-components"
import { BiosampleTableFilters, FilterCriteria, MainQueryParams, RegistryBiosample } from "./types"
import { filtersModified } from "./searchhelpers"
import { ApolloQueryResult, LazyQueryExecFunction, LazyQueryResultTuple, gql } from "@apollo/client"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { InfoOutlined } from "@mui/icons-material";
import BiosampleTables from "./biosampletables";
import ClearIcon from '@mui/icons-material/Clear';
import { BIOSAMPLE_Data } from "../../common/lib/queries";
import { GeneAutoComplete2, GeneInfo } from "./_filterspanel/geneautocomplete2";
import { NearbyAndLinked } from "./_ccredetails/ccredetails";
import { LinkedGenes, LinkedGenesVariables } from "./page";

const snpMarks = [
  {
    value: 0,
    label: '0kb',
  },
  {
    value: 500,
    label: '0.5kb',
  },
  {
    value: 1000,
    label: '1kb',
  },
  {
    value: 1500,
    label: '1.5kb',
  },
  {
    value: 2000,
    label: '2kb',
  }
];

const tssMarks = [
  {
    value: 0,
    label: '0kb',
  },
  {
    value: 10000,
    label: '10kb',
  },
  {
    value: 25000,
    label: '25kb',
  },
  {
    value: 50000,
    label: '50kb',
  },
  {
    value: 100000,
    label: '100kb',
  }
];

const GENE_TRANSCRIPTS_QUERY = gql`
 query ($assembly: String!, $name: [String!], $limit: Int, $version: Int) {
   gene(assembly: $assembly, name: $name, limit: $limit, version: $version) {
     name
     id
     coordinates {
       start
       chromosome
       end
     }
     strand
     transcripts {
      name
      coordinates {
        start
        end
      }      
    }
   }
 } `

export function MainResultsFilters(
  props: {
    mainQueryParams: MainQueryParams,
    setMainQueryParams: Dispatch<SetStateAction<MainQueryParams>>,
    filterCriteria: FilterCriteria,
    setFilterCriteria: Dispatch<SetStateAction<FilterCriteria>>,
    biosampleTableFilters: BiosampleTableFilters,
    setBiosampleTableFilters: Dispatch<SetStateAction<BiosampleTableFilters>>,
    setBiosample: (biosample: RegistryBiosample) => void,
    TSSs: number[]
    setTSSs: Dispatch<SetStateAction<number[]>>,
    setTSSranges: Dispatch<SetStateAction<{ start: number, end: number }[]>>
    biosampleData: ApolloQueryResult<BIOSAMPLE_Data>
    genomeBrowserView: boolean,
    searchParams: { [key: string]: string | undefined },
    useLinkedGenes: LazyQueryResultTuple<LinkedGenes, LinkedGenesVariables> //Is this a proper usage of a custom hook?
  }
): JSX.Element {

  const [getLinkedGenes, { loading: loadingLinkedGenes, data: dataLinkedGenes, error: errorLinkedGenes }] = props.useLinkedGenes

  const {
    data: geneTranscripts
  } = useQuery(GENE_TRANSCRIPTS_QUERY, {
    variables: {
      assembly: props.mainQueryParams.coordinates.assembly.toLowerCase(),
      name: [props.mainQueryParams.gene.name],
      version: props.mainQueryParams.coordinates.assembly.toLowerCase() === "grch38" ? 40 : 25,
    },
    skip: !props.mainQueryParams.gene.name,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first"

  })

  //Recalculate when geneTranscripts available, near
  useEffect(() => {
    if (geneTranscripts?.gene?.length > 0) {
      const TSSs = geneTranscripts.gene[0].transcripts.map(t => {
        if (geneTranscripts.gene[0].strand === "+") {
          return t.coordinates.start
        } else {
          return t.coordinates.end
        }
      })
      // console.log("Max" + Math.max(...TSSs))
      // console.log("Min" + Math.min(...TSSs))
      props.setTSSs(TSSs)
    }
  }, [geneTranscripts])

  //Recalculate TSS ranges when gene distance changes
  useEffect(() => {
    if (props.TSSs !== null) {
      const TSSranges: { start: number, end: number }[] = props.TSSs?.map((tss) => {
        return { start: Math.max(0, tss - props.mainQueryParams.gene.distance), end: tss + props.mainQueryParams.gene.distance }
      })
      // console.log("setting TSSranges")
      props.setTSSranges(TSSranges)
    }
  }, [props.mainQueryParams.gene.distance, props.TSSs])

  const valuetext = (value: number) => {
    return `${value}kb`;
  }


  /**
   * List of linked genes with corresponding linked accessions
   */
  const linkedGenesWithNums: { geneName: string, accessions: string[] }[] = useMemo(() => {
    const genesWithNums: { geneName: string, accessions: string[] }[] = []
    if (dataLinkedGenes?.linkedGenes) {
      for (const linkedGene of dataLinkedGenes?.linkedGenes) {
        const entry = genesWithNums.find(x => (x.geneName === linkedGene.gene.split(' ')[0]))
        //If entry exists, check if accession already documented. If not, add accession
        if (entry) {
          if (!entry.accessions.find(x => x === linkedGene.accession)) {
            entry.accessions.push(linkedGene.accession)
          }
        } else {
          genesWithNums.push({ geneName: linkedGene.gene.split(' ')[0], accessions: [linkedGene.accession] })
        }
      }
    }
    return genesWithNums
  }, [dataLinkedGenes?.linkedGenes])

  const handleRenderGeneAutoCompleteOption = useCallback((
    props: React.HTMLAttributes<HTMLLIElement>,
    option: GeneInfo,
    descriptions: {
      name: string;
      desc: string;
    }[]) => {
    const geneInfo = linkedGenesWithNums.find(x => x.geneName === option.name)
    return (
      <li {...props} key={props.id}>
        <Grid2 container alignItems="center">
          <Grid2 sx={{ width: "100%" }}>
            <Box component="span" sx={{ fontWeight: "regular" }}>
              {loadingLinkedGenes ?
                <Stack direction={'row'}>
                  <i>{option.name}</i>
                  <CircularProgress size={"1rem"} />
                </Stack>
                :
                geneInfo ?
                  <i>{option.name}</i>
                  :
                  <s><i>{option.name}</i></s>
              }
            </Box>
            <Typography variant="body2" color="text.secondary">
              {(geneInfo || loadingLinkedGenes) ? descriptions.find((g) => g.name === option.name)?.desc + ` (Linked: ${geneInfo.accessions.length})` : "Not linked to any search results"}
            </Typography>
          </Grid2>
        </Grid2>
      </li>
    )
  }, [loadingLinkedGenes, linkedGenesWithNums])

  return (
    <Paper elevation={0}>
      {/* cCREs within distance from SNP  */}
      {props.mainQueryParams.snp.rsID &&
        <>
          <Accordion defaultExpanded square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
              <Stack direction="row" spacing={1}>
                {props.mainQueryParams.snp.distance > 0 ?
                  <>
                    <IconButton size="small" sx={{ p: 0 }}
                      onClick={(event) => {
                        props.setMainQueryParams({ ...props.mainQueryParams, snp: { rsID: props.mainQueryParams.snp.rsID, distance: 0 } });
                        event.stopPropagation()
                      }}
                    >
                      <Tooltip placement="top" title={"Clear Filter"}>
                        <ClearIcon />
                      </Tooltip>
                    </IconButton>
                    <i><Typography sx={{ fontWeight: "bold" }}>Search distance from {props.mainQueryParams.snp.rsID}</Typography></i>
                  </>
                  :
                  <Typography>Search distance from {props.mainQueryParams.snp.rsID}</Typography>
                }
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={2}>
                <Grid2 xs={12}>
                  <Box sx={{ width: 300 }}>
                    <Slider
                      aria-label="Custom marks"
                      defaultValue={0}
                      getAriaValueText={valuetext}
                      valueLabelDisplay="auto"
                      min={0}
                      max={2000}
                      step={null}
                      value={props.mainQueryParams.snp.distance}
                      onChange={(_, value: number) => props.setMainQueryParams({ ...props.mainQueryParams, snp: { ...props.mainQueryParams.snp, distance: value } })}
                      marks={snpMarks}
                    />
                  </Box>
                </Grid2>
              </Grid2>
            </AccordionDetails>
          </Accordion>
        </>
      }
      {/* cCRES near gene  */}
      {props.mainQueryParams.gene.name &&
        <Accordion defaultExpanded square disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
            <Stack direction="row" spacing={1}>
              {props.mainQueryParams.gene.nearTSS ?
                <>
                  <IconButton size="small" sx={{ p: 0 }}
                    onClick={(event) => {
                      props.setMainQueryParams({
                        ...props.mainQueryParams, gene: {
                          ...props.mainQueryParams.gene,
                          nearTSS: false
                        }
                      });
                      event.stopPropagation()
                    }}
                  >
                    <Tooltip placement="top" title={"Clear Filter"}>
                      <ClearIcon />
                    </Tooltip>
                  </IconButton>
                  <i><Typography sx={{ fontWeight: "bold" }}>Overlapping Gene/Near TSSs</Typography></i>
                </>
                :
                <Typography>Overlapping Gene/Near TSSs</Typography>
              }
            </Stack>
          </AccordionSummary>
          <AccordionDetails>
            {geneTranscripts ?
              <Grid2 container spacing={2}>
                <Grid2 xs={12}>
                  <FormControl>
                    <RadioGroup
                      aria-labelledby="gene-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={props.mainQueryParams.gene.nearTSS ? "tss" : "overlappinggene"}
                      onChange={(_, value: string) => {
                        props.setMainQueryParams({ ...props.mainQueryParams, gene: { ...props.mainQueryParams.gene, nearTSS: value === "tss" } })
                      }}
                    >
                      <FormControlLabel value="overlappinggene" control={<Radio />} label={<><i>{props.mainQueryParams.gene.name}</i> gene body</>} />
                      <FormControlLabel value="tss" control={<Radio />} label={<>Within distance of TSS of <i>{props.mainQueryParams.gene.name}</i></>} />
                    </RadioGroup>
                  </FormControl>
                </Grid2>
                {props.mainQueryParams.gene.nearTSS && <Grid2 xs={12}>
                  <Box sx={{ width: 300 }}>
                    <Typography id="input-slider" gutterBottom>
                      Distance around TSS
                    </Typography>
                    <Slider
                      aria-label="Custom marks"
                      defaultValue={0}
                      getAriaValueText={valuetext}
                      valueLabelDisplay="auto"
                      min={0}
                      max={100000}
                      step={null}
                      value={props.mainQueryParams.gene.distance}
                      onChange={(_, value: number) => props.setMainQueryParams({ ...props.mainQueryParams, gene: { ...props.mainQueryParams.gene, distance: value } })}
                      marks={tssMarks}
                    />
                  </Box>
                </Grid2>}
              </Grid2>
              :
              <CircularProgress sx={{ margin: "auto" }} />
            }
          </AccordionDetails>
        </Accordion>
      }
      {/* Biosample Activity */}
      <Accordion defaultExpanded={props.mainQueryParams.gene.name ? false : true} square disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Stack direction="row" spacing={1}>
            {props.mainQueryParams.biosample ?
              <>
                <IconButton size="small" sx={{ p: 0 }} onClick={(event) => { props.setMainQueryParams({ ...props.mainQueryParams, biosample: null }); event.stopPropagation() }}>
                  <Tooltip placement="top" title={"Clear Biosample"}>
                    <ClearIcon />
                  </Tooltip>
                </IconButton>
                <i><Typography sx={{ fontWeight: "bold" }}>Biosample Activity</Typography></i>
              </>
              :
              <Typography>Biosample Activity</Typography>
            }
            <Tooltip arrow placement="right-end" title={"View results based on biochemical activity in the selected biosample. The colorful wheels next to each biosample represent the assays available, hover over them for more info"}>
              <InfoOutlined fontSize="small" />
            </Tooltip>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Grid2 container spacing={2}>
            {props.mainQueryParams.biosample && (
              <>
                <Grid2 xs={12}>
                  <Paper elevation={0}>
                    <Typography>Selected Biosample:</Typography>
                    <Typography>{props.mainQueryParams.biosample.ontology.charAt(0).toUpperCase() + props.mainQueryParams.biosample.ontology.slice(1) + " - " + props.mainQueryParams.biosample.displayname}</Typography>
                  </Paper>
                </Grid2>
                <Grid2 xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      props.setMainQueryParams({ ...props.mainQueryParams, biosample: null })
                    }}
                  >
                    Clear
                  </Button>
                </Grid2>
              </>
            )}
            <Grid2 xs={12}>
              <Box sx={{ display: 'flex', flexDirection: "column" }}>
                {props.biosampleData?.loading ?
                  <CircularProgress sx={{ margin: "auto" }} />
                  :
                  props.biosampleData?.data ?
                    <BiosampleTables
                      showRNAseq={false}
                      showDownloads={false}
                      assembly={props.mainQueryParams.coordinates.assembly}
                      biosampleSelectMode="replace"
                      biosampleData={props.biosampleData}
                      selectedBiosamples={[props.mainQueryParams.biosample]}
                      setSelectedBiosamples={(biosample: [RegistryBiosample]) => props.setBiosample(biosample[0])}
                      biosampleTableFilters={props.biosampleTableFilters}
                      setBiosampleTableFilters={props.setBiosampleTableFilters}
                    />
                    :
                    <CircularProgress sx={{ margin: "auto" }} />
                }
              </Box>
            </Grid2>
          </Grid2>
        </AccordionDetails>
      </Accordion>
      {/* Hide all other filters when on genome browser view */}
      {!props.genomeBrowserView &&
        <>
          {/* Chromatin Signals */}
          <Accordion square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
              <Stack direction="row" spacing={1}>
                {filtersModified(props.filterCriteria, "chromatin signals") ?
                  <>
                    <IconButton size="small" sx={{ p: 0 }}
                      onClick={(event) => {
                        props.setFilterCriteria({
                          ...props.filterCriteria,
                          dnase_s: -10,
                          dnase_e: 11,
                          atac_s: -10,
                          atac_e: 11,
                          h3k4me3_s: -10,
                          h3k4me3_e: 11,
                          h3k27ac_s: -10,
                          h3k27ac_e: 11,
                          ctcf_s: -10,
                          ctcf_e: 11
                        });
                        event.stopPropagation()
                      }}
                    >
                      <Tooltip placement="top" title={"Clear Filter"}>
                        <ClearIcon />
                      </Tooltip>
                    </IconButton>
                    <i><Typography sx={{ fontWeight: "bold" }}>Chromatin Signals (Z&#8209;Scores)</Typography></i>
                  </>
                  :
                  <Typography>Chromatin Signals (Z-Scores)</Typography>
                }
                <Tooltip arrow placement="right-end" title={"Filter results based on DNase, H3K4me3, H3K27ac, CTCF, and ATAC Z-scores"}>
                  <InfoOutlined fontSize="small" />
                </Tooltip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={3}>
                {(!props.mainQueryParams.biosample || props.mainQueryParams.biosample.dnase) && <Grid2 xs={6}>
                  <RangeSlider
                    title="DNase"
                    width="100%"
                    value={[props.filterCriteria.dnase_s, props.filterCriteria.dnase_e]}
                    min={-10}
                    max={11}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({ ...props.filterCriteria, dnase_s: value[0], dnase_e: value[1] })
                    }}
                  />
                </Grid2>}
                {(!props.mainQueryParams.biosample || props.mainQueryParams.biosample.h3k4me3) && <Grid2 xs={6}>
                  <RangeSlider
                    title="H3K4me3"
                    width="100%"
                    value={[props.filterCriteria.h3k4me3_s, props.filterCriteria.h3k4me3_e]}
                    min={-10}
                    max={11}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({ ...props.filterCriteria, h3k4me3_s: value[0], h3k4me3_e: value[1] })
                    }}
                  />
                </Grid2>}
                {(!props.mainQueryParams.biosample || props.mainQueryParams.biosample.h3k27ac) && <Grid2 xs={6}>
                  <RangeSlider
                    title="H3K27ac"
                    width="100%"
                    value={[props.filterCriteria.h3k27ac_s, props.filterCriteria.h3k27ac_e]}
                    min={-10}
                    max={11}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({ ...props.filterCriteria, h3k27ac_s: value[0], h3k27ac_e: value[1] })
                    }}
                  />
                </Grid2>}
                {(!props.mainQueryParams.biosample || props.mainQueryParams.biosample.ctcf) && <Grid2 xs={6}>
                  <RangeSlider
                    title="CTCF"
                    width="100%"
                    value={[props.filterCriteria.ctcf_s, props.filterCriteria.ctcf_e]}
                    min={-10}
                    max={11}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({ ...props.filterCriteria, ctcf_s: value[0], ctcf_e: value[1] })
                    }}
                  />
                </Grid2>}
                {(!props.mainQueryParams.biosample || props.mainQueryParams.biosample.atac) && <Grid2 xs={6}>
                  <RangeSlider
                    title="ATAC"
                    width="100%"
                    value={[props.filterCriteria.atac_s, props.filterCriteria.atac_e]}
                    min={-10}
                    max={11}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({ ...props.filterCriteria, atac_s: value[0], atac_e: value[1] })
                    }}
                  />
                </Grid2>}
              </Grid2>
            </AccordionDetails>
          </Accordion>
          {/* Classification */}
          <Accordion square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3a-content" id="panel3a-header">
              <Stack direction="row" spacing={1}>
                {filtersModified(props.filterCriteria, "classification") ?
                  <>
                    <IconButton size="small" sx={{ p: 0 }}
                      onClick={(event) => {
                        props.setFilterCriteria({
                          ...props.filterCriteria,
                          CA: true,
                          CA_CTCF: true,
                          CA_H3K4me3: true,
                          CA_TF: true,
                          dELS: true,
                          pELS: true,
                          PLS: true,
                          TF: true,
                        });
                        event.stopPropagation()
                      }}
                    >
                      <Tooltip placement="top" title={"Clear Filter"}>
                        <ClearIcon />
                      </Tooltip>
                    </IconButton>
                    <i><Typography sx={{ fontWeight: "bold" }}>Classification</Typography></i>
                  </>
                  :
                  <Typography>Classification</Typography>
                }
                <Tooltip arrow placement="right-end" title={"Filter results based on cCRE classification"}>
                  <InfoOutlined fontSize="small" />
                </Tooltip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <FormGroup>
                <FormControlLabel
                  checked={!filtersModified(props.filterCriteria, "classification")}
                  onChange={(_, checked: boolean) =>
                    props.setFilterCriteria({
                      ...props.filterCriteria,
                      CA: checked,
                      CA_CTCF: checked,
                      CA_H3K4me3: checked,
                      CA_TF: checked,
                      dELS: checked,
                      pELS: checked,
                      PLS: checked,
                      TF: checked,
                    })
                  }
                  control={<Checkbox />}
                  label="Select All"
                />
              </FormGroup>
              <Divider />
              {/* <Typography>cCRE Classes</Typography> */}
              <Grid2 container spacing={0}>
                <Grid2 xs={6}>
                  <FormGroup>
                    <FormControlLabel
                      checked={props.filterCriteria.CA}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, CA: checked })}
                      control={<Checkbox />}
                      label="CA"
                    />
                    <FormControlLabel
                      checked={props.filterCriteria.CA_CTCF}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, CA_CTCF: checked })}
                      control={<Checkbox />}
                      label="CA-CTCF"
                    />
                    <FormControlLabel
                      checked={props.filterCriteria.CA_H3K4me3}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, CA_H3K4me3: checked })}
                      control={<Checkbox />}
                      label="CA-H3K4me3"
                    />
                    <FormControlLabel
                      checked={props.filterCriteria.CA_TF}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, CA_TF: checked })}
                      control={<Checkbox />}
                      label="CA-TF"
                    />
                  </FormGroup>
                </Grid2>
                <Grid2 xs={6}>
                  <FormGroup>
                    <FormControlLabel
                      checked={props.filterCriteria.dELS}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, dELS: checked })}
                      control={<Checkbox />}
                      label="dELS"
                    />
                    <FormControlLabel
                      checked={props.filterCriteria.pELS}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, pELS: checked })}
                      control={<Checkbox />}
                      label="pELS"
                    />
                    <FormControlLabel
                      checked={props.filterCriteria.PLS}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, PLS: checked })}
                      control={<Checkbox />}
                      label="PLS"
                    />
                    <FormControlLabel
                      checked={props.filterCriteria.TF}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, TF: checked })}
                      control={<Checkbox />}
                      label="TF"
                    />
                  </FormGroup>
                </Grid2>
              </Grid2>
            </AccordionDetails>
          </Accordion>
          {/* Conservation */}
          {props.mainQueryParams.coordinates.assembly === "GRCh38" && <Accordion square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel6a-content" id="panel6a-header">
              <Stack direction="row" spacing={1}>
                {filtersModified(props.filterCriteria, "conservation") ?
                  <>
                    <IconButton size="small" sx={{ p: 0 }}
                      onClick={(event) => {
                        props.setFilterCriteria({
                          ...props.filterCriteria,
                          prim_s: -2,
                          prim_e: 2,
                          mamm_s: -4,
                          mamm_e: 8,
                          vert_s: -3,
                          vert_e: 8,
                        });
                        event.stopPropagation()
                      }}
                    >
                      <Tooltip placement="top" title={"Clear Filter"}>
                        <ClearIcon />
                      </Tooltip>
                    </IconButton>
                    <i><Typography sx={{ fontWeight: "bold" }}>Conservation</Typography></i>
                  </>
                  :
                  <Typography>Conservation</Typography>
                }
                <Tooltip arrow placement="right-end" title={"Filter results based on Primate, Mammal, and Vertebrate conservation scores"}>
                  <InfoOutlined fontSize="small" />
                </Tooltip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={3}>
                <Grid2 xs={6}>
                  <RangeSlider
                    title="43-primate (phastCons)"
                    width="100%"
                    value={[props.filterCriteria.prim_s, props.filterCriteria.prim_e]}
                    min={-2}
                    max={2}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({ ...props.filterCriteria, prim_s: value[0], prim_e: value[1] })
                    }}
                  />
                </Grid2>
                <Grid2 xs={6}>
                  <RangeSlider
                    title="240-mammal (phyloP)"
                    width="100%"
                    value={[props.filterCriteria.mamm_s, props.filterCriteria.mamm_e]}
                    min={-4}
                    max={8}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({ ...props.filterCriteria, mamm_s: value[0], mamm_e: value[1] })
                    }}
                  />
                </Grid2>
                <Grid2 xs={6}>
                  <RangeSlider
                    title="100-vertebrate (phyloP)"
                    width="100%"
                    value={[props.filterCriteria.vert_s, props.filterCriteria.vert_e]}
                    min={-3}
                    max={8}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({ ...props.filterCriteria, vert_s: value[0], vert_e: value[1] })
                    }}
                  />
                </Grid2>
              </Grid2>
            </AccordionDetails>
          </Accordion>}
          {/* Linked Genes */}
          <Accordion square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4a-content" id="panel4a-header">
              <Stack direction="row" spacing={1}>
                {props.filterCriteria.linkedGenesNames.length > 0 ?
                  <>
                    <IconButton size="small" sx={{ p: 0 }}
                      onClick={(event) => {
                        props.setFilterCriteria({
                          ...props.filterCriteria,
                          linkedGenesNames: []
                        });
                        event.stopPropagation()
                      }}
                    >
                      <Tooltip placement="top" title={"Clear Filter"}>
                        <ClearIcon />
                      </Tooltip>
                    </IconButton>
                    <i><Typography sx={{ fontWeight: "bold" }}>Linked Genes</Typography></i>
                  </>
                  :
                  <Typography>Linked Genes</Typography>
                }
                <Tooltip arrow placement="right-end" title={"Filter results based on genes linked by ChIA-PET Interactions, Intact Hi-C Loops, CRISPRi-FlowFISH, or eQTLs"}>
                  <InfoOutlined fontSize="small" />
                </Tooltip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <GeneAutoComplete2
                assembly={props.mainQueryParams.coordinates.assembly}
                autocompleteProps={
                  {
                    size: "small",
                    fullWidth: true,
                  }
                }
                onTextBoxClick={() => !dataLinkedGenes && !loadingLinkedGenes && getLinkedGenes()}
                endIcon="add"
                colorTheme="light"
                onGeneSubmitted={(gene) => props.setFilterCriteria({ ...props.filterCriteria, linkedGenesNames: [...props.filterCriteria.linkedGenesNames, gene.name] })}
                renderOption={(props, option, descriptions) => handleRenderGeneAutoCompleteOption(props, option, descriptions)}
              />
              {props.filterCriteria.linkedGenesNames.length > 0 &&
                <>
                  <Typography>
                    {"Selected: "} <i>{props.filterCriteria.linkedGenesNames.join(', ')}</i>
                  </Typography>
                  <Button variant="outlined" sx={{textTransform: 'none'}} onClick={() => props.setFilterCriteria({ ...props.filterCriteria, linkedGenesNames: [] })}>
                    Clear Selected Genes
                  </Button>
                </>
              }
              <FormControl>
                <FormLabel component="legend" sx={{ pt: 2 }}>Linked By</FormLabel>
                <FormGroup>
                  <FormControlLabel
                    checked={props.filterCriteria.CTCFChIAPET}
                    onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, CTCFChIAPET: checked })}
                    control={<Checkbox />}
                    label="CTCF ChIA-PET Interaction"
                  />
                  <FormControlLabel
                    checked={props.filterCriteria.RNAPIIChIAPET}
                    onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, RNAPIIChIAPET: checked })}
                    control={<Checkbox />}
                    label="RNAPII ChIA-PET Interaction"
                  />
                  <FormControlLabel
                    checked={props.filterCriteria.HiC}
                    onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, HiC: checked })}
                    control={<Checkbox />}
                    label="Intact Hi-C Loops"
                  />
                  <FormControlLabel
                    checked={props.filterCriteria.CRISPRiFlowFISH}
                    onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, CRISPRiFlowFISH: checked })}
                    control={<Checkbox />}
                    label="CRISPRi-FlowFISH"
                  />
                  <FormControlLabel
                    checked={props.filterCriteria.eQTLs}
                    onChange={(_, checked: boolean) => props.setFilterCriteria({ ...props.filterCriteria, eQTLs: checked })}
                    control={<Checkbox />}
                    label="eQTLs"
                  />
                </FormGroup>
              </FormControl>
            </AccordionDetails>
          </Accordion>
        </>
      }
    </Paper>
  )
}
