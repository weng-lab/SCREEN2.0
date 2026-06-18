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
import Config from "../../config.json";

setVerbosity("debug");

function makeClient() {
  if (typeof window === "undefined") {
    return new ApolloClient({
      // SSR: hit the backend directly to avoid the /api/graphql proxy hop,
      // attaching the API key which is only available server-side.
      cache: new InMemoryCache(),
      link: ApolloLink.from([
        new SSRMultipartLink({ stripDefer: true }),
        new HttpLink({
          uri: Config.API.CcreAPI,
          headers: { Authorization: "Bearer " + process.env.SCREEN_API_KEY! },
        }),
      ]),
    });
  }

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({ uri: "/api/graphql" }),
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

