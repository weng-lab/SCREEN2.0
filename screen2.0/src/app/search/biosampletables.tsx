import { Tooltip, Typography, AccordionSummary, AccordionDetails, TextField, Box, CircularProgress, FormControlLabel, Accordion, FormGroup, Checkbox, IconButton, Menu, MenuItem, Button, InputAdornment, FormControl, FormLabel, CircularProgressProps } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import { ChangeEvent, Dispatch, SetStateAction, useEffect, useMemo, useState } from "react"
import { filterBiosamples, parseBiosamples, assayHoverInfo } from "./searchhelpers"
import { BiosampleData, BiosampleTableFilters, CellTypeData, RegistryBiosample, RegistryBiosamplePlusRNA } from "./types"
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight"
import { ArrowDropDown, Check, Close, Download } from "@mui/icons-material"
import { ArrowRight } from "@mui/icons-material"
import SearchIcon from '@mui/icons-material/Search';
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr"
import { ApolloQueryResult, TypedDocumentNode, gql } from "@apollo/client"
import { BIOSAMPLE_Data, RNA_SEQ_QUERY } from "../../common/lib/queries"
import { downloadTSV } from "../downloads/utils"

function DownloadBiosamplecCREs(row: RegistryBiosample | RegistryBiosamplePlusRNA, x: "dnase" | "h3k4me3" | "h3k27ac" | "ctcf" | "atac" | "celltypeccres") {
  const [progress, setProgress] = useState<number>(null)
  const [hover, setHover] = useState<boolean>(false)
  const [controller, setController] = useState(null);

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
        url = `https://downloads.wenglab.org/Registry-V4/Signal-Files/${row.dnase}-${row.dnase_signal}.txt`
        fileName = `${row.dnase}-${row.dnase_signal}.txt`
        break
      case "h3k4me3":
        url = `https://downloads.wenglab.org/Registry-V4/Signal-Files/${row.h3k4me3}-${row.h3k4me3_signal}.txt`
        fileName = `${row.h3k4me3}-${row.h3k4me3_signal}.txt`
        break
      case "h3k27ac":
        url = `https://downloads.wenglab.org/Registry-V4/Signal-Files/${row.h3k27ac}-${row.h3k27ac_signal}.txt`
        fileName = `${row.h3k27ac}-${row.h3k27ac_signal}.txt`
        break
      case "ctcf":
        url = `https://downloads.wenglab.org/Registry-V4/Signal-Files/${row.ctcf}-${row.ctcf_signal}.txt`
        fileName = `${row.ctcf}-${row.ctcf_signal}.txt`
        break
      case "atac":
        url = `https://downloads.wenglab.org/Registry-V4/Signal-Files/${row.atac}-${row.atac_signal}.txt`
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

interface Props {
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>,
  assembly: "GRCh38" | "mm10"
  selectedBiosamples: RegistryBiosample[] | RegistryBiosamplePlusRNA[],
  setSelectedBiosamples: Dispatch<SetStateAction<RegistryBiosample[] | RegistryBiosamplePlusRNA[]>>,
  showRNAseq: boolean,
  showDownloads: boolean,
  biosampleSelectMode: "replace" | "append"
  biosampleTableFilters?: BiosampleTableFilters,
  setBiosampleTableFilters?: Dispatch<SetStateAction<BiosampleTableFilters>>,
}

/**
 * 
 * @info Importantly, it's assumed that if showRNAseq is true, selectedbiosamples
 * and setSelectedBiosamples will use the type RegistryBiosamplePlusRNA. 
 * If false, it's assumed to use RegistryBiosample.
 * Not following this may cause unexpected behabior
 */
export const BiosampleTables: React.FC<Props> = ({
  biosampleData,
  assembly,
  selectedBiosamples,
  setSelectedBiosamples,
  showRNAseq,
  showDownloads,
  biosampleSelectMode,
  biosampleTableFilters,
  setBiosampleTableFilters }
) => {
  const [biosampleTableFiltersInternal, setBiosampleTableFiltersInternal] = useState<BiosampleTableFilters>({
    CellLine: { checked: true, label: "Cell Line" },
    PrimaryCell: { checked: true, label: "Primary Cell" },
    Tissue: { checked: true, label: "Tissue" },
    Organoid: { checked: true, label: "Organoid" },
    InVitro: { checked: true, label: "In Vitro Differentiated Cell" },
    Core: { checked: true, label: "Core Collection" },
    Partial: { checked: true, label: "Partial Data Collection" },
    Ancillary: { checked: true, label: "Ancillary Collection" },
    Embryo: { checked: true, label: "Embryo" },
    Adult: { checked: true, label: "Adult" }
  })

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

  // Type guard function to prevent accessing rnaseq field when it doesn't exist
  function isRegistryBiosamplePlusRNA(
    biosample: RegistryBiosample | RegistryBiosamplePlusRNA
  ): biosample is RegistryBiosamplePlusRNA {
    return (biosample as RegistryBiosamplePlusRNA)?.rnaseq !== undefined;
  }

  const filteredBiosamples: BiosampleData = useMemo(() => {
    if ((biosampleData.data && (showRNAseq ? data_rnaseq : true))) {
      return (
        filterBiosamples(
          //Parse raw data into ontology-grouped biosamples
          parseBiosamples(biosampleData.data[assembly === "GRCh38" ? "human" : "mouse"].biosamples, data_rnaseq?.rnaSeqQuery || []),
          sidebar ? biosampleTableFilters.Tissue.checked : biosampleTableFiltersInternal.Tissue.checked,
          sidebar ? biosampleTableFilters.PrimaryCell.checked : biosampleTableFiltersInternal.PrimaryCell.checked,
          sidebar ? biosampleTableFilters.CellLine.checked : biosampleTableFiltersInternal.CellLine.checked,
          sidebar ? biosampleTableFilters.InVitro.checked : biosampleTableFiltersInternal.InVitro.checked,
          sidebar ? biosampleTableFilters.Organoid.checked : biosampleTableFiltersInternal.Organoid.checked,
          sidebar ? biosampleTableFilters.Core.checked : biosampleTableFiltersInternal.Core.checked,
          sidebar ? biosampleTableFilters.Partial.checked : biosampleTableFiltersInternal.Partial.checked,
          sidebar ? biosampleTableFilters.Ancillary.checked : biosampleTableFiltersInternal.Ancillary.checked,
          sidebar ? biosampleTableFilters.Embryo.checked : biosampleTableFiltersInternal.Embryo.checked,
          sidebar ? biosampleTableFilters.Adult.checked : biosampleTableFiltersInternal.Adult.checked,
        )
      )
    } else return {}
  }, [biosampleData, assembly, showRNAseq, data_rnaseq, sidebar, biosampleTableFiltersInternal, biosampleTableFilters])


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
          value: (row) => null,
          unsortable: true,
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
        if (searchString ? biosamples.find(obj => obj.displayname.toLowerCase().includes(searchString.toLowerCase())) : true) {
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
                  }}
                />
              </AccordionDetails>
            </Accordion>
          )
        }
      })
    )

  },
    [filteredBiosamples, selectedBiosamples, searchString, setSelectedBiosamples, biosampleSelectMode, showRNAseq, showDownloads]
  )

  const Checkboxes = (checkboxStates: BiosampleTableFilters, setCheckboxStates: Dispatch<SetStateAction<BiosampleTableFilters>>) => {
    return (
      <Box>
        <Button sx={{ textTransform: "none" }} fullWidth variant="outlined" size="medium" startIcon={Boolean(anchorEl) ? <ArrowDropDown /> : <ArrowRight />} onClick={handleClick}>Sample Type/Collection</Button>
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
            <FormLabel component="legend">Lifestage</FormLabel>
            <FormGroup>
              <MenuItem>
                <FormControlLabel
                  checked={checkboxStates.Embryo.checked}
                  onChange={(_, checked: boolean) => setCheckboxStates({ ...checkboxStates, Embryo: { checked: checked, label: checkboxStates.Embryo.label } })}
                  control={<Checkbox />}
                  label={checkboxStates.Embryo.label}
                />
              </MenuItem>
              <MenuItem>
                <FormControlLabel
                  checked={checkboxStates.Adult.checked}
                  onChange={(_, checked: boolean) => setCheckboxStates({ ...checkboxStates, Adult: { checked: checked, label: checkboxStates.Adult.label } })}
                  control={<Checkbox />}
                  label={checkboxStates.Adult.label}
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
          {(biosampleData && (showRNAseq ? data_rnaseq : true)) ? biosampleTables : <CircularProgress sx={{ margin: "auto" }} />}
        </Box>
      </Grid2>
    </Grid2>
  )
}

export default BiosampleTables