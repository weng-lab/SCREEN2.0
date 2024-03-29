"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { NEARBY_GENOMIC_FEATURES_QUERY, NEARBY_GENOMIC_FEATURES_NOSNPS_QUERY } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Typography } from "@mui/material"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { LoadingMessage } from "../../../common/lib/utility"
import { usePathname, useRouter, useSearchParams } from "next/navigation"


const genesDistance = (
  coordinates: { chromosome: string; start: number; end: number },
  ccrecoord: { chromosome: string; start: number; end: number }
) => {
  let c = Math.floor((ccrecoord.start + ccrecoord.end) / 2)
  return Math.min(Math.abs(coordinates.start - c), Math.abs(coordinates.end - c))
}

const cCREDistance = (
  coordinates: { chromosome: string; start: number; end: number },
  ccrecoord: { chromosome: string; start: number; end: number }
) => {
  let c = Math.floor((ccrecoord.start + ccrecoord.end) / 2)
  let g = Math.floor((coordinates.start + coordinates.end) / 2)
  return Math.abs(g - c)
}

const snpDistance = (
  coordinates: { chromosome: string; start: number; end: number },
  ccrecoord: { chromosome: string; start: number; end: number }
) => {
  let c = Math.floor((ccrecoord.start + ccrecoord.end) / 2)
  return Math.abs(c - coordinates.start)
}
export const NearByGenomicFeatures: React.FC<{
  assembly: string
  accession: string
  coordinates: { chromosome: string; start: number; end: number }
  handleOpencCRE: (row: any) => void
}> = ({ assembly, accession, coordinates, handleOpencCRE }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)
      console.log("called")
      return params.toString()
    },
    [searchParams]
  )
  const { loading, data } = useQuery(
    assembly.toLowerCase() === "mm10" ? NEARBY_GENOMIC_FEATURES_NOSNPS_QUERY : NEARBY_GENOMIC_FEATURES_QUERY,
    {
      variables:
        assembly.toLowerCase() === "mm10"
          ? {
            b: assembly.toLowerCase(),
            c: assembly.toLowerCase(),
            coordinates: {
              chromosome: coordinates.chromosome,
              start: coordinates.start - 1000000,
              end: coordinates.end + 1000000,
            },
            chromosome: coordinates.chromosome,
            start: coordinates.start - 1000000,
            end: coordinates.end + 1000000,
            version: 25
          }
          : {
            a: "hg38",
            b: assembly.toLowerCase(),
            c: assembly.toLowerCase(),
            coordinates: {
              chromosome: coordinates.chromosome,
              start: coordinates.start - 1000000,
              end: coordinates.end + 1000000,
            },
            chromosome: coordinates.chromosome,
            start: coordinates.start - 1000000,
            end: coordinates.end + 1000000,
            version: 40
          },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      client,
    }
  )

  let genes =
    data &&
    data.gene &&
    data.gene.map((g) => {
      return {
        name: g.name,
        ensemblid_ver: g.id,
        chrom: g.coordinates.chromosome,
        start: g.coordinates.start,
        stop: g.coordinates.end,
        distance: genesDistance(g.coordinates, coordinates),
      }
    })
  let ccres =
    data &&
    data.cCREQuery &&
    data.cCREQuery.map((c) => {
      return {
        name: c.accession,
        distance: cCREDistance(c.coordinates, coordinates),
        chromosome: c.coordinates.chromosome,
        start: c.coordinates.start,
        end: c.coordinates.end
      }
    })
  let snps =
    data &&
    data.snpQuery &&
    data.snpQuery.map((s) => {
      return {
        assembly,
        accession: accession,
        chrom: coordinates.chromosome,
        cre_start: coordinates.start,
        cre_end: coordinates.end,
        distance: snpDistance(s.coordinates, coordinates),
        name: s.id,
        snp_start: s.coordinates.start,
        snp_end: s.coordinates.end,
      }
    })
  return (
    <>
      {loading || !data ? (
        <LoadingMessage />
      ) : (
        <>
          <Grid2 container spacing={5}>
            <Grid2 xs={12} md={6} xl={4}>
              {
                <DataTable
                  columns={[
                    {
                      header: "Symbol",
                      value: (row) => row.name,
                      render: (row) =>
                        <Typography
                          component="a"
                          variant="body2"
                          color="primary"
                        >
                          {row.name}
                        </Typography>,
                    },
                    {
                      header: "Distance (in bp)",
                      value: (row) => row.distance,
                      render: (row) => row.distance.toLocaleString("en-US"),
                    },
                  ]}
                  onRowClick={(row) => {
                    window.open(`http://www.genecards.org/cgi-bin/carddisp.pl?gene=${row.name}`, "_blank")
                  }}
                  sortColumn={1}
                  tableTitle="Genes"
                  rows={genes || []}
                  itemsPerPage={10}
                  searchable
                  sortDescending={true}
                />
              }
            </Grid2>
            <Grid2 xs={12} md={6} xl={4}>
              {
                <DataTable
                  columns={[
                    {
                      header: "Accession",
                      value: (row) => row.name,
                      render: (row) => (
                        <Typography
                          component="a"
                          variant="body2"
                          color="primary"
                        >
                          {row.name}
                        </Typography>
                      ),
                    },
                    {
                      header: "Distance (in bp)",
                      value: (row) => row.distance,
                      render: (row) => row.distance.toLocaleString("en-US"),
                    },
                  ]}
                  onRowClick={(row) => {
                    handleOpencCRE({...row, accession: row.name })
                  }}
                  sortColumn={1}
                  tableTitle="cCREs"
                  rows={ccres.filter(c => c.distance != 0) || []}
                  itemsPerPage={10}
                  searchable
                  sortDescending={true}
                />
              }
            </Grid2>
            <Grid2 xs={12} md={6} xl={4}>
              {
                <DataTable
                  columns={[
                    {
                      header: "SNP Id",
                      value: (row) => row.name,
                      render: (row) =>
                        <Typography
                          component="a"
                          variant="body2"
                          color="primary"
                        >
                          {row.name}
                        </Typography>,
                    },
                    {
                      header: "Distance (in bp)",
                      value: (row) => row.distance,
                      render: (row) => row.distance.toLocaleString("en-US"),
                    },
                  ]}
                  onRowClick={(row) => {
                    window.open(`http://ensembl.org/${row.assembly.toLowerCase() === "grch38" ? "Homo_sapiens" : "Mus_musculus"}/Variation/Explore?vdb=variation;v=${row.name}`, "_blank")
                  }}
                  sortColumn={1}
                  tableTitle="SNPs"
                  rows={snps || []}
                  itemsPerPage={10}
                  searchable
                  sortDescending={true}
                />
              }
            </Grid2>
          </Grid2>
        </>
      )}
    </>
  )
}
