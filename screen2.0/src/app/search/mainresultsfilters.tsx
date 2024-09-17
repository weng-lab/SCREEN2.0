"use client"

import React, { useEffect, Dispatch, SetStateAction, useCallback, useMemo } from "react";
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
  Autocomplete,
  TextField,
} from "@mui/material/"

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import Grid2 from "@mui/material/Unstable_Grid2"
import { RangeSlider } from "@weng-lab/psychscreen-ui-components"
import {  FilterCriteria, MainQueryParams, RegistryBiosample } from "./types"
import { eQTLsTissues, filtersModified } from "./searchhelpers"
import {  LazyQueryResultTuple, gql, useLazyQuery } from "@apollo/client"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { CancelRounded, InfoOutlined } from "@mui/icons-material";
import ClearIcon from '@mui/icons-material/Clear';
import { GeneAutocomplete, GeneInfo } from "./_geneAutocomplete/GeneAutocomplete";
import { LinkedGenes, LinkedGenesVariables } from "./page";
import BiosampleTables from "../_biosampleTables/BiosampleTables";

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

const GET_LG_BIOSAMPLE = gql`
  query getlistofLinkedGenesCelltypes {
    linkedGenesCelltypes: getLinkedGenesCelltypes {
      celltype
      displayname
      method
    }
  }
`

export function MainResultsFilters(
  props: {
    mainQueryParams: MainQueryParams,
    setMainQueryParams: Dispatch<SetStateAction<MainQueryParams>>,
    filterCriteria: FilterCriteria,
    setFilterCriteria: Dispatch<SetStateAction<FilterCriteria>>,
    setBiosample: (biosample: RegistryBiosample) => void,
    TSSs: number[]
    setTSSs: Dispatch<SetStateAction<number[]>>,
    setTSSranges: Dispatch<SetStateAction<{ start: number, end: number }[]>>
    genomeBrowserView: boolean,
    useLinkedGenes: LazyQueryResultTuple<LinkedGenes, LinkedGenesVariables>
  }
): JSX.Element {
  const {
    mainQueryParams,
    setMainQueryParams,
    filterCriteria,
    setFilterCriteria,
    setBiosample,
    TSSs,
    setTSSs,
    setTSSranges,
    genomeBrowserView,
    useLinkedGenes,
  } = props;

  const [getLinkedGenes, { loading: loadingLinkedGenes, data: dataLinkedGenes, error: errorLinkedGenes }] = useLinkedGenes

  type LGBiosampleReturnData = {
    linkedGenesCelltypes: {
      celltype: string,
      displayname: string,
      method: string
    }[]
  }

  const [getLGBiosamples, { loading: loadingLGBiosamples, data: dataLGBiosamples, error: errorLGBiosamples }] = useLazyQuery<LGBiosampleReturnData, {}>(
    GET_LG_BIOSAMPLE,
  )

  const {
    data: geneTranscripts
  } = useQuery(GENE_TRANSCRIPTS_QUERY, {
    variables: {
      assembly: mainQueryParams.coordinates.assembly.toLowerCase(),
      name: [mainQueryParams.gene.name],
      version: mainQueryParams.coordinates.assembly.toLowerCase() === "grch38" ? 40 : 25,
    },
    skip: !mainQueryParams.gene.name,
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
      setTSSs(TSSs)
    }
  }, [geneTranscripts, setTSSs])

  //Recalculate TSS ranges when gene distance changes
  useEffect(() => {
    if (TSSs !== null) {
      const TSSranges: { start: number, end: number }[] = TSSs?.map((tss) => {
        return { start: Math.max(0, tss - mainQueryParams.gene.distance), end: tss + mainQueryParams.gene.distance }
      })
      setTSSranges(TSSranges)
    }
  }, [mainQueryParams.gene.distance, TSSs, setTSSranges])

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

  const renderGeneAutoCompleteOption = useCallback((
    props: React.HTMLAttributes<HTMLLIElement>,
    option: GeneInfo,
    descriptions: {
      name: string;
      desc: string;
    }[]
  ) => {
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
                <i>{option.name}</i>
              }
            </Box>
            <Typography variant="body2" color="text.secondary">
              {descriptions.find((g) => g.name === option.name)?.desc + ` (Linked: ${geneInfo?.accessions.length ?? 0})`}
            </Typography>
          </Grid2>
        </Grid2>
      </li>
    )
  }, [loadingLinkedGenes, linkedGenesWithNums])

  type LGValidBiosamples = {
    gene: string,
    CTCFChIAPET: { name: string, count: number }[],
    RNAPIIChIAPET: { name: string, count: number }[],
    HiC: { name: string, count: number }[],
    CRISPRiFlowFISH: { name: string, count: number }[],
    eQTLs: { name: string, count: number }[]
  }

  //To show hints of what is valid, this depends on the gene.
  //If there is a gene selected
  const validBiosamples: LGValidBiosamples = useMemo(() => {
    const validBiosamples: LGValidBiosamples = {
      gene: filterCriteria.linkedGeneName,
      CTCFChIAPET: [],
      RNAPIIChIAPET: [],
      HiC: [],
      CRISPRiFlowFISH: [],
      eQTLs: []
    }
    const uniqueeQTLcCREs: string[] = []
    if (dataLinkedGenes?.linkedGenes) {
      for (const linkedGene of dataLinkedGenes?.linkedGenes) {
        //fetched data has trailing space to strip
        if (linkedGene.gene.split(' ')[0] !== filterCriteria.linkedGeneName) { continue; }
        //This is relying on the fact that eQTL-linked genes are the only one that doesn't have an assay field.
        switch (linkedGene.assay) {
          case "CTCF-ChIAPET":
            if (validBiosamples.CTCFChIAPET.find(x => x.name === linkedGene.displayname)) {
              validBiosamples.CTCFChIAPET.find(x => x.name === linkedGene.displayname).count += 1
            } else {
              validBiosamples.CTCFChIAPET.push({ name: linkedGene.displayname, count: 1 })
            }
            break;
          case "RNAPII-ChIAPET":
            if (validBiosamples.RNAPIIChIAPET.find(x => x.name === linkedGene.displayname)) {
              validBiosamples.RNAPIIChIAPET.find(x => x.name === linkedGene.displayname).count += 1
            } else {
              validBiosamples.RNAPIIChIAPET.push({ name: linkedGene.displayname, count: 1 })
            }
            break;
          case "Intact-HiC":
            if (validBiosamples.HiC.find(x => x.name === linkedGene.displayname)) {
              validBiosamples.HiC.find(x => x.name === linkedGene.displayname).count += 1
            } else {
              validBiosamples.HiC.push({ name: linkedGene.displayname, count: 1 })
            }
            break;
          case "CRISPRi-FlowFISH":
            if (validBiosamples.CRISPRiFlowFISH.find(x => x.name === linkedGene.displayname)) {
              validBiosamples.CRISPRiFlowFISH.find(x => x.name === linkedGene.displayname).count += 1
            } else {
              validBiosamples.CRISPRiFlowFISH.push({ name: linkedGene.displayname, count: 1 })
            }
            break;
          case null: //use tissue instead of displayname for eQTLs only. This logic needs cleanup
            if (uniqueeQTLcCREs.find(x => x === linkedGene.accession)) {
              continue
            } else {uniqueeQTLcCREs.push(linkedGene.accession)}
            if (validBiosamples.eQTLs.find(x => x.name === linkedGene.tissue)) {
              validBiosamples.eQTLs.find(x => x.name === linkedGene.tissue).count += 1
            } else {
              validBiosamples.eQTLs.push({ name: linkedGene.tissue, count: 1 })
            }
            break;
        }
      }
    }
    return validBiosamples
  }, [filterCriteria.linkedGeneName, dataLinkedGenes?.linkedGenes])

  const renderBiosampleAutocompleteOption = useCallback((
    props: React.HTMLAttributes<HTMLLIElement>,
    option: { name: string, count: number },
    currentGene: string
  ) => {
    return (
      <li {...props} key={props.id}>
        <Grid2 container alignItems="center">
          <Grid2 sx={{ width: "100%" }}>
            <Box component="span" sx={{ fontWeight: "regular" }}>
              {option.name}
            </Box>
            <Typography variant="body2" color="text.secondary">
              {`${currentGene} linked to ${option.count} in this biosample`}
            </Typography>
          </Grid2>
        </Grid2>
      </li>
    )
  }, [])

  const validatedAutocompleteOptions = useCallback((
    method: "RNAPII-ChIAPET" | "CTCF-ChIAPET" | "Intact-HiC" | "CRISPRi-FlowFISH" | "eQTLs",
  ): {
    name: string;
    count: number;
  }[] => {
    if (errorLGBiosamples) {
      return [{ name: "Error loading", count: 1 }]
    } else if (loadingLGBiosamples) {
      return [{ name: "Loading", count: 1 }]
    } else if (!dataLGBiosamples) {
      getLGBiosamples()
      return [{ name: "Loading", count: 1 }]
    }

    let validOptions: {
      name: string;
      count: number;
    }[]

    switch (method) {
      case "RNAPII-ChIAPET": validOptions = validBiosamples.RNAPIIChIAPET; break;
      case "CTCF-ChIAPET": validOptions = validBiosamples.CTCFChIAPET; break;
      case "Intact-HiC": validOptions = validBiosamples.HiC; break;
      case "CRISPRi-FlowFISH": validOptions = validBiosamples.CRISPRiFlowFISH; break;
      case "eQTLs": validOptions = validBiosamples.eQTLs; break;
    }

    const allOtherOptions: { name: string; count: number; }[] =
      dataLGBiosamples?.linkedGenesCelltypes.map(x => { return { name: x.displayname, count: 0 } })
        .concat(eQTLsTissues.map(x => { return { name: x, count: 0 } }))
        .filter((sample) => !validOptions.find(x => x.name === sample.name))

    return validOptions.sort((a, b) => a.name.localeCompare(b.name)).concat(allOtherOptions.sort((a, b) => a.name.localeCompare(b.name)))
  }, [dataLGBiosamples, errorLGBiosamples, getLGBiosamples, loadingLGBiosamples, validBiosamples])



  return (
    <Paper elevation={0}>
      {/* cCREs within distance from SNP  */}
      {mainQueryParams.snp.rsID &&
        <>
          <Accordion defaultExpanded square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
              <Stack direction="row" spacing={1}>
                {mainQueryParams.snp.distance > 0 ?
                  <>
                    <IconButton size="small" sx={{ p: 0 }}
                      onClick={(event) => {
                        setMainQueryParams({ ...mainQueryParams, snp: { rsID: mainQueryParams.snp.rsID, distance: 0 } });
                        event.stopPropagation()
                      }}
                    >
                      <Tooltip placement="top" title={"Clear Filter"}>
                        <ClearIcon />
                      </Tooltip>
                    </IconButton>
                    <i><Typography sx={{ fontWeight: "bold" }}>Search distance from {mainQueryParams.snp.rsID}</Typography></i>
                  </>
                  :
                  <Typography>Search distance from {mainQueryParams.snp.rsID}</Typography>
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
                      value={mainQueryParams.snp.distance}
                      onChange={(_, value: number) => setMainQueryParams({ ...mainQueryParams, snp: { ...mainQueryParams.snp, distance: value } })}
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
      {mainQueryParams.gene.name &&
        <Accordion defaultExpanded square disableGutters>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
            <Stack direction="row" spacing={1}>
              {mainQueryParams.gene.nearTSS ?
                <>
                  <IconButton size="small" sx={{ p: 0 }}
                    onClick={(event) => {
                      setMainQueryParams({
                        ...mainQueryParams, gene: {
                          ...mainQueryParams.gene,
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
                      value={mainQueryParams.gene.nearTSS ? "tss" : "overlappinggene"}
                      onChange={(_, value: string) => {
                        setMainQueryParams({ ...mainQueryParams, gene: { ...mainQueryParams.gene, nearTSS: value === "tss" } })
                      }}
                    >
                      <FormControlLabel value="overlappinggene" control={<Radio />} label={<><i>{mainQueryParams.gene.name}</i> gene body</>} />
                      <FormControlLabel value="tss" control={<Radio />} label={<>Within distance of TSS of <i>{mainQueryParams.gene.name}</i></>} />
                    </RadioGroup>
                  </FormControl>
                </Grid2>
                {mainQueryParams.gene.nearTSS && <Grid2 xs={12}>
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
                      value={mainQueryParams.gene.distance}
                      onChange={(_, value: number) => setMainQueryParams({ ...mainQueryParams, gene: { ...mainQueryParams.gene, distance: value } })}
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
      <Accordion defaultExpanded={mainQueryParams.gene.name ? false : true} square disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Stack direction="row" spacing={1}>
            {mainQueryParams.biosample ?
              <>
                <IconButton size="small" sx={{ p: 0 }} onClick={(event) => { setMainQueryParams({ ...mainQueryParams, biosample: null }); event.stopPropagation() }}>
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
        <AccordionDetails sx={{ px: 0, pt: 0 }}>
          {mainQueryParams.biosample &&
            <Paper sx={{ mx: 2, mb: 1 }}>
              <Stack borderRadius={1} direction={"row"} spacing={3} sx={{ backgroundColor: "#E7EEF8" }} alignItems={"center"}>
                <Typography flexGrow={1} sx={{ color: "#2C5BA0", pl: 1 }}>{mainQueryParams.biosample.ontology.charAt(0).toUpperCase() + mainQueryParams.biosample.ontology.slice(1) + " - " + mainQueryParams.biosample.displayname.charAt(0).toUpperCase() + mainQueryParams.biosample.displayname.slice(1)}</Typography>
                <IconButton onClick={() => setBiosample(null)} sx={{ m: 'auto', flexGrow: 0 }}>
                  <CancelRounded />
                </IconButton>
              </Stack>
            </Paper>
          }
          <BiosampleTables
            assembly={mainQueryParams.coordinates.assembly}
            selected={mainQueryParams.biosample?.name}
            onBiosampleClicked={setBiosample}
            slotProps={{ paperStack: { elevation: 0 }, headerStack: {mt: 0} }}
          />
        </AccordionDetails>
      </Accordion>
      {/* Hide all other filters when on genome browser view */}
      {!genomeBrowserView &&
        <>
          {/* Chromatin Signals */}
          <Accordion square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
              <Stack direction="row" spacing={1}>
                {filtersModified(filterCriteria, "chromatin signals") ?
                  <>
                    <IconButton size="small" sx={{ p: 0 }}
                      onClick={(event) => {
                        setFilterCriteria({
                          ...filterCriteria,
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
                {(!mainQueryParams.biosample || mainQueryParams.biosample.dnase) && <Grid2 xs={6}>
                  <RangeSlider
                    title="DNase"
                    width="100%"
                    value={[filterCriteria.dnase_s, filterCriteria.dnase_e]}
                    min={-10}
                    max={11}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      setFilterCriteria({ ...filterCriteria, dnase_s: value[0], dnase_e: value[1] })
                    }}
                  />
                </Grid2>}
                {(!mainQueryParams.biosample || mainQueryParams.biosample.h3k4me3) && <Grid2 xs={6}>
                  <RangeSlider
                    title="H3K4me3"
                    width="100%"
                    value={[filterCriteria.h3k4me3_s, filterCriteria.h3k4me3_e]}
                    min={-10}
                    max={11}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      setFilterCriteria({ ...filterCriteria, h3k4me3_s: value[0], h3k4me3_e: value[1] })
                    }}
                  />
                </Grid2>}
                {(!mainQueryParams.biosample || mainQueryParams.biosample.h3k27ac) && <Grid2 xs={6}>
                  <RangeSlider
                    title="H3K27ac"
                    width="100%"
                    value={[filterCriteria.h3k27ac_s, filterCriteria.h3k27ac_e]}
                    min={-10}
                    max={11}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      setFilterCriteria({ ...filterCriteria, h3k27ac_s: value[0], h3k27ac_e: value[1] })
                    }}
                  />
                </Grid2>}
                {(!mainQueryParams.biosample || mainQueryParams.biosample.ctcf) && <Grid2 xs={6}>
                  <RangeSlider
                    title="CTCF"
                    width="100%"
                    value={[filterCriteria.ctcf_s, filterCriteria.ctcf_e]}
                    min={-10}
                    max={11}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      setFilterCriteria({ ...filterCriteria, ctcf_s: value[0], ctcf_e: value[1] })
                    }}
                  />
                </Grid2>}
                {(!mainQueryParams.biosample || mainQueryParams.biosample.atac) && <Grid2 xs={6}>
                  <RangeSlider
                    title="ATAC"
                    width="100%"
                    value={[filterCriteria.atac_s, filterCriteria.atac_e]}
                    min={-10}
                    max={11}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      setFilterCriteria({ ...filterCriteria, atac_s: value[0], atac_e: value[1] })
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
                {filtersModified(filterCriteria, "classification") ?
                  <>
                    <IconButton size="small" sx={{ p: 0 }}
                      onClick={(event) => {
                        setFilterCriteria({
                          ...filterCriteria,
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
                  checked={!filtersModified(filterCriteria, "classification")}
                  onChange={(_, checked: boolean) =>
                    setFilterCriteria({
                      ...filterCriteria,
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
                      checked={filterCriteria.CA}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, CA: checked })}
                      control={<Checkbox />}
                      label="CA"
                    />
                    <FormControlLabel
                      checked={filterCriteria.CA_CTCF}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, CA_CTCF: checked })}
                      control={<Checkbox />}
                      label="CA-CTCF"
                    />
                    <FormControlLabel
                      checked={filterCriteria.CA_H3K4me3}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, CA_H3K4me3: checked })}
                      control={<Checkbox />}
                      label="CA-H3K4me3"
                    />
                    <FormControlLabel
                      checked={filterCriteria.CA_TF}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, CA_TF: checked })}
                      control={<Checkbox />}
                      label="CA-TF"
                    />
                  </FormGroup>
                </Grid2>
                <Grid2 xs={6}>
                  <FormGroup>
                    <FormControlLabel
                      checked={filterCriteria.dELS}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, dELS: checked })}
                      control={<Checkbox />}
                      label="dELS"
                    />
                    <FormControlLabel
                      checked={filterCriteria.pELS}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, pELS: checked })}
                      control={<Checkbox />}
                      label="pELS"
                    />
                    <FormControlLabel
                      checked={filterCriteria.PLS}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, PLS: checked })}
                      control={<Checkbox />}
                      label="PLS"
                    />
                    <FormControlLabel
                      checked={filterCriteria.TF}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, TF: checked })}
                      control={<Checkbox />}
                      label="TF"
                    />
                  </FormGroup>
                </Grid2>
              </Grid2>
            </AccordionDetails>
          </Accordion>
          {/* Conservation */}
          {mainQueryParams.coordinates.assembly === "GRCh38" && <Accordion square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel6a-content" id="panel6a-header">
              <Stack direction="row" spacing={1}>
                {filtersModified(filterCriteria, "conservation") ?
                  <>
                    <IconButton size="small" sx={{ p: 0 }}
                      onClick={(event) => {
                        setFilterCriteria({
                          ...filterCriteria,
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
                    value={[filterCriteria.prim_s, filterCriteria.prim_e]}
                    min={-2}
                    max={2}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      setFilterCriteria({ ...filterCriteria, prim_s: value[0], prim_e: value[1] })
                    }}
                  />
                </Grid2>
                <Grid2 xs={6}>
                  <RangeSlider
                    title="240-mammal (phyloP)"
                    width="100%"
                    value={[filterCriteria.mamm_s, filterCriteria.mamm_e]}
                    min={-4}
                    max={8}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      setFilterCriteria({ ...filterCriteria, mamm_s: value[0], mamm_e: value[1] })
                    }}
                  />
                </Grid2>
                <Grid2 xs={6}>
                  <RangeSlider
                    title="100-vertebrate (phyloP)"
                    width="100%"
                    value={[filterCriteria.vert_s, filterCriteria.vert_e]}
                    min={-3}
                    max={8}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      setFilterCriteria({ ...filterCriteria, vert_s: value[0], vert_e: value[1] })
                    }}
                  />
                </Grid2>
              </Grid2>
            </AccordionDetails>
          </Accordion>}
          {/* Linked Genes */}
          {mainQueryParams.coordinates.assembly === "GRCh38" &&
            <Accordion square disableGutters>
              <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel4a-content" id="panel4a-header">
                <Stack direction="row" spacing={1}>
                  {filterCriteria.linkedGeneName ?
                    <>
                      <IconButton size="small" sx={{ p: 0 }}
                        onClick={(event) => {
                          setFilterCriteria({
                            ...filterCriteria,
                            linkedGeneName: null
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
              <AccordionDetails sx={{ width: '100%' }}>
                {/* Gene Input */}
                <FormControl sx={{ width: 'inherit' }}>
                  <FormLabel component="legend">Gene</FormLabel>
                  <FormGroup>
                    <GeneAutocomplete
                      assembly={mainQueryParams.coordinates.assembly}
                      slotProps={{
                        autocompleteProps: {
                          size: "small",
                          fullWidth: true,
                          defaultValue: filterCriteria.linkedGeneName ?
                            //have to pass in whole object, but only name is checked for equality
                            {
                              name: filterCriteria.linkedGeneName,
                              id: '',
                              coordinates: {
                                chromosome: '',
                                start: 0,
                                end: 0
                              },
                              description: ''
                            }
                            :
                            null,
                          getOptionDisabled: option => !linkedGenesWithNums.find(x => x.geneName === option.name),
                        },
                        stackProps: { mt: 1 }
                      }}
                      onTextBoxClick={() => !dataLinkedGenes && !loadingLinkedGenes && getLinkedGenes()}
                      endIcon="none"
                      colorTheme="light"
                      onGeneSelected={(gene) =>
                        setFilterCriteria(
                          gene === null ?
                            {
                              ...filterCriteria,
                              linkedGeneName: null,
                              CTCFChIAPET: { checked: filterCriteria.CTCFChIAPET.checked, biosample: '' },
                              RNAPIIChIAPET: { checked: filterCriteria.RNAPIIChIAPET.checked, biosample: '' },
                              HiC: { checked: filterCriteria.HiC.checked, biosample: '' },
                              CRISPRiFlowFISH: { checked: filterCriteria.CRISPRiFlowFISH.checked, biosample: '' },
                              eQTLs: { checked: filterCriteria.eQTLs.checked, biosample: '' },
                            }
                            :
                            { ...filterCriteria, linkedGeneName: gene.name }

                        )}
                      renderOption={(props, option, descriptions) => renderGeneAutoCompleteOption(props, option, descriptions)}
                    />
                  </FormGroup>
                </FormControl>
                {/* Linked-by Checkboxes */}
                <FormControl sx={{ width: 'inherit' }}>
                  <FormLabel component="legend" sx={{ pt: 2 }}>Linked By</FormLabel>
                  <FormGroup >
                    <FormControlLabel
                      checked={filterCriteria.HiC.checked}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, HiC: { ...filterCriteria.HiC, checked } })}
                      control={<Checkbox />}                     
                      sx={{
                        alignItems: 'flex-start',
                        mr: 0,
                        '& .MuiPaper-root': { boxShadow: 'none' },
                        '& .MuiTypography-root': { flexGrow: 1 }
                      }}
                      label={
                        <Accordion disableGutters onClick={(event => { event.preventDefault(); event.stopPropagation() })}>
                          <AccordionSummary sx={{ px: 0 }} expandIcon={<ExpandMoreIcon />}>
                            Intact Hi-C Loops
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            {/* Remember to use either tissue (eQTLs) or displayname (all other) when setting biosample filter */}
                            <Autocomplete<{ name: string, count: number }>
                              id="combo-box-demo"
                              disabled={!filterCriteria.linkedGeneName}
                              fullWidth
                              isOptionEqualToValue={(a, b) => a.name === b.name}
                              onChange={(_, value) => { setFilterCriteria({ ...filterCriteria, HiC: { ...filterCriteria.HiC, biosample: value ? value.name : '' } }) }}
                              defaultValue={filterCriteria.HiC.biosample ?
                                { name: filterCriteria.HiC.biosample, count: -1 } : null
                              }
                              options={validatedAutocompleteOptions("Intact-HiC")}
                              getOptionLabel={option => option.name}
                              getOptionDisabled={option => !validBiosamples.HiC.find(x => x.name === option.name)}
                              size="small"
                              renderInput={(params) =>
                                <TextField
                                  onClick={() => (!dataLGBiosamples && !loadingLGBiosamples && getLGBiosamples())}
                                  {...params}
                                  label={params.disabled ? "Select a gene first" : "Select a Tissue"}
                                />
                              }
                              renderOption={(_, option) => renderBiosampleAutocompleteOption(_, option, filterCriteria.linkedGeneName)}
                            />
                          </AccordionDetails>
                        </Accordion>
                      }
                    />
                    <FormControlLabel
                      checked={filterCriteria.CTCFChIAPET.checked}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, CTCFChIAPET: { ...filterCriteria.CTCFChIAPET, checked } })}
                      control={<Checkbox sx={{ mt: 0.25 }} />}
                      sx={{
                        alignItems: 'flex-start',
                        mr: 0,
                        '& .MuiPaper-root': { boxShadow: 'none' },
                        '& .MuiTypography-root': { flexGrow: 1 }
                      }}
                      label={
                        <Accordion disableGutters onClick={(event => { event.preventDefault(); event.stopPropagation() })}>
                          <AccordionSummary sx={{ px: 0 }} expandIcon={<ExpandMoreIcon />}>
                            CTCF ChIA-PET Interaction
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            {/* Remember to use either tissue (eQTLs) or displayname (all other) when setting biosample filter */}
                            <Autocomplete<{ name: string, count: number }>
                              id="combo-box-demo"
                              disabled={!filterCriteria.linkedGeneName}
                              fullWidth
                              isOptionEqualToValue={(a, b) => a.name === b.name}
                              onChange={(_, value) => { setFilterCriteria({ ...filterCriteria, CTCFChIAPET: { ...filterCriteria.CTCFChIAPET, biosample: value ? value.name : '' } }) }}
                              defaultValue={filterCriteria.CTCFChIAPET.biosample ?
                                { name: filterCriteria.CTCFChIAPET.biosample, count: -1 } : null
                              }
                              options={validatedAutocompleteOptions("CTCF-ChIAPET")}
                              getOptionLabel={option => option.name}
                              getOptionDisabled={option => !validBiosamples.CTCFChIAPET.find(x => x.name === option.name)}
                              size="small"
                              renderInput={(params) =>
                                <TextField
                                  onClick={() => (!dataLGBiosamples && !loadingLGBiosamples && getLGBiosamples())}
                                  {...params}
                                  label={params.disabled ? "Select a gene first" : "Select a Tissue"}
                                />
                              }
                              renderOption={(_, option) => renderBiosampleAutocompleteOption(_, option, filterCriteria.linkedGeneName)}
                            />
                          </AccordionDetails>
                        </Accordion>
                      }
                    />
                    <FormControlLabel
                      checked={filterCriteria.RNAPIIChIAPET.checked}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, RNAPIIChIAPET: { ...filterCriteria.RNAPIIChIAPET, checked } })}
                      control={<Checkbox />}
                      sx={{
                        alignItems: 'flex-start',
                        mr: 0,
                        '& .MuiPaper-root': { boxShadow: 'none' },
                        '& .MuiTypography-root': { flexGrow: 1 }
                      }}
                      label={
                        <Accordion disableGutters onClick={(event => { event.preventDefault(); event.stopPropagation() })}>
                          <AccordionSummary sx={{ px: 0 }} expandIcon={<ExpandMoreIcon />}>
                            RNAPII ChIA-PET Interaction
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            {/* Remember to use either tissue (eQTLs) or displayname (all other) when setting biosample filter */}
                            <Autocomplete<{ name: string, count: number }>
                              id="combo-box-demo"
                              disabled={!filterCriteria.linkedGeneName}
                              fullWidth
                              isOptionEqualToValue={(a, b) => a.name === b.name}
                              onChange={(_, value) => { setFilterCriteria({ ...filterCriteria, RNAPIIChIAPET: { ...filterCriteria.RNAPIIChIAPET, biosample: value ? value.name : '' } }) }}
                              defaultValue={filterCriteria.RNAPIIChIAPET.biosample ?
                                { name: filterCriteria.RNAPIIChIAPET.biosample, count: -1 } : null
                              }
                              options={validatedAutocompleteOptions("RNAPII-ChIAPET")}
                              getOptionLabel={option => option.name}
                              getOptionDisabled={option => !validBiosamples.RNAPIIChIAPET.find(x => x.name === option.name)}
                              size="small"
                              renderInput={(params) =>
                                <TextField
                                  onClick={() => (!dataLGBiosamples && !loadingLGBiosamples && getLGBiosamples())}
                                  {...params}
                                  label={params.disabled ? "Select a gene first" : "Select a Tissue"}
                                />
                              }
                              renderOption={(_, option) => renderBiosampleAutocompleteOption(_, option, filterCriteria.linkedGeneName)}
                            />
                          </AccordionDetails>
                        </Accordion>
                      }
                    />
                    <FormControlLabel
                      checked={filterCriteria.CRISPRiFlowFISH.checked}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, CRISPRiFlowFISH: { ...filterCriteria.CRISPRiFlowFISH, checked } })}
                      control={<Checkbox />}
                      sx={{
                        alignItems: 'flex-start',
                        mr: 0,
                        '& .MuiPaper-root': { boxShadow: 'none' },
                        '& .MuiTypography-root': { flexGrow: 1 }
                      }}
                      label={
                        <Accordion disableGutters onClick={(event => { event.preventDefault(); event.stopPropagation() })}>
                          <AccordionSummary sx={{ px: 0 }} expandIcon={<ExpandMoreIcon />}>
                          CRISPRi-FlowFISH
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            {/* Remember to use either tissue (eQTLs) or displayname (all other) when setting biosample filter */}
                            <Autocomplete<{ name: string, count: number }>
                              id="combo-box-demo"
                              disabled={!filterCriteria.linkedGeneName}
                              fullWidth
                              isOptionEqualToValue={(a, b) => a.name === b.name}
                              onChange={(_, value) => { setFilterCriteria({ ...filterCriteria, CRISPRiFlowFISH: { ...filterCriteria.CRISPRiFlowFISH, biosample: value ? value.name : '' } }) }}
                              defaultValue={filterCriteria.CRISPRiFlowFISH.biosample ?
                                { name: filterCriteria.CRISPRiFlowFISH.biosample, count: -1 } : null
                              }
                              options={validatedAutocompleteOptions("CRISPRi-FlowFISH")}
                              getOptionLabel={option => option.name}
                              getOptionDisabled={option => !validBiosamples.CRISPRiFlowFISH.find(x => x.name === option.name)}
                              size="small"
                              renderInput={(params) =>
                                <TextField
                                  onClick={() => (!dataLGBiosamples && !loadingLGBiosamples && getLGBiosamples())}
                                  {...params}
                                  label={params.disabled ? "Select a gene first" : "Select a Tissue"}
                                />
                              }
                              renderOption={(_, option) => renderBiosampleAutocompleteOption(_, option, filterCriteria.linkedGeneName)}
                            />
                          </AccordionDetails>
                        </Accordion>
                      }
                    />
                    <FormControlLabel
                      checked={filterCriteria.eQTLs.checked}
                      onChange={(_, checked: boolean) => setFilterCriteria({ ...filterCriteria, eQTLs: { ...filterCriteria.eQTLs, checked } })}
                      control={<Checkbox />}
                      sx={{
                        alignItems: 'flex-start',
                        mr: 0,
                        '& .MuiPaper-root': { boxShadow: 'none' },
                        '& .MuiTypography-root': { flexGrow: 1 }
                      }}
                      label={
                        <Accordion disableGutters onClick={(event => { event.preventDefault(); event.stopPropagation() })}>
                          <AccordionSummary sx={{ px: 0 }} expandIcon={<ExpandMoreIcon />}>
                            eQTLs
                          </AccordionSummary>
                          <AccordionDetails sx={{ p: 0 }}>
                            {/* Remember to use either tissue (eQTLs) or displayname (all other) when setting biosample filter */}
                            <Autocomplete<{ name: string, count: number }>
                              id="combo-box-demo"
                              disabled={!filterCriteria.linkedGeneName}
                              fullWidth
                              isOptionEqualToValue={(a, b) => a.name === b.name}
                              onChange={(_, value) => { setFilterCriteria({ ...filterCriteria, eQTLs: { ...filterCriteria.eQTLs, biosample: value ? value.name : '' } }) }}
                              defaultValue={filterCriteria.eQTLs.biosample ?
                                { name: filterCriteria.eQTLs.biosample, count: -1 } : null
                              }
                              options={validatedAutocompleteOptions("eQTLs")}
                              getOptionLabel={option => option.name}
                              getOptionDisabled={option => !validBiosamples.eQTLs.find(x => x.name === option.name)}
                              size="small"
                              renderInput={(params) =>
                                <TextField
                                  onClick={() => (!dataLGBiosamples && !loadingLGBiosamples && getLGBiosamples())}
                                  {...params}
                                  label={params.disabled ? "Select a gene first" : "Select a Tissue"}
                                />
                              }
                              renderOption={(_, option) => renderBiosampleAutocompleteOption(_, option, filterCriteria.linkedGeneName)}
                            />
                          </AccordionDetails>
                        </Accordion>
                      }
                    />
                  </FormGroup>
                </FormControl>
              </AccordionDetails>
            </Accordion>
          }
        </>
      }
    </Paper>
  )
}
