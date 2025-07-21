"use client"
import React from "react"
import { client } from "./client"
import { useQuery } from "@apollo/client"
import { NEARBY_GENOMIC_FEATURES_QUERY, NEARBY_GENOMIC_FEATURES_NOSNPS_QUERY } from "./queries"
import Grid from "@mui/material/Grid"
import { Typography } from "@mui/material"
import { DataTable } from "psychscreen-legacy-components"
import { LoadingMessage } from "../../../common/lib/utility"
import { calcDistRegionToPosition, calcDistRegionToRegion } from "./utils"
import { calcDistToTSS } from "./utils"
import GeneLink from "../../_utility/GeneLink"
import { NearbyGenomicFeaturesQuery } from "../../../graphql/__generated__/graphql"

type SNP = {
  assembly: "mm10" | "GRCh38";
  accession: string;
  chrom: string;
  cre_start: number;
  cre_end: number;
  distance: number;
  name: string;
  snp_start: number;
  snp_end: number;
};

export const NearByGenomicFeatures: React.FC<{
  assembly: "mm10" | "GRCh38"
  accession: string
  coordinates: { chromosome: string; start: number; end: number }
  handleOpencCRE: (row: any) => void
}> = ({ assembly, accession, coordinates, handleOpencCRE }) => {

  const { loading: loadingHuman, data: dataHuman } = useQuery(
    NEARBY_GENOMIC_FEATURES_QUERY,
    {
      variables:
      {
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
      skip: assembly !== "GRCh38",
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      client,
    }
  )

  const { loading: loadingMouse, data: dataMouse } = useQuery(
    NEARBY_GENOMIC_FEATURES_NOSNPS_QUERY,
    {
      variables: {
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
      },
      skip: assembly !== "mm10",
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
      client,
    }
  )

  const data = (assembly === "GRCh38") ? dataHuman : dataMouse
  const loading = (assembly === "GRCh38") ? loadingHuman : loadingMouse

  const genes =
    data &&
    data.gene &&
    data.gene.map((g) => {
      return {
        name: g.name,
        ensemblid_ver: g.id,
        chrom: g.coordinates.chromosome,
        start: g.coordinates.start,
        stop: g.coordinates.end,
        distance: calcDistToTSS({...coordinates, chrom: coordinates.chromosome}, g.transcripts, g.strand as "+" | "-")
      }
    })
  const ccres =
    data &&
    data.cCREQuery &&
    data.cCREQuery.map((c) => {
      return {
        name: c.accession,
        distance: calcDistRegionToRegion({start: c.coordinates.start, end: c.coordinates.end}, {start: coordinates.start, end: coordinates.end}),
        chromosome: c.coordinates.chromosome,
        start: c.coordinates.start,
        end: c.coordinates.end,
        class: c.group
      }
    })

  let snps: SNP[] | undefined;

  if (assembly === "GRCh38" && data && (data as NearbyGenomicFeaturesQuery).snpQuery) {
    snps = (data as NearbyGenomicFeaturesQuery).snpQuery.map((s) => {
      return {
        assembly,
        accession: accession,
        chrom: coordinates.chromosome,
        cre_start: coordinates.start,
        cre_end: coordinates.end,
        distance: calcDistRegionToPosition(coordinates.start, coordinates.end, "closest", s.coordinates.start),
        name: s.id,
        snp_start: s.coordinates.start,
        snp_end: s.coordinates.end,
      };
    });
  }

  return (<>
    {loading || !data ? (
      <LoadingMessage />
    ) : (
      <>
        <Grid container spacing={5}>
          <Grid
            size={
              assembly === "GRCh38" ? {
                xs: 12,
                md: 6,
                xl: 4
              } : {
                xs: 12,
                md: 6,
              }
            }
          >
            {
              <DataTable
                columns={[
                  {
                    header: "Symbol",
                    value: (row) => row.name,
                    render: (row) =>
                      <GeneLink assembly={assembly} geneName={row.name} />
                  },
                  {
                    header: "Distance to Nearest TSS (in bp)",
                    value: (row) => row.distance,
                    render: (row) => row.distance.toLocaleString("en-US"),
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
          </Grid>
          <Grid
            size={
              assembly === "GRCh38" ? {
                xs: 12,
                md: 6,
                xl: 4
              } : {
                xs: 12,
                md: 6,
              }
            }
          >
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
                  handleOpencCRE(row)
                }}
                sortColumn={1}
                tableTitle="Nearby cCREs"
                rows={ccres.filter(c => c.distance != 0) || []}
                itemsPerPage={10}
                searchable
                sortDescending={true}
              />
            }
          </Grid>
          {assembly === "GRCh38" && 
          <Grid
            size={{
              xs: 12,
              md: 6,
              xl: 4
            }}>
            {
              <DataTable
                columns={[
                  {
                    header: "SNP ID",
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
                tableTitle="Nearby SNPs"
                rows={snps || []}
                itemsPerPage={10}
                searchable
                sortDescending={true}
              />
            }
          </Grid>}
        </Grid>
      </>
    )}
  </>);
}
