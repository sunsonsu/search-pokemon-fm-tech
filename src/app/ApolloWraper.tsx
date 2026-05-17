"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

function makeCache() {
  return new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          pokemon: {
            keyArgs: ["name"], 
          },
        },
      },
      Pokemon: {
        keyFields: ["id"], 
      },
    },
  });
}

function makeClient() {
  const httpLink = new HttpLink({
    uri: "https://graphql-pokemon2.vercel.app/",
    fetchOptions: {},
  });

  return new ApolloClient({
    cache: makeCache(),
    link: httpLink,
    defaultOptions: {
      watchQuery: {

        fetchPolicy: "cache-and-network",

        nextFetchPolicy: "cache-first",
      },
      query: {
        fetchPolicy: "cache-first",
      },
    },
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}