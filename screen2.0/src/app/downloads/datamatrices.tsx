import { ChangeEvent, useCallback, useEffect, useMemo, useState } from "react"
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Autocomplete,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Box,
  Stack,
  Container,
  CircularProgress,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Paper,
  FormGroup,
  Checkbox,
  Tooltip
} from "@mui/material"
import { useQuery } from "@apollo/client"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { ArrowForward, Download, ExpandMore, Visibility, ZoomIn, ZoomOut, PanTool, Edit, CancelRounded } from "@mui/icons-material"
import Image from "next/image"
import humanTransparentIcon from "../../../public/Transparent_HumanIcon.png"
import mouseTransparentIcon from "../../../public/Transparent_MouseIcon.png"
import { Chart, Scatter, Annotation, Range2D } from "jubilant-carnival"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import Config from "../../config.json"
import { BiosampleUMAP } from "./types"
import { DNase_seq } from "../../common/lib/colors"
import { H3K4me3 } from "../../common/lib/colors"
import { H3K27ac } from "../../common/lib/colors"
import { CA_CTCF } from "../../common/lib/colors"
import { tissueColors } from "../../common/lib/colors"
import { client } from "../search/_ccredetails/client"
import { UMAP_QUERY } from "./queries"
import BiosampleTables from "../_biosampleTables/BiosampleTables"
import { RegistryBiosamplePlusRNA } from "../search/types"
import { ParentSize } from '@visx/responsive';

type Selected = {
  assembly: "Human" | "Mouse"
  assay: "DNase" | "H3K4me3" | "H3K27ac" | "CTCF"
}

// Direct copy from old SCREEN but changed low to be optional
function nearest5(x, low?) {
  if (low) return Math.floor(x) - (x > 0 ? Math.floor(x) % 5 : 5 + (Math.floor(x) % 5))
  return Math.ceil(x) + (x > 0 ? Math.ceil(x) % 5 : 5 + (Math.ceil(x) % 5))
}

// Direct copy from old SCREEN
function fiveRange(min, max) {
  const r = []
  for (let i = min; i <= max; i += 5) r.push(i)
  return r
}

// Direct copy from old SCREEN
function oneRange(min, max) {
  const r = []
  for (let i = min; i <= max; ++i) r.push(i)
  return r
}

// Direct copy from old SCREEN
function colorMap(strings) {
  const counts = {}
  //Count the occurences of each tissue/sample
  strings.forEach((x) => (counts[x] = counts[x] ? counts[x] + 1 : 1))
  //Removes duplicate elements in the array
  strings = [...new Set(strings)]
  const colors = {}
  //For each tissue/sample type
  strings.forEach((x) => {
    colors[x] = tissueColors[x] ?? tissueColors.missing
  })
  return [colors, counts]
}

// Styling for selected biosamples modal
const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  boxShadow: 24,
}

// Styling for download modal
const downloadStyle = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "15%",
  boxShadow: 24,
  padding: "16px",
  bgcolor: "background.paper",
  borderRadius: "8px",
};

export function DataMatrices() {
  const [selectedAssay, setSelectedAssay] = useState<Selected>({assembly: "Human", assay: "DNase" })
  
  const {data: umapData, loading: umapLoading} = useQuery(UMAP_QUERY, {
    variables: { assembly: selectedAssay.assembly==="Human" ? "grch38" :"mm10", assay: selectedAssay.assay, a:  selectedAssay.assay.toLowerCase() },
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
    client,
  })  
  const [bounds, setBounds] = useState(undefined)
  const [lifeStage, setLifeStage] = useState("all")
  const [colorBy, setColorBy] = useState<"ontology" | "sampleType">("ontology")
  const [tSelected, setTSelected] = useState(new Set([]))
  const [searched, setSearched] = useState<String>(null)
  const [biosamples, setBiosamples] = useState<BiosampleUMAP[]>([])
  const [selectMode, setSelectMode] = useState<"select" | "zoom">("select")
  const [tooltip, setTooltip] = useState(-1)

  const handleSetSelectedSample = (selected: any) => {
    setSearched(selected.displayname)
  }
  
  const data = useMemo(() =>{
    return umapData && umapData.ccREBiosampleQuery.biosamples.length>0 ? umapData: {} 
  }, [umapData])

  const [openModalType, setOpenModalType] = useState<null | "biosamples" | "download">(null);

  const handleOpenModal = () => {
    if (biosamples.length !== 0) {
      setOpenModalType("biosamples");
    }
  };

  const handleOpenDownloadModal = () => {
    setOpenModalType("download");
  };

  const handleCloseModal = () => {
    setOpenModalType(null);
  };
  
  const [selectedFormats, setSelectedFormats] = useState({
    signal: false,
    zScore: false,
  });
  
  const handleDownload = () => {
    if (selectedFormats.signal) {
      window.location.href = matrixDownloadURL(selectedAssay, "signal");
    }
    if (selectedFormats.zScore) {
      window.location.href = matrixDownloadURL(selectedAssay, "zScore");
    }
  };
  
  
  useEffect(()=> setBiosamples([]) ,[selectedAssay])

  const fData = useMemo(() => {
    return (
      data &&
      data.ccREBiosampleQuery &&
      data.ccREBiosampleQuery.biosamples
        .filter((x) => x.umap_coordinates)
        .filter((x) => (lifeStage === "all" || lifeStage === x.lifeStage) && (tSelected.size === 0 || tSelected.has(x[colorBy])))
    )
  }, [data, lifeStage, colorBy, tSelected])

  const xMin = useMemo(
    () => (bounds ? Math.floor(bounds.x.start) : nearest5(Math.min(...((fData && fData.map((x) => x.umap_coordinates[0])) || [0])), true)),
    [fData, bounds]
  )
  const yMin = useMemo(
    () => (bounds ? Math.floor(bounds.y.start) : nearest5(Math.min(...((fData && fData.map((x) => x.umap_coordinates[1])) || [0])), true)),
    [fData, bounds]
  )
  const xMax = useMemo(
    () => (bounds ? Math.ceil(bounds.x.end) : nearest5(Math.max(...((fData && fData.map((x) => x.umap_coordinates[0])) || [0])))),
    [fData, bounds]
  )
  const yMax = useMemo(
    () => (bounds ? Math.ceil(bounds.y.end) : nearest5(Math.max(...((fData && fData.map((x) => x.umap_coordinates[1])) || [0])))),
    [fData, bounds]
  )

  const isInbounds = useCallback((x) => {
    return (
      xMin <= x.umap_coordinates[0] &&
      x.umap_coordinates[0] <= xMax &&
      yMin <= x.umap_coordinates[1] &&
      x.umap_coordinates[1] <= yMax
    )
  }, [xMax, xMin, yMax, yMin])

  const [sampleTypeColors, sampleTypeCounts] = useMemo(
    () =>
      colorMap(
        (data && data.ccREBiosampleQuery &&
          data.ccREBiosampleQuery.biosamples.filter((x) => x.umap_coordinates && isInbounds(x)).map((x) => x.sampleType)) ||
        []
      ),
    [data, isInbounds]
  )
  const [ontologyColors, ontologyCounts] = useMemo(
    () =>
      colorMap(
        (data && data.ccREBiosampleQuery &&
          //Check if umap coordinates exist, then map each entry to it's ontology (tissue type). This array of strings is passed to colorMap
          data.ccREBiosampleQuery.biosamples.filter((x) => x.umap_coordinates && isInbounds(x)).map((x) => x.ontology)) ||
        []
      ),
    [data, isInbounds]
  )

  const scatterData = useMemo(() => {
    if (!fData) return [];
    const biosampleIds = biosamples.map(sample => sample.umap_coordinates);
  
    return fData.map((x) => {
      const isInBiosample = biosampleIds.includes(x.umap_coordinates);
  
      return {
        x: x.umap_coordinates[0],
        y: x.umap_coordinates[1],
        svgProps: {
          r: searched && x.displayname === searched ? 10 : 4,
          fill:
            searched === null || x.displayname === searched
              ? (colorBy === "sampleType" ? sampleTypeColors : ontologyColors)[x[colorBy]]
              : "#aaaaaa",
              fillOpacity: biosampleIds.length === 0? 1 : (isInBiosample ? 1 : 0.1),
        },
      };
    });
  }, [fData, searched, colorBy, sampleTypeColors, ontologyColors, isInbounds, biosamples]);
  
  // Direct copy from old SCREEN
  const [legendEntries, height] = useMemo(() => {
    const g = colorBy === "sampleType" ? sampleTypeColors : ontologyColors
    const gc = colorBy === "sampleType" ? sampleTypeCounts : ontologyCounts
    return [Object.keys(g).map((x) => ({ label: x, color: g[x], value: gc[x] })).sort((a,b) => b.value - a.value), Object.keys(g).length * 50]
  }, [colorBy, sampleTypeColors, ontologyColors, sampleTypeCounts, ontologyCounts])

  /**
   * Checks and reverses the order of coordinates provided by Jubilant Carnival selection if needed, then calls setBounds()
   * @param bounds a Range2D object to check
   */
  function handleSetBounds(bounds: Range2D) {
    if (bounds.x.start > bounds.x.end) {
      const tempX = bounds.x.start
      bounds.x.start = bounds.x.end
      bounds.x.end = tempX
    }
    if (bounds.y.start > bounds.y.end) {
      const tempY = bounds.y.start
      bounds.y.start = bounds.y.end
      bounds.y.end = tempY
    }
    setBounds(bounds)
  }

  /**
   * @param assay an assay
   * @returns the corresponding color for the given assay
   */
  function borderColor(assay: Selected["assay"]) {
    switch (assay) {
      case "DNase":
        return DNase_seq
      case "H3K4me3":
        return H3K4me3
      case "H3K27ac":
        return H3K27ac
      case "CTCF":
        return CA_CTCF
    }
  }

  // Assay selectors
  const selectorButton = (variant: Selected) => {
    return (
      <Button
        variant="text"
        fullWidth
        onClick={() => {
          setBounds(undefined)  
          setSelectedAssay(variant)
        }}
        sx={{
          mb: 1,
          textTransform: "none",
          backgroundColor: `${selectedAssay && selectedAssay.assembly === variant.assembly && selectedAssay.assay === variant.assay ? borderColor(variant.assay) : "initial"}`,
          borderLeft: `0.40rem solid ${borderColor(variant.assay)}`,
          color: `${selectedAssay && selectedAssay.assembly === variant.assembly && selectedAssay.assay === variant.assay && selectedAssay.assay === "H3K4me3" ? "white" : "initial"}`,
          boxShadow: '0px 5px 5px rgba(0, 0, 0, 0.25)',
          "&:hover": {
            transform: 'translateY(-0.75px)',
            boxShadow: '0px 8px 12px rgba(0, 0, 0, 0.35)',
            backgroundColor: `${selectedAssay && selectedAssay.assembly === variant.assembly && selectedAssay.assay === variant.assay ? borderColor(variant.assay) : "initial"}`,
          },
        }}
      >
        {`${variant.assay}`}
      </Button>
    )
  }

  /**
   *
   * @param selectedAssay The selected assembly & assay
   * @param variant "signal" or "zScore"
   * @returns The corresponding download URL
   */
  const matrixDownloadURL = (selectedAssay: Selected, variant: "signal" | "zScore") => {
    const matrices = {
      Human: {
        signal: {
          DNase: Config.Downloads.HumanDNaseSignalMatrix,
          H3K4me3: Config.Downloads.HumanPromoterSignalMatrix,
          H3K27ac: Config.Downloads.HumanEnhancerSignalMatrix,
          CTCF: Config.Downloads.HumanCTCFSignalMatrix,
        },
        zScore: {
          DNase: Config.Downloads.HumanDNaseZScoreMatrix,
          H3K4me3: Config.Downloads.HumanPromoterZScoreMatrix,
          H3K27ac: Config.Downloads.HumanEnhancerZScoreMatrix,
          CTCF: Config.Downloads.HumanCTCFZScoreMatrix,
        },
      },
      Mouse: {
        signal: {
          DNase: Config.Downloads.MouseDNaseSignalMatrix,
          H3K4me3: Config.Downloads.MousePromoterSignalMatrix,
          H3K27ac: Config.Downloads.MouseEnhancerSignalMatrix,
          CTCF: Config.Downloads.MouseCTCFSignalMatrix,
        },
        zScore: {
          DNase: Config.Downloads.MouseDNaseZScoreMatrix,
          H3K4me3: Config.Downloads.MousePromoterZScoreMatrix,
          H3K27ac: Config.Downloads.MouseEnhancerZScoreMatrix,
          CTCF: Config.Downloads.MouseCTCFZScoreMatrix,
        },
      },
    }
    return matrices[selectedAssay.assembly][variant][selectedAssay.assay]
  }

  // Columns for selected biosample modal
  const modalCols: DataTableColumn<BiosampleUMAP>[] = [
    {
      header: "Experimental Accession",
      value: (row: BiosampleUMAP) => row.experimentAccession,
    },
    {
      header: "Biosample Name",
      value: (row: BiosampleUMAP) => row.displayname,
    },
    {
      header: "Tissue",
      value: (row: BiosampleUMAP) => row.ontology ?? "",
    },
  ]

  return (
    <Stack mt={1} direction="column" sx={{paddingX:6}}>
      <Stack direction="row" justifyContent="space-between" spacing={10} >
        <Stack direction="column" sx={{ flex: 1.5 }} spacing={2}>
          <Stack direction="row" spacing={15}>

            {/* human section */}
            <Stack direction="column" spacing={1} sx={{ flex: 1 }}>
              <Grid2 container direction="row" alignItems="flex-start" spacing={2}>
                <Grid2>
                  <Image src={humanTransparentIcon} alt={"Human Icon"} style={{ maxWidth: '75px', maxHeight: '75px' }} />
                </Grid2>
                <Grid2 xs>
                  <Stack direction="column" spacing={1}>
                    <Typography variant="h5">Human</Typography>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Typography variant="subtitle2"><b>2,348,854</b> cCREs</Typography>
                      <Typography variant="subtitle2"><b>1,678</b> cell types</Typography>
                    </Stack>
                  </Stack>
                </Grid2>
              </Grid2>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                {selectorButton({ assembly: "Human", assay: "DNase" })}
                {selectorButton({ assembly: "Human", assay: "H3K4me3" })}
                {selectorButton({ assembly: "Human", assay: "H3K27ac" })}
                {selectorButton({ assembly: "Human", assay: "CTCF" })}
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Grid2 container spacing={2} sx={{ flex: 1 }}>
                  <Grid2 xs={6}>
                    <Stack mt={1}>
                      <InputLabel id="color-by-label">Color By</InputLabel>
                      <Select
                        size="small"
                        id="color-by"
                        value={colorBy}
                        onChange={(event: SelectChangeEvent) => {
                          setColorBy(event.target.value as "ontology" | "sampleType");
                        }}
                        fullWidth
                      >
                        <MenuItem value="ontology">Tissue/Organ</MenuItem>
                        <MenuItem value="sampleType">Biosample Type</MenuItem>
                      </Select>
                    </Stack>
                  </Grid2>
                  <Grid2 xs={6}>
                    <Stack mt={1}>
                      <InputLabel id="show-label">Show</InputLabel>
                      <Select
                        size="small"
                        id="show"
                        value={lifeStage}
                        onChange={(event: SelectChangeEvent) => {
                          setLifeStage(event.target.value as "all" | "adult" | "embryonic");
                        }}
                        fullWidth
                      >
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="adult">Adult</MenuItem>
                        <MenuItem value="embryonic">Embryonic</MenuItem>
                      </Select>
                    </Stack>
                  </Grid2>
                </Grid2>
              </Stack>
            </Stack>

            {/* mouse section */}
            <Stack direction="column" spacing={1} sx={{ flex: 1 }}>
              <Grid2 container direction="row" alignItems="flex-start" spacing={2}>
                <Grid2>
                  <Image src={mouseTransparentIcon} alt={"Mouse Icon"} style={{ maxWidth: '75px', maxHeight: '75px' }} />
                </Grid2>
                <Grid2 xs>
                  <Stack direction="column" spacing={1}>
                    <Typography variant="h5">Mouse</Typography>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between" spacing={2}>
                      <Typography variant="subtitle2"><b>926,843</b> cCREs</Typography>
                      <Typography variant="subtitle2"><b>366</b> cell types</Typography>
                    </Stack>
                  </Stack>
                </Grid2>
              </Grid2>
              <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                {selectorButton({ assembly: "Mouse", assay: "DNase" })}
                {selectorButton({ assembly: "Mouse", assay: "H3K4me3" })}
                {selectorButton({ assembly: "Mouse", assay: "H3K27ac" })}
                {selectorButton({ assembly: "Mouse", assay: "CTCF" })}
              </Stack>
              <Grid2 container justifyContent="flex-end">
                <Grid2 xs={5.75} mt={1}>
                  <InputLabel sx={{ color: 'white' }} id="download-label">Download</InputLabel>
                  <Button sx={{ height: '40px', lineHeight: '20px' }} size="medium" variant="contained" fullWidth endIcon={<Download />} onClick={handleOpenDownloadModal}>Download Data</Button>
                </Grid2>
              </Grid2>
            </Stack>
          </Stack>

          {/* graph section */}
          <ParentSize>
            {({ width, height }) => {
              const squareSize = Math.min(width, height);

              // simulate shift key being pressed
              let shiftDownEvent = new KeyboardEvent('keydown', {
                key: 'Shift',
                keyCode: 16,
                code: 'ShiftLeft',
                location: 1,
                ctrlKey: false,
                shiftKey: true,
                altKey: false,
                metaKey: false,
                bubbles: true,
              });
              document.dispatchEvent(shiftDownEvent);

              return (
                <Stack justifyContent="space-between" overflow={"hidden"} padding={1} sx={{ border: '2px solid', borderColor: 'grey.400', borderRadius: '8px', maxHeight: '57vh'}}>
                  <Stack direction="row" justifyContent="space-between" mt={1} sx={{ backgroundColor: '#dbdefc', borderRadius: '8px', zIndex: 10 }}>
                    <Button endIcon={biosamples.length !== 0 && <Visibility />} onClick={handleOpenModal}>
                      {`${biosamples.length} Experiments Selected`}
                    </Button>
                    <Button onClick={() => setBiosamples([])}>Clear Selection</Button>
                  </Stack>
                  <Stack justifyContent="center" alignItems="center" direction="row" sx={{ flex: 1, position: "relative", maxHeight: height }} mt={-5}>
                    <Box sx={{ width: squareSize, height: squareSize }}>
                        <Chart
                          domain={{ x: { start: xMin, end: xMax }, y: { start: yMin, end: yMax } }}
                          innerSize={{ width: squareSize*2, height: squareSize*2}}
                          xAxisProps={{ ticks: (bounds ? oneRange : fiveRange)(xMin, xMax), title: "UMAP-1", fontSize: 40 }}
                          yAxisProps={{ ticks: (bounds ? oneRange : fiveRange)(yMin, yMax), title: "UMAP-2", fontSize: 40 }}
                          scatterData={[scatterData]}
                          plotAreaProps={{
                            onFreeformSelectionEnd: (_, c) => setBiosamples(c[0].map((x) => fData[x])),
                            onSelectionEnd: (x) => handleSetBounds(x),
                            freeformSelection: selectMode === "select",
                          }}
                        >
                          <Scatter
                            data={scatterData}
                            pointStyle={{ r: bounds ? 8 : 6 }}
                            onPointMouseOver={(i, _) => setTimeout(() => setTooltip(i), 100)}
                            onPointMouseOut={() => setTimeout(() => setTooltip(-1), 100)}
                            onPointClick={(i) => setBiosamples([fData[i]])}
                          />
                          {tooltip !== -1 && (
                            <Annotation notScaled notTranslated x={0} y={0}>
                              <rect x={35} y={100} width={740} height={120} strokeWidth={2} stroke="#000000" fill="#ffffffdd" />
                              <rect
                                x={55}
                                y={120}
                                width={740 * 0.04}
                                height={740 * 0.04}
                                strokeWidth={1}
                                stroke="#000000"
                                fill={(colorBy === "sampleType" ? sampleTypeColors : ontologyColors)[colorBy === "sampleType" ? fData[tooltip].sampleType : fData[tooltip].ontology]}
                              />
                              <text x={100} y={140} fontSize="26px" fontWeight="bold">
                                {fData[tooltip].displayname.replace(/_/g, " ").slice(0, 45)}
                                {fData[tooltip].displayname.length > 45 ? "..." : ""}
                              </text>
                              <text x={55} y={185} fontSize="24px">
                                {fData[tooltip].experimentAccession}
                              </text>
                            </Annotation>
                          )}
                        </Chart>
                      </Box>
                    <Stack direction="row" justifyContent={"flex-end"} alignItems={"center"} spacing={5} sx={{position: "absolute", right: 0, bottom: 20}}>
                      <Tooltip title="Drag to Select">
                        <IconButton aria-label="edit" onClick={() => setSelectMode('select')} sx={{ color: selectMode === "select" ? "primary.main" : "default" }}><Edit /></IconButton>
                      </Tooltip>
                      {/* <IconButton aria-label="pan"><PanTool /></IconButton> */}
                        <Tooltip title="Drag to Zoom In">
                          <IconButton aria-label="zoom-in" onClick={() => setSelectMode('zoom')} sx={{ color: selectMode === "zoom" ? "primary.main" : "default" }}><ZoomIn /></IconButton>
                         </Tooltip> 
                        {/* <IconButton aria-label="zoom-out"><ZoomOut /></IconButton> */}
                      <Button sx={{ height: '30px' }} size="small" disabled={!bounds} variant="outlined" onClick={() => setBounds(undefined)}>Reset</Button>
                    </Stack>
                  </Stack>
                </Stack>
              )}}
          </ParentSize>
        </Stack>

        {/* biosample table*/}
        <Grid2 paddingBottom={0} sx={{ width: "30%", display: 'flex', flexDirection: 'column', flex: 1}}>
          {searched && (
            <Paper sx={{ mb: 1 }}>
              <Stack borderRadius={1} direction={"row"} spacing={3} sx={{ backgroundColor: "#E7EEF8" }} alignItems={"center"}>
                <Typography flexGrow={1} sx={{ color: "#2C5BA0", pl: 1 }}>{searched}</Typography>
                <IconButton onClick={() => setSearched(null)} sx={{ m: 'auto', flexGrow: 0 }}>
                  <CancelRounded />
                </IconButton>
              </Stack>
            </Paper>
          )}
          <BiosampleTables
            assembly={selectedAssay?.assembly === "Human" ? "GRCh38" : "mm10"}
            preFilterBiosamples={(sample: RegistryBiosamplePlusRNA) => sample[selectedAssay.assay.toLowerCase()] !== null}
            onBiosampleClicked={handleSetSelectedSample}
            slotProps={{
              paperStack: { overflow: 'hidden', flexGrow: 1 }
            }}
          />
        </Grid2>
      </Stack>

      {/* legend section */}
      <Box mt={2} mb={5} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography sx={{ width: '100%' }} mb={1}>Legend</Typography>
        <Box sx={{ display: 'flex' }} justifyContent={"space-between"}>
          {Array.from({ length: Math.ceil(legendEntries.length / 6) }, (_, colIndex) => (
            <Box key={colIndex} sx={{ marginRight: 2 }}>
              {legendEntries.slice(colIndex * 6, colIndex * 6 + 6).map((element, index) => (
                <Box key={index} sx={{display: 'flex', alignItems: 'center', marginBottom: 1,}}>
                  <Box sx={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: element.color, marginRight: 1,}}/>
                  <Typography>{`${element.label}: ${element.value}`}</Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* modals */}
      {/* Selection table modal */}
      <Modal open={openModalType === "biosamples"} onClose={handleCloseModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
        <Box sx={style}>
          <DataTable
            sortDescending
            searchable
            tableTitle={"Selected Biosamples"}
            columns={modalCols}
            rows={biosamples}
            itemsPerPage={7}
          />
        </Box>
      </Modal>

      {/* Download modal */}
      <Modal
        open={openModalType === "download"}
        onClose={handleCloseModal}
        aria-labelledby="download-modal-title"
        aria-describedby="download-modal-description"
      >
        <Box sx={downloadStyle}>
          <Typography id="download-modal-title" variant="h6">
            Download
          </Typography>
          <Typography id="download-modal-description" variant="subtitle1" sx={{ mt: 1 }}>
            Select format to download
          </Typography>
          <FormGroup sx={{ mt: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedFormats.signal}
                  onChange={(e) => setSelectedFormats({ ...selectedFormats, signal: e.target.checked })}
                />
              }
              label={selectedAssay.assay === "DNase" ? "Read-Depth Normalized Signal Matrix" : "Fold-Change Signal Matrix"}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={selectedFormats.zScore}
                  onChange={(e) => setSelectedFormats({ ...selectedFormats, zScore: e.target.checked })}
                />
              }
              label="Z-Score Matrix"
            />
          </FormGroup>
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button onClick={handleCloseModal}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleDownload}
              disabled={!selectedFormats.signal && !selectedFormats.zScore}
            >
              Download
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Stack>
  )
}