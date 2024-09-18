import { Tooltip, Typography, AccordionSummary, AccordionDetails, TextField, CircularProgress, FormControlLabel, Accordion, FormGroup, Checkbox, IconButton, Menu, MenuItem, InputAdornment, FormControl, FormLabel, Paper, Stack } from "@mui/material"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { useCallback,  useMemo, useState } from "react"
import { BiosampleDataVars, BiosampleReturnData, CheckboxState, FiltersKey, Props, RegistryBiosample, RegistryBiosamplePlusRNA, RNA_SEQ_Data, RNA_SEQ_Variables } from "./types"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { Check,  Close,  FilterList } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { assayHoverInfo, DownloadBiosamplecCREsButton, filterBiosamples } from "./helpers"
import { BIOSAMPLE_QUERY, RNA_SEQ_QUERY } from "./queries"

const checkboxLabels: { [key in FiltersKey]: string } = {
  CellLine: "Cell Line",
  PrimaryCell: "Primary Cell",
  Tissue: "Tissue",
  Organoid: "Organoid",
  InVitro: "In Vitro Differentiated Cell",
  Core: "Core Collection",
  Partial: "Partial Data Collection",
  Ancillary: "Ancillary Collection",
  Embryo: "Embryo",
  Adult: "Adult"
}

export const BiosampleTables = <T extends boolean = false>({
  assembly,
  selected,
  onBiosampleClicked,
  preFilterBiosamples,
  showRNAseq,
  showDownloads,
  slotProps
}: Props<T>) => {
  //Checkbox state for filters
  const [checkboxes, setCheckboxes] = useState<CheckboxState>({
    CellLine: true,
    PrimaryCell: true,
    Tissue: true,
    Organoid: true,
    InVitro: true,
    Core: true,
    Partial: true,
    Ancillary: true,
    Embryo: true,
    Adult: true
  })

  //For searching biosample tables
  const [searchString, setSearchString] = useState<string>("")

  //Anchor for dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleClose = () => { setAnchorEl(null) }

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => { setAnchorEl(event.currentTarget) }


  const { data: biosampleData, loading: loadingBiosamples, error: errorBiosamples } = useQuery<BiosampleReturnData, BiosampleDataVars>(
    BIOSAMPLE_QUERY,
    {
      variables: {
        assembly: assembly.toLowerCase() as "grch38" | "mm10"
      }
    }
  )

  const { data: data_rnaseq, loading: loading_rnaseq, error: error_rnaseq } = useQuery<RNA_SEQ_Data, RNA_SEQ_Variables>(
    RNA_SEQ_QUERY,
    {
      variables: {
        assembly: assembly.toLowerCase() as ("grch38" | "mm10")
      },
      skip: !showRNAseq,
      fetchPolicy: "cache-first"
    }
  )

  //Not using generic BiosampleData<T> type since this function is always called on return data without RNAseq t/f data
  const sampleMatchesSearch = useCallback((x: RegistryBiosample) => {
    if (searchString) {
      return x.name.toLowerCase().includes(searchString.toLowerCase())
        || x.displayname.toLowerCase().includes(searchString.toLowerCase())
        || x.ontology.toLowerCase().includes(searchString.toLowerCase())
    } else return true
  }, [searchString])

  /**
   * Sorted and Filtered Biosamples
   */
  const filteredBiosamples: { [key: string]: (RegistryBiosample | RegistryBiosamplePlusRNA)[] } = useMemo(() => {
    if ((biosampleData && (data_rnaseq || !showRNAseq))) {
      const groupedBiosamples: { [key: string]: (RegistryBiosample | RegistryBiosamplePlusRNA)[] } = {}
      biosampleData.ccREBiosampleQuery.biosamples
        .filter(preFilterBiosamples || (() => true))
        .forEach((biosample: RegistryBiosample) => {
          if (!searchString || (searchString && sampleMatchesSearch(biosample))) { //check to see that sample matches search
            //If tissue hasn't been cataloged yet, define an entry for it
            if (!groupedBiosamples[biosample.ontology]) {
              groupedBiosamples[biosample.ontology] = [];
            }
            if (showRNAseq) {
              //Add biosample to corresponding entry
              groupedBiosamples[biosample.ontology].push(
                {
                  ...biosample,
                  rnaseq: Boolean(data_rnaseq.rnaSeqQuery.map((sample) => sample.biosample).find(sampleName => biosample.name === sampleName)),
                } as RegistryBiosamplePlusRNA
              )
            } else {
              groupedBiosamples[biosample.ontology].push(biosample as RegistryBiosample)
            }
          }
      })
      const filteredBiosamples = filterBiosamples(
        groupedBiosamples,
        checkboxes,
      )
      return filteredBiosamples
    } else return {}
  }, [biosampleData, checkboxes, data_rnaseq, showRNAseq, sampleMatchesSearch, searchString, preFilterBiosamples])


  const biosampleTables = useMemo(() => {
    let cols: DataTableColumn<RegistryBiosamplePlusRNA>[] = [
      {
        header: "Biosample",
        value: (row) => row.displayname,
        render: (row) => (
          <Tooltip title={"Biosample Type: " + row.sampleType} arrow>
            <Typography variant="body2">{row.displayname}</Typography>
          </Tooltip>
        ),
      },
      {
        header: "Assays",
        //number of assays available
        value: (row) => +!!row.dnase + +!!row.atac + +!!row.ctcf + +!!row.h3k27ac + +!!row.h3k4me3,
        render: (row) => {
          const fifthOfCircle = (2 * 3.1416 * 10) / 5
          return (
            <Tooltip
              title={assayHoverInfo({
                dnase: !!row.dnase,
                atac: !!row.atac,
                ctcf: !!row.ctcf,
                h3k27ac: !!row.h3k27ac,
                h3k4me3: !!row.h3k4me3
              })}
              arrow>
              <svg height="50" width="50" viewBox="0 0 50 50">
                <circle r="20.125" cx="25" cy="25" fill="#EEEEEE" stroke="black" strokeWidth="0.25" />
                <circle
                  r="10"
                  cx="25"
                  cy="25"
                  fill="transparent"
                  stroke={`${row.dnase ? "#06DA93" : "transparent"}`}
                  strokeWidth="20"
                  strokeDasharray={`${fifthOfCircle} ${fifthOfCircle * 4}`}
                />
                <circle
                  r="10"
                  cx="25"
                  cy="25"
                  fill="transparent"
                  stroke={`${row.h3k27ac ? "#FFCD00" : "transparent"}`}
                  strokeWidth="20"
                  strokeDasharray={`${fifthOfCircle * 0} ${fifthOfCircle} ${fifthOfCircle} ${fifthOfCircle * 3}`}
                />
                <circle
                  r="10"
                  cx="25"
                  cy="25"
                  fill="transparent"
                  stroke={`${row.h3k4me3 ? "#FF0000" : "transparent"}`}
                  strokeWidth="20"
                  strokeDasharray={`${fifthOfCircle * 0} ${fifthOfCircle * 2} ${fifthOfCircle} ${fifthOfCircle * 2}`}
                />
                <circle
                  r="10"
                  cx="25"
                  cy="25"
                  fill="transparent"
                  stroke={`${row.ctcf ? "#00B0F0" : "transparent"}`}
                  strokeWidth="20"
                  strokeDasharray={`${fifthOfCircle * 0} ${fifthOfCircle * 3} ${fifthOfCircle} ${fifthOfCircle * 1}`}
                />
                <circle
                  r="10"
                  cx="25"
                  cy="25"
                  fill="transparent"
                  stroke={`${row.atac ? "#02C7B9" : "transparent"}`}
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
      value: (row) => +!!row.rnaseq ?? "",
      render: (row) => {
        if (row.rnaseq) {
          return (
            <Check />
          )
        }
      },
    })

    if (showDownloads) {
      cols = [
        ...cols,
        {
          header: "cCREs",
          value: (row) => +!!(row.dnase || row.ctcf || row.h3k27ac || row.h3k4me3),
          FunctionalRender: (row) => DownloadBiosamplecCREsButton(row, "celltypeccres"),
        },
        {
          header: "DNase Signal",
          value: (row) => +!!row.dnase,
          FunctionalRender: (row) => DownloadBiosamplecCREsButton(row, "dnase"),
        },
        {
          header: "ATAC Signal",
          value: (row) => +!!row.atac,
          FunctionalRender: (row) => DownloadBiosamplecCREsButton(row, "atac"),
        },
        {
          header: "CTCF Signal",
          value: (row) => +!!row.ctcf,
          FunctionalRender: (row) => DownloadBiosamplecCREsButton(row, "ctcf"),
        },
        {
          header: "H3K27ac Signal",
          value: (row) => +!!row.h3k27ac,
          FunctionalRender: (row) => DownloadBiosamplecCREsButton(row, "h3k27ac"),
        },
        {
          header: "H3K4me3 Signal",
          value: (row) => +!!row.h3k4me3,
          FunctionalRender: (row) => DownloadBiosamplecCREsButton(row, "h3k4me3"),
        }
      ]
    }

    if (loadingBiosamples || loading_rnaseq) {
      return <CircularProgress sx={{ margin: "auto" }} />
    }

    if (errorBiosamples || error_rnaseq) {
      return <Typography>Something went wrong fetching biosamples, check the console for more information.</Typography>
    }

    return (
      Object.entries(filteredBiosamples).sort().map(([ontology, biosamples], i) => {
        if ((searchString ? biosamples.find(obj => obj.displayname.toLowerCase().includes(searchString.toLowerCase())) : true) && biosamples.length > 0) {
          const toHighlight = selected ? typeof selected === 'string' ? [selected] : selected : []
          const highlighted = toHighlight.map(x => biosamples.find(y => y.name === x) || biosamples.find(y => y.displayname === x))
          return (
            <Accordion key={i}>
              <AccordionSummary
                expandIcon={<KeyboardArrowRightIcon />}
                sx={{
                  flexDirection: "row-reverse",
                  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                    transform: "rotate(90deg)",
                  },
                }}
              >
                <Typography>{ontology.charAt(0).toUpperCase() + ontology.slice(1)}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <DataTable
                  columns={cols}
                  rows={biosamples}
                  dense
                  searchable
                  highlighted={highlighted}
                  sortColumn={1}
                  onRowClick={onBiosampleClicked}
                />
              </AccordionDetails>
            </Accordion>
          )
        }
      })
    )

  },
    [showRNAseq, showDownloads, loadingBiosamples, loading_rnaseq, errorBiosamples, error_rnaseq, filteredBiosamples, searchString, selected, onBiosampleClicked]
  )

  const FilterCheckbox: React.FC<{ control: FiltersKey }> = ({ control }) => {
    const handleChange = (_, checked: boolean) => {
      const x = { ...checkboxes }
      x[control] = checked
      setCheckboxes(x)
    }

    return (
      <MenuItem dense>
        <FormControlLabel
          checked={checkboxes[control]}
          onChange={handleChange}
          control={<Checkbox />}
          label={checkboxLabels[control]}
        />
      </MenuItem>
    )
  }


  return (
    <Stack component={Paper} height={500} {...slotProps?.paperStack}>
      <Stack direction={"row"} justifyContent={"space-between"} m={2} {...slotProps?.headerStack}>
        <TextField
          value={searchString}
          size="small"
          label="Search Biosamples"
          onChange={(event) => setSearchString(event.target.value)}
          InputProps={{
            endAdornment: searchString ? <IconButton onClick={() => setSearchString("")}><Close/></IconButton> : <InputAdornment position="end"><SearchIcon /></InputAdornment>,
          }} />
        <IconButton onClick={handleClick}>
          <FilterList />
        </IconButton>
      </Stack>
      <Stack overflow={"auto"} {...slotProps?.tableStack}>
        {biosampleTables}
      </Stack>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
        {...slotProps?.menu}
      >
        <Stack padding={2} {...slotProps?.menuStack}>
          <FormControl component="fieldset" variant="standard">
            <FormGroup>
              <FormLabel component="legend">Biosample Types</FormLabel>
              <FilterCheckbox control="CellLine" />
              <FilterCheckbox control="PrimaryCell" />
              <FilterCheckbox control="Tissue" />
              <FilterCheckbox control="Organoid" />
              <FilterCheckbox control="InVitro" />
            </FormGroup>
          </FormControl>
          <FormControl component="fieldset" variant="standard">
            <FormGroup>
              <FormLabel component="legend">Collection</FormLabel>
              <FilterCheckbox control="Core" />
              <FilterCheckbox control="Partial" />
              <FilterCheckbox control="Ancillary" />
            </FormGroup>
          </FormControl>
          <FormControl component="fieldset" variant="standard">
            <FormGroup>
              <FormLabel component="legend">Lifestage</FormLabel>
              <FilterCheckbox control="Embryo" />
              <FilterCheckbox control="Adult" />
            </FormGroup>
          </FormControl>
        </Stack>
      </Menu>
    </Stack>
  )
}

export default BiosampleTables