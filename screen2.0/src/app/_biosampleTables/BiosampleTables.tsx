import { Tooltip, Typography, AccordionSummary, AccordionDetails, TextField, CircularProgress, Accordion, IconButton, Menu, InputAdornment, Paper, Stack, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Box, Button} from "@mui/material"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { useCallback, useMemo, useState } from "react"
import { BiosampleData, CollectionCheckboxes, LifeStageCheckboxes, BiosampleTablesProps, RegistryBiosamplePlusRNA, SampleTypeCheckboxes } from "./types"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { Check, Close, FilterList, RestartAlt, } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from "@apollo/client"
import { filterBiosamples } from "./helpers"
import { BIOSAMPLE_QUERY, RNA_SEQ_QUERY } from "./queries"
import { AssayWheel } from "./AssayWheel"
import { DownloadButton } from "./DownloadButton"
import { FilterCheckboxGroup } from "./FilterCheckboxGroup"
import { AggregateDownloadButton } from "./AggregateDownload"

export const BiosampleTables = <
  HasRNASeq extends boolean = false,
  AllowMultiSelect extends boolean = false
>({
  allowMultiSelect = false as AllowMultiSelect,
  assembly,
  selected,
  onChange,
  preFilterBiosamples = () => true,
  fetchBiosamplesWith = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"],
  showCheckboxes,
  showRNAseq = false as HasRNASeq,
  showDownloads,
  slotProps
}: BiosampleTablesProps<HasRNASeq, AllowMultiSelect>) => {
  const [sampleTypeFilter, setSampleTypeFilter] = useState<SampleTypeCheckboxes>({
    "Cell Line": true,
    "Primary Cell": true,
    "Tissue": true,
    "Organoid": true,
    "In Vitro Differentiated Cells": true,
  })
  const [collectionFilter, setCollectionFilter] = useState<CollectionCheckboxes>({
    "Core Collection": true,
    "Partial Collection": true,
    "Ancillary Collection": true,
  })
  const [lifeStageFilter, setLifeStageFilter] = useState<LifeStageCheckboxes>({
    "Embryo": true,
    "Adult": true
  })
  const [mustHaveRnaSeq, setMustHaveRnaSeq] = useState<boolean>(false)
  const [searchString, setSearchString] = useState<string>("")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)  //Anchor for dropdown menu

  //This should not be necessary, but is needed until DataTable is fixed to refresh when columns are changed.
  //This is needed so that DataTable can be refreshed manually to sync checkbox states without losing page state
  const [pageStates, setPageStates] = useState<{ [key: string]: number }>({})

  const handleSetSampleTypeFilter = (newState: SampleTypeCheckboxes) => { setSampleTypeFilter(newState) }
  const handleSetCollectionFilter = (newState: CollectionCheckboxes) => { setCollectionFilter(newState) }
  const handleSetLifeStageFilter = (newState: LifeStageCheckboxes) => { setLifeStageFilter(newState) }
  const handleSetMustHaveRnaSeq = (newState: boolean) => { setMustHaveRnaSeq(newState) }
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => { setAnchorEl(event.currentTarget) }
  const handleClose = () => { setAnchorEl(null) }


  const { data: biosampleData, loading: loadingBiosamples, error: errorBiosamples } = useQuery(
    BIOSAMPLE_QUERY,
    {
      variables: {
        assembly: assembly.toLowerCase() as "grch38" | "mm10",
        assays: fetchBiosamplesWith
      }
    }
  )

  const { data: data_rnaseq, loading: loading_rnaseq, error: error_rnaseq } = useQuery(
    RNA_SEQ_QUERY,
    {
      variables: {
        assembly: assembly.toLowerCase() as ("grch38" | "mm10")
      },
      skip: !showRNAseq,
      fetchPolicy: "cache-first"
    }
  )

  /**
   * All biosamples which pass the prefilter, with RNA-seq attached if requested
   */
  const unfilteredBiosamples: { [key: string]: BiosampleData<HasRNASeq>[] } = useMemo(() => {
    if ((biosampleData && (data_rnaseq || !showRNAseq))) {
      const groupedBiosamples: { [key: string]: BiosampleData<HasRNASeq>[] } = {}
      biosampleData.ccREBiosampleQuery.biosamples
        //Add rna seq data if displaying
        .map((biosample) => {
          if (showRNAseq) {
            return {
              ...biosample,
              rnaseq: data_rnaseq.rnaSeqQuery.map((sample) => sample.biosample).some(sampleName => biosample.name === sampleName)
            }
          } else return biosample
        })
        //prefilter using user-defined function. Default is () => true
        .filter(preFilterBiosamples)
        //iterate through and put into tissue categories
        .forEach((biosample) => {
          //If tissue hasn't been cataloged yet, define an entry for it
          if (!groupedBiosamples[biosample.ontology]) {
            groupedBiosamples[biosample.ontology] = [];
          }
          groupedBiosamples[biosample.ontology].push(biosample as BiosampleData<HasRNASeq>)
        })
      return groupedBiosamples
    } else return {}
  }, [biosampleData, data_rnaseq, preFilterBiosamples, showRNAseq])

  /**
   * Biosamples filtered by sample/collection/lifeStage/rna-seq/global search
   */
  const filteredBiosamples: { [key: string]: BiosampleData<HasRNASeq>[] } = useMemo(() => {
    return filterBiosamples<HasRNASeq>(
      unfilteredBiosamples,
      sampleTypeFilter,
      collectionFilter,
      lifeStageFilter,
      mustHaveRnaSeq,
      searchString
    )
  }, [unfilteredBiosamples, sampleTypeFilter, collectionFilter, lifeStageFilter, mustHaveRnaSeq, searchString])

  const selectedSamples: BiosampleData<HasRNASeq>[] = useMemo(() => {
    //handle empty string, empty array, or null selected
    if (!selected || (Array.isArray(selected) && selected.length === 0)) return []

    const data = Object.values(unfilteredBiosamples).flat()
    const foundMatches = []

    if (allowMultiSelect) {
      (selected as string[]).forEach(x => {
        const match = data.find(y => (y.name === x) || (y.displayname === x))
        if (match) {
          foundMatches.push(match)
        } else {
          console.error(`Could not find biosample with name or displayname: ${x}`)
        }
      })
    } else {
      foundMatches.push(data.find(sample => (sample.name === selected) || (sample.displayname === selected)))
    }

    return foundMatches
  }, [allowMultiSelect, selected, unfilteredBiosamples])

  const biosampleTables = useMemo(() => {
    const colsToSpread: DataTableColumn<BiosampleData<HasRNASeq>>[] = [
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
        value: (row) => +!!row.dnase + +!!row.atac + +!!row.ctcf + +!!row.h3k27ac + +!!row.h3k4me3,
        render: (row) => <AssayWheel row={row} />,
      }
    ]

    if (showRNAseq) colsToSpread.push({
      header: "RNA-Seq",
      value: (row) => +(row as RegistryBiosamplePlusRNA).rnaseq,
      render: (row) => {
        if ((row as RegistryBiosamplePlusRNA).rnaseq) {
          return (
            <Check />
          )
        }
      },
    })

    if (showDownloads) colsToSpread.push(
      {
        header: "cCREs",
        value: (row) => +!!(row.dnase || row.ctcf || row.h3k27ac || row.h3k4me3),
        render: (row) => <DownloadButton row={row} downloadType="celltypeccres" />
      },
      {
        header: "DNase Signal",
        value: (row) => +!!row.dnase,
        render: (row) => <DownloadButton row={row} downloadType="dnase" />
      },
      {
        header: "ATAC Signal",
        value: (row) => +!!row.atac,
        render: (row) => <DownloadButton row={row} downloadType="atac" />
      },
      {
        header: "CTCF Signal",
        value: (row) => +!!row.ctcf,
        render: (row) => <DownloadButton row={row} downloadType="ctcf" />
      },
      {
        header: "H3K27ac Signal",
        value: (row) => +!!row.h3k27ac,
        render: (row) => <DownloadButton row={row} downloadType="h3k27ac" />
      },
      {
        header: "H3K4me3 Signal",
        value: (row) => +!!row.h3k4me3,
        render: (row) => <DownloadButton row={row} downloadType="h3k4me3" />
      }
    )


    if (loadingBiosamples || loading_rnaseq) {
      return <CircularProgress sx={{ margin: "auto" }} />
    }

    if (errorBiosamples || error_rnaseq) {
      return <Typography>Something went wrong fetching biosamples, check the console for more information.</Typography>
    }

    const handleRowClick = (clicked: BiosampleData<HasRNASeq>) => {
      if (onChange && typeof onChange === 'function') {
        if (allowMultiSelect) {
          //If clicked sample is already selected, remove it, otherwise add it
          if (selectedSamples.some(sample => sample.name === clicked.name)) {
            //using type casting since proper type guard was a big cumbersome
            (onChange as (selected: BiosampleData<HasRNASeq>[]) => void)(selectedSamples.filter(x => x.name !== clicked.name))
          } else {
            (onChange as (selected: BiosampleData<HasRNASeq>[]) => void)([...selectedSamples, clicked])
          }
        } else {
          (onChange as (selected: BiosampleData<HasRNASeq>) => void)(clicked)
        }
      }
    }

    const handleModifyAll = (samples: BiosampleData<HasRNASeq>[], action: "select" | "deselect") => {
      console.log("modifying all")
      if (onChange && typeof onChange === 'function') {
        if (action === "select") {
          const toAdd = samples.filter(sample => !selectedSamples.some(x => x.name === sample.name));
          (onChange as (selected: BiosampleData<HasRNASeq>[]) => void)([...selectedSamples, ...toAdd])
        } else {
          const toRemove = samples.filter(sample => selectedSamples.some(x => x.name === sample.name));
          (onChange as (selected: BiosampleData<HasRNASeq>[]) => void)(selectedSamples.filter(x => !toRemove.includes(x)))
        }
      }
    }

    return (
      Object.entries(filteredBiosamples)
        .sort(([aKey, aValue], [bKey, bValue]) => {
          if (aValue.length === 0 && bValue.length !== 0) return 1;
          if (aValue.length !== 0 && bValue.length === 0) return -1;
          return aKey.localeCompare(bKey);
        })
        .map(([ontology, biosamples]) => {
          const columns = [...colsToSpread]

          const selectAllChecked = biosamples.every(sample => selectedSamples.some(x => x.name === sample.name))
          const selectAllIndeterminate = biosamples.some(sample => selectedSamples.some(x => x.name === sample.name)) && !selectAllChecked

          //needed to add the select all checkbox here since it needs to be in the same scope as biosamples
          if (showCheckboxes) {
            columns.unshift({
              header: "Select All",
              HeaderRender: () => (
                <Checkbox
                  id={"Select All " + ontology}
                  checked={selectAllChecked}
                  indeterminate={selectAllIndeterminate}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleModifyAll(biosamples, selectAllChecked ? "deselect" : "select")
                  }}
                />
              ),
              value: (row) => +selectedSamples.some(x => x.name === row.name),
              render: (row) => (
                <Checkbox
                  checked={selectedSamples.some(x => x.name === row.name)}
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRowClick(row)
                  }}
                />
              ),
            })
          }

          return (
            <Accordion key={ontology} slotProps={{ transition: { unmountOnExit: true } }} disabled={biosamples.length === 0} disableGutters>
              <AccordionSummary
                expandIcon={<KeyboardArrowRightIcon />}
                sx={{
                  flexDirection: "row-reverse",
                  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                    transform: "rotate(90deg)",
                  },
                }}
              >
                <Stack width={"100%"} direction={"row"} alignItems={"center"} justifyContent={"space-between"}>
                  {biosamples.length !== unfilteredBiosamples[ontology].length ?
                    <Typography>{ontology.charAt(0).toUpperCase() + ontology.slice(1)} ({biosamples.length} <span style={{ opacity: 0.5 }}><s>{unfilteredBiosamples[ontology].length}</s></span>)</Typography>
                    : <Typography>{ontology.charAt(0).toUpperCase() + ontology.slice(1) + ` (${biosamples.length})`}</Typography>
                  }
                  {showDownloads && assembly !== "mm10" && (
                    <AggregateDownloadButton ontology={ontology}/>
                  )}
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <DataTable
                  //force refresh when selected samples change - this is hacky
                  key={JSON.stringify(selectedSamples) + biosamples.length}
                  page={pageStates[ontology] || 0}
                  onDisplayedRowsChange={(newPage) => {
                    if (pageStates[ontology] === undefined || pageStates[ontology] !== newPage) {
                      setPageStates({ ...pageStates, [ontology]: newPage })
                    }
                  }}
                  columns={columns}
                  rows={biosamples}
                  dense
                  itemsPerPage={5}
                  searchable
                  highlighted={selectedSamples}
                  sortColumn={1}
                  onRowClick={handleRowClick}
                />
              </AccordionDetails>
            </Accordion>
          )
        })
    )

  }, [showRNAseq, showDownloads, loadingBiosamples, loading_rnaseq, errorBiosamples, error_rnaseq, filteredBiosamples, onChange, allowMultiSelect, selectedSamples, showCheckboxes, unfilteredBiosamples, assembly, pageStates])

  const filtersActive: boolean = useMemo(() => {
    return mustHaveRnaSeq
      || Object.values(sampleTypeFilter).some(val => val !== true)
      || Object.values(collectionFilter).some(val => val !== true)
      || Object.values(lifeStageFilter).some(val => val !== true)
  }, [collectionFilter, lifeStageFilter, mustHaveRnaSeq, sampleTypeFilter])

  const handleResetFilters = useCallback(() => {
    handleSetMustHaveRnaSeq(false)
    handleSetLifeStageFilter(Object.fromEntries(Object.entries(lifeStageFilter).map(([key]) => [key, true])) as LifeStageCheckboxes)
    handleSetSampleTypeFilter(Object.fromEntries(Object.entries(sampleTypeFilter).map(([key]) => [key, true])) as SampleTypeCheckboxes)
    handleSetCollectionFilter(Object.fromEntries(Object.entries(collectionFilter).map(([key]) => [key, true])) as CollectionCheckboxes)
  }, [collectionFilter, lifeStageFilter, sampleTypeFilter])

  return (
    <Stack component={Paper} height={500} {...slotProps?.paperStack}>
      <Stack direction={"row"} justifyContent={"space-between"} m={2} {...slotProps?.headerStack}>
        <TextField
          value={searchString}
          size="small"
          label="Name, Tissue, Exp ID"
          onChange={(event) => setSearchString(event.target.value)}
          slotProps={{ input: { endAdornment: searchString ? <IconButton onClick={() => setSearchString("")}><Close /></IconButton> : <InputAdornment position="end"><SearchIcon /></InputAdornment> } }}
        />
        <Box display={"flex"}>
          {filtersActive &&
            <IconButton onClick={handleResetFilters}>
              <Tooltip title="Reset Filters">
                <RestartAlt />
              </Tooltip>
            </IconButton>
          }
          <IconButton onClick={handleOpen}>
            <Tooltip title="Filter Biosamples">
              <FilterList />
            </Tooltip>
          </IconButton>
        </Box>
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
        <Stack px={2} pt={1} gap={1} {...slotProps?.menuStack}>
          {showRNAseq &&
            <FormControl component="fieldset" variant="standard">
              <FormLabel component="legend">RNA-Seq</FormLabel>
              <FormGroup>
                <FormControlLabel
                  label={"Must Have RNA-Seq"}
                  control={
                    <Checkbox
                      checked={mustHaveRnaSeq}
                      onChange={e => handleSetMustHaveRnaSeq(e.target.checked)}
                    />
                  }
                />
              </FormGroup>
            </FormControl>
          }
          <FilterCheckboxGroup groupLabel="Biosample Types" controlsState={sampleTypeFilter} setState={handleSetSampleTypeFilter} />
          <FilterCheckboxGroup groupLabel="Collection" controlsState={collectionFilter} setState={handleSetCollectionFilter} />
          <FilterCheckboxGroup groupLabel="Life Stage" controlsState={lifeStageFilter} setState={handleSetLifeStageFilter} />
          <Button variant="contained" disabled={!filtersActive} onClick={handleResetFilters}>
            <i>Reset Filters</i>
          </Button>
        </Stack>
      </Menu>
    </Stack>
  )
}

export default BiosampleTables