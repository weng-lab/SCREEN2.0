"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { LINKED_GENES, GENE_NAME } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { LoadingMessage, createLink } from "../../../common/lib/utility"

type geneRow = {
  gene: string
  celltype: string
  method: string
}
export const LinkedGenes: React.FC<{ accession: string; assembly: string }> = ({ accession, assembly }) => {
  // returns geneids from linked genes query
  const geneIDs = (linkedGenes: { assay: string; celltype: string; gene: string }[]) => {
    let geneIDs: string[] = []
    for (let i in linkedGenes) {
      geneIDs.push(linkedGenes[i].gene.split(".")[0])
    }
    return geneIDs
  }

  // linked genes query
  const { loading: loading_linked, data: data_linked } = useQuery(LINKED_GENES, {
    variables: {
      assembly,
      accession: [accession],
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })

  // gene query
  const { loading: loading_genes, data: data_genes } = useQuery(GENE_NAME, {
    variables: {
      assembly,
      name_prefix: geneIDs(data_linked?.linkedGenesQuery),
      version: assembly.toLowerCase()==="grch38" ? 40: 25
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  
  let linked_genes
  if (data_linked && data_genes) {
    let linkedgenes: { assay: string; celltype: string; gene: string }[] = data_linked.linkedGenesQuery
    let linkedgeneIDs: { name: string; id: string }[] = data_genes.gene
    let linked: geneRow[] = [],
      ids: { [key: string]: string | undefined } = {}
    for (let x of linkedgeneIDs) ids[x.id.split(".")[0]] = x.name

    for (let x of linkedgenes) {
      
      linked.push({
        gene: ids[x.gene.split(".")[0]] || x.gene.split(".")[0],
        celltype: x.celltype.replaceAll("_", " "),
        method: x.assay,
      })
    }
    linked_genes = linked
  }
  return (
    <>
      {loading_genes || loading_linked || !linked_genes ? (
        <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
          <Grid2 xs={12} md={12} lg={12}>
            <LoadingMessage />
          </Grid2>
        </Grid2>
      ) : (
        <>
          <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
            <Grid2 xs={12} md={12} lg={12}>
              <DataTable
                columns={[
                  {
                    header: "Gene",
                    value: (row: geneRow) => row.gene,
                    render: (row: geneRow) => createLink("http://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.gene),
                  },
                  {
                    header: "Biosample",
                    value: (row: geneRow) => row.celltype,
                  },
                  {
                    header: "Supporting Exp",
                    value: (row: geneRow) => row.method,
                  },
                ]}
                tableTitle="Linked Genes"
                rows={linked_genes}
                sortColumn={0}
                itemsPerPage={5}
              />
            </Grid2>
          </Grid2>
        </>
      )}
    </>
  )
}
