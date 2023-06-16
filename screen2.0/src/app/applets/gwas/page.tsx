"use client"
import { Typography } from "@mui/material"

import React, { useMemo, useState, useEffect } from "react"
import { DataTable } from "@weng-lab/ts-ztable"
import { createLink, fetchServer, ErrorMessage, LoadingMessage } from "../../../common/lib/utility"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Box } from "@mui/material"

type Props = {
  setState: (value: string) => void
}

const initialStudy = {
  Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm: {
    gwas_study: {
      value: "Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm",
      author: "Gretarsdottir S",
      pubmed: "20622881",
      trait: "Abdominal aortic aneurysm",
      total_ldblocks: 2,
      hasenrichment: false,
    },
    mainTable: [
      {
        totalLDblocks: 2,
        numLdBlocksOverlap: 2,
        numLdBlocksOverlapFormat: "2 (100%)",
        numCresOverlap: [11],
      },
    ],
    topCellTypes: [],
    cres: {
      _all: {
        accessions: [
          {
            accession: "EH38E2724033",
            snps: ["rs10818576"],
            info: {
              accession: "EH38E2724033",
              isproximal: true,
              k4me3max: 3.083,
              k27acmax: 3.392,
              ctcfmax: 1.982,
              concordant: false,
            },
            geneid: "DAB2IP",
            start: 121650654,
            stop: 121650827,
            chrom: "chr9",
            gene_all_id: [56110, 56108, 56111, 56109, 56112],
            gene_pc_id: [56098, 56110, 56104, 56100, 56115],
            cts: 0,
            ctspecifc: {
              dnase_zscore: null,
              promoter_zscore: null,
              enhancer_zscore: null,
              ctcf_zscore: null,
            },
            "dnase zscore": "",
            "enhancer zscore": "",
            "promoter zscore": "",
            genesallpc: { all: [Array], pc: [Array], accession: "EH38E2724033" },
          },
        ],
      },
    },
  },
}

const initialstudies = {
  gwas: {
    studies: [
      {
        Huang_KC_26169365_Yu_Zhi_constitution_type_in_type_2_diabetes: {
          value: "Huang_KC_26169365_Yu_Zhi_constitution_type_in_type_2_diabetes",
          author: "Huang KC",
          pubmed: "26169365",
          trait: "Yu-Zhi constitution type in type 2 diabetes",
          total_ldblocks: 11,
          hasenrichment: false,
        },
      },
    ],
  },
}

export default function GWAS() {
  const [study, setStudy] = React.useState("Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm")
  const [trait, setTrait] = React.useState("Abdominal aortic aneurysm")
  const [data, setData] = React.useState(initialStudy)
  const [studies, setStudies] = React.useState(initialstudies)
  const [loadingStudies, setLoadingStudies] = React.useState(true)
  const [loadingStudy, setLoadingStudy] = React.useState(true)
  // const [ studies, setStudies ] = useState<any>()

  // fetch list of studies
  useEffect(() => {
    fetch("https://screen-beta-api.wenglab.org/gwasws/search", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        assembly: "GRCh38",
        uuid: "6c4abb33-b6e8-4cf5-b8f0-b40a27ed11ff",
      }),
    })
      .then((response) => {
        if (!response.ok) {
          const error = new Error(response.statusText)
          // throw new Error(response.statusText)
          // return ErrorMessage(new Error(response.statusText))
          return ErrorMessage(error)
        }
        return response.json()
      })
      .then((data) => {
        setStudies(data)
        //set loading to false
        setLoadingStudies(false)
      })
      .catch((error: Error) => {
        // logging
        // throw error
        return ErrorMessage(error)
      })
    //set loading to true
    setLoadingStudies(true)
  }, [])

  useEffect(() => {
    fetch("https://screen-beta-api.wenglab.org/gwasws/main", {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({
        assembly: "GRCh38",
        gwas_study: study,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          const error = new Error(response.statusText)
          // throw new Error(response.statusText)
          // return ErrorMessage(new Error(response.statusText))
          return ErrorMessage(error)
        }
        return response.json()
      })
      .then((data) => {
        setData(data)
        setLoadingStudy(false)
      })
      .catch((error: Error) => {
        // logging
        // throw error
        return ErrorMessage(error)
      })
    setLoadingStudy(true)
  }, [study])

  // fetch study
  // const data = await fetchServer("https://screen-beta-api.wenglab.org/gwasws/main", study)
  // const data = await fetchServer("https://screen-beta-api.wenglab.org/gwasws/main", JSON.stringify({
  //   assembly: "GRCh38",
  //   gwas_study: study
  // }))

  // console.log(studies)
  // console.log(data)

  return (
    <main>
      <Grid2 container spacing={2} sx={{ mt: "2rem" }}>
        <Grid2 xs={4}>
          <Box ml={1}>
            {loadingStudies
              ? LoadingMessage()
              : studies &&
                studies.gwas && (
                  <DataTable
                    tableTitle="GWAS Studies"
                    rows={studies.gwas.studies}
                    columns={[
                      { header: "Study", value: (row: any) => row.trait },
                      { header: "Author", value: (row: any) => row.author },
                      { header: "Pubmed", value: (row: any) => createLink("https://pubmed.ncbi.nlm.nih.gov/", row.pubmed) },
                    ]}
                    onRowClick={(row: any) => {
                      setStudy(row.value)
                      setTrait(row.trait)
                    }}
                    sortDescending={true}
                    itemsPerPage={10}
                  />
                )}
          </Box>
        </Grid2>
        <Grid2 xs={8}>
          <Box mb={1}>
            <div
              style={{
                display: "flex",
                justifyContent: "left",
                alignItems: "center",
              }}
            >
              {loadingStudies ? <div></div> : <Typography variant="h5">{trait}</Typography>}
            </div>
          </Box>
          <Box mb={2} mr={1}>
            {loadingStudy
              ? LoadingMessage()
              : data &&
                data[study] && (
                  <DataTable
                    rows={data[study].mainTable}
                    columns={[
                      { header: "Total LD blocks", value: (row: any) => row.totalLDblocks },
                      { header: "# of LD blocks overlapping cCREs", value: (row: any) => row.numLdBlocksOverlapFormat },
                      { header: "# of overlapping cCREs", value: (row: any) => row.numCresOverlap },
                    ]}
                    sortDescending={true}
                    hidePageMenu={true}
                  />
                )}
          </Box>
          <Box mr={1}>
            {loadingStudy ? (
              <div></div>
            ) : (
              data &&
              data[study] &&
              data[study].cres && (
                <DataTable
                  rows={data[study].cres._all.accessions}
                  columns={[
                    { header: "cCRE", value: (row: any) => row.accession },
                    {
                      header: "SNPs",
                      value: (row: any) => createLink("http://ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v=", row.snps[0]),
                    },
                    { header: "gene", value: (row: any) => createLink("https://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.geneid) },
                  ]}
                  sortDescending={true}
                  itemsPerPage={10}
                />
              )
            )}
          </Box>
        </Grid2>
      </Grid2>
    </main>
  )
}
