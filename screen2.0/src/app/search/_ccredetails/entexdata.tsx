import { gql, useQuery } from "@apollo/client"
import React from "react"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { client } from "./client"
import { Typography, CircularProgress } from "@mui/material"
import { createLink } from "../../../common/lib/utility"
const ENTEx_QUERY = gql`
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
`
export const ENTExData = (props: { accession }) =>{
    const { data, loading } = useQuery(ENTEx_QUERY, {
        variables: { accession: props.accession },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        client,
      })

    return(
    <Grid2 container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
        {loading && <CircularProgress />}
        {data && !loading && data.entexQuery.length>0  &&
            <Grid2 xs={12} lg={12}>
            <DataTable
            tableTitle={`ENTEx`}
            columns={[
                {
                    header: "Tissue",
                    HeaderRender: () => <b>Tissue</b>,
                    value: (row) => row.tissue.replace("_"," "),
                },
                {
                    header: "Assay",
                    HeaderRender: () => <b>Assay</b>,
                    value: (row) => row.assay.replace("_"," "),
                },
                {
                    header: "Donor",
                    HeaderRender: () => <b>Donor</b>,
                    value: (row) => row.donor,
                },
                {
                    header: "Hap 1 Count",
                    HeaderRender: () => <b>Hap 1 Count</b>,
                    value: (row) => row.hap1_count                
                },
                {
                    header: "Hap 2 Count",
                    HeaderRender: () => <b>Hap 2 Count</b>,
                    value: (row) => row.hap2_count                
                },
                {
                    header: "Hap 1 Allele Ratio",
                    HeaderRender: () => <b>Hap 1 Allele Ratio</b>,
                    value: (row) => row.hap1_allele_ratio.toFixed(2),
                },
                {
                    header: "Experiment Accession",
                    HeaderRender: () => <b>Experiment Accession</b>,
                    value: (row) =>  createLink("https://www.encodeproject.org/experiments/", row.experiment_accession, row.experiment_accession, true),
                },
                {
                    header: "p beta binom",
                    HeaderRender: () => <b><i>p</i> Beta Binom</b>,
                    value: (row) => row.p_betabinom.toFixed(2),
                },
                {
                    header: "Imbalance Significance",
                    HeaderRender: () => <b>Imbalance Significance</b>,
                    value: (row) => row.imbalance_significance,
                }
            ]}
            rows={data.entexQuery || []}
            sortColumn={5}
            searchable
            sortDescending
            itemsPerPage={10}
            />
        </Grid2> }
        { !loading && data && data.entexQuery.length==0 && <Grid2 xs={12} lg={12}><Typography>No data available</Typography></Grid2> }
    </Grid2>)
}