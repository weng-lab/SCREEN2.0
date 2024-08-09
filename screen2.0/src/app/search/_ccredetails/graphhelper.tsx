import React, { useState, useEffect } from "react"
import { Graph } from "@weng-lab/psychscreen-ui-components"

interface FetchedData {
  ccrelinks: NewEdge[]
  ccrenodegroups: NewNode[]
}

export interface Edge {
  from: string
  to: string
  effectSize: number
  category?: string
  id: number
}

export interface Node {
  id: string
  category: string
  color?: string
  info?: {
    [key: string]: any
  }
}

type NewEdge = {
  source: string
  destination: string
  distance: number
  path: string
  weights: string
}

type NewNode = {
  accession: string
  ccre_group: string
}

type OldFormat = {
  data: {
    edge: Edge[]
    node: Node[]
    centered: { id: string }
  }
}

function setColor(node: Node | Edge): string {
  if (node.category !== undefined) {
    switch (node.category) {
      case "PLS":
        return "#FF0000"
      case "dELS":
        return "#FFCD00"
      case "pELS":
        return "#FFA700"
      case "CA-CTCF":
        return "#00B0F0"
      case "CA-H3K4me3":
        return "#ffaaaa"
      case "CA-TF":
        return "#be28e5"
      case "CA-only":
        return "#06DA93"
      case "Low-DNase":
        return "#e1e1e1"
      case "RNAPII-ChIAPET":
        return "#890000"
      case "CTCF-ChIAPET":
        return "#002389"
      case "lower-expression":
        return "black"
      case "higher-expression":
        return "blue"
      default:
        return "grey"
    }
  }
  return "grey"
}

function convertToSimple(node: Node | Edge): string {
  if (node.category) {
    switch (node.category) {
      case "PLS":
        return "Promoter"
      case "dELS":
        return "Distal Enhancer"
      case "pELS":
        return "Proximal Enhancer"
      case "CA-CTCF":
        return "Chromatin Accessible + CTCF"
      case "CA-H3K4me3":
        return "Chromatin Accessible + H3K4me3"
      case "CA-TF":
        return "Chromatin Accessible + Transcription Factor"
      case "Low-DNase":
        return "Low DNase"
      case "CA-only":
        return "Chromatin Accessible"
      case "RNAPII-ChIAPET":
        return "RNAPII ChIAPET"
      case "CTCF-ChIAPET":
        return "CTCF ChIAPET"
      case "lower-expression":
        return "Lower-Expression"
      case "higher-expression":
        return "Higher-Expression"
      default:
        return node.category
    }
  }
  return "Edge"
}

const convertData = (newEdges: NewEdge[], newNodes: NewNode[], cCRE: string, id: number): OldFormat => {
  const nodes: { [key: string]: { id: string; category: string } } = {}
  const edges: Edge[] = []
  const edgeMap = new Map<string, Edge>()

  function findGroup(str: string): string {
    const node = newNodes.find((node) => node.accession === str)
    return node ? node.ccre_group : ""
  }

  newEdges.forEach((entry) => {
    const { path, weights } = entry
    const pathNodes = path.split("->").filter(Boolean)
    const scaleValues = weights.split("->").filter(Boolean).map(parseFloat)

    for (let i = 0; i < pathNodes.length - 1; i++) {
      const from = pathNodes[i]
      const to = pathNodes[i + 1]
      const effectSize = scaleValues[i]

      if (!nodes[from]) {
        nodes[from] = {
          id: from,
          category: findGroup(from),
        }
      }

      if (!nodes[to]) {
        nodes[to] = {
          id: to,
          category: findGroup(to),
        }
      }

      const edgeKey = `${from}-${to}-${effectSize}`

      if (!edgeMap.has(edgeKey)) {
        const edge = {
          from,
          to,
          effectSize,
          id,
        }
        edgeMap.set(edgeKey, edge)
        id++
      }

      edges.push(edgeMap.get(edgeKey)!)
    }
  })

  const uniqueEdges = Array.from(new Set(edges.map((a) => a.id)))
    .map((id) => edges.find((a) => a.id === id))
    .filter((edge): edge is Edge => edge !== undefined)

  return {
    data: {
      edge: uniqueEdges,
      node: Object.values(nodes),
      centered: { id: cCRE },
    },
  }
}

async function fetchDataRNA(accession: string, celltype: string, degreeOfSeparation: number): Promise<FetchedData> {
  const query = `
  query getlinksforccre($accession: String!,$celltype: String!, $degree_of_separation: Int!){
    getcCRELinksQuery(accession:$accession,
      celltype:$celltype,
      degree_of_separation:  $degree_of_separation) {
      ccrelinks
      {
        source
        destination
        distance
        path
        weights
        
      }
      ccrenodegroups {
        accession
        ccre_group
      }
    }
  }
  `

  const variables = {
    accession,
    celltype,
    degree_of_separation: degreeOfSeparation,
  }

  const response = await fetch("https://factorbook.api.wenglab.org/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })

  const result = await response.json()
  return result.data.getcCRELinksQuery
}

async function fetchDataCTCF(accession: string, celltype: string, degreeOfSeparation: number, method: string): Promise<FetchedData> {
  const query = `
    query getlinksforccre($accession: String!,$celltype: String!, $degree_of_separation: Int!,$method: String){
        getcCRELinksQuery(accession:$accession,
          celltype:$celltype,
          degree_of_separation:  $degree_of_separation, method: $method) {
          ccrelinks
          {
            source
            destination
            distance
            path
            weights
            
          }
          ccrenodegroups {
            accession
            ccre_group
          }
        }
      }
    `

  const variables = {
    accession,
    celltype,
    degree_of_separation: degreeOfSeparation,
    method,
  }

  const response = await fetch("https://factorbook.api.wenglab.org/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })

  const result = await response.json()
  return result.data.getcCRELinksQuery
}

export const GraphHelper = ({ accession, celltype, degreeOfSeparation, id, handleOpencCRE }) => {
  const [data, setData] = useState<OldFormat | null>(null)

  useEffect(() => {
    async function loadData() {
      try {
        const fetchedDataRNA = await fetchDataRNA(accession, celltype, degreeOfSeparation)
        const fetchedDataCTCF = await fetchDataCTCF(accession, celltype, degreeOfSeparation, "CTCF-ChIAPET")

        const convertedDataRNA = convertData(fetchedDataRNA.ccrelinks, fetchedDataRNA.ccrenodegroups, accession, 1)
        const convertedDataCTCF = convertData(
          fetchedDataCTCF.ccrelinks,
          fetchedDataCTCF.ccrenodegroups,
          accession,
          convertedDataRNA.data.edge.length + 1
        )

        const allEdges = [
          ...convertedDataRNA.data.edge.map((edge) => ({
            ...edge,
            category: "RNAPII-ChIAPET",
          })),
          ...convertedDataCTCF.data.edge.map((edge) => ({
            ...edge,
            category: "CTCF-ChIAPET",
          })),
        ]

        const allNodes = [
          ...convertedDataRNA.data.node,
          ...convertedDataCTCF.data.node.filter((node) => !convertedDataRNA.data.node.some((n) => n.id === node.id)),
        ]

        setData({
          data: {
            edge: allEdges,
            node: allNodes,
            centered: { id: accession },
          },
        })
      } catch (error) {
        console.error("Error loading data:", error)
      }
    }

    loadData()
  }, [accession, celltype, degreeOfSeparation])

  if (!data) {
    return <div>Loading...</div>
  }

  const createScaleFunction = (min: number, max: number) => {
    return (n: number) => {
      const minWidth = 0.5
      const maxWidth = 5
      if (min === max) {
        return minWidth
      }
      return minWidth + ((n - min) / (max - min)) * (maxWidth - minWidth)
    }
  }

  let min = data.data.edge[0].effectSize
  let max = data.data.edge[0].effectSize

  data.data.edge.forEach((e) => {
    if (e.effectSize > max) {
      max = e.effectSize
    } else if (e.effectSize < min) {
      min = e.effectSize
    }
  })

  const scaleFunction = createScaleFunction(min, max)
  return (
    <Graph
      data={data.data}
      id={id}
      scale={(n: number) => scaleFunction(n)}
      legendNodeLabel="cCRE Type"
      legendToggle={convertToSimple}
      getColor={setColor}
      order={["PLS", "pELS", "dELS", "CA-H3K4me3", "CA-CTCF", "CA-TF", "CA-only", "TF", "Low-DNase"]}
      onNodeClick={handleOpencCRE}
      directional={false}
      scaleLabel={"0.5 + ((n - min) / (max - min)) * 4.5"}
    />
  )
}

export default GraphHelper
