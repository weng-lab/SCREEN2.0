"use client"
import { Accordion, AccordionDetails, AccordionSummary, FormControl, FormLabel, Stack, ToggleButton, ToggleButtonGroup, Typography, useMediaQuery, useTheme } from "@mui/material"

import React, { useState, useEffect, useTransition, useMemo } from "react"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { createLink, LoadingMessage } from "../../../common/lib/utility"
import Grid from "@mui/material/Unstable_Grid2/Grid2"
import { CircularProgress } from "@mui/material"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { client } from "../../search/_ccredetails/client"
import { useQuery } from "@apollo/client"
import { GET_ALL_GWAS_STUDIES, GET_SNPS_FOR_GIVEN_GWASSTUDY, BED_INTERSECT, CCRE_SEARCH } from "./queries"
import { ApolloQueryResult } from "@apollo/client"
import { BIOSAMPLE_Data, biosampleQuery } from "../../../common/lib/queries"
import BiosampleTables from "../../search/biosampletables"
import { RegistryBiosample } from "../../search/types"
import testData from "./gwastestdata.json"
import { EnrichmentLollipopPlot } from "./lollipopplot"

const enrichmentData = testData.map(x => {

  return {
    celltype: x.celltype,
    displayname: x.celltype, //Need to fetch displayname with ccREBiosampleQuery if not included in data
    fdr: +x.fdr,
    pval: +x.pval,
    foldenrichment: +x.foldenrichment,
    study: x.study,
    expID: 'ENCSR123456789'
  }
})

type GWASStudy = {
  studyname: string,
  study: string,
  author: string
  pubmedid: string
  totalldblocks: string

}
export default function GWAS() {
  const [study, setStudy] = useState<GWASStudy>(null)
  const [selectedBiosample, setSelectedBiosample] = useState<RegistryBiosample[]>([])
  const [isPending, startTransition] = useTransition();
  const [biosampleData, setBiosampleData] = useState<ApolloQueryResult<BIOSAMPLE_Data>>(null)

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
  

  let cCREsIntersectionData = cCREIntersections && cCREIntersections.intersection.map((c) => {

    return {
      accession: c[4],
      snpid: c[9],
      ldblocksnpid: c[11],
      ldblock: c[12],
      rsquare: c[10]
    }
  })

  let overlappingldblocks = cCREsIntersectionData && new Set([...cCREsIntersectionData.map(c => { return (+c.ldblock) })])
  let accessions = cCREsIntersectionData && new Set([...cCREsIntersectionData.map(c => { return (c.accession) })])

  const {
    data: cCREDetails, loading: cCREDetailsLoading
  } = useQuery(CCRE_SEARCH, {
    variables: {
      accessions: accessions && Array.from(accessions),
      assembly: "grch38",
      celltype: selectedBiosample && selectedBiosample.length > 0 ? selectedBiosample[0].name : null
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    skip: !(accessions && accessions.size > 0),
    client,
  })

  let ccreGenes = {}

  cCREDetails && cCREDetails.cCRESCREENSearch.forEach((c) => {
    ccreGenes[c.info.accession] = { gene: c.nearestgenes[0].gene, ctspecific: c.ctspecific }


  })

  cCREsIntersectionData = ccreGenes && cCREsIntersectionData && cCREsIntersectionData.map((c) => {
    return {
      ...c,
      gene: ccreGenes[c.accession] && ccreGenes[c.accession].gene,
      ctspecific: ccreGenes[c.accession] && ccreGenes[c.accession].ctspecific

    }
  })

  const columns = useMemo(() => {

    let cols = [
      { header: "cCRE", value: (row: any) => row.accession },
      {
        header: "SNP",
        value: (row: any) => createLink("http://ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=", row.snpid),
      },
      { header: "LdBlock", value: (row: any) => row.ldblock },
      {
        header: "Ld Block SNP ID", value: (row: any) => row.ldblocksnpid
      },
      { header: "R Square", value: (row: any) => row.rsquare },
      { header: "Gene", value: (row: any) => row.gene },

    ]

    if (selectedBiosample && selectedBiosample.length > 0 && cCREsIntersectionData && cCREsIntersectionData[0].ctspecific) {
      if (selectedBiosample[0].dnase) {
        cols.push({ header: "DNase Zscore", value: (row: any) => row.ctspecific.dnase_zscore?.toFixed(2) })
      }
      if (selectedBiosample[0].atac) {
        cols.push({ header: "ATAC Zscore", value: (row: any) => row.ctspecific.atac_zscore?.toFixed(2) })
      }
      if (selectedBiosample[0].ctcf) {
        cols.push({ header: "CTCF Zscore", value: (row: any) => row.ctspecific.ctcf_zscore?.toFixed(2) })
      }

      if (selectedBiosample[0].h3k27ac) {
        cols.push({ header: "H3k27ac Zscore", value: (row: any) => row.ctspecific.enhancer_zscore?.toFixed(2) })
      }

      if (selectedBiosample[0].h3k4me3) {
        cols.push({ header: "H3k4me3 Zscore", value: (row: any) => row.ctspecific.promoter_zscore?.toFixed(2) })
      }



    }
    return cols;
  }, [selectedBiosample, cCREsIntersectionData])

  const StudySelection = () => {
    return gwasstudiesLoading ? LoadingMessage() : gwasstudies && gwasstudies.getAllGwasStudies.length > 0 &&
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Select a GWAS Study
        </AccordionSummary>
        <AccordionDetails>
          <DataTable
            tableTitle="GWAS Studies"
            rows={gwasstudies.getAllGwasStudies}
            columns={[
              {
                header: "Study", value: (row) => {
                  return row.studyname
                }
              },
              { header: "Author", value: (row) => row.author },
              { header: "Pubmed", value: (row) => row.pubmedid, render: (row: any) => createLink("https://pubmed.ncbi.nlm.nih.gov/", row.pubmedid) },
            ]}
            onRowClick={(row: any) => {
              setStudy(row)
              setSelectedBiosample([])
            }}
            sortDescending={true}
            itemsPerPage={10}
            searchable={true}
          />
        </AccordionDetails>
      </Accordion>
  }

  const BiosampleSelection = () => {
    return biosampleData?.loading && gwasstudies && gwasstudies.getAllGwasStudies.length > 0 ?
      <CircularProgress sx={{ margin: "auto" }} />
      :
      <Accordion defaultExpanded>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          Select a Biosample
        </AccordionSummary>
        <AccordionDetails>
          {biosampleData?.data ?
            <BiosampleTables
              showRNAseq={false}
              showDownloads={false}
              biosampleSelectMode="replace"
              biosampleData={{ data: { human: { biosamples: biosampleData.data['human'].biosamples.filter(b => b.dnase) }, mouse: biosampleData.data['mouse'] }, loading: biosampleData.loading, networkStatus: biosampleData.networkStatus }}
              assembly={"GRCh38"}
              selectedBiosamples={selectedBiosample}
              setSelectedBiosamples={setSelectedBiosample}
            /> :
            <CircularProgress sx={{ margin: "auto" }} />}
        </AccordionDetails>
      </Accordion>
  }

  const LdBlocks = () => {
    return (
      study && cCREIntersections && overlappingldblocks && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            LD Blocks
          </AccordionSummary>
          <AccordionDetails>
            <DataTable
              rows={[{ totalLDblocks: study.totalldblocks, overlappingldblocks: Math.ceil((overlappingldblocks.size / +study.totalldblocks) * 100), numCresOverlap: accessions.size }]}
              columns={[
                { header: "Total LD blocks", value: (row: any) => row.totalLDblocks },
                { header: "# of LD blocks overlapping cCREs", value: (row: any) => overlappingldblocks.size + " (" + row.overlappingldblocks + "%)" },
                { header: "# of overlapping cCREs", value: (row: any) => row.numCresOverlap },
              ]}
              sortDescending={true}
              hidePageMenu={true}
            />
          </AccordionDetails>
        </Accordion>
      )
    )
  }

  const IntersectingcCREs = () => {
    return (
      cCREsIntersectionData && cCREsIntersectionData.length > 0 && (
        <Accordion defaultExpanded>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            Intersecting cCREs
          </AccordionSummary>
          <AccordionDetails>
            <DataTable
              key={cCREsIntersectionData[0] && cCREsIntersectionData[0].gene + cCREsIntersectionData[0].accession + cCREsIntersectionData[0].snpid + cCREsIntersectionData[0].ldblocksnpid + cCREsIntersectionData[0].ldblock + cCREsIntersectionData[0].rsquare + columns.toString()}
              rows={cCREsIntersectionData}
              tableTitle={selectedBiosample.length > 0 ? selectedBiosample[0].displayname + " Specific Data" : "Cell Type Agnostic Data"}
              columns={columns}
              sortDescending={true}
              itemsPerPage={10}
              searchable={true}
            />
          </AccordionDetails>
        </Accordion>

      )
    )
  }

  //Tried putting this in an accordion but then the tooltip stopped working
  const SuggestionsPlot = () => {
    return (
        <EnrichmentLollipopPlot
          data={enrichmentData}
          height={700}
          width={800}
          onSuggestionClicked={(selected) => console.log(selected)}
        />
    )
  }

  const theme = useTheme()
  const isLg = useMediaQuery(theme.breakpoints.down('lg'))

  return (
    <main>
      <Grid container spacing={2} padding={5}>
        <Grid xs={12}>
          <Typography variant="h4">GWAS Applet</Typography>
          <Typography>Selected Study: {study?.studyname}</Typography>
          <Typography>Selected Sample: {selectedBiosample.length > 0 && selectedBiosample[0].displayname}</Typography>
        </Grid>
        <Grid xs={12} lg={4}>
          <Stack spacing={2}>
            <StudySelection />
            <BiosampleSelection />
            {isLg &&
              <>
                <LdBlocks />
                <IntersectingcCREs />
                <SuggestionsPlot />
              </>
            }
          </Stack>
        </Grid>
        <Grid lg={8} display={{ xs: 'none', lg: 'block' }}>
          <Stack spacing={2}>
            <LdBlocks />
            <IntersectingcCREs />
            <SuggestionsPlot />
          </Stack>
        </Grid>
      </Grid>
    </main>
  )
}
