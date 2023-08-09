import { ApolloClient, InMemoryCache } from "@apollo/client"
export const client = new ApolloClient({
  uri: "https://factorbook.api.wenglab.org/graphql",
  cache: new InMemoryCache(),
})
