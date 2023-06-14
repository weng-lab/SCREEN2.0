'use client'
import React, { useMemo, useState, useEffect } from "react"
import { DataTable } from "@weng-lab/ts-ztable"
import { createLink, fetchServer, ErrorMessage, LoadingMessage } from "../../../common/utility"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Box } from "@mui/material"

type Props = {
  setState: (value: string) => void
}


export default async function GWAS() {
  // const [ study, setStudy ] = useState(JSON.stringify({
  //   assembly: "GRCh38",
  //   gwas_study: "Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm"
  // }))
  const [ study, setStudy ] = React.useState("Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm")


  // fetch list of studies
  const studies = await fetchServer("https://screen-beta-api.wenglab.org/gwasws/search", JSON.stringify({
    "assembly": "GRCh38",
    "uuid": "6c4abb33-b6e8-4cf5-b8f0-b40a27ed11ff"
  }))

  // fetch study
  // const data = await fetchServer("https://screen-beta-api.wenglab.org/gwasws/main", study)
  const data = await fetchServer("https://screen-beta-api.wenglab.org/gwasws/main", JSON.stringify({
    assembly: "GRCh38",
    gwas_study: study
  }))

  // console.log(studies)
  // console.log(data)

  return (
    <main>
      <Grid2 container spacing={2} sx={{mt: '2rem'}}>
        <Grid2 xs={4}>
          <DataTable
              rows={studies.gwas.studies}
              columns={[
                  { header: "Study", value: (row: any) => row.trait },
                  { header: "Author", value: (row: any) => createLink("https://pubmed.ncbi.nlm.nih.gov/", row.author) },
                  { header: "Pubmed", value: (row: any) => row.pubmed },
              ]}
              onRowClick={(row: any) => setStudy(row.trait)}
          />
        </Grid2>
        <Grid2 xs={8} >
          <Box mb={2}>
            <DataTable
                rows={data[study].mainTable}
                columns={[
                    { header: "Total LD blocks", value: (row: any) => row.totalLDblocks },
                    { header: "# of LD blocks overlapping cCREs", value: (row: any) => row.numLdBlocksOverlapFormat },
                    { header: "# of overlapping cCREs", value: (row: any) => row.numCresOverlap },
                ]}
            />
          </Box>
          <DataTable
              rows={data[study].cres._all.accessions}
              columns={[
                  { header: "cCRE", value: (row: any) => row.accession },
                  { header: "SNPs", value: (row: any) => createLink("http://ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=", row.snps[0]) },
                  { header: "gene", value: (row: any) => createLink("https://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.geneid) },
              ]}
          />
        </Grid2>
      </Grid2>
    </main>
  )
}