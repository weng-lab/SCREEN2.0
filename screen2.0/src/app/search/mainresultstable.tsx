"use client"
import { DataTable, DataTableProps, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import React, { useState, Dispatch, SetStateAction, useMemo, useCallback } from "react"
import { Box, Typography, Menu, Checkbox, Stack, MenuItem, FormControlLabel, FormGroup, Button, Dialog } from "@mui/material"
import { MainResultTableRow, ConservationData, RegistryBiosamplePlusRNA } from "./types"
import { ArrowDropDown, ArrowRight } from "@mui/icons-material"

import ConfigureGenomeBrowser from "./_ccredetails/configuregb"
import { ApolloQueryResult } from "@apollo/client"
import { BIOSAMPLE_Data } from "../../common/lib/queries"
import ConfigureGBModal from "./_ccredetails/configuregbmodal"


interface MainResultsTableProps extends Partial<DataTableProps<any>> {
  assembly: "GRCh38" | "mm10"
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>
}

export function MainResultsTable(props: MainResultsTableProps) {
  const [distance, setDistance] = useState<boolean>(true)
  const [CTCF_ChIAPET, setCTCF_ChIAPET] = useState<boolean>(false)
  const [RNAPII_ChIAPET, setRNAPII_ChIAPET] = useState<boolean>(false)

  const columns = useCallback((
    funcSetDistance: Dispatch<SetStateAction<boolean>>,
    funcSetCTCF_ChIAPET: Dispatch<SetStateAction<boolean>>,
    funcSetRNAPII_ChIAPET: Dispatch<SetStateAction<boolean>>
  ) => {
    let cols: DataTableColumn<MainResultTableRow>[] = [
      {
        header: "Accession",
        value: (row: { accession: string }) => row.accession,
        HeaderRender: () => <strong><p>Accession</p></strong>
      },
      {
        header: "Class",
        value: (row: { class: string }) => row.class === "PLS" ? "Promoter" : row.class === "pELS" ? "Proximal Enhancer" : row.class === "dELS" ? "Distal Enhancer" : row.class,
        HeaderRender: () => <strong><p>Class</p></strong>
      },
      {
        header: "Chr",
        value: (row: { chromosome: string }) => row.chromosome,
        HeaderRender: () => <strong><p>Chr</p></strong>
      },
      {
        header: "Start",
        value: (row: { start: number }) => row.start,
        render: (row: { start: number }) => row.start.toLocaleString("en-US"),
        HeaderRender: () => <strong><p>Start</p></strong>
      },
      {
        header: "End",
        value: (row: { end: number }) => row.end,
        render: (row: { end: number }) => row.end.toLocaleString("en-US"),
        HeaderRender: () => <strong><p>End</p></strong>
      }
    ]
   
    if (props.rows[0] && props.rows[0].dnase !== null) {
      cols.push({
        header: "DNase",
        value: (row) => (row.dnase && row.dnase.toFixed(2)) || 0,
        HeaderRender: () => {
          return (
            <Stack direction="row" alignItems={"center"}>
              <strong><p>DNase</p></strong>
              {/* <Tooltip sx={{ml: 0.5}} arrow title="This will be populated with more info soon">
                <InfoOutlined fontSize="small" />
              </Tooltip> */}
            </Stack>
          )
        }
      })
    }
    if (props.rows[0] && props.rows[0].atac !== null) {
      cols.push({
        header: "ATAC",
        value: (row) => (row.atac && row.atac.toFixed(2)) || 0,
        HeaderRender: () => {
          return (
            <Stack direction="row" alignItems={"center"}>
              <strong><p>ATAC</p></strong>
              {/* <Tooltip sx={{ml: 0.5}} arrow title="This will be populated with more info soon">
                <InfoOutlined fontSize="small" />
              </Tooltip> */}
            </Stack>
          )
        }
      })
    }
    if (props.rows[0] && props.rows[0].ctcf !== null) {
      cols.push({
        header: "CTCF",
        value: (row) => (row.ctcf && row.ctcf.toFixed(2)) || 0,
        HeaderRender: () => {
          return (
            <Stack direction="row" alignItems={"center"}>
              <strong><p>CTCF</p></strong>
              {/* <Tooltip sx={{ml: 0.5}} arrow title="This will be populated with more info soon">
                <InfoOutlined fontSize="small" />
              </Tooltip> */}
            </Stack>
          )
        }
      })
    }
    if (props.rows[0] && props.rows[0].h3k27ac != null) {
      cols.push({
        header: "H3K27ac",
        value: (row) => (row.h3k27ac && row.h3k27ac.toFixed(2)) || 0,
        HeaderRender: () => {
          return (
            <Stack direction="row" alignItems={"center"}>
            <strong><p>H3K27ac</p></strong>
            {/* <Tooltip sx={{ml: 0.5}} arrow title="This will be populated with more info soon">
              <InfoOutlined fontSize="small" />
            </Tooltip> */}
          </Stack>
          )
        }
      })
    }
    if (props.rows[0] && props.rows[0].h3k4me3 != null) {
      cols.push({
        header: "H3K4me3",
        value: (row) => (row.h3k4me3 && row.h3k4me3.toFixed(2)) || 0,
        HeaderRender: () => {
          return (
            <Stack direction="row" alignItems={"center"}>
            <strong><p>H3K4me3</p></strong>
            {/* <Tooltip sx={{ml: 0.5}} arrow title="This will be populated with more info soon">
              <InfoOutlined fontSize="small" />
            </Tooltip> */}
          </Stack>
          )
        }
      })
    }
    //Whenever the state of the checkboxes conflicts with the state of the main component, it triggers a rerender
    // cols.push({
    //   header: "Linked\u00A0Genes\u00A0(Distance)",
    //   value: () => "",
    //   unsortable: true,
    //   HeaderRender: () => {
    //     const [checkedState, setCheckedState] = useState([distance, CTCF_ChIAPET, RNAPII_ChIAPET])
    //     const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

    //     let open = Boolean(anchorEl);

    //     const handleClose = () => {
    //       funcSetDistance(checkedState[0])
    //       funcSetCTCF_ChIAPET(checkedState[1])
    //       funcSetRNAPII_ChIAPET(checkedState[2])
    //       setAnchorEl(null);
    //     };

    //     const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    //       setAnchorEl(event.currentTarget);
    //     };

    //     const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>, value: 0 | 1 | 2) => {
    //       setCheckedState(checkedState.map((prevValue, index) => {
    //         if (index === value) {
    //           return event.target.checked
    //         } else {
    //           return prevValue
    //         }
    //       }))
    //     };

    //     return (
    //       <Box>
    //         <Stack direction="row" alignItems="center" component="button" onClick={handleClick}>
    //           {open ? <ArrowDropDown /> : <ArrowRight />}
    //           <strong><p>Linked Genes</p></strong>
    //         </Stack>
    //         <Menu
    //           id="basic-menu"
    //           anchorEl={anchorEl}
    //           open={open}
    //           onClose={handleClose}
    //           MenuListProps={{
    //             'aria-labelledby': 'basic-button',
    //           }}
    //         >
    //           <FormGroup>
    //             <MenuItem>
    //               <FormControlLabel control={<Checkbox checked={checkedState[0]} onChange={(event) => handleCheckboxChange(event, 0)} />} label={`Distance`} />
    //             </MenuItem>
    //             <MenuItem>
    //               <FormControlLabel control={<Checkbox checked={checkedState[1]} onChange={(event) => handleCheckboxChange(event, 1)} />} label={`CTCF-ChIAPET`} />
    //             </MenuItem>
    //             <MenuItem>
    //               <FormControlLabel control={<Checkbox checked={checkedState[2]} onChange={(event) => handleCheckboxChange(event, 2)} />} label={`RNAPII-ChIAPET`} />
    //             </MenuItem>
    //           </FormGroup>
    //         </Menu>
    //       </Box>
    //     )
    //   },
    //   render: (row) => {
    //     return (
    //       <>
    //         {distance && <Box>
    //           <Typography variant="body2" display="inline">
    //             {`PC:\u00A0`}
    //           </Typography>
    //           <Typography variant="body2" color="primary" display="inline">
    //             {Object.values(row.linkedGenes.distancePC).map((gene: { name: string }, i: number) => (
    //               <a key={i} target="_blank" rel="noopener noreferrer" href={`/applets/gene-expression?assembly=${props.assembly}&gene=${gene.name}`}>
    //                 {i < row.linkedGenes.distancePC.length - 1 ? `\u00A0${gene.name},\u00A0` : `\u00A0${gene.name}`}
    //               </a>
    //             ))}
    //           </Typography>
    //         </Box>}
    //         {distance && <Box>
    //           <Typography variant="body2" display="inline">
    //             {`All:\u00A0`}
    //           </Typography>
    //           <Typography variant="body2" color="primary" display="inline">
    //             {Object.values(row.linkedGenes.distanceAll).map((gene: { name: string }, i: number) => (
    //               <a key={i} target="_blank" rel="noopener noreferrer" href={`/applets/gene-expression?assembly=${props.assembly}&gene=${gene.name}`}>
    //                 {i < row.linkedGenes.distanceAll.length - 1 ? `\u00A0${gene.name},\u00A0` : `\u00A0${gene.name}`}
    //               </a>
    //             ))}
    //           </Typography>
    //         </Box>}
    //         {CTCF_ChIAPET && <Box>
    //           <Typography variant="body2" display="inline">
    //             {`CTCF-ChIAPET:\u00A0`}
    //           </Typography>
    //           <Typography variant="body2" color="primary" display="inline">
    //             {row.linkedGenes.CTCF_ChIAPET.length == 0 ?
    //               "none"
    //               :
    //               Object.values(row.linkedGenes.CTCF_ChIAPET)
    //               .map((gene: { name: string, biosample: string }, i: number) => gene.name)
    //               //deduplicate
    //               .filter((name, index, self) => { return self.indexOf(name) === index })
    //               .map((name: string, i: number, self: string[]) => (
    //                 <a key={i} target="_blank" rel="noopener noreferrer" href={`/applets/gene-expression?assembly=${props.assembly}&gene=${name}`}>
    //                   {i < self.length - 1 ? <>{`\u00A0${name},\u00A0`}</> : <>{`\u00A0${name}`}</>}
    //                 </a>
    //               ))}
    //           </Typography>
    //         </Box>}
    //         {RNAPII_ChIAPET && <Box>
    //           <Typography variant="body2" display="inline">
    //             {`RNAPII-ChIAPET:\u00A0`}
    //           </Typography>
    //           <Typography variant="body2" color="primary" display="inline">
    //             {row.linkedGenes.RNAPII_ChIAPET.length == 0 ?
    //               "none"
    //               :
    //               Object.values(row.linkedGenes.RNAPII_ChIAPET)
    //                 .map((gene: { name: string, biosample: string }, i: number) => gene.name)
    //                 //deduplicate
    //                 .filter((name, index, self) => { return self.indexOf(name) === index })
    //                 .map((name: string, i: number, self: string[]) => (
    //                   <a key={i} target="_blank" rel="noopener noreferrer" href={`/applets/gene-expression?assembly=${props.assembly}&gene=${name}`}>
    //                     {i < self.length - 1 ? <>{`\u00A0${name},\u00A0`}</> : <>{`\u00A0${name}`}</>}
    //                   </a>
    //                 ))}
    //           </Typography>
    //         </Box>}
    //       </>
    //     )
    //   },
    // })
    cols.push({
      header: "Nearest Gene",
      HeaderRender: () => <strong><p>Nearest&nbsp;Gene</p></strong>,
      value: (row) => row.nearestGenes[0].distance,
      render: (row) => <Typography variant="body2"><i>{row.nearestGenes[0].gene}</i> - {row.nearestGenes[0].distance}bp</Typography>
    })
    cols.push({ 
      header: "Configure UCSC",
      value: () => "",
      unsearchable: true,
      unsortable: true,
      HeaderRender: () => {
        return (
          <Stack direction="column" alignItems={"center"}>
            <strong><p>Track&nbsp;Hub</p></strong>
            {/* <Tooltip sx={{ml: 0.5}} arrow title="This will be populated with more info soon">
                <InfoOutlined fontSize="small" />
              </Tooltip> */}
          </Stack>
        )
      },
      FunctionalRender: (row: MainResultTableRow) => {
        const [open, setOpen] = useState(false);

        return (
          //Box's onClick prevents onRowClick from running when interacting with modal
          <Box onClick={(event: React.MouseEvent<HTMLDivElement, MouseEvent>) => { event.stopPropagation() }}>
            <Button variant="outlined" onClick={() => setOpen(true)}>
              UCSC
            </Button>
            <ConfigureGBModal
              biosampleData={props.biosampleData}
              coordinates={{
                assembly: props.assembly,
                chromosome: row.chromosome,
                start: row.start,
                end: row.end,
              }}
              accession={row.accession}
              open={open}
              setOpen={setOpen}
            />
          </Box>
        )
      }
    })
    props.assembly === "GRCh38" && cols.push({
      header: "Conservation",
      value: (row: { conservationData: ConservationData }) => `Primates:\u00A0${row.conservationData.primates?.toFixed(2) ?? "unavailable"} Mammals:\u00A0${row.conservationData.mammals?.toFixed(2) ?? "unavailable"} Vertebrates:\u00A0${row.conservationData.vertebrates?.toFixed(2) ?? "unavailable"}` , 
      HeaderRender: () => <strong><p>Conservation</p></strong>
    })
    return cols
  }, [CTCF_ChIAPET, RNAPII_ChIAPET, distance, props.assembly, props.biosampleData, props.rows])

  const cols = useMemo(() => {
    return columns(setDistance, setCTCF_ChIAPET, setRNAPII_ChIAPET)
  }, [setDistance, setCTCF_ChIAPET, setRNAPII_ChIAPET, columns])

  return (
      <DataTable
        key={props.rows[0] && props.rows[0].dnase + props.rows[0].ctcf + props.rows[0].h3k27ac + props.rows[0].h3k4me3 +  props.rows[0].atac  + columns.toString() + distance + CTCF_ChIAPET + RNAPII_ChIAPET}
        rows={props.rows}
        columns={cols}
        itemsPerPage={props.itemsPerPage}
        searchable
        onRowClick={props.onRowClick}
        tableTitle={props.tableTitle}
        sortColumn={5}
        showMoreColumns={props.assembly === "GRCh38"}
        noOfDefaultColumns={props.assembly === "GRCh38" ? cols.length - 1 : cols.length}
        titleHoverInfo={props.titleHoverInfo}
      />
  )
}
