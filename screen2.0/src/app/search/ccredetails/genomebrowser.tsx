import React, { useEffect } from "react"
import { Button } from "@mui/base"
import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, Paper } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { ErrorMessage, createLink } from "../../../common/lib/utility"
import { useState } from "react"
import { cellTypeInfoArr } from "../../applets/differential-gene-expression/types"

export const ConfigureGenomeBrowser = (props: {assembly: string}) => {
    const [loading, setLoading] = useState<boolean>(true)
    const [cellTypes, setCellTypes] = useState<cellTypeInfoArr>()
    const [checked, setChecked] = useState<{[id: string]: boolean}>(null)

    // fetch list of cell types
  useEffect(() => {
    fetch("https://storage.googleapis.com/gcp.wenglab.org/newV4/" + props.assembly + ".json")
      .then((response) => {
        if (!response.ok) {
          // throw new Error(response.statusText)
          return <ErrorMessage error={new Error(response.statusText)} />
        }
        return response.json()
      })
      .then((data) => {
        setCellTypes(data)
        setLoading(false)
      })
      .catch((error: Error) => {
        // logging
        // throw error
        return <ErrorMessage error={error} />
      })
    setLoading(true)
  }, [])

    const UCSCButton = () => {
        return (
            <Button>
                Open in UCSC
            </Button>
        )
    }

    const UCSCCheck = (biosample: string) => {
        return (
            <FormGroup>
                <FormControlLabel
                    key={biosample}
                    label={biosample}
                    control={<Checkbox checked={checked ? checked[biosample] : false} 
                    onClick={() => {
                      let x: {[id: string]: boolean} = {}
                      Object.entries(checked).map((entries) => {
                        x[entries[0]] = entries[1]
                      })
                      x[biosample] = x[biosample] ? false : true
                    }} 
                  />}
                ></FormControlLabel>
            </FormGroup>
        )
    }

    return (
      <Box>
        <Paper>
            <Grid2 container spacing={3}>
                <Grid2 xs={12}>
            {cellTypes && cellTypes["cellTypeInfoArr"] && (
            <DataTable
                    //   highlighted={rowHighlight ? rowHighlight[1] : false}
                      page={0}
                      rows={cellTypes["cellTypeInfoArr"]}
                      columns={[
                        { header: "Check", value: (row: any) => row.biosample_summary, render: (row: any) => UCSCCheck(row.biosample_summary)}
                        { header: "Cell Type", value: (row: any) => row.biosample_summary },
                        { header: "Experiment", value: (row: any) => row.expID, render: (row: any) => createLink("https://encodeproject.org/experiments/", row.expID)},
                        { header: "Tissue", value: (row: any) => row.tissue },
                        { header: "RNA-seq", value: (row: any) => row.rnaseq }
                      ]}
                      onRowClick={(row: any) => {
                        // if (rowHighlight) setRowHighlight([rowHighlight[0], row])
                        // else setRowHighlight([row])
                      }}
                      sortDescending={true} 
                      searchable={true}
                    />
                )}
                </Grid2>
            </Grid2>
        </Paper>
      </Box>
        
    )
}