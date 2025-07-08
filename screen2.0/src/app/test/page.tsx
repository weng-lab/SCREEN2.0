"use client";

import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import BrowserView from "./BrowserView";

const client = new ApolloClient({
  uri: "https://ga.staging.wenglab.org/graphql",
  cache: new InMemoryCache(),
  connectToDevTools: true,
});

export default function TestPage() {
  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center" }}
    >
      <ApolloProvider client={client}>
        <div style={{ width: "90%" }}>
          <BrowserView
            assembly="GRCh38"
            biosample={null}
            gene={null}
            coordinates={{
              chromosome: "chr12",
              start: 53360176,
              end: 53436446,
            }}
            cCREClick={() => {}}
          />
        </div>
      </ApolloProvider>
    </div>
  );
}
