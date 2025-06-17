import { useQuery } from "@apollo/client"
import React from "react"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import Grid from "@mui/material/Grid2"
import { client } from "./client"
import { CircularProgress } from "@mui/material"
import { CreateLink } from "../../../common/lib/utility"
import { gql } from "../../../graphql/__generated__/gql"

const Silencers_Query = gql(`
query silencersQuery($accession: [String]!){
  silencersQuery(accession: $accession){
   silencer_studies
  }
}
`)

export const Silencer_Study_Names: Map<string, string> = new Map([
  ["Cai-Fullwood-2021.Silencer-cCREs", "Cai Fullwood (2021)"],
  ["Jayavelu-Hawkins-2020.Silencer-cCREs", "Jayavelu Hawkins (2020)"],
  ["Huan-Ovcharenko-2019.Silencer-cCREs", "Huan Ovcharenko (2019)"],
  ["Pang-Snyder-2020.Silencer-cCREs", "Pang Snyder (2020)"],
  ["REST-Enhancers", "REST Enhancers"],
  ["REST-Silencers","REST Silencers"],
  ["STARR-Silencers.Robust","STARR Silencers (Robust)"],
  ["STARR-Silencers.Stringent","STARR Silencers (Stringent)"]
])


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
                                value: (row) => Silencer_Study_Names.get(row.study),
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