import React from "react"
import { Link, Alert, AlertTitle, CircularProgress, Typography, Popover, Popper } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Snackbar, Box } from "@mui/material"

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
        return <ErrorMessage error={Error(response.statusText)} />
      }
      return response.json()
    })
    .then((data) => {
      return data
    })
    .catch((error: Error) => {
      // logging
      // throw error
      return <ErrorMessage error={error} />
    })
}

/**
 * Creates a hyperlink to the url + id with the id as the button
 * @param url
 * @param id string to be pasted at the end of the url
 * @returns link anchor to url + id
 */
export const createLink = (url: string, id: string, label?: string) => {
  const link = url + id
  return (
    <Link href={link} rel="noopener noreferrer" target="_blank">
      {label ? <button>{label}</button> : <button>{id}</button>}
      {/* <button>{id}</button> */}
    </Link>
  )
}

/**
 * Logs and returns loading message
 * @returns active loader
 */
export function LoadingMessage() {
  return (
    <Grid2 container alignItems="center" justifyContent="center" direction="column" sx={{ minHeight: "90vh" }}>
      <Box>
        <CircularProgress />
      </Box>
      <Box mt={1} ml={1}>
        <Typography>Loading...</Typography>
      </Box>
    </Grid2>
  )
}

/**
 * Logs and returns error message
 * @param {Error} error
 * @returns error message
 */
export function ErrorMessage(props: { error: Error }) {
  console.log(props.error)
  // throw error

  return (
    <Grid2 container alignItems="center" justifyContent="center" direction="column" sx={{ minHeight: "90vh" }}>
      <Snackbar
        id="errorpopper"
        open={true}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
      >
        <Alert severity="error" variant="filled">
          <AlertTitle>Error</AlertTitle>
          There was an error loading
        </Alert>
      </Snackbar>
    </Grid2>
  )
}
