"use client"
import React, { useState } from "react"
import { Link } from "@mui/material"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { TF_INTERSECTION_QUERY, CRE_TF_DCC_QUERY } from "./queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { CircularProgress } from "@mui/material"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { LoadingMessage } from "../../../common/lib/utility"

export const TfIntersection: React.FC<{ assembly: string; coordinates: { chromosome: string; start: number; end: number } }> = ({
  assembly,
  coordinates,
}) => {
  const [factor, setFactor] = useState<string>("")
  const [factorHighlight, setFactorHighlight] = useState<{} | null>(null)
  const { loading: loading, data: data } = useQuery(TF_INTERSECTION_QUERY, {
    variables: {
      assembly: assembly.toLowerCase(),
      range: {
        chrom: coordinates.chromosome,
        chrom_start: coordinates.start,
        chrom_end: coordinates.end,
      },
      species: assembly.toLowerCase() === "grch38" ? "Homo sapiens" : "Mus musculus",
    },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  const { loading: loading_cre_tf, data: data_cre_tf } = useQuery(CRE_TF_DCC_QUERY, {
    variables: {
      assembly: assembly.toLowerCase(),
      range: {
        chrom: coordinates.chromosome,
        chrom_start: coordinates.start,
        chrom_end: coordinates.end,
      },
      target: factor,
    },
    skip: factor === "",
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })
  const cre_tf_data =
    factor != "" &&
    data_cre_tf &&
    data_cre_tf.peaks.peaks.map((p) => {
      return {
        expID: `${p.dataset.accession}/${p.dataset.files[0].accession}`,
        biosample_term_name: p.dataset.biosample,
      }
    })
  console.log(cre_tf_data, "cre_tf_data")
  let peakmap = {}
  data &&
    data.peaks.peaks.forEach((d) => {
      if (!peakmap[d.dataset.target]) {
        peakmap[d.dataset.target] = new Set()
      }
      peakmap[d.dataset.target].add(d.dataset.accession)
    })
  let totalmap = {}
  data &&
    data.peakDataset.partitionByTarget.forEach((x) => {
      totalmap[x.target.name] = x.counts.total
    })
  let tableData =
    data &&
    Object.keys(peakmap).map((k) => {
      return {
        name: k,
        n: peakmap[k].size,
        total: totalmap[k],
        test: peakmap[k],
      }
    })

  return (
    <>
      {loading || !data ? (
        <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
          <Grid2 xs={12} md={12} lg={12}>
            <LoadingMessage />
          </Grid2>
        </Grid2>
      ) : (
        <>
          <Grid2 container spacing={3} sx={{ mt: "0rem", mb: "2rem" }}>
            <Grid2 xs={factor != "" ? 6 : 12} lg={factor != "" ? 6 : 12}>
              <DataTable
                columns={[
                  {
                    header: "Factor",
                    value: (row) => row.name,
                    render: (row) => (
                      <Link href={`https://www.factorbook.org/tf/human/${row.name}/function`} rel="noopener noreferrer" target="_blank">
                        <button>{row.name}</button>
                      </Link>
                    ),
                  },
                  {
                    header: "# of experiments that support TF binding",
                    value: (row) => row.n,
                  },
                  {
                    header: "# experiments in total",
                    value: (row) => row.total,
                  },
                ]}
                tableTitle="TFs that bind this cCRE "
                rows={tableData || []}
                onRowClick={(row) => {
                  setFactor(row.name)
                  setFactorHighlight(row)
                }}
                sortColumn={0}
                itemsPerPage={5}
                highlighted={factorHighlight}
              />
            </Grid2>
            {cre_tf_data && (
              <Grid2 xs={6} lg={6}>
                <DataTable
                  columns={[
                    {
                      header: "cell type",
                      value: (row) => row.biosample_term_name,
                    },
                    {
                      header: "experiment/file",
                      value: (row) => row.expID,
                      render: (row) => (
                        <Link
                          href={`https://www.encodeproject.org/experiments/${row.expID.split("/")[0]}/`}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          <button>{row.expID}</button>
                        </Link>
                      ),
                    },
                  ]}
                  tableTitle={`ChIP-seq ${factor} Experiments`}
                  rows={cre_tf_data || []}
                  sortColumn={0}
                  itemsPerPage={5}
                />
              </Grid2>
            )}
          </Grid2>
        </>
      )}
    </>
  )
}
