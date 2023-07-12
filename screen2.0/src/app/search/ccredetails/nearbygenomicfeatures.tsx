"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { NEARBY_GENOMIC_FEATURES_QUERY, NEARBY_GENOMIC_FEATURES_NOSNPS_QUERY } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { CircularProgress } from "@mui/material"
import { DataTable, Typography } from "@weng-lab/psychscreen-ui-components"
import { createLink } from "../../../common/lib/utility"
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
}> = ({ assembly, accession, coordinates }) => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams: any = useSearchParams()!

  const createQueryString = React.useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

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
        <Grid2 container spacing={3} sx={{ mt: "2rem", mb: "2rem" }}>
          <Grid2 xs={12} lg={12}>
            <CircularProgress />
          </Grid2>
        </Grid2>
      ) : (
        <>
          <Grid2 container spacing={3} sx={{ ml: "1rem", mr: "1rem", mt: "1rem", mb: "1rem" }}>
            <Grid2 xs={4} lg={4}>
              {
                <DataTable
                  columns={[
                    {
                      header: "Symbol",
                      value: (row) => row.name,
                      render: (row) => createLink("http://www.genecards.org/cgi-bin/carddisp.pl?gene=", row.name),
                    },
                    {
                      header: "Distance",
                      value: (row) => row.distance,
                    },
                  ]}
                  sortColumn={1}
                  tableTitle="Nearby Genes"
                  rows={genes || []}
                  itemsPerPage={10}
                  searchable
                  sortDescending={true}
                />
              }
            </Grid2>
            <Grid2 xs={4} lg={4}>
              {
                <DataTable
                  columns={[
                    {
                      header: "accession",
                      value: (row) => row.name,
                      render: (row) => (
                        <Typography
                          type="body"
                          size="medium"
                          onClick={() => router.push(pathname + "?" + createQueryString("accession", row.name))}
                          style={{
                            color: "#1976d2",
                            textDecoration: "underline",
                            fontSize: "14px",
                            lineHeight: "20px",
                            fontWeight: 400,
                            letterSpacing: "0.1px",
                            //marginBottom: "10px",
                          }}
                        >
                          {row.name}
                        </Typography>
                      ),
                    },
                    {
                      header: "Distance",
                      value: (row) => row.distance,
                    },
                  ]}
                  sortColumn={1}
                  tableTitle="Nearby cCREs"
                  rows={ccres || []}
                  itemsPerPage={10}
                  searchable
                  sortDescending={true}
                />
              }
            </Grid2>
            <Grid2 xs={4} lg={4}>
              {
                <DataTable
                  columns={[
                    {
                      header: "SNP Id",
                      value: (row) => row.name,
                      render: (row) =>
                        createLink(
                          row.assembly.toLowerCase() === "grch38"
                            ? "http://ensembl.org/Homo_sapiens/Variation/Explore?vdb=variation;v="
                            : "http://ensembl.org/Mus_musculus/Variation/Explore?vdb=variation;v=",
                          row.name
                        ),
                    },
                    {
                      header: "Distance",
                      value: (row) => row.distance,
                    },
                  ]}
                  sortColumn={1}
                  tableTitle="Nearby SNPs "
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
