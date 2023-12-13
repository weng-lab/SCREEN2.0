import { Tooltip, Typography, AccordionSummary, AccordionDetails, TextField, Paper, Box, CircularProgress, FormControlLabel, Accordion, FormGroup, Checkbox } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { useMemo, useState } from "react"
import { filterBiosamples, parseByCellType, assayHoverInfo } from "./searchhelpers"
import { BiosampleTableFilters, CellTypeData, FilteredBiosampleData } from "./types"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"

//This should be modified to be used by both filters panel and configure genome browser for ease of maintenence
export const BiosampleTables = (props: { byCellType: CellTypeData }) => {
  const [biosampleTableFilters, setBiosampleTableFilters] = useState<BiosampleTableFilters>({
    CellLine: true,
    PrimaryCell: true,
    Tissue: true,
    Organoid: true,
    InVitro: true,
  })
  const [selectedBiosamples, setSelectedBiosamples] = useState<{}[]>([])
  const [searchString, setSearchString] = useState<string>("")

  const filteredBiosamples: FilteredBiosampleData = useMemo(() => {
    if (props.byCellType) {
      return (
        filterBiosamples(
          parseByCellType(props.byCellType),
          biosampleTableFilters.Tissue,
          biosampleTableFilters.PrimaryCell,
          biosampleTableFilters.CellLine,
          biosampleTableFilters.InVitro,
          biosampleTableFilters.Organoid
        )
      )
    } else return []
  }, [props.byCellType, biosampleTableFilters.Tissue, biosampleTableFilters.PrimaryCell, biosampleTableFilters.CellLine, biosampleTableFilters.InVitro, biosampleTableFilters.Organoid])

  //This could be refactored to improve performance in SNP/Gene filters. The onRowClick for each table depends on setting main query params, which the gene/snp filters also modify
  //This is recalculated every time those sliders are moved.
  const biosampleTables = useMemo(() => {
    const cols = [
      {
        header: "Biosample",
        value: (row) => row.summaryName,
        render: (row) => (
          <Tooltip title={"Biosample Type: " + row.biosampleType} arrow>
            <Typography variant="body2">{row.summaryName}</Typography>
          </Tooltip>
        ),
      },
      {
        header: "Assays",
        value: (row) => Object.keys(row.assays).filter((key) => row.assays[key] === true).length,
        render: (row) => {
          const fifthOfCircle = (2 * 3.1416 * 10) / 5
          return (
            <Tooltip title={assayHoverInfo(row.assays)} arrow>
              <svg height="50" width="50" viewBox="0 0 50 50">
                <circle r="20.125" cx="25" cy="25" fill="#EEEEEE" stroke="black" strokeWidth="0.25" />
                <circle
                  r="10"
                  cx="25"
                  cy="25"
                  fill="transparent"
                  stroke={`${row.assays.dnase ? "#06DA93" : "transparent"}`}
                  strokeWidth="20"
                  strokeDasharray={`${fifthOfCircle} ${fifthOfCircle * 4}`}
                />
                <circle
                  r="10"
                  cx="25"
                  cy="25"
                  fill="transparent"
                  stroke={`${row.assays.h3k27ac ? "#FFCD00" : "transparent"}`}
                  strokeWidth="20"
                  strokeDasharray={`${fifthOfCircle * 0} ${fifthOfCircle} ${fifthOfCircle} ${fifthOfCircle * 3}`}
                />
                <circle
                  r="10"
                  cx="25"
                  cy="25"
                  fill="transparent"
                  stroke={`${row.assays.h3k4me3 ? "#FF0000" : "transparent"}`}
                  strokeWidth="20"
                  strokeDasharray={`${fifthOfCircle * 0} ${fifthOfCircle * 2} ${fifthOfCircle} ${fifthOfCircle * 2}`}
                />
                <circle
                  r="10"
                  cx="25"
                  cy="25"
                  fill="transparent"
                  stroke={`${row.assays.ctcf ? "#00B0F0" : "transparent"}`}
                  strokeWidth="20"
                  strokeDasharray={`${fifthOfCircle * 0} ${fifthOfCircle * 3} ${fifthOfCircle} ${fifthOfCircle * 1}`}
                />
                <circle
                  r="10"
                  cx="25"
                  cy="25"
                  fill="transparent"
                  stroke={`${row.assays.atac ? "#02C7B9" : "transparent"}`}
                  strokeWidth="20"
                  strokeDasharray={`${fifthOfCircle * 0} ${fifthOfCircle * 4} ${fifthOfCircle}`}
                />
              </svg>
            </Tooltip>
          )
        },
      },
    ]

    return (
      filteredBiosamples.sort().map((tissue: [string, {}[]], i) => {
        // Filter shows accordians by if their table contains the search
        if (searchString ? tissue[1].find(obj => obj["summaryName"].toLowerCase().includes(searchString.toLowerCase())) : true) {
          return (
            <Accordion key={tissue[0]}>
              <AccordionSummary
                expandIcon={<KeyboardArrowRightIcon />}
                sx={{
                  flexDirection: "row-reverse",
                  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                    transform: "rotate(90deg)",
                  },
                }}
              >
                <Typography>{tissue[0][0].toUpperCase() + tissue[0].slice(1)}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <DataTable
                  columns={cols}
                  rows={tissue[1]}
                  dense
                  searchable
                  search={searchString}
                  highlighted={selectedBiosamples}
                  sortColumn={1}
                  onRowClick={(row, i) => {
                    setSelectedBiosamples([...selectedBiosamples, row])
                  }}
                />
              </AccordionDetails>
            </Accordion>
          )
        }
      })
    )
  },
    //For some reason it wants "props" as a dependency here, not sure why. Not referring to just "props" here at all
    [filteredBiosamples, selectedBiosamples, searchString]
  )
  return (
    <Grid2 container spacing={2}>
      <Grid2 xs={5}>
        <Typography>Tissue/Organ</Typography>
      </Grid2>
      <Grid2 xs={7}>
        <TextField
          value={searchString}
          size="small"
          label="Search Biosamples"
          onChange={(event) => setSearchString(event.target.value)}
        />
      </Grid2>
      <Grid2 xs={12} maxHeight={300} overflow={"auto"} >
        <Box sx={{ display: 'flex', flexDirection: "column" }}>
          {props.byCellType ? biosampleTables : <CircularProgress sx={{ margin: "auto" }} />}
        </Box>
      </Grid2>
      <Grid2 xs={12} sx={{ mt: 1 }}>
        <Typography>Biosample Type</Typography>
        <FormGroup>
          <FormControlLabel
            checked={biosampleTableFilters.Tissue}
            onChange={(_, checked: boolean) => setBiosampleTableFilters({ ...biosampleTableFilters, Tissue: checked })}
            control={<Checkbox />}
            label="Tissue"
          />
          <FormControlLabel
            checked={biosampleTableFilters.PrimaryCell}
            onChange={(_, checked: boolean) => setBiosampleTableFilters({ ...biosampleTableFilters, PrimaryCell: checked })}
            control={<Checkbox />}
            label="Primary Cell"
          />
          <FormControlLabel
            checked={biosampleTableFilters.InVitro}
            onChange={(_, checked: boolean) => setBiosampleTableFilters({ ...biosampleTableFilters, InVitro: checked })}
            control={<Checkbox />}
            label="In Vitro Differentiated Cell"
          />
          <FormControlLabel
            checked={biosampleTableFilters.Organoid}
            onChange={(_, checked: boolean) => setBiosampleTableFilters({ ...biosampleTableFilters, Organoid: checked })}
            control={<Checkbox />}
            label="Organoid"
          />
          <FormControlLabel
            checked={biosampleTableFilters.CellLine}
            onChange={(_, checked: boolean) => setBiosampleTableFilters({ ...biosampleTableFilters, CellLine: checked })}
            control={<Checkbox />}
            label="Cell Line"
          />
        </FormGroup>
      </Grid2>
    </Grid2>
  )
}