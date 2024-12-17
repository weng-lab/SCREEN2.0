import { Tooltip, Typography, AccordionSummary, AccordionDetails, TextField, CircularProgress,  Accordion, IconButton, Menu, InputAdornment, Paper, Stack, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Box, Button } from "@mui/material"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { useCallback,  useMemo, useState } from "react"
import { BiosampleData, CollectionCheckboxes, LifeStageCheckboxes, BiosampleTablesProps, RegistryBiosample, RegistryBiosamplePlusRNA, SampleTypeCheckboxes } from "./types"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { Check,  Close,  FilterList, RestartAlt } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from "@apollo/client"
import { filterBiosamples } from "./helpers"
import { BIOSAMPLE_QUERY, RNA_SEQ_QUERY } from "./queries"
import { AssayWheel } from "./AssayWheel"
import { DownloadButton } from "./DownloadButton"
import { FilterCheckboxGroup } from "./FilterCheckboxGroup"

export const BiosampleTables = <T extends boolean = false>({
  assembly,
  selected,
  onBiosampleClicked,
  preFilterBiosamples = () => true,
  fetchBiosamplesWith = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"],
  showRNAseq,
  showDownloads,
  slotProps
}: BiosampleTablesProps<T>) => {
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
  
  const handleSetSampleTypeFilter = (newState: SampleTypeCheckboxes) => { setSampleTypeFilter(newState) }
  const handleSetCollectionFilter = (newState: CollectionCheckboxes) => { setCollectionFilter(newState) }
  const handleSetLifeStageFilter = (newState: LifeStageCheckboxes) => { setLifeStageFilter(newState) }
  const handleSetMustHaveRnaSeq = (newState: boolean) => { setMustHaveRnaSeq(newState)}
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

  //Not using generic BiosampleData<T> type since this function is always called on return data without RNAseq t/f data
  const sampleMatchesSearch = useCallback((x: RegistryBiosample | RegistryBiosamplePlusRNA) => {
    if (searchString) {
      return (
        //typeof check needed since rnaseq is a boolean
        Object.values(x).some(val => typeof val === "string" && val?.toLowerCase().includes(searchString.toLowerCase()))
      )
    } else return true
  }, [searchString])

  /**
   * Sorted and Filtered Biosamples
   */
  const filteredBiosamples: { [key: string]: BiosampleData<T>[] } = useMemo(() => {
    if ((biosampleData && (data_rnaseq || !showRNAseq))) {
      const groupedBiosamples: { [key: string]: BiosampleData<T>[] } = {}
      biosampleData.ccREBiosampleQuery.biosamples
        //Add rna seq data if displaying
        .map((biosample) => {
          if (showRNAseq) {
            return {
              ...biosample, 
              rnaseq: data_rnaseq.rnaSeqQuery.map((sample) => sample.biosample).some(sampleName => biosample.name === sampleName)}
          } else return biosample
        })
        //prefilter using user-defined function. Default is () => true
        .filter(preFilterBiosamples)
        //filter by search
        .filter(sampleMatchesSearch)
        //iterate through and put into tissue categories
        .forEach((biosample) => {
          //If tissue hasn't been cataloged yet, define an entry for it
          if (!groupedBiosamples[biosample.ontology]) {
            groupedBiosamples[biosample.ontology] = [];
          }
          groupedBiosamples[biosample.ontology].push(biosample as BiosampleData<T>)
        })
      //filter biosamples
      const filteredBiosamples = filterBiosamples<T>(
        groupedBiosamples,
        sampleTypeFilter,
        collectionFilter,
        lifeStageFilter,
        mustHaveRnaSeq
      )
      return filteredBiosamples
    } else return {}
  }, [biosampleData, data_rnaseq, showRNAseq, preFilterBiosamples, sampleTypeFilter, collectionFilter, lifeStageFilter, mustHaveRnaSeq, sampleMatchesSearch])


  const biosampleTables = useMemo(() => {
    let cols: DataTableColumn<BiosampleData<T>>[] = [
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

    if (showRNAseq) cols.push({
      header: "RNA-Seq",
      value: (row: RegistryBiosamplePlusRNA) => +row.rnaseq,
      render: (row: RegistryBiosamplePlusRNA) => {
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
          render: (row) => <DownloadButton row={row} downloadType="celltypeccres"/>
        },
        {
          header: "DNase Signal",
          value: (row) => +!!row.dnase,
          render: (row) => <DownloadButton row={row} downloadType="dnase"/>
        },
        {
          header: "ATAC Signal",
          value: (row) => +!!row.atac,
          render: (row) => <DownloadButton row={row} downloadType="atac"/>
        },
        {
          header: "CTCF Signal",
          value: (row) => +!!row.ctcf,
          render: (row) => <DownloadButton row={row} downloadType="ctcf"/>
        },
        {
          header: "H3K27ac Signal",
          value: (row) => +!!row.h3k27ac,
          render: (row) => <DownloadButton row={row} downloadType="h3k27ac"/>
        },
        {
          header: "H3K4me3 Signal",
          value: (row) => +!!row.h3k4me3,
          render: (row) => <DownloadButton row={row} downloadType="h3k4me3"/>
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
      Object.entries(filteredBiosamples).sort().map(([ontology, biosamples]) => {
        //Make sure that the accordions won't be empty
        if (biosamples.length > 0) {
          const toHighlight = selected ? typeof selected === 'string' ? [selected] : selected : []
          const highlighted = toHighlight.map(x => biosamples.find(y => y.name === x) || biosamples.find(y => y.displayname === x))
          return (
            <Accordion key={ontology} slotProps={{transition: {unmountOnExit: true}}}>
              <AccordionSummary
                expandIcon={<KeyboardArrowRightIcon />}
                sx={{
                  flexDirection: "row-reverse",
                  "& .MuiAccordionSummary-expandIconWrapper.Mui-expanded": {
                    transform: "rotate(90deg)",
                  },
                }}
              >
                <Typography>{ontology.charAt(0).toUpperCase() + ontology.slice(1) + ` (${biosamples.length})`}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <DataTable
                  columns={cols}
                  rows={biosamples}
                  dense
                  itemsPerPage={5}
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

  }, [showRNAseq, showDownloads, loadingBiosamples, loading_rnaseq, errorBiosamples, error_rnaseq, filteredBiosamples, selected, onBiosampleClicked])

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
          {filtersActive &&
            <Button variant="contained" onClick={handleResetFilters}>
              <i>Reset Filters</i>
            </Button>
          }
        </Stack>
      </Menu>
    </Stack>
  )
}

export default BiosampleTables