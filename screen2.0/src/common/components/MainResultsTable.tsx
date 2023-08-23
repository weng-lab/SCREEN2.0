"use client"
import { DataTable, DataTableProps, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import React, { useCallback, useEffect, useState } from "react"
import { Box, Typography, Menu, Checkbox, Stack, MenuItem, Container, FormControlLabel, FormGroup } from "@mui/material"
import { MainResultTableRow } from "../../app/search/types"
import ArrowRightIcon from '@mui/icons-material/ArrowRight';
import { usePathname, useRouter, useSearchParams } from "next/navigation"

function MainResultsTable(props: Partial<DataTableProps<any>>) {
  const [distance, setDistance] = useState(true)
  const [CTCF_ChIAPET, setCTCF_ChIAPET] = useState(false)
  const [RNAPII_ChIAPET, setRNAPII_ChIAPET] = useState(false)

  const [columns, setColumns] = useState<DataTableColumn<MainResultTableRow>[]>(
    [{
      header: "Accession",
      value: (row: { accession: string }) => row.accession,
    }]
  )

  const router = useRouter()
  const pathname = usePathname()
  const searchParams: any = useSearchParams()!

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams)
      params.set(name, value)

      return params.toString()
    }, [searchParams])

  //How do I tell if I am replacing the array or modifying it? I need to make sure I'm replacing it
  useEffect(() => {
    let cols: DataTableColumn<MainResultTableRow>[] = [
      {
        header: "Accession",
        value: (row: { accession: string }) => row.accession,
      },
      {
        header: "Class",
        value: (row: { class: string }) => row.class,
      },
      {
        header: "Chr",
        value: (row: { chromosome: any }) => row.chromosome,
      },
      {
        header: "Start",
        value: (row: { start: string }) => row.start,
      },
      {
        header: "End",
        value: (row: { end: string }) => row.end,
      },
      {
        header: "ATAC",
        //Atac is a string because the data does not exist and is "TBD" for now
        value: (row: { atac: string }) => row.atac,
      },
    ]

    if (props.rows[0] && props.rows[0].dnase !== null) {
      cols.push({
        header: "DNase",
        value: (row) => (row.dnase && row.dnase.toFixed(2)) || 0,
      })
    }
    if (props.rows[0] && props.rows[0].ctcf !== null) {
      cols.push({
        header: "CTCF",
        value: (row) => (row.ctcf && row.ctcf.toFixed(2)) || 0,
      })
    }
    if (props.rows[0] && props.rows[0].h3k27ac != null) {
      cols.push({
        header: "H3K27ac",
        value: (row) => (row.h3k27ac && row.h3k27ac.toFixed(2)) || 0,
      })
    }
    if (props.rows[0] && props.rows[0].h3k4me3 != null) {
      cols.push({
        header: "H3K4me3",
        value: (row) => (row.h3k4me3 && row.h3k4me3.toFixed(2)) || 0,
      })
    }

    //Is there a good way to sort linked genes? Set to "" because I'm not sure
    //Need to import types I set for the linked genes data
    //Is this being rerendered and thus the anchor is being wiped?
    cols.push({
      header: "Linked\u00A0Genes\u00A0(Distance)",
      value: () => "",
      headerRender: () => {
        const [distanceChecked, setDistanceChecked] = useState(distance)
        const [CTCF_ChIAPETChecked, setCTCF_ChIAPETChecked] = useState(CTCF_ChIAPET)
        const [RNAPII_ChIAPETChecked, setRNAPII_ChIAPETChecked] = useState(RNAPII_ChIAPET)
        const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(() => {
          console.log("initialization performed")
          return null})
        const open = Boolean(anchorEl);

        const handleClose = () => {
          setDistance(distanceChecked)
          setCTCF_ChIAPET(CTCF_ChIAPETChecked)
          setRNAPII_ChIAPET(RNAPII_ChIAPETChecked)
          console.log("menu closed, state of checkboxes pushed to main state")
          setAnchorEl(null);
        };

        const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
          console.log("New Anchor Set")
          setAnchorEl(event.currentTarget);
        };

        const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, value: 0 | 1 | 2) => {
          switch (value) {
            case 0:
              setDistance(event.target.checked)
              setDistanceChecked(event.target.checked)
              break
            case 1:
              setCTCF_ChIAPET(event.target.checked)
              setCTCF_ChIAPETChecked(event.target.checked)
              break
            case 2:
              setRNAPII_ChIAPET(event.target.checked)
              setRNAPII_ChIAPETChecked(event.target.checked)
              break
          }
        };

        // useEffect(() => {
        //   setDistanceChecked(distance)
        //   setCTCF_ChIAPETChecked(CTCF_ChIAPET)
        //   setRNAPII_ChIAPETChecked(RNAPII_ChIAPET)
        // }, [])

        return (
          <>
            <Stack direction="row" alignItems="flex-start" component="button" onClick={handleClick}>
              <ArrowRightIcon />
              <Typography variant="body2">Linked Genes</Typography>
            </Stack>
            <Menu
              id="basic-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
            >
              <FormGroup>
                <MenuItem>
                  <FormControlLabel control={<Checkbox checked={distanceChecked} onChange={(event) => handleCheckboxChange(event, 0)} />} label={`Distance`} />
                </MenuItem>
                <MenuItem>
                  <FormControlLabel control={<Checkbox checked={CTCF_ChIAPETChecked} onChange={(event) => handleCheckboxChange(event, 1)} />} label={`CTCF-ChIAPET`} />
                </MenuItem>
                <MenuItem>
                  <FormControlLabel control={<Checkbox checked={RNAPII_ChIAPETChecked} onChange={(event) => handleCheckboxChange(event, 2)} />} label={`RNAPII-ChIAPET`} />
                </MenuItem>
              </FormGroup>
            </Menu>
          </>

        )
      },
      render: (row) => {
        return (
          <>
            {distance && <Box>
              <Typography variant="body2" display="inline">
                {`PC:\u00A0`}
              </Typography>
              <Typography variant="body2" color="primary" display="inline">
                {Object.values(row.linkedGenes.distancePC).map((gene: { name: string }, i: number) => (
                  <a key={i} target="_blank" rel="noopener noreferrer" href={`/applets/gene-expression?gene=${gene.name}`}>
                    {i < row.linkedGenes.distancePC.length - 1 ? `\u00A0${gene.name},\u00A0` : `\u00A0${gene.name}`}
                  </a>
                ))}
              </Typography>
            </Box>}
            {distance && <Box>
              <Typography variant="body2" display="inline">
                {`All:\u00A0`}
              </Typography>
              <Typography variant="body2" color="primary" display="inline">
                {Object.values(row.linkedGenes.distanceAll).map((gene: { name: string }, i: number) => (
                  <a key={i} target="_blank" rel="noopener noreferrer" href={`/applets/gene-expression?gene=${gene.name}`}>
                    {i < row.linkedGenes.distanceAll.length - 1 ? `\u00A0${gene.name},\u00A0` : `\u00A0${gene.name}`}
                  </a>
                ))}
              </Typography>
            </Box>}
            {CTCF_ChIAPET && <Box>
              <Typography variant="body2" display="inline">
                {`CTCF-ChIAPET:\u00A0`}
              </Typography>
              <Typography variant="body2" color="primary" display="inline">
                {row.linkedGenes.CTCF_ChIAPET.length == 0 ? "none" : Object.values(row.linkedGenes.CTCF_ChIAPET).map((gene: { name: string, biosample: string }, i: number) => (
                  <a key={i} target="_blank" rel="noopener noreferrer" href={`/applets/gene-expression?gene=${gene.name}`}>
                    {i < row.linkedGenes.CTCF_ChIAPET.length - 1 ? `\u00A0${gene.name},\u00A0` : `\u00A0${gene.name}`}
                  </a>
                ))}
              </Typography>
            </Box>}
            {RNAPII_ChIAPET && <Box>
              <Typography variant="body2" display="inline">
                {`RNAPII-ChIAPET:\u00A0`}
              </Typography>
              <Typography variant="body2" color="primary" display="inline">
                {row.linkedGenes.RNAPII_ChIAPET.length == 0 ? "none" : Object.values(row.linkedGenes.RNAPII_ChIAPET).map((gene: { name: string, biosample: string }, i: number) => (
                  <a key={i} target="_blank" rel="noopener noreferrer" href={`/applets/gene-expression?gene=${gene.name}`}>
                    {i < row.linkedGenes.RNAPII_ChIAPET.length - 1 ? `\u00A0${gene.name},\u00A0` : `\u00A0${gene.name}`}
                  </a>
                ))}
              </Typography>
            </Box>}
          </>
        )
      },
    })
    console.log("columns recalculated")
    handleSetColumns(cols)
  }, [props.rows])

  function handleSetColumns(newColumns: DataTableColumn<MainResultTableRow>[]) {
    console.log("new columns set")
    setColumns(newColumns)
  }

  return (
    <>
      <Typography>Distance - {distance.toString()}</Typography>
      <Typography>CTCF - {CTCF_ChIAPET.toString()}</Typography>
      <Typography>RNAPII - {RNAPII_ChIAPET.toString()}</Typography>
      <DataTable
        //Using a key here to trigger rerender is hacky. There should be another way https://react.dev/reference/react/useState#updating-objects-and-arrays-in-state
        //It actually might be an issue with how the DataTable handles it's state internally. Is it possible that a rerender is being triggered but it's internal state is not being updated with the new value?
        //The columns in the DataTable are being stored in an object. It might be that a change in props here doesn't replace the columns on the state variable, but rather modifies the columns attribute, which the React Docs say is bad.
        //Internally, when the columns are changed (by the modal), the columns are reset properly(?) using the spread operator.
        //Does a function passed to DataTable have access to the state of the parent function?
        key={props.rows[0] && props.rows[0].dnase + props.rows[0].ctcf + props.rows[0].h3k27ac + props.rows[0].h3k4me3 + columns.toString() + distance.toString() + CTCF_ChIAPET.toString() + RNAPII_ChIAPET.toString()}
        rows={props.rows}
        columns={columns}
        itemsPerPage={props.itemsPerPage}
        searchable
        onRowClick={(r) => {
          router.push(pathname + "?" + createQueryString("accession", r.accession))
        }}
        tableTitle={props.tableTitle}
        sortColumn={0}
        sortDescending
      />
    </>
  )
}

export default MainResultsTable
