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
} from "@mui/material/"

import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControl from '@mui/material/FormControl';
import SendIcon from "@mui/icons-material/Send"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import Grid2 from "@mui/material/Unstable_Grid2"
import Link from "next/link"
import { RangeSlider, DataTable } from "@weng-lab/psychscreen-ui-components"
import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CellTypeData, FilteredBiosampleData, MainQueryParams, URLParams } from "../../app/search/types"
import { parseByCellType, filterBiosamples, assayHoverInfo, constructURL } from "../../app/search/search-helpers"
import { gql } from "@apollo/client"
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import GeneAutoComplete from "../../app/applets/gene-expression/gene-autocomplete";
import { InfoOutlined } from "@mui/icons-material";

const marks = [
  {
    value: 0,
    label: '0kb',
  },
  {
    value: 5000,
    label: '5kb',
  },
  {
    value: 10000,
    label: '10kb',
  },
  {
    value: 25000,
    label: '25kb',
  }
  ,
  {
    value: 50000,
    label: '50kb',
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


export default function MainResultsFilters(props: { mainQueryParams: MainQueryParams, byCellType: CellTypeData, genomeBrowserView: boolean, accessions: string, page: number }) {
  //No alternatives provided for default, as all these attributes should exist and are given a default value in Search's page.tsx

  const [tssupstream, setTssupstream] = useState<number>(0);
  const [snpdistance, setSnpDistance] = useState<number>(0);

  //Biosample Filter
  const [CellLine, setCellLine] = useState<boolean>(props.mainQueryParams.filterCriteria.biosampleTableFilters.CellLine)
  const [PrimaryCell, setPrimaryCell] = useState<boolean>(props.mainQueryParams.filterCriteria.biosampleTableFilters.PrimaryCell)
  const [Tissue, setTissue] = useState<boolean>(props.mainQueryParams.filterCriteria.biosampleTableFilters.Tissue)
  const [Organoid, setOrganoid] = useState<boolean>(props.mainQueryParams.filterCriteria.biosampleTableFilters.Organoid)
  const [InVitro, setInVitro] = useState<boolean>(props.mainQueryParams.filterCriteria.biosampleTableFilters.InVitro)
  
  //Selected Biosample
  const [Biosample, setBiosample] = useState<{
    selected: boolean
    biosample: string | null
    tissue: string | null
    summaryName: string | null
  }>(props.mainQueryParams.biosample)
  const [BiosampleHighlight, setBiosampleHighlight] = useState<{} | null>(null)
  const [SearchString, setSearchString] = useState<string>("")

  const [value, setValue] = React.useState('overlappinggene');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  //Chromatin Filter
  const [DNaseStart, setDNaseStart] = useState<number>(props.mainQueryParams.filterCriteria.chromatinFilter.dnase_s)
  const [DNaseEnd, setDNaseEnd] = useState<number>(props.mainQueryParams.filterCriteria.chromatinFilter.dnase_e)
  const [H3K4me3Start, setH3K4me3Start] = useState<number>(props.mainQueryParams.filterCriteria.chromatinFilter.h3k4me3_s)
  const [H3K4me3End, setH3K4me3End] = useState<number>(props.mainQueryParams.filterCriteria.chromatinFilter.h3k4me3_e)
  const [H3K27acStart, setH3K27acStart] = useState<number>(props.mainQueryParams.filterCriteria.chromatinFilter.h3k27ac_s)
  const [H3K27acEnd, setH3K27acEnd] = useState<number>(props.mainQueryParams.filterCriteria.chromatinFilter.h3k27ac_e)
  const [CTCFStart, setCTCFStart] = useState<number>(props.mainQueryParams.filterCriteria.chromatinFilter.ctcf_s)
  const [CTCFEnd, setCTCFEnd] = useState<number>(props.mainQueryParams.filterCriteria.chromatinFilter.ctcf_e)
  const [ATACStart, setATACStart] = useState<number>(props.mainQueryParams.filterCriteria.chromatinFilter.atac_s)
  const [ATACEnd, setATACEnd] = useState<number>(props.mainQueryParams.filterCriteria.chromatinFilter.atac_e)

  //Classification Filter
  const [CA, setCA] = useState<boolean>(props.mainQueryParams.filterCriteria.classificationFilter.CA)
  const [CA_CTCF, setCA_CTCF] = useState<boolean>(props.mainQueryParams.filterCriteria.classificationFilter.CA_CTCF)
  const [CA_H3K4me3, setCA_H3K4me3] = useState<boolean>(props.mainQueryParams.filterCriteria.classificationFilter.CA_H3K4me3)
  const [CA_TF, setCA_TF] = useState<boolean>(props.mainQueryParams.filterCriteria.classificationFilter.CA_TF)
  const [dELS, setdELS] = useState<boolean>(props.mainQueryParams.filterCriteria.classificationFilter.dELS)
  const [pELS, setpELS] = useState<boolean>(props.mainQueryParams.filterCriteria.classificationFilter.pELS)
  const [PLS, setPLS] = useState<boolean>(props.mainQueryParams.filterCriteria.classificationFilter.PLS)
  const [TF, setTF] = useState<boolean>(props.mainQueryParams.filterCriteria.classificationFilter.TF)

  //Conservation Filter
  const [PrimateStart, setPrimateStart] = useState<number>(props.mainQueryParams.filterCriteria.conservationFilter.prim_s)
  const [PrimateEnd, setPrimateEnd] = useState<number>(props.mainQueryParams.filterCriteria.conservationFilter.prim_e)
  const [MammalStart, setMammalStart] = useState<number>(props.mainQueryParams.filterCriteria.conservationFilter.mamm_s)
  const [MammalEnd, setMammalEnd] = useState<number>(props.mainQueryParams.filterCriteria.conservationFilter.mamm_e)
  const [VertebrateStart, setVertebrateStart] = useState<number>(props.mainQueryParams.filterCriteria.conservationFilter.vert_s)
  const [VertebrateEnd, setVertebrateEnd] = useState<number>(props.mainQueryParams.filterCriteria.conservationFilter.vert_e)

  //Linked Genes Filter
  const [gene, setGene] = useState<string>("")
  const [genesToFind, setGenesToFind] = useState<string[]>(props.mainQueryParams.filterCriteria.linkedGenesFilter.genesToFind)
  const [distanceAll, setdistanceAll] = React.useState(props.mainQueryParams.filterCriteria.linkedGenesFilter.distanceAll)
  const [distancePC, setdistancePC] = React.useState(props.mainQueryParams.filterCriteria.linkedGenesFilter.distancePC)
  const [CTCF_ChIA_PET, setCTCF_ChIA_PET] = React.useState(props.mainQueryParams.filterCriteria.linkedGenesFilter.CTCF_ChIA_PET)
  const [RNAPII_ChIA_PET, setRNAPII_ChIA_PET] = React.useState(props.mainQueryParams.filterCriteria.linkedGenesFilter.RNAPII_ChIA_PET)

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

  const TSSs = geneTranscripts && geneTranscripts.gene && geneTranscripts.gene.length > 0 && geneTranscripts.gene[0].transcripts.map(t => {
    if (geneTranscripts.gene[0].strand === "+") {
      return t.coordinates.start
    } else {
      return t.coordinates.end
    }

  })

  const firstTSS = geneTranscripts && geneTranscripts.gene && geneTranscripts.gene.length > 0 && TSSs && TSSs.length > 0 ?
    geneTranscripts.gene[0].transcripts.length === 1 ? geneTranscripts.gene[0].transcripts[0].coordinates.start :
      geneTranscripts.gene[0].strand === "+" ? Math.max(0, (Math.min(...TSSs) - tssupstream)) : Math.max(...TSSs) + tssupstream : 0

  const lastTSS = geneTranscripts && geneTranscripts.gene && geneTranscripts.gene.length > 0 && TSSs && TSSs.length > 0 ?
    geneTranscripts.gene[0].transcripts.length === 1 ? geneTranscripts.gene[0].transcripts[0].coordinates.end :
      geneTranscripts.gene[0].strand === "+" ? Math.max(...TSSs) : Math.min(...TSSs) : 0

  const urlParams: URLParams = {
    Tissue,
    PrimaryCell,
    InVitro,
    Organoid,
    CellLine,
    start: props.mainQueryParams.searchConfig.snpid ? Math.max(0, props.mainQueryParams.coordinates.start - snpdistance) : props.mainQueryParams.searchConfig.gene ? (geneTranscripts && geneTranscripts.gene && geneTranscripts.gene.length > 0 ? value === "tss"
      && firstTSS && firstTSS != 0 && lastTSS && lastTSS != 0 ? geneTranscripts.gene[0].strand === "+" ? firstTSS : lastTSS : geneTranscripts.gene[0].coordinates.start :
      props.mainQueryParams.coordinates.start) : props.mainQueryParams.coordinates.start,
    end: props.mainQueryParams.searchConfig.snpid ? props.mainQueryParams.coordinates.end + snpdistance : props.mainQueryParams.searchConfig.gene ? (geneTranscripts && geneTranscripts.gene && geneTranscripts.gene.length > 0 ? value === "tss"
      && firstTSS && firstTSS != 0 && lastTSS && lastTSS != 0 ? geneTranscripts.gene[0].strand === "+" ? lastTSS : firstTSS : geneTranscripts.gene[0].coordinates.end :
      props.mainQueryParams.coordinates.end) : props.mainQueryParams.coordinates.end,
    Biosample: {
      selected: Biosample.selected,
      biosample: Biosample.biosample,
      tissue: Biosample.tissue,
      summaryName: Biosample.summaryName,
    },
    DNaseStart,
    DNaseEnd,
    H3K4me3Start,
    H3K4me3End,
    H3K27acStart,
    H3K27acEnd,
    CTCFStart,
    CTCFEnd,
    ATACStart,
    ATACEnd,
    CA,
    CA_CTCF,
    CA_H3K4me3,
    CA_TF,
    dELS,
    pELS,
    PLS,
    TF,
    PrimateStart,
    PrimateEnd,
    MammalStart,
    MammalEnd,
    VertebrateStart,
    VertebrateEnd,
    Accessions: props.accessions,
    Page: props.page,
    genesToFind,
    distancePC,
    distanceAll,
    distanceFromcCRE: 1000000,
    CTCF_ChIA_PET,
    RNAPII_ChIA_PET
  }

  const handleTssUpstreamChange = (_, newValue: number) => {
    setTssupstream(newValue as number);
  };
  const handleSNPDistanceChange = (_, newValue: number) => {
    setSnpDistance(newValue as number);
  };
  

  

  function valuetext(value: number) {
    return `${value}kb`;
  }
  const router = useRouter()

  /**
   * Biosample Tables, only re-rendered if the relevant state variables change. Prevents sluggish sliders in other filters
   */
  const biosampleTables = useMemo(
    () => {
      const filteredBiosamples: FilteredBiosampleData = filterBiosamples(
        parseByCellType(props.byCellType),
        Tissue,
        PrimaryCell,
        CellLine,
        InVitro,
        Organoid
      )
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

      return filteredBiosamples.sort().map((tissue: [string, {}[]], i) => {
        // Filter shown accordians by if their table contains the search
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
                    setBiosample({ selected: true, biosample: row.queryValue, tissue: row.biosampleTissue, summaryName: row.summaryName })
                    setBiosampleHighlight(row)
                    //Push to router with new biosample to avoid accessing stale Biosample value
                    router.push(
                      constructURL(props.mainQueryParams, urlParams, {
                        selected: true,
                        biosample: row.queryValue,
                        tissue: row.biosampleTissue,
                        summaryName: row.summaryName,
                      })
                    )
                  }}
                />
              </AccordionDetails>
            </Accordion>
          )
        }
      })
    },
    // Linter wants to include biosampleTables here as a dependency. Including it breaks intended functionality. Revisit later?
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [CellLine, InVitro, Organoid, PrimaryCell, Tissue, BiosampleHighlight, SearchString, props.byCellType, props.mainQueryParams]
  )

  useEffect(() => {
    setBiosample(props.mainQueryParams.biosample)
  }, [props.mainQueryParams.biosample])

  return (
    <Paper elevation={0}>
      {/* cCREs within distance from SNP  */}
      {props.mainQueryParams.searchConfig.snpid &&
        <>
          <Accordion defaultExpanded square disableGutters>
            <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel2a-content" id="panel2a-header">
              <Typography>cCREs within distance from SNP {props.mainQueryParams.searchConfig.snpid}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid2 container spacing={2}>

                <Grid2 xs={12}>
                  <Box sx={{ width: 300 }}>
                    <Slider
                      aria-label="Custom marks"
                      defaultValue={0}
                      getAriaValueText={valuetext}
                      valueLabelDisplay="on"
                      min={0}
                      max={50000}
                      step={null}
                      value={snpdistance}
                      onChange={handleSNPDistanceChange}
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
      {props.mainQueryParams.searchConfig.gene &&
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
                      valueLabelDisplay="on"
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
      }
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
            {Biosample.selected && (
              <Grid2 container spacing={2}>
                <Grid2 xs={12}>
                  <Paper elevation={0}>
                    <Typography>Selected Biosample:</Typography>
                    <Typography>{Biosample.tissue[0].toUpperCase() + Biosample.tissue.slice(1) + " - " + Biosample.summaryName}</Typography>
                  </Paper>
                </Grid2>
                <Grid2 xs={12}>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => {
                      setBiosample({ selected: false, biosample: null, tissue: null, summaryName: null })
                      setBiosampleHighlight(null)
                      router.push(
                        constructURL(props.mainQueryParams, urlParams, {
                          selected: false,
                          biosample: null,
                          tissue: null,
                          summaryName: null,
                        })
                      )
                    }}
                  >
                    Clear
                  </Button>
                </Grid2>
              </Grid2>
            )}
            <Grid2 xs={12} maxHeight={300} overflow={"auto"}>
              {biosampleTables}
            </Grid2>
            <Grid2 xs={12} sx={{ mt: 1 }}>
              <Typography>Biosample Type</Typography>
              <FormGroup>
                <FormControlLabel
                  checked={Tissue}
                  onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setTissue(checked)}
                  control={<Checkbox />}
                  label="Tissue"
                />
                <FormControlLabel
                  checked={PrimaryCell}
                  onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setPrimaryCell(checked)}
                  control={<Checkbox />}
                  label="Primary Cell"
                />
                <FormControlLabel
                  checked={InVitro}
                  onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setInVitro(checked)}
                  control={<Checkbox />}
                  label="In Vitro Differentiated Cell"
                />
                <FormControlLabel
                  checked={Organoid}
                  onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setOrganoid(checked)}
                  control={<Checkbox />}
                  label="Organoid"
                />
                <FormControlLabel
                  checked={CellLine}
                  onChange={(event: React.SyntheticEvent<Element, Event>, checked: boolean) => setCellLine(checked)}
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
                    defaultStart={DNaseStart}
                    defaultEnd={DNaseEnd}
                    min={-10}
                    max={10}
                    minDistance={1}
                    step={0.1}
                    //These are not properly typed due to an issue in the component library. Type properly when fixed
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
                    //These are not properly typed due to an issue in the component library. Type properly when fixed
                    onChange={(value: any) => {
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
                <Grid2 xs={6} sm={6} xl={6}>
                  <FormGroup>
                    <FormControlLabel
                      checked={CA}
                      onChange={(_, checked: boolean) => setCA(checked)}
                      control={<Checkbox />}
                      label="CA"
                    />
                    <FormControlLabel
                      checked={CA_CTCF}
                      onChange={(_, checked: boolean) => setCA_CTCF(checked)}
                      control={<Checkbox />}
                      label="CA-CTCF"
                    />
                    <FormControlLabel
                      checked={CA_H3K4me3}
                      onChange={(_, checked: boolean) => setCA_H3K4me3(checked)}
                      control={<Checkbox />}
                      label="CA-H3K4me3"
                    />
                    <FormControlLabel
                      checked={CA_TF}
                      onChange={(_, checked: boolean) => setCA_TF(checked)}
                      control={<Checkbox />}
                      label="CA-TF"
                    />
                  </FormGroup>
                </Grid2>
                <Grid2 xs={6} sm={6} xl={6}>
                  <FormGroup>
                    <FormControlLabel
                      checked={dELS}
                      onChange={(_, checked: boolean) => setdELS(checked)}
                      control={<Checkbox />}
                      label="dELS"
                    />
                    <FormControlLabel
                      checked={pELS}
                      onChange={(_, checked: boolean) => setpELS(checked)}
                      control={<Checkbox />}
                      label="pELS"
                    />
                    <FormControlLabel
                      checked={PLS}
                      onChange={(_, checked: boolean) => setPLS(checked)}
                      control={<Checkbox />}
                      label="PLS"
                    />
                    <FormControlLabel
                      checked={TF}
                      onChange={(_, checked: boolean) => setTF(checked)}
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
                    defaultStart={PrimateStart}
                    defaultEnd={PrimateEnd}
                    min={-2}
                    max={2}
                    minDistance={1}
                    step={0.1}
                    //These are not properly typed due to an issue in the component library. Type properly when fixed
                    onChange={(value: any) => {
                      setPrimateStart(value[0])
                      setPrimateEnd(value[1])
                    }}
                  />
                </Grid2>
                <Grid2 xs={6} lg={12} xl={6}>
                  <RangeSlider
                    title="240-mammal (phyloP)"
                    width="100%"
                    defaultStart={MammalStart}
                    defaultEnd={MammalEnd}
                    min={-4}
                    max={8}
                    minDistance={1}
                    step={0.1}
                    onChange={(value: any) => {
                      setMammalStart(value[0])
                      setMammalEnd(value[1])
                    }}
                  />
                </Grid2>
                <Grid2 xs={6} lg={12} xl={6}>
                  <RangeSlider
                    title="100-vertebrate (phyloP)"
                    width="100%"
                    defaultStart={VertebrateStart}
                    defaultEnd={VertebrateEnd}
                    min={-3}
                    max={8}
                    minDistance={1}
                    step={0.1}
                    onChange={(value: any) => {
                      setVertebrateStart(value[0])
                      setVertebrateEnd(value[1])
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
                setGene={(gene) => { setGene(gene); setGenesToFind([...genesToFind, gene]) }}
                plusIcon
              />
              {genesToFind.length > 0 &&
                <>
                  <Typography>
                    {"Selected: " + genesToFind.join(', ')}
                  </Typography>
                  <Button variant="outlined" onClick={() => setGenesToFind([])}>
                    Clear Selected Genes
                  </Button>
                </>
              }
              <FormLabel component="legend" sx={{ pt: 2 }}>Linked By</FormLabel>
              <FormGroup>
                <FormControlLabel
                  checked={distanceAll}
                  onChange={(_, checked: boolean) => setdistanceAll(checked)}
                  control={<Checkbox />}
                  label="Distance (All)"
                />
                <FormControlLabel
                  checked={distancePC}
                  onChange={(_, checked: boolean) => setdistancePC(checked)}
                  control={<Checkbox />}
                  label="Distance (PC)"
                />
                <FormControlLabel
                  checked={CTCF_ChIA_PET}
                  onChange={(_, checked: boolean) => setCTCF_ChIA_PET(checked)}
                  control={<Checkbox />}
                  label="CTCF ChIA-PET"
                />
                <FormControlLabel
                  checked={RNAPII_ChIA_PET}
                  onChange={(_, checked: boolean) => setRNAPII_ChIA_PET(checked)}
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
      <Link href={constructURL(props.mainQueryParams, urlParams)}>
        <Button variant="contained" endIcon={<SendIcon />} sx={{ mt: "16px", mb: "16px", ml: "16px", mr: "16px" }}>
          Filter Results
        </Button>
      </Link>
    </Paper>
  )
}
