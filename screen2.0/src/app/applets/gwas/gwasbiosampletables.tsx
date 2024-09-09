import { Tooltip, Typography, AccordionSummary, AccordionDetails, TextField, Box, CircularProgress, FormControlLabel, Accordion, FormGroup, Checkbox, IconButton, Menu, MenuItem, InputAdornment, FormControl, FormLabel, CircularProgressProps, Paper, Stack } from "@mui/material"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { Dispatch, SetStateAction, SyntheticEvent, useEffect, useMemo, useState } from "react"
import { filterBiosamples, parseBiosamples, assayHoverInfo } from "../../search/searchhelpers"
import { BiosampleData, BiosampleTableFilters, RegistryBiosample, RegistryBiosamplePlusRNA } from "../../search/types"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { Check, Close, Download, FilterList } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { ApolloQueryResult, TypedDocumentNode, gql } from "@apollo/client"
import { BIOSAMPLE_Data } from "../../../common/lib/queries"
import { downloadTSV } from "../../downloads/utils"

type RNA_SEQ_Data = {
  rnaSeqQuery: {
    biosample: string
  }[]
}

type RNA_SEQ_Variables = {
  assembly: "mm10" | "grch38",
}

const RNA_SEQ_QUERY: TypedDocumentNode<RNA_SEQ_Data, RNA_SEQ_Variables> = gql`
  query RNASeqQuery($assembly: String!){
    rnaSeqQuery(assembly:$assembly) {
      biosample
    }
  }
`

function DownloadBiosamplecCREs(row: RegistryBiosample | RegistryBiosamplePlusRNA, x: "dnase" | "h3k4me3" | "h3k27ac" | "ctcf" | "atac" | "celltypeccres") {
  const [progress, setProgress] = useState<number>(null) //for progress wheel
  const [hover, setHover] = useState<boolean>(false) //for tracking if user is hovering over progress wheel
  const [controller, setController] = useState(null); //used to hold an AbortController created in handleDL, which allows aborting download

  useEffect(() => {
    return () => {
      // Cleanup: Abort the fetch request if the component is unmounted
      if (controller) {
        controller.abort();
      }
    };
  }, [controller]);

  const handleAbort = () => {
    // Trigger the abort signal
    if (controller) {
      controller.abort();
    }
  };

  function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number},
  ) {
    return (
      <Box
        sx={{ position: 'relative', display: 'inline-flex' }}
      >
        <CircularProgress variant="determinate" {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
  }

  if (row[x] || (x === "celltypeccres" && (row.dnase || row.ctcf || row.h3k27ac || row.h3k4me3))) {
    let url: string
    let fileName: string
    switch (x) {
      case "dnase":
        url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.dnase}-${row.dnase_signal}.txt`
        fileName = `${row.dnase}-${row.dnase_signal}.txt`
        break
      case "h3k4me3":
        url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.h3k4me3}-${row.h3k4me3_signal}.txt`
        fileName = `${row.h3k4me3}-${row.h3k4me3_signal}.txt`
        break
      case "h3k27ac":
        url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.h3k27ac}-${row.h3k27ac_signal}.txt`
        fileName = `${row.h3k27ac}-${row.h3k27ac_signal}.txt`
        break
      case "ctcf":
        url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.ctcf}-${row.ctcf_signal}.txt`
        fileName = `${row.ctcf}-${row.ctcf_signal}.txt`
        break
      case "atac":
        url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.atac}-${row.atac_signal}.txt`
        fileName = `${row.atac}-${row.atac_signal}.txt`
        break
      case "celltypeccres":
        const signalIDs = [
          row.dnase_signal,
          row.h3k4me3_signal,
          row.h3k27ac_signal,
          row.ctcf_signal
        ].filter(id => id !== null && id !== undefined);
        url = `https://downloads.wenglab.org/Registry-V4/${signalIDs.join('_')}.bed`
        fileName = `${signalIDs.join('_')}.bed`
        break
    }

    const handleDL = async () => {
      // Cleanup previous controller if any
      if (controller) {
        controller.abort();
      }

      // Create a new AbortController
      const newController = new AbortController();
      setController(newController);

      // Create a progress callback function
      const handleProgress = (progress) => {
        setProgress((progress.loaded / progress.total) * 100);
      };

      try {
        const response = await fetch(url, {
          signal: newController.signal, // Pass the signal to the fetch request
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const contentLength = +response.headers.get('Content-Length')!;

        let receivedLength = 0;
        let chunks = [];

        const read = async () => {
          const { done, value } = await reader.read();

          if (done) {
            return;
          }

          receivedLength += value!.length;
          chunks.push(value!);

          handleProgress({ loaded: receivedLength, total: contentLength });

          // Continue reading the next chunk unless aborted
          if (!newController.signal.aborted) {
            return read();
          }
        };

        await read();

        if (!newController.signal.aborted) {
          const dataArray = new Uint8Array(receivedLength);
          let position = 0;
          for (const chunk of chunks) {
            dataArray.set(chunk, position);
            position += chunk.length;
          }

          const dataString = new TextDecoder('utf-8').decode(dataArray);

          downloadTSV(dataString, fileName);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          window.alert('Download failed:' + error);
        }
      } finally {
        setController(null);
        setProgress(null);
      }
    };

    return (
      progress ?
        <Box
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {hover ?
            <IconButton onClick={handleAbort}>
              <Close />
            </IconButton>
            :
            <CircularProgressWithLabel value={progress} />
          }
        </Box>
        :
        <IconButton onClick={handleDL}>
          <Download />
        </IconButton>
    )
  } else return null
}

type FiltersKey = "CellLine" | "PrimaryCell" | "Tissue" | "Organoid" | "InVitro" | "Core" | "Partial" | "Ancillary" | "Embryo" | "Adult"

type CheckboxState = {[key in FiltersKey]: boolean}

/**
 * @todo in V2
 * 
 * - Fetch biosample data within this component
 * - Pass selectedBiosamples as string[]
 * - Undo the weird type assumption with showRNAseq that is confusing
 * - Undo biosampleSelectMode, why?
 * - Clarify what passing biosampleTableFilters does
 * - Remove this weird type difference with RegistryBiosample and RegistryBiosamplePlusRNA
 */

interface Props {
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>,
  assembly: "GRCh38" | "mm10"
  selectedBiosamples: RegistryBiosample[] | RegistryBiosamplePlusRNA[],
  setSelectedBiosamples: Dispatch<SetStateAction<RegistryBiosample[] | RegistryBiosamplePlusRNA[]>>,
  onBiosampleClicked?: (selected: RegistryBiosamplePlusRNA) => void,
  showRNAseq: boolean,
  showDownloads: boolean,
  biosampleSelectMode: "replace" | "append"
  biosampleTableFilters?: BiosampleTableFilters,
}

/**
 * 
 * @info Importantly, it's assumed that if showRNAseq is true, selectedbiosamples
 * and setSelectedBiosamples will use the type RegistryBiosamplePlusRNA. 
 * If false, it's assumed to use RegistryBiosample.
 * Not following this may cause unexpected behabior
 */
export const GwasBiosampleTables: React.FC<Props> = ({
  biosampleData,
  assembly,
  selectedBiosamples,
  setSelectedBiosamples,
  onBiosampleClicked,
  showRNAseq,
  showDownloads,
  biosampleSelectMode,
  biosampleTableFilters 
}) => {
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

  const checkboxLabels: {[key in FiltersKey]: string} = {
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

//For searching biosample tables
  const [searchString, setSearchString] = useState<string>("")

  //Anchor for dropdown menu
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const { data: data_rnaseq, loading: loading_rnaseq, error: error_rnaseq } = useQuery(RNA_SEQ_QUERY,
    {
      variables: {
        assembly: assembly.toLowerCase() as ("grch38" | "mm10")
      },
      skip: !showRNAseq,
      fetchPolicy: "cache-first"
    }
  )

  const sidebar = Boolean(biosampleTableFilters)



  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Type guard function to prevent accessing rnaseq field when it doesn't exist
  function isRegistryBiosamplePlusRNA(
    biosample: RegistryBiosample | RegistryBiosamplePlusRNA
  ): biosample is RegistryBiosamplePlusRNA {
    return (biosample as RegistryBiosamplePlusRNA)?.rnaseq !== undefined;
  }

  const filteredBiosamples: BiosampleData = useMemo(() => {
    if ((biosampleData?.data && (showRNAseq ? data_rnaseq : true))) {
      return (
        filterBiosamples(
          //Parse raw data into ontology-grouped biosamples
          parseBiosamples(biosampleData.data[assembly === "GRCh38" ? "human" : "mouse"].biosamples, data_rnaseq?.rnaSeqQuery || []),
          checkboxes.Tissue,
          checkboxes.PrimaryCell,
          checkboxes.CellLine,
          checkboxes.InVitro,
          checkboxes.Organoid,
          checkboxes.Core,
          checkboxes.Partial,
          checkboxes.Ancillary,
          checkboxes.Embryo,
          checkboxes.Adult,
        )
      )
    } else return {}
  }, [biosampleData, assembly, showRNAseq, data_rnaseq, checkboxes])


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
          FunctionalRender: (row) => DownloadBiosamplecCREs(row, "celltypeccres"),
        },
        {
          header: "DNase Signal",
          value: (row) => +!!row.dnase,
          FunctionalRender: (row) => DownloadBiosamplecCREs(row, "dnase"),
        },
        {
          header: "ATAC Signal",
          value: (row) => +!!row.atac,
          FunctionalRender: (row) => DownloadBiosamplecCREs(row, "atac"),
        },
        {
          header: "CTCF Signal",
          value: (row) => +!!row.ctcf,
          FunctionalRender: (row) => DownloadBiosamplecCREs(row, "ctcf"),
        },
        {
          header: "H3K27ac Signal",
          value: (row) => +!!row.h3k27ac,
          FunctionalRender: (row) => DownloadBiosamplecCREs(row, "h3k27ac"),
        },
        {
          header: "H3K4me3 Signal",
          value: (row) => +!!row.h3k4me3,
          FunctionalRender: (row) => DownloadBiosamplecCREs(row, "h3k4me3"),
        }
      ]
    }

    return (
      Object.entries(filteredBiosamples).sort().map(([ontology, biosamples], i) => {
        if ((searchString ? biosamples.find(obj => obj.displayname.toLowerCase().includes(searchString.toLowerCase())) : true) && biosamples.length > 0) {
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
                  search={searchString}
                  //Rows will always have rnaseq columns, so add on if selected biosample will be missing
                  highlighted={isRegistryBiosamplePlusRNA(selectedBiosamples[0]) ? selectedBiosamples : selectedBiosamples.map(x => { return { ...x, rnaseq: false } })}
                  sortColumn={1}
                  onRowClick={(row: RegistryBiosamplePlusRNA, i) => {
                    let x = row
                    if (biosampleSelectMode === "append" && !selectedBiosamples.find((x) => x.displayname === row.displayname)) {
                      if (showRNAseq) {
                        setSelectedBiosamples([...selectedBiosamples, row])
                      } else {
                        //remove rnaseq data if not using
                        delete x.rnaseq
                        setSelectedBiosamples([...selectedBiosamples, x])
                      }
                    } else {
                      setSelectedBiosamples([row])
                    }
                    onBiosampleClicked && onBiosampleClicked(row)
                  }}
                />
              </AccordionDetails>
            </Accordion>
          )
        }
      })
    )

  },
    [filteredBiosamples, selectedBiosamples, searchString, setSelectedBiosamples, biosampleSelectMode, showRNAseq, showDownloads, onBiosampleClicked]
  )

  const FilterCheckbox: React.FC<{control: FiltersKey}> = ({control}) => {
    const handleChange = (_, checked: boolean) => {
      const x = {...checkboxes}
      x[control] = checked
      setCheckboxes(x)
    }
    
    return (
      <MenuItem>
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
    <Paper elevation={0}>
      <Stack direction={"column"} gap={2}>
        <Stack direction={"row"} justifyContent={"space-between"}>
          <TextField
            value={searchString}
            size="small"
            label="Search Biosamples"
            onChange={(event) => setSearchString(event.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end"><SearchIcon /></InputAdornment>,
            }}
          />
          <IconButton onClick={handleClick}>
            <FilterList />
          </IconButton>
        </Stack>
        <Box height={sidebar ? 350 : 500} sx={{ display: 'flex', flexDirection: "column", overflow: "auto" }}>
          {(biosampleData && (showRNAseq ? data_rnaseq : true)) ? biosampleTables : <CircularProgress sx={{ margin: "auto" }} />}
        </Box>
      </Stack>
      {/**
       * @todo fix all this duplication
       *   */}
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
            <FormGroup>
              <FormLabel component="legend">Biosample Types</FormLabel>
              <FilterCheckbox control="CellLine" />
              <FilterCheckbox control="PrimaryCell" />
              <FilterCheckbox control="Tissue" />
              <FilterCheckbox control="Organoid" />
              <FilterCheckbox control="InVitro" />
            </FormGroup>
            <FormGroup>
              <FormLabel component="legend">Collection</FormLabel>
              <FilterCheckbox control="Core" />
              <FilterCheckbox control="Partial" />
              <FilterCheckbox control="Ancillary" />
            </FormGroup>
            <FormGroup>
              <FormLabel component="legend">Lifestage</FormLabel>
              <FilterCheckbox control="Embryo" />
              <FilterCheckbox control="Adult" />
            </FormGroup>
          </FormControl>
        </Menu>
    </Paper>
  )
}

export default GwasBiosampleTables