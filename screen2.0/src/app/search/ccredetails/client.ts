import { ApolloClient, InMemoryCache, useQuery } from "@apollo/client"
export const client = new ApolloClient({
  uri: "https://factorbook.api.wenglab.org/graphql",
  cache: new InMemoryCache(),
})
