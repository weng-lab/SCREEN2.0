"use client"
import React from "react"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { createLink, toScientificNotationElement } from "../../../common/lib/utility"
import { Box, Link, Paper, Typography } from "@mui/material"
import { LinkedGeneInfo } from "./ccredetails"
import { gql, useLazyQuery, useQuery } from "@apollo/client"
import { useRouter, useSearchParams } from "next/navigation"

type props = {
  linkedGenes: LinkedGeneInfo[]
}

export const LinkedGenes: React.FC<props> = (props) => {
  const HiCLinked = props.linkedGenes.filter((x) => x.assay === "Intact-HiC")
  const ChIAPETLinked = props.linkedGenes.filter((x) => x.assay === "RNAPII-ChIAPET" || x.assay === "CTCF-ChIAPET")
  const crisprLinked = props.linkedGenes.filter((x) => x.method === "CRISPR")
  const eqtlLinked = props.linkedGenes.filter((x) => x.method === "eQTLs")

  const searchParams = useSearchParams()
  const router = useRouter()

  type EmptyTileProps = {
    title: string,
    body: string
  }

  const EmptyTile: React.FC<EmptyTileProps> = (props: EmptyTileProps) =>
    <Paper elevation={3}>
      <Box p={"16px"}>
        <Typography variant="h5" pb={1}>{props.title}</Typography>
        <Typography>{props.body}</Typography>
      </Box>
    </Paper>

  
  const GENE_LOCATION = gql`
    query geneLocation ($name: String!, $assembly: String!, $version: Int!){
      gene(name: [$name], assembly: $assembly, version: $version){
        name
        coordinates {
          chromosome
          start
          end
        }
      }
    }
  `
  type GeneLocationVars = {
    name: string,
    assembly: "grch38" | "mm10",
    version: 25 | 40
  }
  
  type GenomicRegion = {
    chromosome: string
    start: number
    end: number
  }

  type GeneLocationData = {
    gene: [
      {
        name: string
        coordinates: GenomicRegion
      }
    ]
  }
  
  const [getGeneLocation] = useLazyQuery<GeneLocationData, GeneLocationVars>(GENE_LOCATION)

  const openNewGeneSearch = (gene: string) => {
    const assembly = searchParams.get("assembly") //assuming assembly is correct in url
    //removing space after gene name due to issue with return data having trailing space
    getGeneLocation({variables: {name: gene, assembly: assembly.toLowerCase() as ('mm10' | 'grch38'), version: assembly.toLowerCase() === "grch38" ? 40 : 25}})
    .then((geneLocation) => {
      const coordinates = geneLocation.data.gene[0].coordinates
      const gene = geneLocation.data.gene[0].name
      window.open(`/search?assembly=${assembly}&chromosome=${coordinates.chromosome}&start=${coordinates.start}&end=${coordinates.end}&gene=${gene}&tssDistance=0`, '_blank')
    })
    .catch((error) => window.alert("Something went wrong fetching the location of " + gene + ", please try again or start a new search for this gene. Error: " + error))
  }

  return (
    <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
      <Grid2 xs={12}>
        {HiCLinked.length > 0 ?
          <DataTable
            columns={[
              {
                header: "Common Gene Name",
                value: (row: LinkedGeneInfo) => row.gene,
                //Bit hacky, using link with nested button to get desired color/mouse/underline
                render: (row: LinkedGeneInfo) => <Link variant="inherit" onClick={() => openNewGeneSearch(row.gene)}><button><i>{row.gene}</i></button></Link>
              },
              {
                header: "Gene Type",
                value: (row: LinkedGeneInfo) => row.genetype === 'lncRNA' ? row.genetype : row.genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              },
              {
                header: "Assay Type",
                value: (row: LinkedGeneInfo) => row.assay,
              },
              {
                header: "Experiment ID",
                value: (row: LinkedGeneInfo) => row.experiment_accession,
                render: (row: LinkedGeneInfo) => createLink("https://www.encodeproject.org/experiments/", row.experiment_accession, row.experiment_accession, true)
              },
              {
                header: "Biosample",
                value: (row: LinkedGeneInfo) => row.displayname,
                render: (row: LinkedGeneInfo) => <Typography variant="body2" minWidth={'200px'} maxWidth={'400px'}>{row.displayname}</Typography>
              },
              {
                header: "Score",
                value: (row: LinkedGeneInfo) => row.score,
              },
              {
                header: "P",
                HeaderRender: (row: LinkedGeneInfo) => <Typography variant="body2"><i>P</i></Typography>,
                value: (row: LinkedGeneInfo) => row.p_val,
                render: (row: LinkedGeneInfo) => row.p_val === 0 ? '0' : toScientificNotationElement(row.p_val, 'body2')
              },
            ]}
            tableTitle="Intact Hi-C Loops"
            rows={HiCLinked}
            sortColumn={6}
            sortDescending
            itemsPerPage={5}
            searchable
          />
          :
          <EmptyTile title="Intact Hi-C Loops" body="No intact Hi-C loops overlap this cCRE and the promoter of a gene" />
        }
      </Grid2>
      <Grid2 xs={12}>
        {ChIAPETLinked.length > 0 ?
          <DataTable
            columns={[
              {
                header: "Common Gene Name",
                value: (row: LinkedGeneInfo) => row.gene,
                //Bit hacky, using link with nested button to get desired color/mouse/underline
                render: (row: LinkedGeneInfo) => <Link variant="inherit" onClick={() => openNewGeneSearch(row.gene)}><button><i>{row.gene}</i></button></Link>
              },
              {
                header: "Gene Type",
                value: (row: LinkedGeneInfo) => row.genetype === 'lncRNA' ? row.genetype : row.genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              },
              {
                header: "Assay Type",
                value: (row: LinkedGeneInfo) => row.assay,
              },
              {
                header: "Experiment ID",
                value: (row: LinkedGeneInfo) => row.experiment_accession,
                render: (row: LinkedGeneInfo) => createLink("https://www.encodeproject.org/experiments/", row.experiment_accession, row.experiment_accession, true)
              },
              {
                header: "Biosample",
                value: (row: LinkedGeneInfo) => row.displayname,
                render: (row: LinkedGeneInfo) => <Typography variant="body2" minWidth={'200px'} maxWidth={'400px'}>{row.displayname}</Typography>
              },
              {
                header: "Score",
                value: (row: LinkedGeneInfo) => row.score,
              },
            ]}
            tableTitle="ChIA-PET Interactions"
            rows={ChIAPETLinked}
            sortColumn={5}
            itemsPerPage={5}
            searchable
          />
          :
          <EmptyTile title="ChIA-PET Interactions" body="No ChIA-PET interactions overlap this cCRE and the promoter of a gene" />
        }
      </Grid2>
      <Grid2 xs={12}>
        {crisprLinked.length > 0 ?
          <DataTable
            columns={[
              {
                header: "Common Gene Name",
                value: (row: LinkedGeneInfo) => row.gene,
                //Bit hacky, using link with nested button to get desired color/mouse/underline
                render: (row: LinkedGeneInfo) => <Link variant="inherit" onClick={() => openNewGeneSearch(row.gene)}><button><i>{row.gene}</i></button></Link>
              },
              {
                header: "Gene Type",
                value: (row: LinkedGeneInfo) => row.genetype === 'lncRNA' ? row.genetype : row.genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              },
              {
                header: "gRNA ID",
                value: (row: LinkedGeneInfo) => row.grnaid,
              },
              {
                header: "Assay Type",
                value: (row: LinkedGeneInfo) => row.assay,
              },
              {
                header: "Experiment ID",
                value: (row: LinkedGeneInfo) => row.experiment_accession,
                render: (row: LinkedGeneInfo) => createLink("https://www.encodeproject.org/experiments/", row.experiment_accession, row.experiment_accession, true)
              },
              {
                header: "Biosample",
                value: (row: LinkedGeneInfo) => row.displayname,
                render: (row: LinkedGeneInfo) => <Typography variant="body2" minWidth={'200px'} maxWidth={'400px'}>{row.displayname}</Typography>
              },
              {
                header: "Effect Size",
                value: (row: LinkedGeneInfo) => row.effectsize,
              },
              {
                header: "P",
                HeaderRender: (row: LinkedGeneInfo) => <Typography variant="body2"><i>P</i></Typography>,
                value: (row: LinkedGeneInfo) => row.p_val,
                render: (row: LinkedGeneInfo) => toScientificNotationElement(row.p_val, 'body2')
              },
            ]}
            tableTitle="CRISPRi-FlowFISH"
            rows={crisprLinked}
            emptyText="test"
            sortColumn={7}
            sortDescending
            itemsPerPage={5}
            searchable
          />
          :
          <EmptyTile title="CRISPRi-FlowFISH" body="This cCRE was not targeted in a CRISPRi-FlowFISH experiment" />
        }
      </Grid2>
      <Grid2 xs={12}>
        {eqtlLinked.length > 0 ?
          <DataTable
            columns={[
              {
                header: "Common Gene Name",
                value: (row: LinkedGeneInfo) => row.gene,
                //Bit hacky, using link with nested button to get desired color/mouse/underline
                render: (row: LinkedGeneInfo) => <Link variant="inherit" onClick={() => openNewGeneSearch(row.gene)}><button><i>{row.gene}</i></button></Link>
              },
              {
                header: "Gene Type",
                value: (row: LinkedGeneInfo) => row.genetype === 'lncRNA' ? row.genetype : row.genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              },
              {
                header: "Variant ID",
                value: (row: LinkedGeneInfo) => row.variantid,
              },
              {
                header: "Source",
                value: (row: LinkedGeneInfo) => row.source,
              },
              {
                header: "Tissue",
                value: (row: LinkedGeneInfo) => row.tissue,
              },
              {
                header: "Slope",
                value: (row: LinkedGeneInfo) => row.slope,
              },
              {
                header: "P",
                HeaderRender: () => <Typography variant="body2"><i>P</i></Typography>,
                value: (row: LinkedGeneInfo) => row.p_val,
                render: (row: LinkedGeneInfo) => toScientificNotationElement(row.p_val, 'body2')
              },
            ]}
            tableTitle="eQTLs"
            rows={eqtlLinked}
            sortColumn={6}
            sortDescending
            itemsPerPage={5}
            searchable
          />
          :
          <EmptyTile title="eQTLs" body="This cCRE does not overlap a variant associated with significant changes in gene expression" />
        }
      </Grid2>
    </Grid2>
  )
}
