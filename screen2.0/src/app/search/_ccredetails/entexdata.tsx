import { gql, useQuery } from "@apollo/client"
import React from "react"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import Grid from "@mui/material/Grid2"
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

const ENTEx_Active_Annotations_QUERY = gql`
query entexActiveAnnotationsQuery( $coordinates: GenomicRangeInput! ) {
    entexActiveAnnotationsQuery(coordinates: $coordinates) {
        tissue
        assay_score
    }

}`
export const ENTExData = (props: { accession, coordinates }) =>{
    console.log(props.coordinates)
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
        (<Grid container spacing={3} sx={{ mt: "1rem", mb: "1rem" }}>
            {loading && <CircularProgress />}
            {data && !loading && data.entexQuery.length>0  &&
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
                        HeaderRender: () => <b>Tissue</b>,
                        value: (row) => row.tissue.split("_").map(s=>s[0].toUpperCase()+s.slice(1)).join(" "),
                    },
                    {
                        header: "Assay",
                        HeaderRender: () => <b>Assay</b>,
                        value: (row) => row.assay.replaceAll("_"," "),
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
            </Grid> }
            { !loading && data && data.entexQuery.length==0 && <Grid
                size={{
                    xs: 12,
                    lg: 12
                }}><Typography>No data available</Typography></Grid> }
            {entexActiveAnno && !entexActiveAnnoLoading && entexActiveAnno.entexActiveAnnotationsQuery.length>0 && 
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
                    HeaderRender: () => <b>Tissue</b>,
                    value: (row) => row.tissue.split("_").map(s=>s[0].toUpperCase()+s.slice(1)).join(" "),
                },
                {
                    header: "Supporting Assays",
                    HeaderRender: () => <b>Supporting Assays</b>,
                    value: (row) => row.assay_score.split("|").map(s=>s.split(":")[0]).join(",")
                }
            ]}
            rows={entexActiveAnno.entexActiveAnnotationsQuery || []}
            sortColumn={0}
            searchable
            sortDescending
            itemsPerPage={10}
            />
        </Grid> 

            }
        </Grid>)
    );
}