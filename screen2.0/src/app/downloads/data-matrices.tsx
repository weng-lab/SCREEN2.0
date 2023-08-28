import { ChangeEvent, useEffect, useMemo, useState } from "react"
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
  Grid,
  Modal,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  Box,
  Stack,
} from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { ArrowForward, Clear, Download, ExpandMore, Visibility } from "@mui/icons-material"
import Image from "next/image"
import Human from "../../../public/Human2.png"
import Mouse from "../../../public/Mouse2.png"
import { useRouter } from "next/navigation"
import { Chart, Scatter, Legend, Annotation, Range2D } from "jubilant-carnival"
import { DataTable, DataTableColumn } from "@weng-lab/psychscreen-ui-components"
import Config from "../../config.json"
import { BiosampleUMAP } from "./types"
import { DNase_seq } from "../../common/lib/colors"
import { H3K4me3 } from "../../common/lib/colors"
import { H3K27ac } from "../../common/lib/colors"
import { CA_CTCF } from "../../common/lib/colors"
import { ApolloQueryResult } from "@apollo/client"

//Need to type these
interface TabPanelProps {
  children?: React.ReactNode
  value: number
  biosamples: -1 | ApolloQueryResult<any>
  matrices: -1 | ApolloQueryResult<any>
  searchParams: { [key: string]: string | string[] | undefined }
}

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
function tenRange(min, max) {
  const r = []
  for (let i = min; i <= max; i += 10) r.push(i)
  return r
}

// Direct copy from old SCREEN
function oneRange(min, max) {
  const r = []
  for (let i = min; i <= max; ++i) r.push(i)
  return r
}

// Direct copy from old SCREEN
function spacedColors(n) {
  const r = []
  for (let i = 0; i < 360; i += 360 / n) r.push(`hsl(${i},50%,40%)`)
  return r
}

// Direct copy from old SCREEN
function colorMap(strings) {
  const c = {}
  strings.forEach((x) => (c[x] = c[x] ? c[x] + 1 : 1))
  strings = [...new Set(strings)]
  const r = {}
  const colors = spacedColors(strings.length)
  strings.forEach((x, i) => {
    r[x] = colors[i]
  })
  return [r, c]
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

export function DataMatrices(props: TabPanelProps) {
  const [selectedAssay, setSelectedAssay] = useState<Selected>(() => {
    if (
      (props.searchParams.assembly === "Human" || props.searchParams.assembly === "Mouse") &&
      (props.searchParams.assay === "DNase" ||
        props.searchParams.assay === "H3K4me3" ||
        props.searchParams.assay === "H3K27ac" ||
        props.searchParams.assay === "CTCF")
    ) {
      return { assembly: props.searchParams.assembly, assay: props.searchParams.assay }
    } else {
      return { assembly: "Human", assay: "DNase" }
    }
  })
  const [bounds, setBounds] = useState(undefined)
  const [data, setData] = useState<{ ccREBiosampleQuery: { biosamples: BiosampleUMAP[] } }>(props.matrices != -1 ? props.matrices.data : {})
  const [lifeStage, setLifeStage] = useState("all")
  const [colorBy, setColorBy] = useState("sampleType")
  const [tSelected, setTSelected] = useState(new Set([]))
  const [searched, setSearched] = useState<BiosampleUMAP>(null)
  const [biosamples, setBiosamples] = useState<BiosampleUMAP[]>([])
  const [selectMode, setSelectMode] = useState<"select" | "zoom">("select")
  const [tooltip, setTooltip] = useState(-1)

  const [open, setOpen] = useState(false)
  const handleOpenModal = () => {
    biosamples.length !== 0 && setOpen(true)
  }
  const handleCloseModal = () => setOpen(false)

  const router = useRouter()

  //Update data state variable whenever the data changes
  useEffect(() => setData(props.matrices != -1 ? props.matrices.data : {}), [props.matrices])

  // Direct copy from old SCREEN
  const [scMap, scc] = useMemo(
    () =>
      colorMap(
        (data &&
          data.ccREBiosampleQuery &&
          data.ccREBiosampleQuery.biosamples.filter((x) => x.umap_coordinates).map((x) => x.sampleType)) ||
          []
      ),
    [data]
  )
  const [oMap, occ] = useMemo(
    () =>
      colorMap(
        (data && data.ccREBiosampleQuery && data.ccREBiosampleQuery.biosamples.filter((x) => x.umap_coordinates).map((x) => x.ontology)) ||
          []
      ),
    [data]
  )
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
  const scatterData = useMemo(
    () =>
      (fData &&
        fData
          .filter(
            (x) =>
              xMin <= x.umap_coordinates[0] &&
              x.umap_coordinates[0] <= xMax &&
              yMin <= x.umap_coordinates[1] &&
              x.umap_coordinates[1] <= yMax
          )
          .map((x) => ({
            x: x.umap_coordinates[0],
            y: x.umap_coordinates[1],
            svgProps: {
              r: searched && x.experimentAccession === searched.experimentAccession ? 10 : 3,
              fill:
                searched === null || x.experimentAccession === searched.experimentAccession
                  ? (colorBy === "sampleType" ? scMap : oMap)[x[colorBy]]
                  : "#aaaaaa",
              fillOpacity: searched === null || x.experimentAccession === searched.experimentAccession ? 1 : 0.2,
            },
          }))) ||
      [],
    [fData, scMap, colorBy, searched, oMap, xMin, xMax, yMin, yMax]
  )

  // Direct copy from old SCREEN
  const [legendEntries, height] = useMemo(() => {
    const g = colorBy === "sampleType" ? scMap : oMap
    const gc = colorBy === "sampleType" ? scc : occ
    return [Object.keys(g).map((x) => ({ label: x, color: g[x], value: `${gc[x]} experiments` })), Object.keys(g).length * 50]
  }, [scMap, oMap, colorBy, occ, scc])

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
    console.log(bounds)
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
        variant="outlined"
        fullWidth
        onClick={() => {
          if ((selectedAssay && selectedAssay.assembly !== variant.assembly) || selectedAssay.assay !== variant.assay) {
            router.push(`/downloads?tab=2&assembly=${variant.assembly}&assay=${variant.assay}`)
            setSelectedAssay(variant)
          }
        }}
        endIcon={
          selectedAssay && selectedAssay.assembly === variant.assembly && selectedAssay.assay === variant.assay ? <ArrowForward /> : null
        }
        sx={{
          mb: 1,
          textTransform: "none",
          borderLeft: `${
            selectedAssay && selectedAssay.assembly === variant.assembly && selectedAssay.assay === variant.assay ? "1.5rem" : "0.40rem"
          } solid ${borderColor(variant.assay)}`,
          "&:hover": { borderLeft: `1.5rem solid ${borderColor(variant.assay)}` },
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
    <>
      {props.value === 2 && (
        <div role="tabpanel" id={`simple-tabpanel-${2}`} aria-labelledby={`simple-tab-${2}`}>
          <Grid2 container spacing={3} columnSpacing={5}>
            <Grid2 container justifyContent="flex-start" alignContent="flex-start" spacing={2} xs={2.5}>
              <Grid2 xs={8}>
                <Typography mt="auto" variant="h5">
                  Human
                </Typography>
                <Divider />
                <Typography variant="subtitle2">2,348,854 cCREs</Typography>
                <Typography variant="subtitle2">1,678 cell types</Typography>
              </Grid2>
              <Grid2 xs={4}>
                <Image src={Human} alt={"Human Icon"} width={50} />
              </Grid2>
              <Grid2 xs={12}>
                {selectorButton({ assembly: "Human", assay: "DNase" })}
                {selectorButton({ assembly: "Human", assay: "H3K4me3" })}
                {selectorButton({ assembly: "Human", assay: "H3K27ac" })}
                {selectorButton({ assembly: "Human", assay: "CTCF" })}
              </Grid2>
              <Grid2 xs={8}>
                <Typography variant="h5">Mouse</Typography>
                <Divider />
                <Typography variant="subtitle2">926,843 cCREs</Typography>
                <Typography variant="subtitle2">366 cell types</Typography>
              </Grid2>
              <Grid2 xs={4}>
                <Image src={Mouse} alt={"Mouse Icon"} width={50} />
              </Grid2>
              <Grid2 xs={12}>
                {selectorButton({ assembly: "Mouse", assay: "DNase" })}
                {selectorButton({ assembly: "Mouse", assay: "H3K4me3" })}
                {selectorButton({ assembly: "Mouse", assay: "H3K27ac" })}
                {selectorButton({ assembly: "Mouse", assay: "CTCF" })}
              </Grid2>
            </Grid2>
            <Grid2 container xs={9.5}>
              <Grid2 xs={4}>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={() => null}
                  endIcon={<Download />}
                  sx={{ mr: 1, mb: 1, mt: 3, textTransform: "none" }}
                  href={matrixDownloadURL(selectedAssay, "signal")}
                >
                  {`${selectedAssay.assay === "DNase" ? "Read-Depth Normalized Signal Matrix" : "Fold-Change Signal Matrix"}`}
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  endIcon={<Download />}
                  sx={{ textTransform: "none", mb: 1 }}
                  href={matrixDownloadURL(selectedAssay, "zScore")}
                >
                  Z-Score Matrix
                </Button>
                <Autocomplete
                  sx={{ mb: 3 }}
                  disablePortal
                  id="combo-box-demo"
                  options={fData}
                  renderInput={(params) => <TextField {...params} label={"Search for a Biosample"} />}
                  getOptionLabel={(biosample: BiosampleUMAP) => biosample.displayname + " — Exp ID: " + biosample.experimentAccession}
                  blurOnSelect
                  onChange={(_, value: any) => setSearched(value)}
                  size="small"
                />
                <FormControl>
                  <FormLabel id="demo-radio-buttons-group-label">Color By:</FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="sampleType"
                    name="radio-buttons-group"
                    sx={{ mb: 2 }}
                    onChange={(event: ChangeEvent<HTMLInputElement>, value: string) => setColorBy(value)}
                  >
                    <FormControlLabel value="sampleType" control={<Radio />} label="Sample Type" />
                    <FormControlLabel value="ontology" control={<Radio />} label="Ontology" />
                  </RadioGroup>
                </FormControl>
                <FormControl>
                  <FormLabel id="demo-radio-buttons-group-label">Show:</FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="all"
                    name="radio-buttons-group"
                    sx={{ mb: 2 }}
                    onChange={(event: ChangeEvent<HTMLInputElement>, value: string) => setLifeStage(value)}
                  >
                    <FormControlLabel value="all" control={<Radio />} label="All" />
                    <FormControlLabel value="adult" control={<Radio />} label="Adult" />
                    <FormControlLabel value="embryonic" control={<Radio />} label="Embyronic" />
                  </RadioGroup>
                </FormControl>
                <FormControl>
                  <FormLabel id="demo-radio-buttons-group-label">Hold shift, click, and draw a selection to:</FormLabel>
                  <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="select"
                    name="radio-buttons-group"
                    onChange={(event: ChangeEvent<HTMLInputElement>, value: "select" | "zoom") => setSelectMode(value)}
                  >
                    <FormControlLabel value="select" control={<Radio />} label="Select Experiments" />
                    <FormControlLabel value="zoom" control={<Radio />} label="Zoom In" />
                  </RadioGroup>
                </FormControl>
                {bounds && <Button onClick={() => setBounds(undefined)}>Reset Zoom</Button>}
              </Grid2>
              <Grid2 xs={8}>
                <Chart
                  domain={{ x: { start: xMin, end: xMax }, y: { start: yMin, end: yMax } }}
                  innerSize={{ width: 1000, height: 1000 }}
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
                    pointStyle={{ r: bounds ? 6 : 4 }}
                    onPointMouseOver={setTooltip}
                    onPointMouseOut={() => setTooltip(-1)}
                    onPointClick={(i) => setBiosamples([fData[i]])}
                  />
                  {tooltip !== -1 && (
                    //X and Y attributes added due to error. Not sure if setting to zero has unintended consequences
                    <Annotation notScaled notTranslated x={0} y={0}>
                      <rect x={35} y={100} width={740} height={120} strokeWidth={2} stroke="#000000" fill="#ffffffdd" />
                      <rect x={55} y={120} width={740 * 0.04} height={740 * 0.04} strokeWidth={1} stroke="#000000" fill="#00b0d0" />
                      <text x={100} y={140} fontSize="26px" fontWeight="bold">
                        {fData[tooltip].name.replace(/_/g, " ").slice(0, 45)}
                        {fData[tooltip].name.length > 45 ? "..." : ""}
                      </text>
                      <text x={55} y={185} fontSize="24px">
                        {fData[tooltip].experimentAccession}
                      </text>
                    </Annotation>
                  )}
                </Chart>
                {biosamples.length !== 0 && (
                  <Stack direction="row" justifyContent="space-between" mb={1}>
                    <Button endIcon={biosamples.length !== 0 && <Visibility />} onClick={handleOpenModal}>
                      {`${biosamples.length} Experiments Selected`}
                    </Button>
                    <Button onClick={() => setBiosamples([])}>Clear</Button>
                  </Stack>
                )}
                <Accordion elevation={2}>
                  <AccordionSummary expandIcon={<ExpandMore />}>Legend</AccordionSummary>
                  <AccordionDetails>
                    {legendEntries.map((element, index) => {
                      return (
                        <Typography key={index} borderLeft={`0.2rem solid ${element.color}`} paddingLeft={1}>
                          {`${element.label}: ${element.value}`}
                        </Typography>
                      )
                    })}
                  </AccordionDetails>
                </Accordion>
              </Grid2>
            </Grid2>
          </Grid2>
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
        </div>
      )}
    </>
  )
}
