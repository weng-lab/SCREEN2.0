import { Tooltip, Typography, AccordionSummary, AccordionDetails, TextField, CircularProgress, FormControlLabel, Accordion, FormGroup, Checkbox, IconButton, Menu, MenuItem, InputAdornment, FormControl, FormLabel, Paper, Stack } from "@mui/material"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { useCallback,  useMemo, useState } from "react"
import { assay, CheckboxState, FiltersKey, Props, RegistryBiosample, RegistryBiosamplePlusRNA } from "./types"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { Check,  Close,  FilterList, Launch } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from "@apollo/client"
import { assayColors, assayHoverInfo, DownloadBiosamplecCREsButton, filterBiosamples } from "./helpers"
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


  const { data: biosampleData, loading: loadingBiosamples, error: errorBiosamples } = useQuery(
    BIOSAMPLE_QUERY,
    {
      variables: {
        assembly: assembly.toLowerCase() as "grch38" | "mm10"
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
        value: (row) => +!!row.dnase + +!!row.atac + +!!row.ctcf + +!!row.h3k27ac + +!!row.h3k4me3,
        FunctionalRender: (row: RegistryBiosamplePlusRNA) => {
          const [hoveredAssay, setHoveredAssay] = useState<assay>(null)

          //Constants used for sizing svg elements
          const svgHeight = 50
          const svgWidth = 50
          const radius = 10
          const radiusHovered = 12.5 //If assay is hovered, bump up the radius to create the "poking out" effect
          const fifth = (2 * Math.PI * radius) / 5
          const fifthHovered = (2 * Math.PI * radiusHovered) / 5

          const assays: { id: assay, expID: string, color: string, dashArray: string, radius: number }[] = useMemo(() => {
            return [
              {
                id: "DNase",
                expID: row.dnase, //Used to provide link to ENCODE for that experiment
                color: row.dnase ? assayColors.DNase : "transparent", //Only color slice if the biosample has data in that assay
                dashArray: hoveredAssay === "DNase" ? `${fifthHovered} ${fifthHovered * 4}` : `${fifth} ${fifth * 4}`, //Use dasharray to create a single slice of 1/5th of the circle. 
                radius: hoveredAssay === "DNase" ? radiusHovered : radius 
              },
              {
                id: "H3K27ac",
                expID: row.h3k27ac,
                color: row.h3k27ac ? assayColors.H3K27ac : "transparent",
                dashArray: hoveredAssay === "H3K27ac" ? `0 ${fifthHovered} ${fifthHovered} ${fifthHovered * 3}` : `0 ${fifth} ${fifth} ${fifth * 3}`,
                radius: hoveredAssay === "H3K27ac" ? radiusHovered : radius
              },
              {
                id: "H3K4me3",
                expID: row.h3k4me3,
                color: row.h3k4me3 ? assayColors.H3K4me3 : "transparent",
                dashArray: hoveredAssay === "H3K4me3" ? `0 ${fifthHovered * 2} ${fifthHovered} ${fifthHovered * 2}` : `0 ${fifth * 2} ${fifth} ${fifth * 2}`,
                radius: hoveredAssay === "H3K4me3" ? radiusHovered : radius
              },
              {
                id: "CTCF",
                expID: row.ctcf,
                color: row.ctcf ? assayColors.CTCF : "transparent",
                dashArray: hoveredAssay === "CTCF" ? `0 ${fifthHovered * 3} ${fifthHovered} ${fifthHovered * 1}` : `0 ${fifth * 3} ${fifth} ${fifth * 1}`,
                radius: hoveredAssay === "CTCF" ? radiusHovered : radius
              },
              {
                id: "ATAC",
                expID: row.atac,
                color: row.atac ? assayColors.ATAC : "transparent",
                dashArray: hoveredAssay === "ATAC" ? `0 ${fifthHovered * 4} ${fifthHovered}` : `0 ${fifth * 4} ${fifth}`,
                radius: hoveredAssay === "ATAC" ? radiusHovered : radius
              },
            ];
          }, [row.dnase, row.h3k27ac, row.h3k4me3, row.ctcf, row.atac, hoveredAssay, fifthHovered, fifth])

          return (
            <Tooltip
              title={
                <Stack spacing={1}>
                  <Typography variant="body2">
                    {assayHoverInfo({
                      dnase: !!row.dnase,
                      atac: !!row.atac,
                      ctcf: !!row.ctcf,
                      h3k27ac: !!row.h3k27ac,
                      h3k4me3: !!row.h3k4me3
                    })}
                  </Typography>
                  {hoveredAssay && <>
                    <Typography variant="body2">Click to view {hoveredAssay} experiment:</Typography>
                    <Stack direction="row" alignItems={"baseline"}>
                      <Typography variant="body2">{row[hoveredAssay.toLowerCase()]}</Typography>
                      <Launch fontSize="inherit" sx={{ ml: 0.5 }} />
                    </Stack>
                  </>}
                </Stack>
              }
              arrow
              placement="right"
            >
              <svg height={svgHeight} width={svgWidth} viewBox={`0 0 ${svgWidth} ${svgHeight}`}  >
                {/* Provides outline */}
                <circle r={2 * radius + 0.125} cx={svgWidth / 2} cy={svgHeight / 2} fill="#EEEEEE" stroke="black" strokeWidth={0.25} />
                {assays.map((assay) => (
                  assay.expID &&
                  <a
                    key={assay.id}
                    href={`https://www.encodeproject.org/experiments/${assay.expID}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ pointerEvents: 'none' }} // Prevents anchor from interfering with mouse events
                  >
                    <circle
                      cursor={"pointer"}
                      pointerEvents={"auto"}
                      r={assay.radius}
                      cx={svgWidth / 2}
                      cy={svgHeight / 2}
                      fill="transparent"
                      stroke={assay.color}
                      strokeWidth={hoveredAssay === assay.id ? 2 * radiusHovered : 2 * radius}
                      strokeDasharray={assay.dashArray}
                      onMouseEnter={() => setHoveredAssay(assay.id)}
                      onMouseLeave={() => setHoveredAssay(null)}
                      onClick={(event) => event.stopPropagation()}
                    />
                  </a>
                ))}
                {/* Provides dead zone in middle to prevent ATAC wheel from capturing mouse events in center due to it being topmost element */}
                <circle r={radius} cx={svgWidth / 2} cy={svgHeight / 2} fill="white" stroke="black" strokeWidth={0.25} />
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