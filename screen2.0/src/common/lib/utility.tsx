import React, { ReactElement, useState } from "react"
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client"
import { Link, Alert, AlertTitle, CircularProgress, Typography } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Snackbar, Stack, Box } from "@mui/material"

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
        <Grid2 container spacing={3} sx={{ mt: "1rem", mb: "2rem" }}>
          <Grid2 xs={12} lg={12}>
            <Box mt={2}>
              <CircularProgress />
              <Typography>Loading...</Typography>
            </Box>
          </Grid2>
        </Grid2>
    </div>
  )
}

/**
 * Logs and returns error message
 * @param {Error} error
 * @returns error message
 */
export function ErrorMessage(error: Error) {
  let open: boolean = true
  console.log("Error!")
  console.log(error.message)
  // throw error

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return
    }
    open = false
  }

  return (
    <Snackbar open={true} autoHideDuration={120} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        There was an error loading. — <strong>{error.message}</strong>
      </Alert>
    </Snackbar>
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
