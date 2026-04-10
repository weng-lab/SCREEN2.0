"use client";
// ^ this file needs the "use client" pragma
import React from "react";
import { ApolloLink, HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  InMemoryCache,
  ApolloClient,
  SSRMultipartLink,
} from "@apollo/experimental-nextjs-app-support";

import { setVerbosity } from "ts-invariant";
setVerbosity("debug");

function makeClient() {
  const httpLink = new HttpLink({
    uri: "/api/graphql",
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link:
      typeof window === "undefined"
        ? ApolloLink.from([
          // in a SSR environment, if you use multipart features like
          // @defer, you need to decide how to handle these.
          // This strips all interfaces with a `@defer` directive from your queries.
          new SSRMultipartLink({
            stripDefer: true,
          }),
          httpLink,
        ])
        : httpLink,
    devtools: {
      enabled: true,
    },
  });
}

// you need to create a component to wrap your app in
export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}

