import React, { useState, useEffect } from "react"
import { Autocomplete, TextField, Typography } from "@mui/material"
import GraphHelper from "./graphhelper"

async function fetchList(accession: string): Promise<string[]> {
  const query = `
    query getcCRENodeCelltypes($accession: String!){
      getcCRENodeCelltypes(accession:$accession)
    }
  `

  const variables = {
    accession,
  }

  const response = await fetch("https://factorbook.api.wenglab.org/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  })

  const result = await response.json()
  return result.data.getcCRENodeCelltypes
}

export const GraphComponent = ({ accession, handleOpencCRE }) => {
  const [cellType, setCellType] = useState<string | null>(null)
  const [cellTypes, setCellTypes] = useState<string[]>([])
  const [degreeOfSeparation, setDegree] = useState<number>(1)

  useEffect(() => {
    try {
      fetchList(accession).then((list) => setCellTypes(list))
    } catch {
      setCellTypes([])
    }
  }, [accession])

  return (
    <div style={{ margin: "10px" }}>
      <Autocomplete
        options={cellTypes}
        value={cellType}
        onChange={(_, newValue) => setCellType(newValue)}
        renderInput={(params) => <TextField {...params} label="Select Cell Type" />}
        style={{ marginBottom: "20px" }}
        disabled={!accession}
      />

      <div
        style={{
          top: "55px",
          left: "15px",
          display: "flex",
          marginLeft: "5px",
          alignItems: "center",
        }}
      >
        <Typography
          variant="h1"
          style={{
            marginTop: "5px",
            fontSize: "15px",
            marginBottom: "10px",
          }}
        >
          Degrees of Separation:
        </Typography>
        <input
          id="degree"
          type="number"
          value={degreeOfSeparation}
          min={1}
          max={3}
          onChange={(e) => setDegree(parseInt(e.target.value))}
          style={{
            marginLeft: "5px",
            marginBottom: "5px",
            fontFamily: "Roboto",
          }}
        />
      </div>

      {cellType && (
        <GraphHelper
          accession={accession}
          celltype={cellType}
          degreeOfSeparation={degreeOfSeparation}
          id={Math.random()}
          handleOpencCRE={handleOpencCRE}
        />
      )}
    </div>
  )
}

export default GraphComponent
