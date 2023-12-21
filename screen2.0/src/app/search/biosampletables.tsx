import { Tooltip, Typography, AccordionSummary, AccordionDetails, TextField, Paper, Box, CircularProgress, FormControlLabel, Accordion, FormGroup, Checkbox, Stack, IconButton, Menu, MenuItem, Button, InputAdornment } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2"
import { DataTable } from "@weng-lab/psychscreen-ui-components"
import { Dispatch, SetStateAction, useMemo, useState } from "react"
import { filterBiosamples, parseByCellType, assayHoverInfo } from "./searchhelpers"
import { BiosampleTableFilters, CellTypeData, FilteredBiosampleData, Biosample } from "./types"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { ArrowDropDown, Check, Close } from "@mui/icons-material"
import { ArrowRight } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';


interface Props {
  configGB: boolean,
  byCellType: CellTypeData,
  //when sidebar = true, selected biosamples should only be length 1
  selectedBiosamples: Biosample[],
  setSelectedBiosamples: Dispatch<SetStateAction<Biosample[]>>,
  biosampleTableFilters?: BiosampleTableFilters,
  setBiosampleTableFilters?: Dispatch<SetStateAction<BiosampleTableFilters>>,
}

export const BiosampleTables: React.FC<Props> = ({
  configGB,
  byCellType,
  //when sidebar = true, selected biosamples should only be length 1
  selectedBiosamples,
  setSelectedBiosamples,
  biosampleTableFilters,
  setBiosampleTableFilters}
) => {
  //This is ONLY used in configGB == true situations. Otherwise, use biosampleTableFilters if changes are to be synced to URL
  const [biosampleCheckboxes, setBiosampleCheckboxes] = useState<BiosampleTableFilters>({
    CellLine: { checked: true, label: "Cell Line" },
    PrimaryCell: { checked: true, label: "Primary Cell" },
    Tissue: { checked: true, label: "Tissue" },
    Organoid: { checked: true, label: "Organoid" },
    InVitro: { checked: true, label: "In Vitro Differentiated Cell" },
  })

  //For searching biosample tables
  const [searchString, setSearchString] = useState<string>("")

  //Anchor for dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  let open = Boolean(anchorEl);

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
          configGB ? biosampleCheckboxes.Tissue.checked : biosampleTableFilters.Tissue.checked,
          configGB ? biosampleCheckboxes.PrimaryCell.checked : biosampleTableFilters.PrimaryCell.checked,
          configGB ? biosampleCheckboxes.CellLine.checked : biosampleTableFilters.CellLine.checked,
          configGB ? biosampleCheckboxes.InVitro.checked : biosampleTableFilters.InVitro.checked,
          configGB ? biosampleCheckboxes.Organoid.checked : biosampleTableFilters.Organoid.checked,
        )
      )
    } else return []
  }, [byCellType, configGB, biosampleCheckboxes, biosampleTableFilters])

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

    if (configGB) cols.push({
      header: "RNA-Seq Available",
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
                    //If in config GB, and selected Biosamples does not contain the clicked item
                    if (configGB && !selectedBiosamples.find((x) => x.summaryName === row.summaryName)) {
                        setSelectedBiosamples([...selectedBiosamples, row])
                    } else if (!configGB) {
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
    [filteredBiosamples, selectedBiosamples, searchString, configGB, setSelectedBiosamples]
  )

  const typeCheckboxes = useMemo(() => {
    if (configGB) {
      //If using in config GB, wrap checkboxes in dropdown. Use local biosampleCheckboxes state (doesn't sync to URL)
      return (
        <Box>
          <Button fullWidth variant="outlined" size="medium" startIcon={open ? <ArrowDropDown /> : <ArrowRight />} onClick={handleClick}>Biosample Types</Button>
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
              {Object.keys(biosampleCheckboxes).map((value: string, i: number) => {
                return (
                  <MenuItem key={i}>
                    <FormControlLabel
                      checked={biosampleCheckboxes[value].checked}
                      onChange={(_, checked: boolean) => setBiosampleCheckboxes({ ...biosampleCheckboxes, [value]: { checked: checked, label: biosampleCheckboxes[value].label } })}
                      control={<Checkbox />}
                      label={biosampleCheckboxes[value].label}
                    />
                  </MenuItem>
                )
              })}
            </FormGroup>
          </Menu>
        </Box>
      )
    } else {
      //If not in config GB, return simple list. Use external biosampleTableFilters state (syncs to URL)
      return (
        <>
          <Typography>Biosample Types</Typography>
          <FormGroup>
            {Object.keys(biosampleTableFilters).map((value: string, i: number) => {
            return (
              <FormControlLabel
                key={i}
                checked={biosampleTableFilters[value].checked}
                onChange={(_, checked: boolean) => setBiosampleTableFilters({ ...biosampleTableFilters, [value]: { checked: checked, label: biosampleTableFilters[value].label } })}
                control={<Checkbox />}
                label={biosampleTableFilters[value].label}
              />
            )
          })}
          </FormGroup>
        </>
      )
    }
  }, [anchorEl, biosampleCheckboxes, open, biosampleTableFilters, configGB, setBiosampleTableFilters])

  return (
    <Grid2 container spacing={2}>
      <Grid2 xs={configGB ? 6 : 12}>
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
      {configGB &&
        <Grid2 xs={6}>
          {typeCheckboxes}
        </Grid2>
      }
      <Grid2 xs={12} height={configGB ? 500 : 350} overflow={"auto"} >
        <Box sx={{ display: 'flex', flexDirection: "column" }}>
          {byCellType ? biosampleTables : <CircularProgress sx={{ margin: "auto" }} />}
        </Box>
      </Grid2>
      {!configGB &&
        <Grid2 xs={12}>
          {typeCheckboxes}
        </Grid2>
      }
    </Grid2>
  )
}

export default BiosampleTables