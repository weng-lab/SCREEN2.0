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
  Paper
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

  const [open, setOpen] = useState(false)
  const handleOpenModal = () => {
    biosamples.length !== 0 && setOpen(true)
  }
  const handleCloseModal = () => setOpen(false)
  
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

  const scatterData = useMemo(
    () =>
      (fData &&
        fData
          .map((x) => ({
            x: x.umap_coordinates[0],
            y: x.umap_coordinates[1],
            svgProps: {
              r: searched && x.displayname === searched ? 10 : 4,
              fill:
                searched === null || x.displayname === searched
                  ? (colorBy === "sampleType" ? sampleTypeColors : ontologyColors)[x[colorBy]]
                  : "#aaaaaa",
              fillOpacity: isInbounds(x) ? (searched === null || x.displayname === searched ? 1 : 0.2) : 0,
            },
          }))) ||
      [],
    [fData, searched, colorBy, sampleTypeColors, ontologyColors, isInbounds]
  )  
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
    <Stack mt={1} direction="column" sx={{height: '100vh', paddingX:6}}>
      <Stack direction="row" justifyContent="space-between" spacing={10} sx={{height: '80vh'}}>
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
                  <Button sx={{ height: '40px' }} size="medium" variant="contained" fullWidth endIcon={<Download />}>Download Data</Button>
                </Grid2>
              </Grid2>
            </Stack>
          </Stack>

          {/* graph section */}
          <Stack justifyContent="space-between" overflow={"hidden"} padding={1} sx={{border: '2px solid', borderColor: 'grey.400', borderRadius: '8px', height: '100%'}}>
            <Stack direction="row" justifyContent="space-between" mt={1} sx={{ backgroundColor: '#dbdefc', borderRadius: '8px' }}>
              <Button endIcon={biosamples.length !== 0 && <Visibility />} onClick={handleOpenModal}>
                {`${biosamples.length} Experiments Selected`}
              </Button>
              <Button onClick={() => setBiosamples([])}>Clear Selection</Button>
            </Stack>
            <Stack alignItems="center">
              <Grid2 xs={8} padding={3} mb={-6} mt={-6}>
                <Chart
                  domain={{ x: { start: xMin, end: xMax }, y: { start: yMin, end: yMax } }}
                  innerSize={{ width: 1075, height: 1000 }}
                  xAxisProps={{ ticks: (bounds ? oneRange : fiveRange)(xMin, xMax), title: "UMAP-1", fontSize: 35 }}
                  yAxisProps={{ ticks: (bounds ? oneRange : fiveRange)(yMin, yMax), title: "UMAP-2", fontSize: 35 }}
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
                        fill={
                          (colorBy === "sampleType" ? sampleTypeColors : ontologyColors)[colorBy === "sampleType" ? fData[tooltip].sampleType : fData[tooltip].ontology]
                        }
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
              </Grid2>
            </Stack>
            <Stack direction="row" justifyContent={"flex-end"} alignItems={"center"} spacing={5}>
              <IconButton aria-label="edit"><Edit /></IconButton>
              <IconButton aria-label="pan"><PanTool /></IconButton>
              <Stack direction="row">
              <IconButton aria-label="zoom-in"><ZoomIn /></IconButton>
              <IconButton aria-label="zoom-out"><ZoomOut /></IconButton>
              </Stack>
              <Button sx={{ height: '30px' }} size="small" disabled={!bounds} variant="outlined" onClick={() => setBounds(undefined)}>Reset</Button>
            </Stack>
          </Stack>
        </Stack>

        {/* biosample table*/}
        <Grid2 paddingBottom={0} sx={{ width: "30%", display: 'flex', flexDirection: 'column' }}>
          {searched && (
            <Paper sx={{ mx: 2, mb: 1 }}>
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
              paperStack: { overflow: 'hidden', flexGrow: 1 } // Allow the table to grow within the container
            }}
          />
        </Grid2>

      </Stack>

      {/* legend section */}
      <Stack mt={2} sx={{ height: '20vh'}}>
        <Typography>Legend</Typography>
          {legendEntries.map((element, index) => {
            return (
              <Typography key={index} borderLeft={`0.2rem solid ${element.color}`} paddingLeft={1}>
                {`${element.label}: ${element.value} experiments`}
              </Typography>
            )
          })}
      </Stack>

      {/* modals */}
      <Modal open={open} onClose={handleCloseModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
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
    </Stack>
    
  )
}

// <div role="tabpanel" id={`simple-tabpanel-${2}`} aria-labelledby={`simple-tab-${2}`}>
    //   <Grid2 container spacing={3} columnSpacing={5}>
    //     <Grid2 container justifyContent="flex-start" alignContent="flex-start" spacing={2} xs={2.5}>
    //       <Grid2 xs={12}>
    //         <Stack direction={"row"} justifyContent={"space-between"}>
    //           <div>
    //             <Typography mt="auto" variant="h5">
    //               Human
    //             </Typography>
    //             <Divider />
    //             <Typography variant="subtitle2">2,348,854 cCREs</Typography>
    //             <Typography variant="subtitle2">1,678 cell types</Typography>
    //           </div>
    //           <Image src={humanTransparentIcon} alt={"Human Icon"} style={{maxWidth: '75px', maxHeight: '75px'}} />
    //         </Stack>
    //       </Grid2>
    //       <Grid2 xs={12}>
    //         {selectorButton({ assembly: "Human", assay: "DNase" })}
    //         {selectorButton({ assembly: "Human", assay: "H3K4me3" })}
    //         {selectorButton({ assembly: "Human", assay: "H3K27ac" })}
    //         {selectorButton({ assembly: "Human", assay: "CTCF" })}
    //       </Grid2>
    //       <Grid2 xs={12}>
    //         <Stack direction={"row"} justifyContent={"space-between"}>
    //           <div>
    //             <Typography mt="auto" variant="h5">
    //               Mouse
    //             </Typography>
    //             <Divider />
    //             <Typography variant="subtitle2">926,843 cCREs</Typography>
    //             <Typography variant="subtitle2">366 cell types</Typography>
    //           </div>
    //           <Image src={mouseTransparentIcon} alt={"Mouse Icon"} style={{maxWidth: '75px', maxHeight: '75px'}} />
    //         </Stack>
    //       </Grid2>
    //       <Grid2 xs={12}>
    //         {selectorButton({ assembly: "Mouse", assay: "DNase" })}
    //         {selectorButton({ assembly: "Mouse", assay: "H3K4me3" })}
    //         {selectorButton({ assembly: "Mouse", assay: "H3K27ac" })}
    //         {selectorButton({ assembly: "Mouse", assay: "CTCF" })}
    //       </Grid2>
    //     </Grid2>
    //     <Grid2 container xs={9.5}>
    //       <Grid2 xs={4}>
    //         <Button
    //           variant="outlined"
    //           fullWidth
    //           onClick={() => null}
    //           endIcon={<Download />}
    //           sx={{ mr: 1, mb: 1, mt: 3, textTransform: "none" }}
    //           href={matrixDownloadURL(selectedAssay, "signal")}
    //         >
    //           {`${selectedAssay.assay === "DNase" ? "Read-Depth Normalized Signal Matrix" : "Fold-Change Signal Matrix"}`}
    //         </Button>
    //         <Button
    //           variant="outlined"
    //           fullWidth
    //           endIcon={<Download />}
    //           sx={{ textTransform: "none", mb: 1 }}
    //           href={matrixDownloadURL(selectedAssay, "zScore")}
    //         >
    //           Z-Score Matrix
    //         </Button>
    //         <Autocomplete
    //           sx={{ mb: 3 }}
    //           disablePortal
    //           id="combo-box-demo"
    //           options={fData}
    //           renderInput={(params) => <TextField {...params} label={"Search for a Biosample"} />}
    //           groupBy={(option) => option.ontology}
    //           getOptionLabel={(biosample: BiosampleUMAP) => biosample.displayname + " — Exp ID: " + biosample.experimentAccession}
    //           blurOnSelect
    //           onChange={(_, value: any) => setSearched(value)}
    //           size="small"
    //         />
    //         <FormControl>
    //           <FormLabel id="demo-radio-buttons-group-label">Color By:</FormLabel>
    //           <RadioGroup
    //             aria-labelledby="demo-radio-buttons-group-label"
    //             name="radio-buttons-group"
    //             sx={{ mb: 2 }}
    //             onChange={(_, value: "ontology" | "sampleType") => setColorBy(value)}
    //             value={colorBy}
    //           >
    //             <FormControlLabel value="ontology" control={<Radio />} label="Tissue/Organ" />
    //             <FormControlLabel value="sampleType" control={<Radio />} label="Biosample type" />
    //           </RadioGroup>
    //         </FormControl>
    //         <FormControl>
    //           <FormLabel id="demo-radio-buttons-group-label">Show:</FormLabel>
    //           <RadioGroup
    //             aria-labelledby="demo-radio-buttons-group-label"
    //             defaultValue="all"
    //             name="radio-buttons-group"
    //             sx={{ mb: 2 }}
    //             onChange={(event: ChangeEvent<HTMLInputElement>, value: string) => setLifeStage(value)}
    //           >
    //             <FormControlLabel value="all" control={<Radio />} label="All" />
    //             <FormControlLabel value="adult" control={<Radio />} label="Adult" />
    //             <FormControlLabel value="embryonic" control={<Radio />} label="Embyronic" />
    //           </RadioGroup>
    //         </FormControl>
    //         <FormControl>
    //           <FormLabel id="demo-radio-buttons-group-label">Hold shift, click, and draw a selection to:</FormLabel>
    //           <RadioGroup
    //             aria-labelledby="demo-radio-buttons-group-label"
    //             defaultValue="select"
    //             name="radio-buttons-group"
    //             onChange={(event: ChangeEvent<HTMLInputElement>, value: "select" | "zoom") => setSelectMode(value)}
    //           >
    //             <FormControlLabel value="select" control={<Radio />} label="Select Experiments" />
    //             <FormControlLabel value="zoom" control={<Radio />} label="Zoom In" />
    //           </RadioGroup>
    //         </FormControl>
    //          <Button disabled={!bounds} variant="contained" onClick={() => setBounds(undefined)}>Reset Zoom</Button>
    //       </Grid2>
    //       <Grid2 xs={8} position={"relative"} padding={2}>
            // <Chart
            //   domain={{ x: { start: xMin, end: xMax }, y: { start: yMin, end: yMax } }}
            //   innerSize={{ width: 1000, height: 1000 }}
            //   xAxisProps={{ ticks: (bounds ? oneRange : fiveRange)(xMin, xMax), title: "UMAP-1", fontSize: 40 }}
            //   yAxisProps={{ ticks: (bounds ? oneRange : fiveRange)(yMin, yMax), title: "UMAP-2", fontSize: 40 }}
            //   scatterData={[scatterData]}
            //   plotAreaProps={{
            //     onFreeformSelectionEnd: (_, c) => setBiosamples(c[0].map((x) => fData[x])),
            //     onSelectionEnd: (x) => handleSetBounds(x),
            //     freeformSelection: selectMode === "select",
            //   }}
            // >
            //   <Scatter
            //     data={scatterData}
            //     pointStyle={{ r: bounds ? 8 : 6 }}
            //     onPointMouseOver={(i,_)=> setTimeout(() => {
            //       setTooltip(i)
            //     }, 100)}
            //     onPointMouseOut={() => setTimeout(() => {
            //       setTooltip(-1)
            //     }, 100)}
            //     onPointClick={(i) => setBiosamples([fData[i]])}
            //   />
            //   {tooltip !== -1 && (
            //     //X and Y attributes added due to error. Not sure if setting to zero has unintended consequences
            //     <Annotation notScaled notTranslated x={0} y={0}>
            //       <rect x={35} y={100} width={740} height={120} strokeWidth={2} stroke="#000000" fill="#ffffffdd" />
            //       <rect x={55} y={120} width={740 * 0.04} height={740 * 0.04} strokeWidth={1} stroke="#000000" fill={(colorBy === "sampleType" ? sampleTypeColors : ontologyColors)[colorBy === "sampleType" ? fData[tooltip].sampleType : fData[tooltip].ontology]} />
            //       <text x={100} y={140} fontSize="26px" fontWeight="bold">
            //         {fData[tooltip].displayname.replace(/_/g, " ").slice(0, 45)}
            //         {fData[tooltip].displayname.length > 45 ? "..." : ""}
            //       </text>
            //       <text x={55} y={185} fontSize="24px">
            //         {fData[tooltip].experimentAccession}
            //       </text>
            //     </Annotation>
            //   )}
            // </Chart>
            // {biosamples.length !== 0 && (
            //   <Stack direction="row" justifyContent="space-between" mb={1}>
            //     <Button endIcon={biosamples.length !== 0 && <Visibility />} onClick={handleOpenModal}>
            //       {`${biosamples.length} Experiments Selected`}
            //     </Button>
            //     <Button onClick={() => setBiosamples([])}>Clear</Button>
            //   </Stack>
            // )}
    //         <Accordion elevation={2}>
    //           <AccordionSummary expandIcon={<ExpandMore />}>Legend</AccordionSummary>
    //           <AccordionDetails>
                // {legendEntries.map((element, index) => {
                //   return (
                //     <Typography key={index} borderLeft={`0.2rem solid ${element.color}`} paddingLeft={1}>
                //       {`${element.label}: ${element.value} experiments`}
                //     </Typography>
                //   )
                // })}
    //           </AccordionDetails>
    //         </Accordion>
    //         {umapLoading &&
    //           <Box
    //               position={"absolute"}
    //               top={0}
    //               left={0}
    //               width={'100%'}
    //               height={'100%'}
    //               display={'flex'}
    //               justifyContent={"center"}
    //               alignItems={"center"}
    //               sx={{
    //                   backdropFilter: 'blur(3px)'
    //               }}
    //           >
    //               <CircularProgress />
    //           </Box>
    //        }
    //       </Grid2>
    //     </Grid2>
    //   </Grid2>
      // <Modal open={open} onClose={handleCloseModal} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      //   <Box sx={style}>
      //     <DataTable
      //       sortDescending
      //       searchable
      //       tableTitle={"Selected Biosamples"}
      //       columns={modalCols}
      //       rows={biosamples}
      //       itemsPerPage={7}
      //     />
      //   </Box>
      // </Modal>
    // </div>