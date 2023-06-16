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
    body: jq,
  })
    .then((response) => {
      if (!response.ok) {
        // throw new Error(response.statusText)
        return ErrorMessage(Error(response.statusText))
      }
      return response.json()
    })
    .then((data) => {
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
  return (
    <Link href={link}>
      <button>{id}</button>
    </Link>
  )
}

/**
 * Logs and returns loading message
 * @returns active loader
 */
export function LoadingMessage() {
  // console.log("Loading...")
  // return <CircularProgress />
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {<CircularProgress />}
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

export const z_score = (d: any) => (d === -11.0 || d === "--" || d === undefined ? "--" : d.toFixed(2))

export const ctgroup = (group: string) => {
  group = group.split(",")[0]
  if (group === "CA-CTCF")
    return (
      <span style={{ color: "#00B0F0" }}>
        <strong>chromatin accessible with ctcf</strong>
      </span>
    )
  if (group === "CA-TF")
    return (
      <span style={{ color: "#be28e5" }}>
        <strong>chromatin accessible with tf</strong>
      </span>
    )
  if (group === "CA-H3K4me3")
    return (
      <span style={{ color: "#ffaaaa" }}>
        <strong>chromatin accessible with H3K4me3</strong>
      </span>
    )
  if (group === "TF")
    return (
      <span style={{ color: "#d876ec" }}>
        <strong>tf only</strong>
      </span>
    )
  if (group === "CA")
    return (
      <span style={{ color: "#06DA93" }}>
        <strong>chromatin accessible only</strong>
      </span>
    )
  if (group === "pELS")
    return (
      <span style={{ color: "#ffcd00" }}>
        <strong>proximal enhancer-like signature</strong>
      </span>
    )
  if (group === "dELS")
    return (
      <span style={{ color: "#ffcd00" }}>
        <strong>distal enhancer-like signature</strong>
      </span>
    )
  if (group === "PLS")
    return (
      <span style={{ color: "#ff0000" }}>
        <strong>promoter-like signature</strong>
      </span>
    )
  if (group === "DNase-H3K4me3")
    return (
      <span style={{ color: "#ffaaaa" }}>
        <strong>DNase-H3K4me3</strong>
      </span>
    )
  if (group === "ctcf")
    return (
      <span style={{ color: "#00b0f0" }}>
        <strong>CTCF bound</strong>
      </span>
    )
  if (group === "ylowdnase")
    return (
      <span style={{ color: "#8c8c8c" }}>
        <strong>low DNase</strong>
      </span>
    )
  if (group === "zunclassified")
    return (
      <span style={{ color: "#8c8c8c" }}>
        <strong>zunclassified</strong>
      </span>
    )
  return (
    <span style={{ color: "#06da93" }}>
      <strong>DNase only</strong>
    </span>
  )
}

