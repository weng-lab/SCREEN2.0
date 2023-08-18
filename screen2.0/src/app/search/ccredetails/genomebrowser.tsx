import React, { useEffect } from "react"
import { Box, Button, Checkbox, FormControlLabel, FormGroup, Paper, Typography } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { ErrorMessage, createLink } from "../../../common/lib/utility"
import { useState } from "react"
import { cellTypeInfoArr } from "../../applets/differential-gene-expression/types"
import CheckIcon from '@mui/icons-material/Check'
import { GenomeBrowserTooltip } from './const'
import { enhancerYellow } from "../../../common/lib/colors"
import { useRouter } from "next/navigation"

export const ConfigureGenomeBrowser = (props: {assembly: string, chromosome: string}) => {
    const router = useRouter
    const [loading, setLoading] = useState<boolean>(true)
    const [cellTypes, setCellTypes] = useState<cellTypeInfoArr>()
    const [checked, setChecked] = useState<{[id: string]: boolean}>({})
    const [range, setRange] = useState<number[]>([0, 100000])

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
    
    // fetch list of cell types
    useEffect(() => {
      fetch("https://storage.googleapis.com/gcp.wenglab.org/newV4/" + props.assembly + ".json", {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          assembly: props.assembly,
          chromosome: props.chromosome,
          end: range[1],
          start: range[0],
        }),
      })
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
    }, [props.assembly, props.chromosome, range])

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
                      if (checked)
                        Object.entries(checked).map((entries) => {
                          if (x[biosample] === entries[1])
                            x[biosample] = x[biosample] ? false : true
                          else x[entries[0]] = entries[1]
                        })
                      // x[biosample] = x[biosample] ? false : true
                      setChecked(x)
                    }} 
                  />}
                ></FormControlLabel>
            </FormGroup>
        )
    }

    const TableView = () => {
      return (
        <DataTable
                    //   highlighted={rowHighlight ? rowHighlight[1] : false}
                      page={0}
                      rows={cellTypes["cellTypeInfoArr"]}
                      columns={[
                        { header: "Check", value: (row: any) => row.biosample_summary, render: (row: any) => UCSCCheck(row.biosample_summary)},
                        { header: "Cell Type", value: (row: any) => row.biosample_summary },
                        { header: "Experiment", value: (row: any) => row.expID, render: (row: any) => createLink("https://encodeproject.org/experiments/", row.expID)},
                        { header: "Tissue", value: (row: any) => row.tissue },
                        { header: "RNA-seq", value: (row: any) => row.rnaseq, render: (row: any) => <CheckIcon /> }
                      ]}
                      onRowClick={(row: any) => {
                        checked[row.biosample_summary] = checked[row.biosample_summary] ? false : true
                        setChecked(checked)
                        // if (rowHighlight) setRowHighlight([rowHighlight[0], row])
                        // else setRowHighlight([row])
                      }}
                      sortDescending={true} 
                      searchable={true}
                    />
      )
    }

    const BrowserView = () => {
      return (
        <Box>
          <svg>
            <text x={110} y={10}>Enh</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>EnhG</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>EnhLo</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>EnhPois</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>EnhPr</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>Het</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>Quies</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>Quies3</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>Quies4</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>QuiesG</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>ReprPC</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>ReprPCW</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>Tss</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>TssBiv</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>TssFink</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>Tx</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
            <text x={110} y={10}>TxWk</text>
            <rect height={1} width={1} x={100} fill={enhancerYellow} />
          </svg>
        </Box>
      )
    }

    return (
      <Box>
        <Paper>
            <Grid2 container spacing={3}>
              <Grid2 xs={12} m={1}>
                <Button
                  sx={{ m: 1 }}
                  variant="contained"
                  onClick={() => {
                    // router.push("")
                  }}
                >
                  Open in UCSC
                </Button>
                <Paper>
                  <Typography>Selected Biosamples</Typography>
                  <Typography>
                    {GenomeBrowserTooltip}
                  </Typography>
                </Paper>
              </Grid2>
                <Grid2 xs={12}>
                  {cellTypes && cellTypes["cellTypeInfoArr"] && <TableView />}
                </Grid2>
                <Grid2 xs={12}>
                  <BrowserView />
                </Grid2>
            </Grid2>
        </Paper>
      </Box>
    )
}