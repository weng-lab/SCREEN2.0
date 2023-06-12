'use client'
import { Typography } from "@mui/material"
import { fetchGWASStudy } from "./gwas"
// import { useMemo, useState, useEffect } from "react"
import { DataTable } from "@weng-lab/ts-ztable"
import { createLink, fetchServer } from "../../../common/utility"

type Props = {
  setState: (value: string) => void
}

export default async function GWAS() {
  let study = JSON.stringify({
    assembly: "GRCh38",
    gwas_study: "Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm"
  })

  // fetch list of studies
  const studies = await fetchServer("https://screen-beta-api.wenglab.org/gwasws/search", JSON.stringify({
    "assembly": "GRCh38",
    "uuid": "6c4abb33-b6e8-4cf5-b8f0-b40a27ed11ff"
  }))

  // fetch study
  const data = await fetchServer("https://screen-beta-api.wenglab.org/gwasws/main", study)

  console.log(studies)
  console.log(data)
  return (
    <main>
      <DataTable
          rows={studies.gwas.studies}
          columns={[
              { header: "Study", value: (row: any) => row.trait },
              { header: "Author", value: (row: any) => createLink("https://pubmed.ncbi.nlm.nih.gov/", row.author) },
              { header: "Pubmed", value: (row: any) => row.pubmed },
          ]}
      />
      <DataTable
          rows={data.Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm.mainTable}
          columns={[
              { header: "Total LD blocks", value: (row: any) => row.totalLDblocks },
              { header: "# of LD blocks overlapping cCREs", value: (row: any) => row.numLdBlocksOverlapFormat },
              { header: "# of overlapping cCREs", value: (row: any) => row.numCresOverlap },
          ]}
      />
      <DataTable
          rows={data.Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm.cres._all.accessions}
          columns={[
              { header: "cCRE", value: (row: any) => row.accession },
              { header: "SNPs", value: (row: any) => createLink("http://ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=", row.snps[0]) },
              { header: "gene", value: (row: any) => createLink("https://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.geneid) },
          ]}
      />
    </main>
  )
}