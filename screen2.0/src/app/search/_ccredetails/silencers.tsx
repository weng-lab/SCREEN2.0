import { useQuery } from "@apollo/client"
import React from "react"
import { DataTable } from "psychscreen-legacy-components"
import Grid from "@mui/material/Grid2"
import { client } from "./client"
import { CircularProgress } from "@mui/material"
import { CreateLink } from "../../../common/lib/utility"
import { gql } from "../../../graphql/__generated__/gql"
import { Description } from "@mui/icons-material"
import { Silencer_Studies } from "./const"

const Silencers_Query = gql(`
query silencersQuery($accession: [String]!){
  silencersQuery(accession: $accession){
   silencer_studies
  }
}
`)

export const Silencers = (props: { accession }) => {
    const { data, loading } = useQuery(Silencers_Query, {
        variables: { accession: props.accession },
        fetchPolicy: "cache-and-network",
        nextFetchPolicy: "cache-first",
        client,
    })


    return (
        <Grid container spacing={1} sx={{ mt: "1rem", mb: "1rem" }}>
            {loading && <CircularProgress />}
            {data && !loading &&
                <Grid
                    size={{
                        xs: 12,
                        lg: 12
                    }}>
                    <DataTable
                        tableTitle={`Silencers`}
                        columns={[
                            {
                                header: "Study",
                                value: (row) => Silencer_Studies.find(s=>s.value==row.study).study,
                            },
                            {
                                header: "PMID",
                                value: (row) => Silencer_Studies.find(s=>s.value==row.study).pubmed_id,
                                render: (row) => <CreateLink linkPrefix={Silencer_Studies.find(s=>s.value==row.study).pubmed_link} label={Silencer_Studies.find(s=>s.value==row.study).pubmed_id} showExternalIcon underline="hover" />,
                            },
                            {
                                header: "Method",
                                value: (row) => Silencer_Studies.find(s=>s.value==row.study).method,
                            }
                        ]}
                        rows={data?.silencersQuery.flatMap(item =>
                            item.silencer_studies.map(study => ({                              
                              study: study,
                            }))
                          ) || []}                        
                        searchable                        
                        itemsPerPage={10}
                    />
                </Grid>}
            
        </Grid>
    );
}