"use client"
import { Typography } from "@mui/material"

import React, { useEffect, useState } from "react"
import { DataTable } from "@weng-lab/ts-ztable"
import { createLink, ErrorMessage, LoadingMessage } from "../../../common/lib/utility"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Box } from "@mui/material"
import { initialStudy, initialstudies } from "./types"

export default function GWAS() {
  const [study, setStudy] = useState<string>("Gretarsdottir_S_20622881_Abdominal_aortic_aneurysm")
  const [trait, setTrait] = useState<string>("Abdominal aortic aneurysm")
  const [data, setData] = useState(initialStudy)
  const [studies, setStudies] = useState(initialstudies)
  const [loadingStudies, setLoadingStudies] = useState<boolean>(true)
  const [loadingStudy, setLoadingStudy] = useState<boolean>(true)

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
          // throw new Error(response.statusText)
          return <ErrorMessage error={(new Error(response.statusText))} />
        }
        return response.json()
      })
      .then((data) => {
        setStudies(data)
        setLoadingStudies(false)
      })
      .catch((error: Error) => {
        // logging
        // throw error
        return <ErrorMessage error={error} />
      })
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
          // throw new Error(response.statusText)
          return <ErrorMessage error={(new Error(response.statusText))} />
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
        return <ErrorMessage error={error} />
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
                    searchable={true}
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
                  searchable={true}
                />
              )
            )}
          </Box>
        </Grid2>
      </Grid2>
    </main>
  )
}
