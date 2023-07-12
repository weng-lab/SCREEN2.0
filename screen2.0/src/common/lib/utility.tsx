import React, { ReactElement } from "react"
import { ApolloClient, gql, InMemoryCache } from "@apollo/client"
import { Link, Alert, AlertTitle, CircularProgress, Typography, Popover, Popper } from "@mui/material"
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
    <Link href={link} rel="noopener noreferrer" target="_blank" >
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
  return (
      <Grid2 container alignItems="center" justifyContent="center" direction="column" sx={{ minHeight: '90vh' }}>
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
export function ErrorMessage(error: Error) {
  let open: boolean = true

  // debugging
  // console.log("Error!")
  console.log(error.message)
  // throw error
  
  function toggleOpen(toggle: boolean) {
    if (toggle === true) open = false
    else open = true
  }

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === "clickaway") {
      return
    }
    open = false
  }

  return (
    <Grid2 container alignItems="center" justifyContent="center" direction="column" sx={{ minHeight: '90vh' }}>
      {/* <Popover
      id="errorpopper"
      open={open}
      anchorOrigin={{
        vertical: "center",
        horizontal: "center"
      }}
    > */}
        <Alert severity="error" variant="filled">
          <AlertTitle>Error</AlertTitle>
          There was an error loading. — <strong>{error.message}</strong>
        </Alert>
      {/* </Popover> */}
    </Grid2>
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
