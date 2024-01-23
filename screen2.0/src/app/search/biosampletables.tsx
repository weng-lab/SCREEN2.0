import { Tooltip, Typography, AccordionSummary, AccordionDetails, TextField, Paper, Box, CircularProgress, FormControlLabel, Accordion, FormGroup, Checkbox, Stack, IconButton, Menu, MenuItem, Button, InputAdornment, FormControl, FormLabel } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { ChangeEvent, Dispatch, SetStateAction, useMemo, useState } from "react"
import { filterBiosamples, parseByCellType, assayHoverInfo } from "./searchhelpers"
import { BiosampleTableFilters, CellTypeData, FilteredBiosampleData, Biosample } from "./types"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { ArrowDropDown, Check, Close } from "@mui/icons-material"
import { ArrowRight } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';


interface Props {
  byCellType: CellTypeData,
  selectedBiosamples: Biosample[],
  setSelectedBiosamples: Dispatch<SetStateAction<Biosample[]>>,
  showRNAseq: boolean,
  biosampleSelectMode: "replace" | "append"
  biosampleTableFilters?: BiosampleTableFilters,
  setBiosampleTableFilters?: Dispatch<SetStateAction<BiosampleTableFilters>>,
}

export const BiosampleTables: React.FC<Props> = ({
  byCellType,
  selectedBiosamples,
  setSelectedBiosamples,
  showRNAseq,
  biosampleSelectMode,
  biosampleTableFilters,
  setBiosampleTableFilters }
) => {
  //This is ONLY used in configGB == true situations. Otherwise, use biosampleTableFilters if changes are to be synced to URL
  const [biosampleTableFiltersInternal, setBiosampleTableFiltersInternal] = useState<BiosampleTableFilters>({
    CellLine: { checked: true, label: "Cell Line" },
    PrimaryCell: { checked: true, label: "Primary Cell" },
    Tissue: { checked: true, label: "Tissue" },
    Organoid: { checked: true, label: "Organoid" },
    InVitro: { checked: true, label: "In Vitro Differentiated Cell" },
    Core: { checked: true, label: "Core Collection" },
    Partial: { checked: true, label: "Partial Data Collection" },
    Ancillary: { checked: true, label: "Ancillary Collection" },
  })

  const sidebar = Boolean(biosampleTableFilters)

  //For searching biosample tables
  const [searchString, setSearchString] = useState<string>("")

  //Anchor for dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    console.log("clicked")
    setAnchorEl(event.currentTarget);
  };

  const filteredBiosamples: FilteredBiosampleData = useMemo(() => {
    if (byCellType) {
      return (
        filterBiosamples(
          parseByCellType(byCellType),
          sidebar ? biosampleTableFilters.Tissue.checked : biosampleTableFiltersInternal.Tissue.checked,
          sidebar ? biosampleTableFilters.PrimaryCell.checked : biosampleTableFiltersInternal.PrimaryCell.checked,
          sidebar ? biosampleTableFilters.CellLine.checked : biosampleTableFiltersInternal.CellLine.checked,
          sidebar ? biosampleTableFilters.InVitro.checked : biosampleTableFiltersInternal.InVitro.checked,
          sidebar ? biosampleTableFilters.Organoid.checked : biosampleTableFiltersInternal.Organoid.checked,
          sidebar ? biosampleTableFilters.Core.checked : biosampleTableFiltersInternal.Core.checked,
          sidebar ? biosampleTableFilters.Partial.checked : biosampleTableFiltersInternal.Partial.checked,
          sidebar ? biosampleTableFilters.Ancillary.checked : biosampleTableFiltersInternal.Ancillary.checked,
        )
      )
    } else return []
  }, [byCellType, sidebar, biosampleTableFiltersInternal, biosampleTableFilters])

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
      }
    ]

    if (showRNAseq) cols.push({
      header: "RNA-Seq",
      value: (row) => +row.rnaseq,
      render: (row) => {
        if (row.rnaseq) {
          return (
            <Check />
          )
        }
      },
    })

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
                    if (biosampleSelectMode === "append" && !selectedBiosamples.find((x) => x.summaryName === row.summaryName)) {
                      setSelectedBiosamples([...selectedBiosamples, row])
                    } else {
                      setSelectedBiosamples([row])
                    }
                  }}
                />
              </AccordionDetails>
            </Accordion>
          )
        }
      })
    )
  },
    [filteredBiosamples, selectedBiosamples, searchString, setSelectedBiosamples, biosampleSelectMode, showRNAseq]
  )

  const Checkboxes = (checkboxStates: BiosampleTableFilters, setCheckboxStates: Dispatch<SetStateAction<BiosampleTableFilters>>) => {
    return (
      <Box>
        <Button sx={{textTransform: "none"}} fullWidth variant="outlined" size="medium" startIcon={Boolean(anchorEl) ? <ArrowDropDown /> : <ArrowRight />} onClick={handleClick}>Sample Type/Collection</Button>
        <Menu
          id="basic-menu"
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleClose}
          MenuListProps={{
            'aria-labelledby': 'basic-button',
          }}
        >
          <FormControl sx={{ ml: 2, mt: 1 }} component="fieldset" variant="standard">
            <FormLabel component="legend">Biosample Types</FormLabel>
            <FormGroup>
              <MenuItem>
                <FormControlLabel
                  checked={checkboxStates.CellLine.checked}
                  onChange={(_, checked: boolean) => setCheckboxStates({ ...checkboxStates, CellLine: { checked: checked, label: checkboxStates.CellLine.label } })}
                  control={<Checkbox />}
                  label={checkboxStates.CellLine.label}
                />
              </MenuItem>
              <MenuItem>
                <FormControlLabel
                  checked={checkboxStates.PrimaryCell.checked}
                  onChange={(_, checked: boolean) => setCheckboxStates({ ...checkboxStates, PrimaryCell: { checked: checked, label: checkboxStates.PrimaryCell.label } })}
                  control={<Checkbox />}
                  label={checkboxStates.PrimaryCell.label}
                />
              </MenuItem>
              <MenuItem>
                <FormControlLabel
                  checked={checkboxStates.Tissue.checked}
                  onChange={(_, checked: boolean) => setCheckboxStates({ ...checkboxStates, Tissue: { checked: checked, label: checkboxStates.Tissue.label } })}
                  control={<Checkbox />}
                  label={checkboxStates.Tissue.label}
                />
              </MenuItem>
              <MenuItem>
                <FormControlLabel
                  checked={checkboxStates.Organoid.checked}
                  onChange={(_, checked: boolean) => setCheckboxStates({ ...checkboxStates, Organoid: { checked: checked, label: checkboxStates.Organoid.label } })}
                  control={<Checkbox />}
                  label={checkboxStates.Organoid.label}
                />
              </MenuItem>
              <MenuItem>
                <FormControlLabel
                  checked={checkboxStates.InVitro.checked}
                  onChange={(_, checked: boolean) => setCheckboxStates({ ...checkboxStates, InVitro: { checked: checked, label: checkboxStates.InVitro.label } })}
                  control={<Checkbox />}
                  label={checkboxStates.InVitro.label}
                />
              </MenuItem>
            </FormGroup>
            <FormLabel component="legend">Collection</FormLabel>
            <FormGroup>
              <MenuItem>
                <FormControlLabel
                  checked={checkboxStates.Core.checked}
                  onChange={(_, checked: boolean) => setCheckboxStates({ ...checkboxStates, Core: { checked: checked, label: checkboxStates.Core.label } })}
                  control={<Checkbox />}
                  label={checkboxStates.Core.label}
                />
              </MenuItem>
              <MenuItem>
                <FormControlLabel
                  checked={checkboxStates.Partial.checked}
                  onChange={(_, checked: boolean) => setCheckboxStates({ ...checkboxStates, Partial: { checked: checked, label: checkboxStates.Partial.label } })}
                  control={<Checkbox />}
                  label={checkboxStates.Partial.label}
                />
              </MenuItem>
              <MenuItem>
                <FormControlLabel
                  checked={checkboxStates.Ancillary.checked}
                  onChange={(_, checked: boolean) => setCheckboxStates({ ...checkboxStates, Ancillary: { checked: checked, label: checkboxStates.Ancillary.label } })}
                  control={<Checkbox />}
                  label={checkboxStates.Ancillary.label}
                />
              </MenuItem>
            </FormGroup>
          </FormControl>
        </Menu>
      </Box>
    )
  }

  return (
    <Grid2 container spacing={2}>
      <Grid2 xs={sidebar ? 12 : 6}>
        <TextField
          value={searchString}
          size="small"
          label="Search Biosamples"
          onChange={(event) => setSearchString(event.target.value)}
          fullWidth
          InputProps={{
            endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment>,
          }}
        />
      </Grid2>
      <Grid2 xs={sidebar ? 12 : 6}>
        {sidebar ?
          Checkboxes(biosampleTableFilters, setBiosampleTableFilters)
          :
          Checkboxes(biosampleTableFiltersInternal, setBiosampleTableFiltersInternal)
        }
      </Grid2>
      <Grid2 xs={12} height={sidebar ? 350 : 500} overflow={"auto"} >
        <Box sx={{ display: 'flex', flexDirection: "column" }}>
          {byCellType ? biosampleTables : <CircularProgress sx={{ margin: "auto" }} />}
        </Box>
      </Grid2>
    </Grid2>
  )
}

export default BiosampleTables