"use client"
import { Accordion, AccordionDetails, AccordionSummary, IconButton, Paper, Stack, Tooltip, Typography, useMediaQuery, useTheme } from "@mui/material"

import React, { useState, useEffect, useTransition, useMemo } from "react"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { CreateLink, createLink, LoadingMessage } from "../../../common/lib/utility"
import Grid from "@mui/material/Unstable_Grid2/Grid2"
import { CircularProgress } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { client } from "../../search/_ccredetails/client"
import { useQuery } from "@apollo/client"
import { GET_ALL_GWAS_STUDIES, GET_SNPS_FOR_GIVEN_GWASSTUDY, BED_INTERSECT, CCRE_SEARCH, CT_ENRICHMENT, BIOSAMPLE_DISPLAYNAMES } from "./queries"
import { ApolloQueryResult } from "@apollo/client"
import { BIOSAMPLE_Data, biosampleQuery } from "../../../common/lib/queries"
import GwasBiosampleTables from "./gwasbiosampletables"
import { RegistryBiosample, RegistryBiosamplePlusRNA } from "../../search/types"
import { EnrichmentLollipopPlot, RawEnrichmentData, TransformedEnrichmentData } from "./_lollipop-plot/lollipopplot"
import { ParentSize } from "@visx/responsive"
import { ParentSizeProvidedProps } from "@visx/responsive/lib/components/ParentSize"
import { BiosampleNameData, BiosampleNameVars, EnrichmentData, EnrichmentVars } from "./types"
import { tissueColors } from "../../../common/lib/colors"
import { CancelRounded, Info } from "@mui/icons-material"
import { capitalizeFirstLetter } from "./helpers"

//Background colors for the accordions
const lightBlue = "#5F8ED3"
const darkBlue = "#2C5BA0"
const orange = "#F1884D"
const lightOrange = "#FDEFE7 !important"
const background = "#F9F9F9"
const lightTextColor = "#FFFFFF"

type GWASStudy = {
  studyname: string,
  study: string,
  author: string
  pubmedid: string
  totalldblocks: string
}

type TableRow = {
  accession: string,
  coordinates: {chromosome: string, start: number, end: number}
  snpid: string,
  ldblocksnpid: string,
  ldblock: string,
  rsquare: string,
  gene: string,
  atac_zscore: number,
  ctcf_zscore: number,
  dnase_zscore: number,
  h3k4me3_zscore: number,
  h3k27ac_zscore: number
}

export default function GWAS() {
  //all 3 useless, to remove once biosampletable2 fixed
  const [selectedBiosample, setSelectedBiosample] = useState<RegistryBiosample[]>([])
  const [isPending, startTransition] = useTransition();
  const [biosampleData, setBiosampleData] = useState<ApolloQueryResult<BIOSAMPLE_Data>>(null)

  const [study, setStudy] = useState<GWASStudy>(null)
  const [selectedSample, setSelectedSample] = useState<{ name: string, displayname: string, tissue: string }>(null)
  const [suggestionsOpen, setSuggestionsOpen] = useState<boolean>(false)
  const [studiesOpen, setStudiesOpen] = useState<boolean>(true)
  const [samplesOpen, setSamplesOpen] = useState<boolean>(false)

  const handleSetSuggestionsOpen = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setSuggestionsOpen(isExpanded);
  };

  const handleSetStudiesOpen = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setStudiesOpen(isExpanded);
  };

  const handleSetSamplesOpen = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setSamplesOpen(isExpanded);
  };

  const handleSetStudy = (newStudy: GWASStudy) => {
    if (newStudy) {
      setSuggestionsOpen(true)
      setSamplesOpen(true)
      setStudiesOpen(false)
    } else {
      setSuggestionsOpen(false)
      setSamplesOpen(false)
      setStudiesOpen(true)
    }
    setStudy(newStudy)
  }

  const handleSetSelectedSample = (selected: RegistryBiosamplePlusRNA) => {
    setSelectedSample( selected ? { name: selected.name, displayname: selected.displayname, tissue: selected.ontology } : null)
  }

  const handlePlotSelection = (selected: TransformedEnrichmentData) => {
    setSelectedSample({ name: selected.celltype, displayname: selected.displayname, tissue: selected.ontology })
  }

  const theme = useTheme()
  const isLg = useMediaQuery(theme.breakpoints.up('lg'))

  useEffect(() => {
    startTransition(async () => {
      const biosamples = await biosampleQuery()
      setBiosampleData(biosamples)
    })
  }, [])

  const {
    data: gwasstudies, loading: gwasstudiesLoading
  } = useQuery(GET_ALL_GWAS_STUDIES, {
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })


  const {
    data: gwasstudySNPs, loading: gwasstudySNPsLoading
  } = useQuery(GET_SNPS_FOR_GIVEN_GWASSTUDY, {
    variables: {
      study: study && [study.study]
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
    skip: !study
  })

  let snpsRegions = gwasstudySNPs && gwasstudySNPs.getSNPsforGWASStudies.map(g => {
    return [g.chromosome.toString(), g.start.toString(), g.stop.toString(), g.snpid.toString(), g.rsquare.toString(), g.ldblocksnpid.toString(), g.ldblock.toString()]
  })


  const {
    data: cCREIntersections, loading: cCREIntersectionsLoading
  } = useQuery(BED_INTERSECT, {
    variables: {
      inp: snpsRegions,
      assembly: "grch38"
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    skip: gwasstudySNPsLoading || (gwasstudySNPs && gwasstudySNPs.getSNPsforGWASStudies.length === 0) || (!snpsRegions) || (snpsRegions.length === 0),
    client,
  })

  const cCREsIntersectionData: {
    accession: string,
    snpid: string,
    ldblocksnpid: string,
    ldblock: string,
    rsquare: string,
  }[] = useMemo(() => {
    if (cCREIntersections) {
      return cCREIntersections.intersection.map((c) => {
        return {
          accession: c[4],
          snpid: c[9],
          ldblocksnpid: c[11],
          ldblock: c[12],
          rsquare: c[10]
        }
      })
    } else return []
  }, [cCREIntersections])

  //I'm assuming this returns duplicate accessions maybe?
  const uniqueAccessions = useMemo(() => {
    return [...new Set([...cCREsIntersectionData.map(c => { return (c.accession) })])]
  }, [cCREsIntersectionData])

  const overlappingLdBlocks = useMemo(() => {
    return [... new Set([...cCREsIntersectionData.map(c => { return (+c.ldblock) })])]
  }, [cCREsIntersectionData])


  const { data: enrichmentData, loading: enrichmentLoading, error: enrichmentError } = useQuery<EnrichmentData, EnrichmentVars>(
    CT_ENRICHMENT,
    {
      variables: {
        study: study?.study
      },
      skip: !study,
      client
    }
  )

  const { data: biosampleNames, loading: loadingBiosampleNames, error: errorBiosampleNames } = useQuery<BiosampleNameData, BiosampleNameVars>(
    BIOSAMPLE_DISPLAYNAMES,
    {
      variables: {
        assembly: "grch38",
        samples: enrichmentData?.getGWASCtEnrichmentQuery.map(x => x.celltype)
      },
      skip: !enrichmentData,
      client
    }
  )

  const { data: cCREDetails, loading: cCREDetailsLoading } = useQuery(CCRE_SEARCH, {
    variables: {
      accessions: uniqueAccessions,
      assembly: "grch38",
      celltype: selectedSample ? selectedSample.name : null
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    skip: !(uniqueAccessions && uniqueAccessions.length > 0),
    client,
  })

  const plotData: RawEnrichmentData[] = useMemo(() => {
    if (!enrichmentData || !biosampleNames) return null
    return (
      enrichmentData.getGWASCtEnrichmentQuery.map(x => {
        return (
          {
            ...x,
            displayname: biosampleNames.ccREBiosampleQuery.biosamples.find(y => y.name === x.celltype).displayname || "NAME MISMATCH",
            ontology: biosampleNames.ccREBiosampleQuery.biosamples.find(y => y.name === x.celltype).ontology || "NAME MISMATCH",
            color: tissueColors[biosampleNames.ccREBiosampleQuery.biosamples.find(y => y.name === x.celltype).ontology] || tissueColors.missing
          }
        )
      })
    )
  }, [biosampleNames, enrichmentData])

  //Combine snp and cCRE data into rows for the table
  const intersectionTableRows: TableRow[] = useMemo(() => {
    if (cCREDetails && cCREsIntersectionData) {
      return uniqueAccessions.map((x, i) => {
        const snpInfo = cCREsIntersectionData.find(y => y.accession === x)
        const cCREInfo = cCREDetails.cCRESCREENSearch.find(y => y.info.accession === x)
        return {
          accession: x,
          coordinates: {chromosome: cCREInfo.chrom, start: cCREInfo.start, end: cCREInfo.start + cCREInfo.len},
          ...snpInfo,
          gene: cCREInfo.nearestgenes[0].gene,
          atac_zscore: cCREInfo.ctspecific?.atac_zscore ?? cCREInfo.atac_zscore,
          ctcf_zscore: cCREInfo.ctspecific?.ctcf_zscore ?? cCREInfo.ctcf_zscore,
          dnase_zscore: cCREInfo.ctspecific?.dnase_zscore ?? cCREInfo.dnase_zscore,
          h3k4me3_zscore: cCREInfo.ctspecific?.h3k4me3_zscore ?? cCREInfo.promoter_zscore,
          h3k27ac_zscore: cCREInfo.ctspecific?.h3k27ac_zscore ?? cCREInfo.enhancer_zscore
        }
      })
    } else return []
  }, [cCREDetails, cCREsIntersectionData, uniqueAccessions])

  const columns: DataTableColumn<TableRow>[] = useMemo(() => {
    const cols: DataTableColumn<TableRow>[] = [
      {
        header: "cCRE",
        value: (row: TableRow) => row.accession,
        render: (row: TableRow) => createLink(`/search?assembly=GRCh38&chromosome=${row.coordinates.chromosome}&start=${row.coordinates.start}&end=${row.coordinates.end}&accessions=${row.accession}&page=2`, "", row.accession, false)
      },
      {
        header: "SNP",
        value: (row: TableRow) => "http://ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=" + row.snpid,
        render: (row: TableRow) => createLink("http://ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=", row.snpid, row.snpid, true)
      },
      {
        header: "LD Block SNP ID",
        value: (row: TableRow) => row.ldblocksnpid
      },
      {
        header: "R Square",
        HeaderRender: () => <Typography variant="body2"><i>R</i><sup>2</sup></Typography>,
        value: (row: TableRow) => row.rsquare
      },
      {
        header: "Gene",
        value: (row: TableRow) => row.gene,
        render: (row: TableRow) => <i><CreateLink linkPrefix={"/applets/gene-expression?assembly=GRCh38&gene="} linkArg={row.gene} label={row.gene} underline={"none"} /></i>
      },
    ]

    //if sample selected, check before adding assays
    if (selectedSample && cCREDetails) {
      const cCRE = cCREDetails.cCRESCREENSearch[0]
      cCRE.ctspecific?.dnase_zscore && cols.push({ header: "DNase Z\u2011Score", value: (row: TableRow) => row.dnase_zscore?.toFixed(2) })
      cCRE.ctspecific?.atac_zscore && cols.push({ header: "ATAC Z\u2011Score", value: (row: TableRow) => row.atac_zscore?.toFixed(2) })
      cCRE.ctspecific?.ctcf_zscore && cols.push({ header: "CTCF Z\u2011Score", value: (row: TableRow) => row.ctcf_zscore?.toFixed(2) })
      cCRE.ctspecific?.h3k27ac_zscore && cols.push({ header: "H3k27ac Z\u2011Score", value: (row: TableRow) => row.h3k27ac_zscore?.toFixed(2) })
      cCRE.ctspecific?.h3k4me3_zscore && cols.push({ header: "H3k4me3 Z\u2011Score", value: (row: TableRow) => row.h3k4me3_zscore?.toFixed(2) })
    } else {
      cols.push({ header: "DNase Max\u00A0Z", value: (row: TableRow) => row.dnase_zscore?.toFixed(2) })
      cols.push({ header: "ATAC Max\u00A0Z", value: (row: TableRow) => row.atac_zscore?.toFixed(2) })
      cols.push({ header: "CTCF Max\u00A0Z", value: (row: TableRow) => row.ctcf_zscore?.toFixed(2) })
      cols.push({ header: "H3k27ac Max\u00A0Z", value: (row: TableRow) => row.h3k27ac_zscore?.toFixed(2) })
      cols.push({ header: "H3k4me3 Max\u00A0Z", value: (row: TableRow) => row.h3k4me3_zscore?.toFixed(2) })
    }
    return cols

  }, [selectedSample, cCREDetails])

  type SelectInfoProps = {
    info1: string,
    info2: string,
    onClose: React.MouseEventHandler<HTMLButtonElement>
  }

  const SelectInfo: React.FC<SelectInfoProps> = (props: SelectInfoProps) => {
    return (
      <Paper>
        <Stack borderRadius={1} direction={"row"} spacing={3} sx={{ backgroundColor: "#E7EEF8" }} alignItems={"center"}>
          <Typography flexGrow={1} sx={{ color: "#2C5BA0", pl: 1 }}>{props.info1}</Typography>
          <Typography flexGrow={0} sx={{ color: "#2C5BA0" }}>{props.info2}</Typography>
          <IconButton onClick={props.onClose} sx={{ m: 'auto', flexGrow: 0 }}>
            <CancelRounded />
          </IconButton>
        </Stack>
      </Paper>
    )
  }

  const StudySelection = () => {
    return gwasstudiesLoading ? LoadingMessage() : gwasstudies && gwasstudies.getAllGwasStudies.length > 0 &&
      <div id="study-selection">
        <Accordion expanded={studiesOpen} onChange={handleSetStudiesOpen} sx={{borderRadius: '4px !important'}}>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor={lightTextColor} />} sx={{ backgroundColor: lightBlue, color: lightTextColor, borderRadius: '4px' }}>
            <Typography variant="h6">GWAS Studies</Typography>
            <Tooltip title={"Select a study to view cCREs overlapping associated SNPs"} sx={{alignSelf: "center", ml: 1}}>
              <Info />
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails sx={{ p: 0 }}>
            <Stack gap={1}>
              {study &&
                <SelectInfo info1={study.studyname} info2={study.author.replaceAll("_", " ")} onClose={() => handleSetStudy(null)} />
              }
              <DataTable
                tableTitle="GWAS Studies"
                highlighted={study}
                rows={gwasstudies.getAllGwasStudies}
                columns={[
                  {
                    header: "Study", value: (row) => {
                      return row.studyname
                    }
                  },
                  { header: "Author", value: (row) => row.author.replaceAll("_", " ") },
                  { header: "Pubmed", value: (row) => row.pubmedid, render: (row: any) => createLink("https://pubmed.ncbi.nlm.nih.gov/", row.pubmedid) },
                ]}
                onRowClick={(row: any) => {
                  handleSetStudy(row)
                  setSelectedSample(null)
                }}
                sortDescending={true}
                itemsPerPage={10}
                searchable={true}
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
        {study && !studiesOpen &&
          <SelectInfo info1={capitalizeFirstLetter(study.studyname)} info2={study.author.replaceAll("_", " ")} onClose={() => handleSetStudy(null)} />
        }
      </div>
  }

  const BiosampleSelection = () => {
    return biosampleData?.loading && gwasstudies && gwasstudies.getAllGwasStudies.length > 0 ?
      <CircularProgress sx={{ margin: "auto" }} />
      :
      <div>
        <Accordion expanded={samplesOpen} onChange={handleSetSamplesOpen} disabled={!study}  sx={{borderRadius: '4px !important'}}>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor={lightTextColor} />} sx={{ backgroundColor: lightBlue, color: lightTextColor, borderRadius: '4px' }}>
            <Typography variant="h6">Select a Biosample</Typography>
            <Tooltip title={"Optionally select a biosample to view biosample-specific assay z-scores"} sx={{alignSelf: "center", ml: 1}}>
              <Info />
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails sx={{p: 0}}>
            <Stack gap={1} mt={selectedSample ? 0 : 1}>
              {selectedSample &&
                <SelectInfo info1={capitalizeFirstLetter(selectedSample.tissue)} info2={capitalizeFirstLetter(selectedSample.displayname)} onClose={() => handleSetSelectedSample(null)} />
              }
              {biosampleData?.data ?
                <GwasBiosampleTables
                  showRNAseq={false}
                  showDownloads={false}
                  biosampleSelectMode="replace"
                  /**
                   * @todo account for this when refactoring biosample tables further
                   */
                  biosampleData={{ data: { human: { biosamples: biosampleData.data['human'].biosamples.filter(b => b.dnase) }, mouse: biosampleData.data['mouse'] }, loading: biosampleData.loading, networkStatus: biosampleData.networkStatus }}
                  assembly={"GRCh38"}
                  selectedBiosamples={[]}
                  setSelectedBiosamples={setSelectedBiosample}
                  onBiosampleClicked={handleSetSelectedSample}
                />
                :
                <CircularProgress sx={{ margin: "auto" }} />
              }
            </Stack>
          </AccordionDetails>
        </Accordion>
        {selectedSample && !samplesOpen &&
          <SelectInfo info1={capitalizeFirstLetter(selectedSample.tissue)} info2={capitalizeFirstLetter(selectedSample.displayname)} onClose={() => handleSetSelectedSample(null)} />
        }
      </div>
  }

  const LdBlocks = () => {
    return (
      <div>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor={lightTextColor} />} sx={{ backgroundColor: darkBlue, color: lightTextColor, borderRadius: '4px' }}>
            <Typography variant="h6">LD Blocks</Typography>
            <Tooltip title={"LD Blocks are regions of the genome where genetic variants are inherited together due to high levels of linkage disequilibrium (LD)"} sx={{alignSelf: "center", ml: 1}}>
              <Info />
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails sx={{p: 0}}>
            {study ?
              cCREIntersectionsLoading ?
                <CircularProgress /> :
                <DataTable
                  tableTitle={"LD Blocks"}
                  rows={[{ totalLDblocks: study.totalldblocks, overlappingldblocks: Math.ceil((overlappingLdBlocks.length / +study.totalldblocks) * 100), numCresOverlap: uniqueAccessions.length }]}
                  columns={[
                    { header: "Total LD blocks", value: (row: any) => row.totalLDblocks },
                    { header: "# of LD blocks overlapping cCREs", value: (row: any) => overlappingLdBlocks.length + " (" + row.overlappingldblocks + "%)" },
                    { header: "# of overlapping cCREs", value: (row: any) => row.numCresOverlap },
                  ]}
                  sortDescending={true}
                  hidePageMenu={true}
                />
              :
              <Typography p={2}>Select a Study on the Left</Typography>
            }
          </AccordionDetails>
        </Accordion>
      </div>
    )
  }

  const IntersectingcCREs = () => {
    return (
      <div>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor={lightTextColor} />} sx={{ backgroundColor: darkBlue, color: lightTextColor, borderRadius: '4px' }}>
            <Typography variant="h6">Intersecting cCREs</Typography>
            <Tooltip title={"cCREs intersected against SNPs identified by selected GWAS study"} sx={{alignSelf: "center", ml: 1}}>
              <Info />
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails sx={{p: 0}}>
            {study ?
              !cCREDetails || cCREDetailsLoading ?
                <CircularProgress />
                :
                <DataTable
                  key={Math.random()}
                  rows={intersectionTableRows}
                  tableTitle={selectedSample ? capitalizeFirstLetter(selectedSample.displayname) + " Specific Data" : "Cell Type Agnostic Data"}
                  columns={columns}
                  itemsPerPage={5}
                  searchable={true}
                  sortColumn={5}
                />
              :
              <Typography p={2}>Select a Study on the Left</Typography>
            }
          </AccordionDetails>
        </Accordion>
      </div>
    )
  }

  const DataToDisplay = () => {
    return (
      <Paper sx={{ width: "100%" }}>
        <Stack spacing={2} margin={2}>
          <LdBlocks />
          <IntersectingcCREs />
        </Stack>
      </Paper>
    )
  }

  const Selections = () => {
    return (
      <Paper sx={{ width: "100%" }}>
        <Stack spacing={2} margin={2}>
          <StudySelection />
          <BiosampleSelection />
        </Stack>
      </Paper>
    )
  }

  const SuggestionsPlot = useMemo(() => {
    return (
      <Paper sx={{ backgroundColor: lightOrange, backgroundImage: "none !important", padding: 2, width: "100%" }}>
        <Accordion disabled={!study} expanded={suggestionsOpen} onChange={handleSetSuggestionsOpen}>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor={lightTextColor} />} sx={{ backgroundColor: orange, color: lightTextColor, borderRadius: '4px' }}>
            <Typography variant="h6">Suggestions</Typography>
            <Tooltip title={"Suggested Biosamples: Suggested biosamples to investigate based on cCRE enrichment as calculated by the Variant Enrichment and Sample Prioritization Analysis (VESPA) pipeline"} sx={{alignSelf: "center", ml: 1}}>
              <Info />
            </Tooltip>
          </AccordionSummary>
          <AccordionDetails>
            <ParentSize>
              {(parent: ParentSizeProvidedProps) => (
                (plotData && parent.width) ?
                  <EnrichmentLollipopPlot
                    data={plotData}
                    height={700}
                    width={parent.width}
                    onSuggestionClicked={handlePlotSelection}
                    title={study.studyname + ', ' + study.author.replaceAll('_', ' ') + ', ' + study.pubmedid}
                  />
                  :
                  <CircularProgress />
              )}
            </ParentSize>
          </AccordionDetails>
        </Accordion>
      </Paper>
    )
  }, [plotData, study, suggestionsOpen])

  return (
    <main style={{ backgroundColor: background }}>
      <Grid container spacing={2} padding={5}>
        <Grid xs={12} lg={4}>
          <Stack spacing={2} alignItems={"center"}>
            <Selections />
            {!isLg && <DataToDisplay />}
            {!isLg && SuggestionsPlot}
          </Stack>
        </Grid>
        <Grid lg={8} display={{ xs: 'none', lg: 'block' }}>
          <Stack spacing={2}>
            <DataToDisplay />
            {SuggestionsPlot}
          </Stack>
        </Grid>
      </Grid>
    </main>
  )
}
