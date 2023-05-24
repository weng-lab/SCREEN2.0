import React, { useState, useEffect } from "react"
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client"


// import HelpIcon from "./components/help_icon"

// import loading from "./components/loading"
// import { Message } from "semantic-ui-react"

export function useGetDownloadFileUrl(primaryurl: string, secondaryurl: string) {
  const [url, setUrl] = useState(primaryurl)
  useEffect(() => {
    fetch(primaryurl, { method: "HEAD" })
      .then((res) => {
        if (res.status !== 200) {
          setUrl(secondaryurl)
        }
      })
      .catch((e) => {
        setUrl(secondaryurl)
      })
  }, [primaryurl, secondaryurl])
  return url
}

/**
 * Logs and returns loading message
 * @returns active loader
 */
export const LoadingMessage = () => {
  console.log("Loading...")
  // return loading({ isFetching: true, isError: false })
}

/**
 * Logs and returns error message
 * @param {ApolloError} error
 * @returns error message
 */
export const ErrorMessage = (error: any) => {
  console.log("Error!")
  console.log(error.message)
  // return (
  //   <Message negative>
  //     <Message.Header>Error!</Message.Header>
  //     <p>There was an error loading this page, try reloading.</p>
  //   </Message>
  // )
}