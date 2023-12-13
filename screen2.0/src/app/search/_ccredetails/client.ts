import { ApolloClient, InMemoryCache } from "@apollo/client"
import Config from "../../../config.json"
export const client = new ApolloClient({
  uri: Config.API.CcreAPI,
  cache: new InMemoryCache(),
})
