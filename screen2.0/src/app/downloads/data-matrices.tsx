import { Autocomplete, Button, Divider, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Select, TextField, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { Box } from "@mui/system";
import Image from "next/image";
import Human from "../../../public/Human2.png"
import Mouse from "../../../public/Mouse2.png"
import { ChangeEvent, useEffect, useMemo, useState } from "react";

import { ArrowForward, Clear, Download } from "@mui/icons-material";
import { useRouter } from "next/navigation";

import { Chart, Scatter, Legend, Annotation } from "jubilant-carnival"

import Config from "../../config.json"

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  biosamples: any;
  matrices: any;
}

type Selected = {
  assembly: "Human" | "Mouse"
  assay: "DNase" | "H3K4me3" | "H3K27ac" | "CTCF"
}

// Direct Copy but changed low to be optional since it gives error otherwise
function nearest5(x, low?) {
  if (low) return Math.floor(x) - (x > 0 ? Math.floor(x) % 5 : 5 + (Math.floor(x) % 5))
  return Math.ceil(x) + (x > 0 ? Math.ceil(x) % 5 : 5 + (Math.ceil(x) % 5))
}

function fiveRange(min, max) {
  const r = []
  for (let i = min; i <= max; i += 5) r.push(i)
  return r
}

function tenRange(min, max) {
  const r = []
  for (let i = min; i <= max; i += 10) r.push(i)
  return r
}

function oneRange(min, max) {
  const r = []
  for (let i = min; i <= max; ++i) r.push(i)
  return r
}

function spacedColors(n) {
  const r = []
  for (let i = 0; i < 360; i += 360 / n) r.push(`hsl(${i},50%,40%)`)
  return r
}

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

//When the buttons are clicked, slected is updated but data is not. The URL params change, but it seems like there is no refresh in the query. Why?
// props.matrices is getting updated, but since data is only initialized with it once, it never receives the change

export function DataMatrices(props: TabPanelProps) {
  const [selectedAssay, setSelectedAssay] = useState<Selected>({ assembly: "Human", assay: "DNase" })
  // Direct copy
  const [bounds, setBounds] = useState(undefined)
  // Direct copy, put any since typing was lacking in js file
  const [data, setData] = useState<any>(props.matrices.data ?? {})
  const [lifeStage, setLifeStage] = useState("all")
  const [colorBy, setColorBy] = useState("sampleType")
  const [tSelected, setTSelected] = useState(new Set([]))
  const [searched, setSearched] = useState(null)
  const [biosamples, setBiosamples] = useState([])
  const [selectMode, setSelectMode] = useState("select")
  const [tooltip, setTooltip] = useState(-1)

  const router = useRouter()

  //Update data state variable whenever the data changes
  useEffect(() => setData(props.matrices.data), [props.matrices])

  // Direct Copy
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

  // Direct Copy, FilterData?
  const fData = useMemo(
    () => {
      return (
        data &&
        data.ccREBiosampleQuery &&
        data.ccREBiosampleQuery.biosamples
          .filter((x) => x.umap_coordinates)
          .filter((x) => (lifeStage === "all" || lifeStage === x.lifeStage) && (tSelected.size === 0 || tSelected.has(x[colorBy])))
      )
    }
    ,
    [data, lifeStage, colorBy, tSelected, selectedAssay, props.matrices]
  )

  // Direct Copy
  const scatterData = useMemo(
    () =>
      (fData &&
        fData.map((x) => ({
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
    [fData, scMap, colorBy, searched, oMap]
  )

  // Direct copy
  const xMin = useMemo(
    () => (bounds ? Math.floor(bounds.x.start) : nearest5(Math.min(...((fData && fData.map((x) => x.umap_coordinates[0])) || [0])), true)),
    [fData, bounds]
  )
  const yMin = useMemo(
    () => (bounds ? Math.ceil(bounds.y.end) : nearest5(Math.min(...((fData && fData.map((x) => x.umap_coordinates[1])) || [0])), true)),
    [fData, bounds]
  )
  const xMax = useMemo(
    () => (bounds ? Math.ceil(bounds.x.end) : nearest5(Math.max(...((fData && fData.map((x) => x.umap_coordinates[0])) || [0])))),
    [fData, bounds]
  )
  const yMax = useMemo(
    () => (bounds ? Math.floor(bounds.y.start) : nearest5(Math.max(...((fData && fData.map((x) => x.umap_coordinates[1])) || [0])))),
    [fData, bounds]
  )

  const selectorButton = (variant: Selected) => {
    return (
      <Button
        variant="contained"
        fullWidth
        onClick={() => {
          if (selectedAssay && selectedAssay.assembly !== variant.assembly || selectedAssay.assay !== variant.assay) {
            router.push(`./downloads?tab=2&assembly=${variant.assembly}&assay=${variant.assay}`)
            setSelectedAssay(variant)
          }
        }}
        endIcon={(selectedAssay && selectedAssay.assembly === variant.assembly && selectedAssay.assay === variant.assay) ? <ArrowForward /> : null}
        sx={{ mb: 1 }}
      >
        {`${variant.assay}`}
      </Button>
    )
  }

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
    };
  
    return matrices[selectedAssay.assembly][variant][selectedAssay.assay];
  };

  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${2}`}
      aria-labelledby={`simple-tab-${2}`}
    >
      {props.value === 2 &&
        <Grid2 container spacing={3}>
          <Grid2 container spacing={1} xs={2.5}>
            <Grid2 xs={8}>
              <Typography mt="auto" variant="h5">Human</Typography>
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
            <Grid2 xs={12}>
              <Typography>{`UMAP Embedding: ${selectedAssay.assay} in ${selectedAssay.assembly}`}</Typography>
            </Grid2>
            <Grid2 xs={4}>
              {/* Search box is being fed fData, the data used to populate the table */}
              <Autocomplete
                sx={{ mb: 3 }}
                disablePortal
                id="combo-box-demo"
                options={fData}
                renderInput={(params) => <TextField {...params} label={"Search for a Biosample"} />}
                getOptionLabel={(biosample: {
                  name: string,
                  ontology: string,
                  sampleType: string,
                  lifeStage: string,
                  umap_coordinates: [ number, number ],
                  experimentAccession: string
                }) => biosample.name.replace(/_/g, " ") + " — Exp ID: " + biosample.experimentAccession}
                blurOnSelect
                onChange={(event, value: any) => setSearched(value)}
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
                  onChange={(event: ChangeEvent<HTMLInputElement>, value: string) => setSelectMode(value)}
                >
                  <FormControlLabel value="select" control={<Radio />} label="Select Experiments" />
                  <FormControlLabel value="zoom" control={<Radio />} label="Zoom In" />
                </RadioGroup>
              </FormControl>
              {bounds && <Button onClick={() => setBounds(undefined)}>Reset Zoom</Button>}
              <Button
                variant="outlined"
                fullWidth
                onClick={() => null}
                endIcon={<Download />}
                sx={{ mb: 1, mt: 3 }}
                href={matrixDownloadURL(selectedAssay, "signal")}
              >
                {`${selectedAssay.assay === "DNase" ? "Read-Depth Normalized Signal Matrix" : "Fold-Change Signal Matrix"}`}
              </Button>
              <Button
                variant="outlined"
                fullWidth
                endIcon={<Download />}
                href={matrixDownloadURL(selectedAssay, "zScore")}
              >
                Z-Score Matrix
              </Button>
            </Grid2>
            <Grid2 xs={8}>
              {/* Direct copy */}
              <Chart
                domain={{ x: { start: xMin, end: xMax }, y: { start: yMin, end: yMax } }}
                innerSize={{ width: 1000, height: 1000 }}
                xAxisProps={{ ticks: (bounds ? oneRange : fiveRange)(xMin, xMax), title: "UMAP-1", fontSize: 40 }}
                yAxisProps={{ ticks: (bounds ? oneRange : fiveRange)(yMin, yMax), title: "UMAP-2", fontSize: 40 }}
                scatterData={[scatterData]}
                plotAreaProps={{
                  onFreeformSelectionEnd: (_, c) => setBiosamples(c[0].map((x) => fData[x])),
                  onSelectionEnd: (x) => setBounds(x),
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
                  //X and Y attributes added due to error. What should these be?
                  <Annotation notScaled notTranslated x={0} y={0}>
                    <rect x={35} y={100} width={740} height={120} strokeWidth={2} stroke="#000000" fill="#ffffffdd" />
                    <rect x={55} y={120} width={740 * 0.04} height={740 * 0.04} strokeWidth={1} stroke="#000000" fill="#00b0d0" />
                    <text x={100} y={140} fontSize="26px" fontWeight="bold">
                      {fData[tooltip].name.replace(/_/g, " ").slice(0, 45)}
                      {fData[tooltip].name.length > 45 ? "..." : ""}
                    </text>
                    <text x={55} y={185} fontSize="24px">
                      {fData[tooltip].experimentAccession} · click for associated downloads
                    </text>
                  </Annotation>
                )}
              </Chart>
            </Grid2>
          </Grid2>
        </Grid2>
      }
    </div>
  );
}