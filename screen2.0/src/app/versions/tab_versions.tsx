import React, { useMemo } from "react"
import { ApolloClient, gql, InMemoryCache, useQuery } from "@apollo/client"
import { LoadingMessage, ErrorMessage } from "../../common/utility-temp"
import { DataTable } from "@weng-lab/psychscreen-ui-components"

import { Tabs, Tab } from "react-bootstrap"

/**
 * This file and function queries for versions tab data and returns the rendered display
 * @returns versions tab
 */
function TabDataScreen() {
  const client = useMemo(
    () =>
      new ApolloClient({
        uri: "https://ga.staging.wenglab.org/graphql",
        cache: new InMemoryCache(),
      }),
    []
  )

  const { loading, error, data } = useQuery(
    gql`
      query {
        groundLevelVersionsQuery {
          version
          biosample
          assay
          accession
        }
      }
    `,
    { client }
  )

  return loading ? (
    LoadingMessage()
  ) : error ? (
    ErrorMessage(error)
  ) : (
    VersionView(data.groundLevelVersionsQuery)
  )
}

/**
 * links experiment accessions to their encode url and renders the columns
 * @returns columns for Ztable
 */
const CtsTableColumns = [
    {
      header: "Biosample",
      value: (row: any) => row.biosample
    },
    {
      header: "Experiments",
      value: (row: any) => row.experiments
    }
]

/**
 * creates a url from experiment accession and maps them
 * @param {Map} experiments dict of experiments {assay : [ experiments ]}
 * @returns map of assays to a list of encode experiment urls
 */
function dccLinks (experiments: {[assay: string] : string[]}) {
  function dccLink (assay: string, accs: string[]) {
    const url = (acc: string) => "https://www.encodeproject.org/experiments/" + acc
    return (
      <p key={assay}>
        <strong>{assay}</strong>:&nbsp;
        {accs.map((acc, i) => (
          <span key={acc}>
            <a href={url(acc)} target="_blank" rel="noopener noreferrer">
              {acc}
            </a>
            {i < accs.length - 1 && ", "}
          </span>
        ))}
      </p>
    )
  }
  return Object.keys(experiments).map((assay) => dccLink(assay, experiments[assay]))
}

/**
 * Organize and render data from query
 * @param {} data groundLevelVersionsQuery
 * @returns rendered display of versions tab
 */
function VersionView(data: any) {
    let collection: { [version: string] : {[biosample: string] : {[assay: string] : string[]}} } = {} // version collection
    let totals: { [version: string] : number } = {} // total experiments for each version
    let versions: { [version: string] : {biosample: string, experiments: React.JSX.Element[] }[]} = {} // dict of versions to biosample objects
    let versionIDs: string[] = [] // IDs of each version

    // construct collection from query
    for (let x of data) {
      if (collection[x.version] === undefined) {
        versionIDs.push(x.version)
        versions[x.version] = []
        collection[x.version] = { [x.biosample]: { [x.assay]: [x.accession] } }
      } else if (collection[x.version][x.biosample] === undefined)
        collection[x.version][x.biosample] = { [x.assay]: [x.accession] }
      else if (collection[x.version][x.biosample][x.assay] === undefined)
        collection[x.version][x.biosample][x.assay] = [x.accession]
      else collection[x.version][x.biosample][x.assay].push(x.accession)

      // count experiments
      if (totals[x.version] === undefined) totals[x.version] = 1
      else totals[x.version] += 1
    }
    

    // link experiments to their encode url and make a list of objects for Ztable
    Object.keys(collection).forEach((version) => {
      Object.keys(collection[version]).forEach((biosample) => {
        versions[version].push({
          biosample: biosample
            .substring(0, biosample[biosample.length - 1] === "'" ? biosample.length - 1 : biosample.length)
            .replace(/b'/g, "")
            .replace(/b"/g, ""),
          experiments: dccLinks(collection[version][biosample]),
        })
      })
    })
  
    return (
      <main>
        <div>
          <Tabs defaultActiveKey={1} id="tabset">
            {versionIDs.map((id: string, i: number) => (
              <Tab title={id} key={id} eventKey={i}>
                <h3>
                  ENCODE and Roadmap Experiments constituting ground level version {id} ({totals[id].toLocaleString()} total)
                </h3>
                <DataTable 
                  rows={versions[id]} 
                  columns={CtsTableColumns} 
                  itemsPerPage={4}
                  tableTitle="Versions"
                  searchable
                  />
              </Tab>
            ))}
          </Tabs>
        </div>
      </main>
    )
}

function TabVersions() {
  return (TabDataScreen())
}

export default TabVersions