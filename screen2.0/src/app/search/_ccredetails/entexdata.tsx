import { useQuery } from "@apollo/client"
import React from "react"
import { DataTable } from "psychscreen-legacy-components"
import Grid from "@mui/material/Grid"
import { client } from "./client"
import { CircularProgress } from "@mui/material"
import { CreateLink } from "../../../common/lib/utility"
import { gql } from "../../../graphql/__generated__/gql"

const ENTEx_QUERY = gql(`
query ENTEXQuery($accession: String!){
  entexQuery(accession: $accession){
    assay
    accession
    hap1_count
    hap2_count
    hap1_allele_ratio
    p_betabinom
    experiment_accession
    tissue
    donor    
    imbalance_significance
  }
}
`)

const ENTEx_Active_Annotations_QUERY = gql(`
query entexActiveAnnotationsQuery( $coordinates: GenomicRangeInput! ) {
    entexActiveAnnotationsQuery(coordinates: $coordinates) {
        tissue
        assay_score
    }

}`)

export const ENTExData = (props: { accession, coordinates }) => {
    const { data, loading } = useQuery(ENTEx_QUERY, {
        variables: { accession: props.accession },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        client,
    })

    const { data: entexActiveAnno, loading: entexActiveAnnoLoading } = useQuery(ENTEx_Active_Annotations_QUERY, {
        variables: { coordinates: props.coordinates },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        client,
    })

    return (
        <Grid container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
            {loading && <CircularProgress />}
            {data && !loading &&
                <Grid
                    size={{
                        xs: 12,
                        lg: 12
                    }}>
                    <DataTable
                        tableTitle={`ENTEx`}
                        columns={[
                            {
                                header: "Tissue",
                                value: (row) => row.tissue.split("_").map(s => s[0].toUpperCase() + s.slice(1)).join(" "),
                            },
                            {
                                header: "Assay",
                                value: (row) => row.assay.replaceAll("_", " "),
                            },
                            {
                                header: "Donor",
                                value: (row) => row.donor,
                            },
                            {
                                header: "Hap 1 Count",
                                value: (row) => row.hap1_count
                            },
                            {
                                header: "Hap 2 Count",
                                value: (row) => row.hap2_count
                            },
                            {
                                header: "Hap 1 Allele Ratio",
                                value: (row) => row.hap1_allele_ratio.toFixed(2),
                            },
                            {
                                header: "Experiment Accession",
                                value: (row) => row.experiment_accession,
                                render: (row) => <CreateLink linkPrefix="https://www.encodeproject.org/experiments/" linkArg={row.experiment_accession} label={row.experiment_accession} underline="hover" />
                            },
                            {
                                header: "p beta binom",
                                value: (row) => row.p_betabinom.toFixed(2),
                            },
                            {
                                header: "Imbalance Significance",
                                value: (row) => row.imbalance_significance,
                            }
                        ]}
                        rows={data?.entexQuery || []}
                        sortColumn={5}
                        searchable
                        sortDescending
                        itemsPerPage={10}
                    />
                </Grid>}
            {entexActiveAnnoLoading && <CircularProgress />}
            {entexActiveAnno && !entexActiveAnnoLoading &&
                <Grid
                    size={{
                        xs: 12,
                        lg: 12
                    }}>
                    <DataTable
                        tableTitle={`ENTEx Active Annotations`}
                        columns={[
                            {
                                header: "Tissue",
                                value: (row) => row.tissue.split("_").map(s => s[0].toUpperCase() + s.slice(1)).join(" "),
                            },
                            {
                                header: "Supporting Assays",
                                value: (row) => row.assay_score.split("|").map(s => s.split(":")[0]).join(", ")
                            }
                        ]}
                        rows={entexActiveAnno?.entexActiveAnnotationsQuery || []}
                        sortColumn={0}
                        searchable
                        sortDescending
                        itemsPerPage={[10, 25, 100]}
                    />
                </Grid>
            }
        </Grid>
    );
}