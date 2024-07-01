"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { LINKED_GENES, GENE_NAME } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { LoadingMessage, createLink } from "../../../common/lib/utility"
import { Typography } from "@mui/material"

type geneRow = {
  p_val: number;
  gene: string;
  geneid: string;
  genetype: string;
  method: string;
  accession: string;
  grnaid: string;
  effectsize: number;
  assay: string;
  celltype: string;
  experiment_accession: string;
  score: number;
  variantid: string;
  source: string;
  slope: number;
  tissue: string;
}

export const LinkedGenes: React.FC<{ accession: string; assembly: string }> = ({ accession, assembly }) => {
  // linked genes query
  const { loading: loading_linked, data: data_linked }: { loading: boolean, data: { linkedGenesQuery: { [key: string]: any; }[] } } = useQuery(LINKED_GENES, {
    variables: {
      assembly: assembly.toLowerCase(),
      accession: [accession],
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  const chromatinLinked = data_linked?.linkedGenesQuery.filter((x) => x.method === "Chromatin")
  const crisprLinked = data_linked?.linkedGenesQuery.filter((x) => x.method === "CRISPR")
  const eqtlsLinked = data_linked?.linkedGenesQuery.filter((x) => x.method === "eQTLs")

  return (
    loading_linked || !data_linked ? (
      <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
        <Grid2 xs={12} md={12} lg={12}>
          <LoadingMessage />
        </Grid2>
      </Grid2>
    ) : (
      <>
        <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
          <Grid2 xs={12}>
            <DataTable
              columns={[
                {
                  header: "Gene ID",
                  value: (row: geneRow) => row.geneid,
                  render: (row: geneRow) => createLink("http://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.geneid)
                },
                {
                  header: "Common Gene Name",
                  value: (row: geneRow) => row.gene,
                  render: (row: geneRow) => createLink("http://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.gene)
                },
                {
                  header: "Gene Type",
                  value: (row: geneRow) => row.genetype === 'lncRNA' ? row.genetype : row.genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                },
                {
                  header: "Assay Type",
                  value: (row: geneRow) => row.assay,
                },
                {
                  header: "Experiment ID",
                  value: (row: geneRow) => row.experiment_accession,
                },
                {
                  header: "Biosample",
                  value: (row: geneRow) => row.celltype,
                  render: (row: geneRow) => <Typography variant="body2" minWidth={'200px'} maxWidth={'400px'}>{row.celltype.replaceAll('_', ' ')}</Typography>
                },
                {
                  header: "Score",
                  value: (row: geneRow) => row.score,
                },
                {
                  header: "P",
                  HeaderRender: (row: geneRow) => <Typography variant="body2"><i>P</i></Typography>,
                  value: (row: geneRow) => row.p_val === 0 ? "n/a" : row.p_val, //TODO fix this sort
                },
              ]}
              tableTitle="3D Chromatin Linked"
              rows={chromatinLinked}
              sortColumn={6}
              itemsPerPage={5}
              searchable
            />
          </Grid2>
          <Grid2 xs={12}>
            <DataTable
              columns={[
                {
                  header: "Gene ID",
                  value: (row: geneRow) => row.geneid,
                  render: (row: geneRow) => createLink("http://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.geneid)
                },
                {
                  header: "Common Gene Name",
                  value: (row: geneRow) => row.gene,
                  render: (row: geneRow) => createLink("http://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.gene)
                },
                {
                  header: "Gene Type",
                  value: (row: geneRow) => row.genetype === 'lncRNA' ? row.genetype : row.genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                },
                {
                  header: "gRNA ID",
                  value: (row: geneRow) => row.grnaid,
                },
                {
                  header: "Assay Type",
                  value: (row: geneRow) => row.assay,
                },
                {
                  header: "Experiment ID",
                  value: (row: geneRow) => row.experiment_accession,
                },
                {
                  header: "Biosample",
                  value: (row: geneRow) => row.celltype,
                  render: (row: geneRow) => <Typography variant="body2" minWidth={'200px'} maxWidth={'400px'}>{row.celltype.replaceAll('_', ' ')}</Typography>
                },
                {
                  header: "Effect Size",
                  value: (row: geneRow) => row.effectsize,
                },
                {
                  header: "P",
                  HeaderRender: (row: geneRow) => <Typography variant="body2"><i>P</i></Typography>,
                  value: (row: geneRow) => row.p_val,
                },
              ]}
              tableTitle="CRISPR Linked"
              rows={crisprLinked}
              // sortColumn={7}
              itemsPerPage={5}
              searchable
            />
          </Grid2>
          <Grid2 xs={12}>
            <DataTable
              columns={[
                {
                  header: "Gene ID",
                  value: (row: geneRow) => row.geneid,
                  render: (row: geneRow) => createLink("http://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.geneid)
                },
                {
                  header: "Common Gene Name",
                  value: (row: geneRow) => row.gene,
                  render: (row: geneRow) => createLink("http://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.gene)
                },
                {
                  header: "Gene Type",
                  value: (row: geneRow) => row.genetype === 'lncRNA' ? row.genetype : row.genetype.replaceAll('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
                },
                {
                  header: "Variant ID",
                  value: (row: geneRow) => row.variantid,
                },
                {
                  header: "Source",
                  value: (row: geneRow) => row.source,
                },
                {
                  header: "Tissue",
                  value: (row: geneRow) => row.tissue,
                },
                {
                  header: "Slope",
                  value: (row: geneRow) => row.slope,
                },
                {
                  header: "P",
                  HeaderRender: () => <Typography variant="body2"><i>P</i></Typography>,
                  value: (row: geneRow) => row.p_val,
                },
              ]}
              tableTitle="eQTL Linked"
              rows={eqtlsLinked}
              // sortColumn={6}
              itemsPerPage={5}
              searchable
            />
          </Grid2>
        </Grid2>
      </>
    )
  )
}
