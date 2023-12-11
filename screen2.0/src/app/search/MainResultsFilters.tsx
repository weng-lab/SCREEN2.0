"use client"
import * as React from "react"
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
  TextField,
  Tooltip,
  Box,
  Slider,
  FormLabel,
  Stack,
  IconButton,
  CircularProgress,
} from "@mui/material/"

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import Grid2 from "@mui/material/Unstable_Grid2"
import { RangeSlider, DataTable } from "@weng-lab/psychscreen-ui-components"
import { useState, useMemo, useEffect } from "react"
import { BiosampleTableFilters, CellTypeData, FilterCriteria, FilteredBiosampleData, MainQueryParams } from "./types"
import { parseByCellType, filterBiosamples, assayHoverInfo, constructSearchURL, constructMainQueryParamsFromURL, constructBiosampleTableFiltersFromURL } from "./search-helpers"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import GeneAutoComplete from "../applets/gene-expression/gene-autocomplete";
import { InfoOutlined } from "@mui/icons-material";

const marks = [
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
  }
  ,
  {
    value: 2000,
    label: '2kb',
  }
];

const GENE_TRANSCRIPTS_QUERY = gql`
 query ($assembly: String!, $name: [String!], $limit: Int) {
   gene(assembly: $assembly, name: $name, limit: $limit) {
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

 //TODO
 // gene changing main query

export default function MainResultsFilters(
  props: {
    mainQueryParams: MainQueryParams,
    setMainQueryParams: React.Dispatch<React.SetStateAction<MainQueryParams>>,
    filterCriteria: FilterCriteria,
    setFilterCriteria: React.Dispatch<React.SetStateAction<FilterCriteria>>,
    biosampleTableFilters: BiosampleTableFilters,
    setBiosampleTableFilters: React.Dispatch<React.SetStateAction<BiosampleTableFilters>>,
    setBiosample: (biosample: { selected: boolean, biosample: string, tissue: string, summaryName: string }) => void
    byCellType: CellTypeData,
    genomeBrowserView: boolean,
    searchParams: { [key: string]: string | undefined },
  }
): React.JSX.Element {

  //for commented gene filter
  const [tssupstream, setTssupstream] = useState<number>(0);

  
  //Selected Biosample
  const [BiosampleHighlight, setBiosampleHighlight] = useState<{} | null>(null)
  const [SearchString, setSearchString] = useState<string>("")

  const [value, setValue] = React.useState('overlappinggene');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  const [gene, setGene] = useState<string>("")


  const {
    data: geneTranscripts
  } = useQuery(GENE_TRANSCRIPTS_QUERY, {
    variables: {
      assembly: props.mainQueryParams.coordinates.assembly.toLowerCase(),
      name: [props.mainQueryParams.searchConfig.gene && props.mainQueryParams.searchConfig.gene.toUpperCase()]
    },
    skip: !props.mainQueryParams.searchConfig.gene,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first"

  })

  const TSSs = geneTranscripts?.gene?.length > 0 && geneTranscripts.gene[0].transcripts.map(t => {
    if (geneTranscripts.gene[0].strand === "+") {
      return t.coordinates.start
    } else {
      return t.coordinates.end
    }

  })

  const firstTSS = geneTranscripts?.gene?.length > 0 && TSSs?.length > 0 ?
    geneTranscripts.gene[0].transcripts.length === 1 ? geneTranscripts.gene[0].transcripts[0].coordinates.start :
      geneTranscripts.gene[0].strand === "+" ? Math.max(0, (Math.min(...TSSs) - tssupstream)) : Math.max(...TSSs) + tssupstream : 0

  const lastTSS = geneTranscripts?.gene?.length > 0 && TSSs?.length > 0 ?
    geneTranscripts.gene[0].transcripts.length === 1 ? geneTranscripts.gene[0].transcripts[0].coordinates.end :
      geneTranscripts.gene[0].strand === "+" ? Math.max(...TSSs) : Math.min(...TSSs) : 0

  //SNP distance is having issues since it is adjusting the start and end, which then get adjusted again and again infinitely
  //Need some way to track the original value of the SNP, either by sending query here, or adding start/end params to snp in mqp

  const handleTssUpstreamChange = (_, newValue: number) => {
    setTssupstream(newValue as number);
  };
  
  function valuetext(value: number) {
    return `${value}kb`;
  }

  const filteredBiosamples: FilteredBiosampleData = useMemo(() => {
    if (props.byCellType) {
      return (
        filterBiosamples(
          parseByCellType(props.byCellType),
          props.biosampleTableFilters.Tissue,
          props.biosampleTableFilters.PrimaryCell,
          props.biosampleTableFilters.CellLine,
          props.biosampleTableFilters.InVitro,
          props.biosampleTableFilters.Organoid
        )
      )
    } else return []
  }, [props.byCellType, props.biosampleTableFilters.Tissue, props.biosampleTableFilters.PrimaryCell, props.biosampleTableFilters.CellLine, props.biosampleTableFilters.InVitro, props.biosampleTableFilters.Organoid])

  //This could be refactored to improve performance in SNP/Gene filters. The onRowClick for each table depends on setting main query params, which the gene/snp filters also modify
  //This is recalculated every time those sliders are moved.
  const biosampleTables = useMemo(() => {
      const cols = [
        {
          header: "Biosample",
          value: (row) => row.summaryName,
          render: (row) => (
            <Tooltip title={"Biosample Type: " + row.biosampleType} arrow>
              <Typography variant="body2">{row.summaryName}</Typography>
            </Tooltip>
          ),
        },
        {
          header: "Assays",
          value: (row) => Object.keys(row.assays).filter((key) => row.assays[key] === true).length,
          render: (row) => {
            const fifth = (2 * 3.1416 * 10) / 5
            return (
              <Tooltip title={assayHoverInfo(row.assays)} arrow>
                <svg height="50" width="50" viewBox="0 0 50 50">
                  <circle r="20.125" cx="25" cy="25" fill="#EEEEEE" stroke="black" strokeWidth="0.25" />
                  <circle
                    r="10"
                    cx="25"
                    cy="25"
                    fill="transparent"
                    stroke={`${row.assays.dnase ? "#06DA93" : "transparent"}`}
                    strokeWidth="20"
                    strokeDasharray={`${fifth} ${fifth * 4}`}
                  />
                  <circle
                    r="10"
                    cx="25"
                    cy="25"
                    fill="transparent"
                    stroke={`${row.assays.h3k27ac ? "#FFCD00" : "transparent"}`}
                    strokeWidth="20"
                    strokeDasharray={`${fifth * 0} ${fifth} ${fifth} ${fifth * 3}`}
                  />
                  <circle
                    r="10"
                    cx="25"
                    cy="25"
                    fill="transparent"
                    stroke={`${row.assays.h3k4me3 ? "#FF0000" : "transparent"}`}
                    strokeWidth="20"
                    strokeDasharray={`${fifth * 0} ${fifth * 2} ${fifth} ${fifth * 2}`}
                  />
                  <circle
                    r="10"
                    cx="25"
                    cy="25"
                    fill="transparent"
                    stroke={`${row.assays.ctcf ? "#00B0F0" : "transparent"}`}
                    strokeWidth="20"
                    strokeDasharray={`${fifth * 0} ${fifth * 3} ${fifth} ${fifth * 1}`}
                  />
                  <circle
                    r="10"
                    cx="25"
                    cy="25"
                    fill="transparent"
                    stroke={`${row.assays.atac ? "#02C7B9" : "transparent"}`}
                    strokeWidth="20"
                    strokeDasharray={`${fifth * 0} ${fifth * 4} ${fifth}`}
                  />
                </svg>
              </Tooltip>
            )
          },
        },
      ]

      return (
        filteredBiosamples.sort().map((tissue: [string, {}[]], i) => {
          // Filter shows accordians by if their table contains the search
          if (SearchString ? tissue[1].find(obj => obj["summaryName"].toLowerCase().includes(SearchString.toLowerCase())) : true) {
            return (
              <Accordion key={tissue[0]}>
                <AccordionSummary
                  expandIcon={<KeyboardArrowRightIcon />}
                  sx={{
                    flexDirection: "row-reverse",
                    "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                      transform: "rotate(90deg)",
                    },
                  }}
                >
                  <Typography>{tissue[0][0].toUpperCase() + tissue[0].slice(1)}</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <DataTable
                    columns={cols}
                    rows={tissue[1]}
                    dense
                    searchable
                    search={SearchString}
                    highlighted={BiosampleHighlight}
                    sortColumn={1}
                    onRowClick={(row, i) => {
                      props.setBiosample({ selected: true, biosample: row.queryValue, tissue: row.biosampleTissue, summaryName: row.summaryName })
                      setBiosampleHighlight(row)
                    }}
                  />
                </AccordionDetails>
              </Accordion>
            )
          }
        })
      )
    },
    //For some reason it wants "props" as a dependency here, not sure why. Not referring to just "props" here at all
    [filteredBiosamples, BiosampleHighlight, SearchString, props.setBiosample]
  )

  return (
    <Paper elevation={0}>
      {/* cCREs within distance from SNP  */}
      {props.mainQueryParams.snp.rsID &&
        <>
          <Accordion defaultExpanded square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
              <Typography>cCREs within distance from SNP {props.mainQueryParams.snp.rsID} (upstream + downstream)</Typography>
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
                      onChange={(_, value: number) => props.setMainQueryParams({...props.mainQueryParams, snp: {...props.mainQueryParams.snp, distance: value}})}
                      marks={marks}
                    />
                  </Box>
                </Grid2>
              </Grid2>
            </AccordionDetails>
          </Accordion>
        </>
      }
      {/* cCRES near gene  */}
      {/* {props.mainQueryParams.searchConfig.gene &&
        <>
          <Accordion defaultExpanded square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
              <Typography>Overlapping Gene/By TSS</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={2}>
                <Grid2 xs={12}>
                  <FormControl>
                    <RadioGroup
                      aria-labelledby="demo-controlled-radio-buttons-group"
                      name="controlled-radio-buttons-group"
                      value={value}
                      onChange={handleChange}
                    >
                      <FormControlLabel value="overlappinggene" control={<Radio />} label={`Overlapping the gene body of ${props.mainQueryParams.searchConfig.gene}`} />
                      <FormControlLabel value="tss" control={<Radio />} label={`Located between the first and last Transcription Start Sites (TSSs) of ${props.mainQueryParams.searchConfig.gene}`} />
                    </RadioGroup>
                  </FormControl>
                </Grid2>
                {value === 'tss' && <Grid2 xs={12}>
                  <Box sx={{ width: 300 }}>
                    <Typography id="input-slider" gutterBottom>
                      Upstream of the TSSs
                    </Typography>
                    <Slider
                      aria-label="Custom marks"
                      defaultValue={0}
                      getAriaValueText={valuetext}
                      valueLabelDisplay="auto"
                      min={0}
                      max={50000}
                      step={null}
                      value={tssupstream}
                      onChange={handleTssUpstreamChange}
                      marks={marks}
                    />
                  </Box>
                </Grid2>}
              </Grid2>
            </AccordionDetails>
          </Accordion>
        </>
      } */}
      {/* Biosample Activity */}
      <Accordion defaultExpanded={props.mainQueryParams.searchConfig.gene ? false : true} square disableGutters>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
          <Stack direction="row" spacing={1}>
            <Typography>Biosample Activity</Typography>
            <Tooltip arrow placement="right-end" title={"This will be populated with more info soon"}>
              <InfoOutlined fontSize="small" />
            </Tooltip>
          </Stack>
        </AccordionSummary>
        <AccordionDetails>
          <Grid2 container spacing={2}>
            <Grid2 xs={5}>
              <Typography>Tissue/Organ</Typography>
            </Grid2>
            <Grid2 xs={7}>
              <TextField
                value={SearchString}
                size="small"
                label="Search Biosamples"
                onChange={(event) => setSearchString(event.target.value)}
              />
            </Grid2>
            {props.mainQueryParams.biosample.selected && (
              <Grid2 container spacing={2}>
                <Grid2 xs={12}>
                  <Paper elevation={0}>
                    <Typography>Selected Biosample:</Typography>
                    <Typography>{props.mainQueryParams.biosample.tissue[0].toUpperCase() + props.mainQueryParams.biosample.tissue.slice(1) + " - " + props.mainQueryParams.biosample.summaryName}</Typography>
                  </Paper>
                </Grid2>
                <Grid2 xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      props.setMainQueryParams({...props.mainQueryParams, biosample: { selected: false, biosample: null, tissue: null, summaryName: null }})
                      setBiosampleHighlight(null)
                    }}
                  >
                    Clear
                  </Button>
                </Grid2>
              </Grid2>
            )}
            <Grid2 xs={12} maxHeight={300} overflow={"auto"} >
              <Box sx={{ display: 'flex', flexDirection: "column" }}>
                {props.byCellType ? biosampleTables : <CircularProgress sx={{margin: "auto"}} />}
              </Box>
            </Grid2>
            <Grid2 xs={12} sx={{ mt: 1 }}>
              <Typography>Biosample Type</Typography>
              <FormGroup>
                <FormControlLabel
                  checked={props.biosampleTableFilters.Tissue}
                  onChange={(_, checked: boolean) => props.setBiosampleTableFilters({...props.biosampleTableFilters, Tissue: checked})}
                  control={<Checkbox />}
                  label="Tissue"
                />
                <FormControlLabel
                  checked={props.biosampleTableFilters.PrimaryCell}
                  onChange={(_, checked: boolean) => props.setBiosampleTableFilters({...props.biosampleTableFilters, PrimaryCell: checked})}
                  control={<Checkbox />}
                  label="Primary Cell"
                />
                <FormControlLabel
                  checked={props.biosampleTableFilters.InVitro}
                  onChange={(_, checked: boolean) => props.setBiosampleTableFilters({...props.biosampleTableFilters, InVitro: checked})}
                  control={<Checkbox />}
                  label="In Vitro Differentiated Cell"
                />
                <FormControlLabel
                  checked={props.biosampleTableFilters.Organoid}
                  onChange={(_, checked: boolean) => props.setBiosampleTableFilters({...props.biosampleTableFilters, Organoid: checked})}
                  control={<Checkbox />}
                  label="Organoid"
                />
                <FormControlLabel
                  checked={props.biosampleTableFilters.CellLine}
                  onChange={(_, checked: boolean) => props.setBiosampleTableFilters({...props.biosampleTableFilters, CellLine: checked})}
                  control={<Checkbox />}
                  label="Cell Line"
                />
              </FormGroup>
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
                <Typography>Chromatin Signals (Z-Scores)</Typography>
                <Tooltip arrow placement="right-end" title={"This will be populated with more info soon"}>
                  <InfoOutlined fontSize="small" />
                </Tooltip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={3}>
                <Grid2 xs={6} lg={12} xl={6}>
                  <RangeSlider
                    title="DNase"
                    width="100%"
                    defaultStart={props.filterCriteria.dnase_s}
                    defaultEnd={props.filterCriteria.dnase_e}
                    min={-10}
                    max={10}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({...props.filterCriteria, dnase_s: value[0], dnase_e: value[1]})
                    }}
                  />
                </Grid2>
                <Grid2 xs={6} lg={12} xl={6}>
                  <RangeSlider
                    title="H3K4me3"
                    width="100%"
                    defaultStart={props.filterCriteria.h3k4me3_s}
                    defaultEnd={props.filterCriteria.h3k4me3_e}
                    min={-10}
                    max={10}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({...props.filterCriteria, h3k4me3_s: value[0], h3k4me3_e: value[1]})
                    }}
                  />
                </Grid2>
                <Grid2 xs={6} lg={12} xl={6}>
                  <RangeSlider
                    title="H3K27ac"
                    width="100%"
                    defaultStart={props.filterCriteria.h3k27ac_s}
                    defaultEnd={props.filterCriteria.h3k27ac_e}
                    min={-10}
                    max={10}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({...props.filterCriteria, h3k27ac_s: value[0], h3k27ac_e: value[1]})
                    }}
                  />
                </Grid2>
                <Grid2 xs={6} lg={12} xl={6}>
                  <RangeSlider
                    title="CTCF"
                    width="100%"
                    defaultStart={props.filterCriteria.ctcf_s}
                    defaultEnd={props.filterCriteria.ctcf_e}
                    min={-10}
                    max={10}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({...props.filterCriteria, ctcf_s: value[0], ctcf_e: value[1]})
                    }}
                  />
                </Grid2>
                {/*<Grid2 xs={12} lg={12} xl={12}>
                  <RangeSlider
                    title="ATAC"
                    width="100%"
                    defaultStart={ATACStart}
                    defaultEnd={ATACEnd}
                    min={-10}
                    max={10}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: any) => {
                      setATACStart(value[0])
                      setATACEnd(value[1])
                    }}
                  />
                </Grid2>*/}
              </Grid2>
            </AccordionDetails>
          </Accordion>
          {/* Classification */}
          <Accordion square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel3a-content" id="panel3a-header">
              <Stack direction="row" spacing={1}>
                <Typography>Classification</Typography>
                <Tooltip arrow placement="right-end" title={"This will be populated with more info soon"}>
                  <InfoOutlined fontSize="small" />
                </Tooltip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>cCRE Classes</Typography>
              <Grid2 container spacing={0}>
                <Grid2 xs={12}>
                  <FormGroup>
                    <FormControlLabel
                      checked={props.filterCriteria.CA}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({...props.filterCriteria, CA: checked})}
                      control={<Checkbox />}
                      label="CA"
                    />
                    <FormControlLabel
                      checked={props.filterCriteria.CA_CTCF}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({...props.filterCriteria, CA_CTCF: checked})}
                      control={<Checkbox />}
                      label="CA-CTCF"
                    />
                    <FormControlLabel
                      checked={props.filterCriteria.CA_H3K4me3}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({...props.filterCriteria, CA_H3K4me3: checked})}
                      control={<Checkbox />}
                      label="CA-H3K4me3"
                    />
                    <FormControlLabel
                      checked={props.filterCriteria.CA_TF}
                      onChange={(_, checked: boolean) => props.setFilterCriteria({...props.filterCriteria, CA_TF: checked})}
                      control={<Checkbox />}
                      label="CA-TF"
                    />
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
                <Typography>Conservation</Typography>
                <Tooltip arrow placement="right-end" title={"This will be populated with more info soon"}>
                  <InfoOutlined fontSize="small" />
                </Tooltip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={3}>
                <Grid2 xs={6} lg={12} xl={6}>
                  <RangeSlider
                    title="43-primate (phastCons)"
                    width="100%"
                    defaultStart={props.filterCriteria.prim_s}
                    defaultEnd={props.filterCriteria.prim_e}
                    min={-2}
                    max={2}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({...props.filterCriteria, prim_s: value[0], prim_e: value[1]})
                    }}
                  />
                </Grid2>
                <Grid2 xs={6} lg={12} xl={6}>
                  <RangeSlider
                    title="240-mammal (phyloP)"
                    width="100%"
                    defaultStart={props.filterCriteria.mamm_s}
                    defaultEnd={props.filterCriteria.mamm_e}
                    min={-4}
                    max={8}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({...props.filterCriteria, mamm_s: value[0], mamm_e: value[1]})
                    }}
                  />
                </Grid2>
                <Grid2 xs={6} lg={12} xl={6}>
                  <RangeSlider
                    title="100-vertebrate (phyloP)"
                    width="100%"
                    defaultStart={props.filterCriteria.vert_s}
                    defaultEnd={props.filterCriteria.vert_e}
                    min={-3}
                    max={8}
                    minDistance={1}
                    step={0.1}
                    onSliderChangeCommitted={(value: number[]) => {
                      props.setFilterCriteria({...props.filterCriteria, vert_s: value[0], vert_e: value[1]})
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
                <Typography>Linked Genes</Typography>
                <Tooltip arrow placement="right-end" title={"This will be populated with more info soon"}>
                  <InfoOutlined fontSize="small" />
                </Tooltip>
              </Stack>
            </AccordionSummary>
            <AccordionDetails>
              <GeneAutoComplete
                assembly={props.mainQueryParams.coordinates.assembly}
                gene={gene}
                setGene={(gene) => { setGene(gene); props.setFilterCriteria({...props.filterCriteria, genesToFind: [...props.filterCriteria.genesToFind, gene]}) }}
                plusIcon
              />
              {props.filterCriteria.genesToFind.length > 0 &&
                <>
                  <Typography>
                    {"Selected: " + props.filterCriteria.genesToFind.join(', ')}
                  </Typography>
                  <Button variant="outlined" onClick={() => props.setFilterCriteria({...props.filterCriteria, genesToFind: []})}>
                    Clear Selected Genes
                  </Button>
                </>
              }
              <FormLabel component="legend" sx={{ pt: 2 }}>Linked By</FormLabel>
              <FormGroup>
                <FormControlLabel
                  checked={props.filterCriteria.distanceAll}
                  onChange={(_, checked: boolean) => props.setFilterCriteria({...props.filterCriteria, distanceAll: checked})}
                  control={<Checkbox />}
                  label="Distance (All)"
                />
                <FormControlLabel
                  checked={props.filterCriteria.distancePC}
                  onChange={(_, checked: boolean) => props.setFilterCriteria({...props.filterCriteria, distancePC: checked})}
                  control={<Checkbox />}
                  label="Distance (PC)"
                />
                <FormControlLabel
                  checked={props.filterCriteria.CTCF_ChIA_PET}
                  onChange={(_, checked: boolean) => props.setFilterCriteria({...props.filterCriteria, CTCF_ChIA_PET: checked})}
                  control={<Checkbox />}
                  label="CTCF ChIA-PET"
                />
                <FormControlLabel
                  checked={props.filterCriteria.RNAPII_ChIA_PET}
                  onChange={(_, checked: boolean) => props.setFilterCriteria({...props.filterCriteria, RNAPII_ChIA_PET: checked})}
                  control={<Checkbox />}
                  label="RNAPII ChIA-PET"
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          {/* Functional Characterization */}
          {/* <Accordion square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel5a-content" id="panel5a-header">
              <Typography>Functional Characterization</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse malesuada lacus ex, sit amet blandit leo lobortis eget.
              </Typography>
            </AccordionDetails>
          </Accordion> */}
        </>
      }
    </Paper>
  )
}
