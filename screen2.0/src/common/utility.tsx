import React, { useState, useEffect, ReactElement } from "react"
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client"
import { Alert, AlertTitle } from "@mui/material"


/**
 * Uses fetch to make a query call
 * @param {string} url 
 * @param {string} jq json of variables to use when fetching
 * @returns data
 */
export async function useFetch<T>(url: string, jq: BodyInit) {
  const [data, setData] = useState(jq)
  useEffect(() => {
    fetch(url, {
      method: "POST",
      body: jq
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(response.statusText)
        }
        return response.json()
    })
    .then(data => {
        setData(data)
        // return data
    })
    .catch((error: Error) => {
        // logging
        return ErrorMessage(error)
    })
  }, [ jq ])
  // return fetch(url, {
  //     method: "POST",
  //     body: jq
  // })
  // .then(response => {
  //     if (!response.ok) {
  //         throw new Error(response.statusText)
  //     }
  //     return response.json()
  // })
  // .then(data => {
  //     return data
  // })
  // .catch((error: Error) => {
  //     // logging
  //     throw error
  // })

  return data
}

/**
 * Logs and returns loading message
 * @returns active loader
 */
export function LoadingMessage() {
  console.log("Loading...")
  // return loading({ isFetching: true, isError: false })
}

/**
 * Logs and returns error message
 * @param {Error} error
 * @returns error message
 */
export function ErrorMessage(error: Error) {
  console.log("Error!")
  console.log(error.message)
  // throw error
  return (
    <Alert severity="error">
      <AlertTitle>Error</AlertTitle>
      There was an error loading this page, try reloading. — <strong>{error.message}</strong>
    </Alert>
  )
}