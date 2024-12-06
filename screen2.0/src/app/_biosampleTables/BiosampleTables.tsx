import { Tooltip, Typography, AccordionSummary, AccordionDetails, TextField, CircularProgress,  Accordion, IconButton, Menu, InputAdornment, Paper, Stack } from "@mui/material"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { useCallback,  useMemo, useState } from "react"
import { BiosampleData, CollectionCheckboxes, LifeStageCheckboxes, Props, RegistryBiosample, RegistryBiosamplePlusRNA, SampleTypeCheckboxes } from "./types"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { Check,  Close,  FilterList } from "@mui/icons-material"
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
  preFilterBiosamples,
  fetchBiosamplesWith = ["dnase", "h3k4me3", "h3k27ac", "ctcf", "atac"],
  showRNAseq,
  showDownloads,
  slotProps
}: Props<T>) => {
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
  const [searchString, setSearchString] = useState<string>("")
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)  //Anchor for dropdown menu
  
  const handleSetSampleTypeFilter = (newState: SampleTypeCheckboxes) => { setSampleTypeFilter(newState) }
  const handleSetCollectionFilter = (newState: CollectionCheckboxes) => { setCollectionFilter(newState) }
  const handleSetLifeStageFilter = (newState: LifeStageCheckboxes) => { setLifeStageFilter(newState) }
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
        Object.values(x).some(val => val?.toLowerCase().includes(searchString.toLowerCase()))
      )
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
        sampleTypeFilter,
        collectionFilter,
        lifeStageFilter
      )
      return filteredBiosamples
    } else return {}
  }, [biosampleData, data_rnaseq, showRNAseq, preFilterBiosamples, sampleTypeFilter, collectionFilter, lifeStageFilter, searchString, sampleMatchesSearch])


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
      Object.entries(filteredBiosamples).sort().map(([ontology, biosamples], i) => {
        //Make sure that the accordions won't be empty
        if (biosamples.length > 0) {
          const toHighlight = selected ? typeof selected === 'string' ? [selected] : selected : []
          const highlighted = toHighlight.map(x => biosamples.find(y => y.name === x) || biosamples.find(y => y.displayname === x))
          return (
            <Accordion key={i} slotProps={{transition: {unmountOnExit: true}}}>
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
        <IconButton onClick={handleOpen}>
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
          <FilterCheckboxGroup groupLabel="Biosample Types" controlsState={sampleTypeFilter} setState={handleSetSampleTypeFilter} />
          <FilterCheckboxGroup groupLabel="Collection" controlsState={collectionFilter} setState={handleSetCollectionFilter} />
          <FilterCheckboxGroup groupLabel="Life Stage" controlsState={lifeStageFilter} setState={handleSetLifeStageFilter} />
        </Stack>
      </Menu>
    </Stack>
  )
}

export default BiosampleTables