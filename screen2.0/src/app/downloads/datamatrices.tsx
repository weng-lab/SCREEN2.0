import { useCallback, useEffect, useMemo, useState, useRef } from "react"
import {
  Button,
  Divider,
  Modal,
  Typography,
  Box,
  Stack,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Paper,
  Tooltip
} from "@mui/material"
import { useQuery } from "@apollo/client"
import Grid from "@mui/material/Grid2"
import { Download, Visibility, ZoomIn, ZoomOut, PanTool, Edit, CancelRounded, HighlightAlt } from "@mui/icons-material"
import Image from "next/image"
import humanTransparentIcon from "../../../public/Transparent_HumanIcon.png"
import mouseTransparentIcon from "../../../public/Transparent_MouseIcon.png"
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
import { ParentSize } from '@visx/responsive';
import { Chart } from '../_scatterPlot/scatterPlot'

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
  const [selectMode, setSelectMode] = useState<"select" | "pan">("select")
  const [openModalType, setOpenModalType] = useState<null | "biosamples" | "download">(null);
  const [zoom, setZoom] = useState({ scaleX: 1, scaleY: 1 });
  const [showMiniMap, setShowMiniMap] = useState(false);
  const graphContainerRef = useRef(null);

  const handleZoomIn = useCallback(() => {
      setZoom({
          scaleX: 1.2,
          scaleY: 1.2,
      });
  }, [zoom]);

  const handleZoomOut = useCallback(() => {
      setZoom({
          scaleX: 0.8,
          scaleY: 0.8,
      });
  }, [zoom]);

  const handleReset = useCallback(() => {
    setZoom({
        scaleX: 1,
        scaleY: 1,
    });
  }, [zoom]);

  const toggleMiniMap = useCallback(() => {
    setShowMiniMap(!showMiniMap);
  }, [showMiniMap]);

  const graphRef = useRef(null);

  useEffect(() => {
    const graphElement = graphRef.current;

    const handleWheel = (event: WheelEvent) => {
      // Prevent default scroll behavior when using the wheel in the graph
      event.preventDefault();
    };
    if (graphElement) {
      graphElement.addEventListener('wheel', handleWheel, { passive: false });
    }
    return () => {
      if (graphElement) {
        graphElement.removeEventListener('wheel', handleWheel);
      }
    };
  }, []);

  const handleSetSelectedSample = (selected: any) => {
    setSearched(selected.displayname)
  }

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
  
  useEffect(()=> setBiosamples([]) ,[selectedAssay])

  useEffect(() => {
    // Function to handle key press
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') {
        setSelectMode('pan'); // Switch to pan mode when Shift is pressed
      }
    };

    // Function to handle key release
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setSelectMode('select'); // Switch back to select mode when Shift is released
      }
    };

    // Add event listeners for key press and release
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Clean up event listeners on unmount
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const map = useMemo(() => {
    return {
        show: showMiniMap,
        position: {
            right: 50,
            bottom: 50, 
        },
        ref: graphContainerRef
    };
  }, [showMiniMap]);

  const fData = useMemo(() => {
    return (
      umapData &&
      umapData.ccREBiosampleQuery.biosamples
        .filter((x) => x.umap_coordinates)
        .filter((x) => (lifeStage === "all" || lifeStage === x.lifeStage) && (tSelected.size === 0 || tSelected.has(x[colorBy])))
    )
  }, [umapData, lifeStage, colorBy, tSelected])

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
        (umapData && umapData.ccREBiosampleQuery &&
          umapData.ccREBiosampleQuery.biosamples.filter((x) => x.umap_coordinates && isInbounds(x)).map((x) => x.sampleType)) ||
        []
      ),
    [umapData, isInbounds]
  )
  const [ontologyColors, ontologyCounts] = useMemo(
    () =>
      colorMap(
        (umapData && umapData.ccREBiosampleQuery &&
          //Check if umap coordinates exist, then map each entry to it's ontology (tissue type). This array of strings is passed to colorMap
          umapData.ccREBiosampleQuery.biosamples.filter((x) => x.umap_coordinates && isInbounds(x)).map((x) => x.ontology)) ||
        []
      ),
    [umapData, isInbounds]
  )

  const handleSelectionChange = (selectedPoints) => {
    const selected = selectedPoints.map(point => point.x);
    const selectedBiosamples = fData
        .filter(biosample =>
            selected.includes(biosample.umap_coordinates[0]) &&
            biosample.umap_coordinates
        )
        .map(biosample => ({
            name: biosample.name,
            displayname: biosample.displayname,
            ontology: biosample.ontology,
            sampleType: biosample.sampleType,
            lifeStage: biosample.lifeStage,
            umap_coordinates: biosample.umap_coordinates!,
            experimentAccession: biosample.experimentAccession,
        }));
    setBiosamples(selectedBiosamples);
  };

  const scatterData = useMemo(() => {
    if (!fData) return [];
    const biosampleIds = biosamples.map(sample => sample.umap_coordinates);
  
    return fData.map((x) => {
      const isInBiosample = biosampleIds.includes(x.umap_coordinates);
  
      return {
        x: x.umap_coordinates![0],
        y: x.umap_coordinates![1],
        r: searched && x.displayname === searched ? 5 : 2,
        color: searched === null || x.displayname === searched
          ? (colorBy === "sampleType" ? sampleTypeColors : ontologyColors)[x[colorBy]]
          : "#aaaaaa",
        opacity: biosampleIds.length === 0 ? 1 : (isInBiosample ? 1 : 0.1),
        metaData: {
          name: x.displayname,
          accession: x.experimentAccession
        }
      };
    });
  }, [fData, searched, colorBy, sampleTypeColors, ontologyColors, isInbounds, biosamples]);
  
  const legendEntries = useMemo(() => {
    // Create a color-count map based on scatterData
    const colorCounts = scatterData.reduce((acc, point) => {
      const color = point.color;
      acc[color] = (acc[color] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const colorMapping = colorBy === "sampleType" ? sampleTypeColors : ontologyColors;
  
    // Map the color counts to the same format as before: label, color, and value
    return Object.entries(colorCounts).map(([color, count]) => ({
      label: Object.keys(colorMapping).find(key => colorMapping[key] === color) || color,
      color,
      value: count
    })).sort((a, b) => b.value - a.value);
  }, [scatterData, colorBy, sampleTypeColors, ontologyColors]);
  

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
          borderRight: `0.40rem solid ${selectedAssay && selectedAssay.assembly === variant.assembly && selectedAssay.assay === variant.assay ? borderColor(variant.assay) : "white"}`,
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
    <Grid container mt={1} direction="column" sx={{paddingX:5}}>
      <Stack direction="row" spacing={10}>
        <Stack direction="column" spacing={2}>
          <Stack direction="row" spacing={20}>

            {/* human section */}
            <Stack direction="column" spacing={1}>
              <Grid container direction="row" alignItems="flex-start" spacing={2}>
                <Grid>
                  <Image src={humanTransparentIcon} alt={"Human Icon"} style={{ maxWidth: '75px', maxHeight: '75px' }} />
                </Grid>
                <Grid size="grow">
                  <Stack direction="column" spacing={1}>
                    <Typography variant="h5">Human</Typography>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2"><b>2,348,854</b> cCREs</Typography>
                      <Typography variant="subtitle2"><b>1,678</b> cell types</Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
              <Stack direction="row" spacing={2} alignItems="center">
                {selectorButton({ assembly: "Human", assay: "DNase" })}
                {selectorButton({ assembly: "Human", assay: "H3K4me3" })}
                {selectorButton({ assembly: "Human", assay: "H3K27ac" })}
                {selectorButton({ assembly: "Human", assay: "CTCF" })}
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Grid container spacing={2} sx={{ flex: 1 }}>
                  <Grid size={{ xs: 6}} mt={1}>
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
                  </Grid>
                  <Grid size={{ xs: 6}} mt={1}>
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
                  </Grid>
                </Grid>
              </Stack>
            </Stack>

            {/* mouse section */}
            <Stack direction="column" spacing={1}>
              <Grid container direction="row" alignItems="flex-start" spacing={2}>
                <Grid>
                  <Image src={mouseTransparentIcon} alt={"Mouse Icon"} style={{ maxWidth: '75px', maxHeight: '75px' }} />
                </Grid>
                <Grid size="grow">
                  <Stack direction="column" spacing={1}>
                    <Typography variant="h5">Mouse</Typography>
                    <Divider />
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="subtitle2"><b>926,843</b> cCREs</Typography>
                      <Typography variant="subtitle2"><b>366</b> cell types</Typography>
                    </Stack>
                  </Stack>
                </Grid>
              </Grid>
              <Stack direction="row" spacing={2} alignItems="center">
                {selectorButton({ assembly: "Mouse", assay: "DNase" })}
                {selectorButton({ assembly: "Mouse", assay: "H3K4me3" })}
                {selectorButton({ assembly: "Mouse", assay: "H3K27ac" })}
                {selectorButton({ assembly: "Mouse", assay: "CTCF" })}
              </Stack>
              <Grid container justifyContent="flex-end">
                <Grid size={{ xs: 5.75 }} mt={1}>
                  <InputLabel sx={{ color: 'white' }} id="download-label">Download</InputLabel>
                  <Button sx={{ height: '40px', lineHeight: '20px', textTransform: 'none' }} size="medium" variant="contained" fullWidth endIcon={<Download />} onClick={handleOpenDownloadModal}>Download Data</Button>
                </Grid>
              </Grid>
            </Stack>
          </Stack>

          {/* graph section */}
          <ParentSize>
            {({ width, height }) => {
              const squareSize = Math.min(width, height);

              return (
                <Stack overflow={"hidden"} padding={1} sx={{ border: '2px solid', borderColor: 'grey.400', borderRadius: '8px', height: '57vh', position: 'relative' }} ref={graphContainerRef}>
                  <Stack direction="row" justifyContent="space-between" mt={1} sx={{ backgroundColor: '#dbdefc', borderRadius: '8px', zIndex: 10 }}>
                    <Button endIcon={biosamples.length !== 0 && <Visibility />} onClick={handleOpenModal}>
                      {`${biosamples.length} Experiments Selected`}
                    </Button>
                    <Button onClick={() => setBiosamples([])}>Clear Selection</Button>
                  </Stack>
                  <Stack justifyContent="center" alignItems="center" direction="row" sx={{ position: "relative", maxHeight: height }}>
                    <Box sx={{ width: squareSize, height: squareSize }} ref={graphRef}>
                      <Chart
                        width={squareSize - 25}
                        height={squareSize - 25}
                        pointData={scatterData}
                        loading={umapLoading}
                        selectionType={selectMode}
                        onSelectionChange={handleSelectionChange}
                        zoomScale={zoom}
                        miniMap={map}
                        leftAxisLable="UMAP-2"
                        bottomAxisLabel="UMAP-1"
                      />
                    </Box>
                  </Stack>
                  <Stack direction="column" justifyContent="flex-start" alignItems="center" spacing={5} sx={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }}>
                    <Tooltip title="Drag to select">
                      <IconButton aria-label="edit" onClick={() => setSelectMode('select')} sx={{ color: selectMode === "select" ? "primary.main" : "default" }}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Drag to pan, or hold Shift and drag">
                      <IconButton aria-label="pan" onClick={() => setSelectMode('pan')} sx={{ color: selectMode === "pan" ? "primary.main" : "default" }}>
                        <PanTool />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom In">
                      <IconButton aria-label="zoom-in" onClick={handleZoomIn}>
                        <ZoomIn />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Zoom Out">
                      <IconButton aria-label="zoom-out" onClick={handleZoomOut}>
                        <ZoomOut />
                      </IconButton>
                    </Tooltip>
                    <Button sx={{ height: '30px', textTransform: 'none' }} size="small" variant="outlined" onClick={handleReset}>
                      Reset
                    </Button>
                  </Stack>
                  <Tooltip title="Toggle Minimap">
                    <IconButton sx={{ position: 'absolute', right: 10, bottom: 10, zIndex: 10, width: 'auto', height: 'auto', color: showMiniMap ? "primary.main" : "default" }} size="small" onClick={toggleMiniMap}>
                      <HighlightAlt />
                    </IconButton>
                  </Tooltip>
                </Stack>
              )}
            }
          </ParentSize>
        </Stack>

        {/* biosample table*/}
        <Grid paddingBottom={0} sx={{ display: 'flex', flexDirection: 'column', flex: 1}}>
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
            fetchBiosamplesWith={[selectedAssay.assay.toLowerCase() as ("dnase" | "h3k4me3" | "h3k27ac" | "ctcf")]}
            onChange={handleSetSelectedSample}
            slotProps={{
              paperStack: { overflow: 'hidden', flexGrow: 1 }
            }}
          />
        </Grid>
      </Stack>

      {/* legend section */}
      <Box mt={2} mb={5} sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography mb={1}><b>Legend</b></Typography>
        <Box sx={{ display: 'flex', justifyContent: legendEntries.length / 6 >= 3 ? "space-between" : "flex-start", gap: legendEntries.length / 6 >= 4 ? 0 : 10 }}>
          {Array.from({ length: Math.ceil(legendEntries.length / 6) }, (_, colIndex) => (
            <Box key={colIndex} sx={{ marginRight: 2 }}>
              {legendEntries.slice(colIndex * 6, colIndex * 6 + 6).map((element, index) => (
                <Box key={index} sx={{ display: 'flex', alignItems: 'center', marginBottom: 1 }}>
                  <Box sx={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: element.color, marginRight: 1 }} />
                  <Typography>
                    {`${element.label
                      .split(' ')
                      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                      .join(' ')
                      }: ${element.value}`}
                  </Typography>
                </Box>
              ))}
            </Box>
          ))}
        </Box>
      </Box>

      {/* modals */}
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
          <Stack sx={{ mt: 2 }} spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center">
                <IconButton
                  color="primary"
                  onClick={() => {
                    const url = matrixDownloadURL(selectedAssay, "signal");
                    window.location.href = url;
                  }}
                  >
                  <Download />
                </IconButton>
                <Typography>
                  {selectedAssay.assay === "DNase" ? "Read-Depth Normalized Signal Matrix" : "Fold-Change Signal Matrix"}
                </Typography>
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" alignItems="center">
                <IconButton
                  color="primary"
                  onClick={() => {
                    const url = matrixDownloadURL(selectedAssay, "zScore");
                    window.location.href = url;
                  }}
                  >
                  <Download />
                </IconButton>
                <Typography>Z-Score Matrix</Typography>
              </Stack>
            </Stack>
          </Stack>
          <Stack direction="row" spacing={2} justifyContent="flex-end" sx={{ mt: 3 }}>
            <Button sx={{ textTransform: 'none' }} onClick={handleCloseModal}>Cancel</Button>
          </Stack>
        </Box>
      </Modal>
    </Grid>
  )
}