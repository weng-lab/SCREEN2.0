"use client"
import { Accordion, AccordionDetails, AccordionSummary, Box, Button, FormControl, FormLabel, IconButton, Paper, Stack, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from "@mui/material"

import React, { useState, useEffect, useTransition, useMemo } from "react"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { createLink, LoadingMessage } from "../../../common/lib/utility"
import Grid from "@mui/material/Unstable_Grid2/Grid2"
import { CircularProgress } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { client } from "../../search/_ccredetails/client"
import { useQuery } from "@apollo/client"
import { GET_ALL_GWAS_STUDIES, GET_SNPS_FOR_GIVEN_GWASSTUDY, BED_INTERSECT, CCRE_SEARCH, CT_ENRICHMENT, BIOSAMPLE_DISPLAYNAMES } from "./queries"
import { ApolloQueryResult } from "@apollo/client"
import { BIOSAMPLE_Data, biosampleQuery } from "../../../common/lib/queries"
import BiosampleTables2 from "./biosampletables2"
import { RegistryBiosample, RegistryBiosamplePlusRNA } from "../../search/types"
import { EnrichmentLollipopPlot, RawEnrichmentData, TransformedEnrichmentData } from "./_lollipop-plot/lollipopplot"
import { ParentSize } from "@visx/responsive"
import { ParentSizeProvidedProps } from "@visx/responsive/lib/components/ParentSize"
import { BiosampleNameData, BiosampleNameVars, EnrichmentData, EnrichmentVars } from "./types"
import { tissueColors } from "../../../common/lib/colors"
import { Close } from "@mui/icons-material"

//Background colors for the accordions
const lightBlue = "#5F8ED3"
const darkBlue = "#2C5BA0"
const extraLightBlue = "#E7EEF8"
const orange = "#F1884D"
const lightOrange = "#FDEFE7 !important"
const lightGrey = "#EAE9E9"
const grey = "#B6B6B6"
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
  const [study, setStudy] = useState<GWASStudy>(null)
  const [selectedSample, setSelectedSample] = useState<{ name: string, displayname: string }>(null)

  //useless, to remove once biosampletable2 fixed
  const [selectedBiosample, setSelectedBiosample] = useState<RegistryBiosample[]>([])

  const [isPending, startTransition] = useTransition();
  const [biosampleData, setBiosampleData] = useState<ApolloQueryResult<BIOSAMPLE_Data>>(null)

  const [suggestionsOpen, setSuggestionsOpen] = useState<boolean>(false)

  const handleSetSuggestionsOpen = (event: React.SyntheticEvent, isExpanded: boolean) => {
    setSuggestionsOpen(isExpanded);
  };

  const handleSetStudy = (newStudy: GWASStudy) => {
    if (newStudy) {
      setSuggestionsOpen(true)
    } else {
      setSuggestionsOpen(false)
    }
    setStudy(newStudy)
  }
  
  const handleSetSelectedSample = (selected: RegistryBiosamplePlusRNA) => {
    setSelectedSample({ name: selected.name, displayname: selected.displayname })
  }
  
  const handlePlotSelection = (selected: TransformedEnrichmentData) => {
    setSelectedSample({ name: selected.celltype, displayname: selected.displayname })
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
        value: (row: TableRow) => row.accession
      },
      {
        header: "SNP",
        value: (row: TableRow) => "http://ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=" + row.snpid,
        render: (row: TableRow) => createLink("http://ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=", row.snpid)
      },
      {
        header: "Ld Block SNP ID",
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
        render: (row: TableRow) => <i>{row.gene}</i>
      },
    ]

    //if sample selected, check before adding assays
    if (selectedSample && cCREDetails) {
      const cCRE = cCREDetails.cCRESCREENSearch[0]
      cCRE.ctspecific?.dnase_zscore && cols.push({ header: "DNase Zscore", value: (row: TableRow) => row.dnase_zscore?.toFixed(2) })
      cCRE.ctspecific?.atac_zscore && cols.push({ header: "ATAC Zscore", value: (row: TableRow) => row.atac_zscore?.toFixed(2) })
      cCRE.ctspecific?.ctcf_zscore && cols.push({ header: "CTCF Zscore", value: (row: TableRow) => row.ctcf_zscore?.toFixed(2) })
      cCRE.ctspecific?.h3k27ac_zscore && cols.push({ header: "H3k27ac Zscore", value: (row: TableRow) => row.h3k27ac_zscore?.toFixed(2) })
      cCRE.ctspecific?.h3k4me3_zscore && cols.push({ header: "H3k4me3 Zscore", value: (row: TableRow) => row.h3k4me3_zscore?.toFixed(2) })
    } else {
      cols.push({ header: "DNase Zscore", value: (row: TableRow) => row.dnase_zscore?.toFixed(2) })
      cols.push({ header: "ATAC Zscore", value: (row: TableRow) => row.atac_zscore?.toFixed(2) })
      cols.push({ header: "CTCF Zscore", value: (row: TableRow) => row.ctcf_zscore?.toFixed(2) })
      cols.push({ header: "H3k27ac Zscore", value: (row: TableRow) => row.h3k27ac_zscore?.toFixed(2) })
      cols.push({ header: "H3k4me3 Zscore", value: (row: TableRow) => row.h3k4me3_zscore?.toFixed(2) })
    }
    return cols

  }, [selectedSample, cCREDetails])

  const StudySelection = () => {
    return gwasstudiesLoading ? LoadingMessage() : gwasstudies && gwasstudies.getAllGwasStudies.length > 0 &&
      <div id="study-selection">
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor={lightTextColor} />} sx={{ backgroundColor: lightBlue, color: lightTextColor, borderRadius: '4px' }}>
            GWAS Studies
          </AccordionSummary>
          <AccordionDetails>
            {study ?
              <Stack direction={"row"} gap={2} alignItems={"center"} justifyContent={"space-between"}>
                <Typography>{study.studyname}</Typography>
                <Typography>{study.author}</Typography>
                <Box flexGrow={1}>
                  <IconButton onClick={() => handleSetStudy(null)}>
                    <Close />
                  </IconButton>
                </Box>
              </Stack>
              :
              <DataTable
                tableTitle="GWAS Studies"
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
            }
          </AccordionDetails>
        </Accordion>
      </div>
  }

  const BiosampleSelection = () => {
    return biosampleData?.loading && gwasstudies && gwasstudies.getAllGwasStudies.length > 0 ?
      <CircularProgress sx={{ margin: "auto" }} />
      :
      <div>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor={lightTextColor} />} sx={{ backgroundColor: lightBlue, color: lightTextColor, borderRadius: '4px' }}>
            Select a Biosample
          </AccordionSummary>
          <AccordionDetails>
            {biosampleData?.data ?
              <BiosampleTables2
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
              <CircularProgress sx={{ margin: "auto" }} />}
          </AccordionDetails>
        </Accordion>
      </div>
  }

  const LdBlocks = () => {
    return (
      <div>
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor={lightTextColor} />} sx={{ backgroundColor: darkBlue, color: lightTextColor, borderRadius: '4px' }}>
            LD Blocks
          </AccordionSummary>
          <AccordionDetails>
            {study ?
              cCREIntersectionsLoading ?
                <CircularProgress /> :
                <DataTable
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
              <Typography>Select a Study on the Left</Typography>
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
            Intersecting cCREs
          </AccordionSummary>
          <AccordionDetails>
            {study ?
              !cCREDetails || cCREDetailsLoading ?
                <CircularProgress />
                :
                <DataTable
                  key={Math.random()}
                  rows={intersectionTableRows}
                  tableTitle={selectedSample ? selectedSample.displayname + " Specific Data" : "Cell Type Agnostic Data"}
                  columns={columns}
                  sortDescending={true}
                  itemsPerPage={10}
                  searchable={true}
                  onRowClick={(row) => console.log(row)}
                />
              :
              <Typography>Select a Study on the Left</Typography>
            }
          </AccordionDetails>
        </Accordion>
      </div>
    )
  }

  const DataToDisplay = () => {
    return (
      <Paper sx={{width: "100%"}}>
        <Stack spacing={2} margin={2}>
          <LdBlocks />
          <IntersectingcCREs />
        </Stack>
      </Paper>
    )
  }

  const Selections = () => {
    return (
      <Paper sx={{width: "100%"}}>
        <Stack spacing={2} margin={2}>
          <StudySelection />
          {study && <BiosampleSelection />}
        </Stack>
      </Paper>
    )
  }

  const SuggestionsPlot = useMemo(() => {
    return (
      <Paper sx={{ backgroundColor: study ? lightOrange : lightGrey, backgroundImage: "none !important", padding: 2, width: "100%" }}>
        <Accordion disabled={!study} expanded={suggestionsOpen} onChange={handleSetSuggestionsOpen}>
          <AccordionSummary expandIcon={<ExpandMoreIcon htmlColor={lightTextColor} />} sx={{ backgroundColor: study ? orange : grey, color: study ? lightTextColor : undefined, borderRadius: '4px' }}>
            Suggestions
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
        <Grid xs={12}>
          <Typography variant="h4">GWAS Applet</Typography>
          <Typography>Selected Study: {study?.studyname}</Typography>
          <Button onClick={() => { handleSetStudy(null); setSelectedSample(null) }}>Clear Study</Button>
          <Typography>Selected Sample: {selectedSample && selectedSample.displayname}</Typography>
          <Button onClick={() => { setSelectedSample(null) }}>Clear Sample</Button>
        </Grid>
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
