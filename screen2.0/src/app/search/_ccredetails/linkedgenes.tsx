"use client"
import React from "react"
import Grid from "@mui/material/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { CreateLink, toScientificNotationElement } from "../../../common/lib/utility"
import { Box, Paper, Typography } from "@mui/material"
import { LinkedGeneInfo } from "./ccredetails"
import GeneLink from "../../_utility/GeneLink"
import { gql } from "../../../graphql/__generated__/gql"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { CircularProgress } from "@mui/material"

const ComputationalGeneLinks_Query = gql(`
query ComputationalGeneLinksQuery($accession: String!){
  ComputationalGeneLinksQuery(accession: $accession){
   geneid
   genename
   genetype
   method
   celltype
   score
   methodregion
   fileaccession
  }
}
`)

type props = {
  linkedGenes: LinkedGeneInfo[],
  assembly: "mm10" | "GRCh38",
  accession: string
}

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
  
export const LinkedGenes: React.FC<props> = (props) => {
  const HiCLinked = props.linkedGenes.filter((x) => x.assay === "Intact-HiC")
  const ChIAPETLinked = props.linkedGenes.filter((x) => x.assay === "RNAPII-ChIAPET" || x.assay === "CTCF-ChIAPET")
  const crisprLinked = props.linkedGenes.filter((x) => x.method === "CRISPR")
  const eqtlLinked = props.linkedGenes.filter((x) => x.method === "eQTLs")
  const { data, loading } = useQuery(ComputationalGeneLinks_Query, {
          variables: { accession: props.accession },
          skip: !props.accession,
          fetchPolicy: "cache-and-network",
          nextFetchPolicy: "cache-first",
          client,
  })

  return (
    <Grid container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
      <Grid size={12}>
        {HiCLinked.length > 0 ?
          <DataTable
            columns={[
              {
                header: "Common Gene Name",
                value: (row: LinkedGeneInfo) => row.gene,
                render: (row: LinkedGeneInfo) => <GeneLink assembly={props.assembly} geneName={row.gene} />
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
                render: (row: LinkedGeneInfo) => <CreateLink linkPrefix="https://www.encodeproject.org/experiments/" linkArg={row.experiment_accession} label={row.experiment_accession} showExternalIcon underline="hover" />
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
                HeaderRender: () => <Typography variant="body2"><i>P</i></Typography>,
                value: (row: LinkedGeneInfo) => row.p_val,
                render: (row: LinkedGeneInfo) => row.p_val === 0 ? '0' : toScientificNotationElement(row.p_val, 2, {variant: "body2"})
              },
            ]}
            tableTitle="Intact Hi-C Loops"
            rows={HiCLinked}
            sortColumn={6}
            sortDescending
            searchable
          />
          :
          <EmptyTile title="Intact Hi-C Loops" body="No intact Hi-C loops overlap this cCRE and the promoter of a gene" />
        }
      </Grid>
      <Grid size={12}>
        {ChIAPETLinked.length > 0 ?
          <DataTable
            columns={[
              {
                header: "Common Gene Name",
                value: (row: LinkedGeneInfo) => row.gene,
                render: (row: LinkedGeneInfo) =><GeneLink assembly={props.assembly} geneName={row.gene} />
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
                render: (row: LinkedGeneInfo) => <CreateLink linkPrefix="https://www.encodeproject.org/experiments/" linkArg={row.experiment_accession} label={row.experiment_accession} showExternalIcon underline="hover" />
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
            searchable
          />
          :
          <EmptyTile title="ChIA-PET Interactions" body="No ChIA-PET interactions overlap this cCRE and the promoter of a gene" />
        }
      </Grid>
      <Grid size={12}>
        {crisprLinked.length > 0 ?
          <DataTable
            columns={[
              {
                header: "Common Gene Name",
                value: (row: LinkedGeneInfo) => row.gene,
                render: (row: LinkedGeneInfo) => <GeneLink assembly={props.assembly} geneName={row.gene} />
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
                render: (row: LinkedGeneInfo) => <CreateLink linkPrefix="https://www.encodeproject.org/experiments/" linkArg={row.experiment_accession} label={row.experiment_accession} showExternalIcon underline="hover" />
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
                HeaderRender: () => <Typography variant="body2"><i>P</i></Typography>,
                value: (row: LinkedGeneInfo) => row.p_val,
                render: (row: LinkedGeneInfo) => toScientificNotationElement(row.p_val, 2, {variant: 'body2'})
              },
            ]}
            tableTitle="CRISPRi-FlowFISH"
            rows={crisprLinked}
            emptyText="test"
            sortColumn={7}
            sortDescending
            searchable
          />
          :
          <EmptyTile title="CRISPRi-FlowFISH" body="This cCRE was not targeted in a CRISPRi-FlowFISH experiment" />
        }
      </Grid>
      <Grid size={12}>
        {eqtlLinked.length > 0 ?
          <DataTable
            columns={[
              {
                header: "Common Gene Name",
                value: (row: LinkedGeneInfo) => row.gene,
                render: (row: LinkedGeneInfo) => <GeneLink assembly={props.assembly} geneName={row.gene} />
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
                render: (row: LinkedGeneInfo) => toScientificNotationElement(row.p_val, 2, {variant: 'body2'})
              },
            ]}
            tableTitle="eQTLs"
            rows={eqtlLinked}
            sortColumn={6}
            sortDescending
            searchable
          />
          :
          <EmptyTile title="eQTLs" body="This cCRE does not overlap a variant associated with significant changes in gene expression" />
        }
      </Grid>
      <Grid size={12}>
        {loading && <CircularProgress />}
        {data && !loading && data.ComputationalGeneLinksQuery.length > 0 ? 
          <DataTable columns={[{
                header: "Common Gene Name",
                value: (row) => row.genename,
                render: (row) =><GeneLink assembly={props.assembly} geneName={row.genename} />
              },
              {
                header: "Gene Type",
                value: (row) => row.genetype === 'lncRNA' ? row.genetype : row.genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              },
              {
                header: "Gene ID",
                value: (row) => row.geneid,
              },
              {
                header: "Method",
                value: (row) => row.method.replaceAll("_"," "),
              },
              {
                header: "Method Region",
                value: (row) => row.methodregion.replaceAll("_"," ").replace(/^(\S+)\s+(\S+)\s+(\S+)$/, '$1:$2-$3'),
              },
              {
                header: "File ID",
                value: (row) => row.fileaccession,
                render: (row) => <CreateLink linkPrefix="https://www.encodeproject.org/files/" linkArg={row.fileaccession} label={row.fileaccession} showExternalIcon underline="hover" />
              },
              {
                header: "Biosample",
                value: (row) => row.celltype,
                render: (row) => <Typography variant="body2" minWidth={'200px'} maxWidth={'400px'}>{row.celltype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Typography>
              },
              {
                header: "Score",
                value: (row) => row.score.toFixed(2),
              }]}  
            tableTitle="Computational methods"
            rows={data.ComputationalGeneLinksQuery}
            sortColumn={7}
            sortDescending
            searchable/> : 
          <EmptyTile title="Computational methods" body="This cCRE does not have any genes linked by computational method" /> }
      </Grid>
    </Grid>
  );
}
