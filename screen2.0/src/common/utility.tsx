import React, { ReactElement } from "react"
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client"
import { Link, Alert, AlertTitle, CircularProgress } from "@mui/material"

/**
 * Uses fetch to make a query call (server side)
 * @param {string} url 
 * @param {string} jq json of variables to use when fetching
 * @returns data
 */
export async function fetchServer<T>(url: string, jq: BodyInit) {
    return await fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: jq
  })
  .then(response => {
      if (!response.ok) {
          // throw new Error(response.statusText)
          return ErrorMessage(Error(response.statusText))
      }
      return response.json()
  })
  .then(data => {
      return data
  })
  .catch((error: Error) => {
      // logging
      // throw error
      return ErrorMessage(error)
  })
}

/**
 * Creates a hyperlink to the url + id with the id as the button
 * @param url 
 * @param id string to be pasted at the end of the url
 * @returns link anchor to url + id
 */
export const createLink = (url: string, id: string) => {
  const link = url + id
  return <Link href={link}><button>{id}</button></Link>
}

/**
 * Logs and returns loading message
 * @returns active loader
 */
export function LoadingMessage() {
  console.log("Loading...")
  // return <CircularProgress />
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      {  
        <CircularProgress />
      }
    </div>
  )
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

// /**
//  * Uses fetch to make a query call (client side)
//  * @param {string} url 
//  * @param {string} jq json of variables to use when fetching
//  * @returns data
//  */
// export async function useFetch<T>(url: string, jq: BodyInit) {
//   const [data, setData] = useState(jq)
//   useEffect(() => {
//     fetch(url, {
//       headers: {
//         Accept: "application/json",
//         "Content-Type": "application/json",
//       },
//       method: "POST",
//       body: jq
//     })
//     .then(response => {
//         if (!response.ok) {
//             throw new Error(response.statusText)
//         }
//         return response.json()
//     })
//     .then(data => {
//         setData(data)
//         // return data
//     })
//     .catch((error: Error) => {
//         // logging
//         return ErrorMessage(error)
//     })
//   }, [ jq ])

//   return data
// }