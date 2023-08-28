import { Button, ButtonProps, IconButton, Paper, Tooltip, Typography, Modal, Container, Divider } from "@mui/material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Box } from "@mui/system"
import React, { useMemo } from "react"
import Config from "../../config.json"
import DownloadIcon from "@mui/icons-material/Download"
import SearchIcon from "@mui/icons-material/Search"
import { CA_CTCF, CA_H3K4me3, CA_TF, CA_only, PLS, TF_only, dELS, pELS } from "../../common/lib/colors"
import { DataTable, DataTableColumn, DataTableProps } from "@weng-lab/psychscreen-ui-components"
import { Biosample } from "./types"
import Image from "next/image"
import Human from "../../../public/Human2.png"
import Mouse from "../../../public/Mouse2.png"
import { ApolloQueryResult } from "@apollo/client"
import { downloadTSV } from "./utils"

interface TabPanelProps {
  children?: React.ReactNode
  value: number
  biosamples: -1 | ApolloQueryResult<any>
}

//For all Human/Mouse cCREs
const DownloadButton = (props: ButtonProps & { label: string }) => {
  return (
    <Button sx={{ textTransform: "none" }} fullWidth variant="contained" color="primary" {...props} endIcon={<DownloadIcon />}>
      {props.label}
    </Button>
  )
}

//Download tiles
const InlineDownloadButton = (props: ButtonProps & { label: string; bordercolor: string; mode: "download" | "search" }) => {
  return (
    <Paper sx={{ borderTop: `0.375rem solid ${props.bordercolor}`, marginBottom: "1rem" }} elevation={2}>
      <Button
        sx={{ textTransform: "none", maxWidth: "9rem" }}
        variant="text"
        color="primary"
        {...props}
        endIcon={props.mode === "search" ? <SearchIcon /> : <DownloadIcon />}
      >
        {props.label}
      </Button>
    </Paper>
  )
}

// Styling for By Cell Type Modal
const style = {
  position: "absolute" as "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "80%",
  boxShadow: 24,
}

// Render for URL in modal table
function bioTableColsRender(row: Biosample, x: "dnase" | "h3k4me3" | "h3k27ac" | "ctcf") {
  if (row[x]) {
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
    }

    const handleDL = () =>
      fetch(url)
        .then((x) => x.text())
        .then((x) => {
          downloadTSV(x, fileName)
        })

    return (
      <IconButton onClick={handleDL}>
        <DownloadIcon />
      </IconButton>
    )
  } else return null
}

// Modal Columns
const bioTableCols: DataTableColumn<Biosample>[] = [
  {
    header: "Tissue",
    value: (row: Biosample) => row.ontology,
  },
  {
    header: "Cell Type",
    value: (row: Biosample) => row.displayname,
  },
  {
    header: "DNase",
    value: (row: Biosample) => row.dnase ?? "",
    render: (row: Biosample) => bioTableColsRender(row, "dnase"),
  },
  {
    header: "H3K4me3",
    value: (row: Biosample) => row.h3k4me3 ?? "",
    render: (row: Biosample) => bioTableColsRender(row, "h3k4me3"),
  },
  {
    header: "H3K27ac",
    value: (row: Biosample) => row.h3k27ac ?? "",
    render: (row: Biosample) => bioTableColsRender(row, "h3k27ac"),
  },
  {
    header: "CTCF",
    value: (row: Biosample) => row.ctcf ?? "",
    render: (row: Biosample) => bioTableColsRender(row, "ctcf"),
  },
]

// By Cell Type Modal
function BiosampleModals(props: {
  rows: Biosample[]
  open: boolean
  tableTitle: string
  handleClose: (event: {}, reason: "backdropClick" | "escapeKeyDown") => void
}): React.JSX.Element {
  return (
    <Modal open={props.open} onClose={props.handleClose} aria-labelledby="modal-modal-title" aria-describedby="modal-modal-description">
      <Box sx={style}>
        <DataTable sortDescending searchable tableTitle={props.tableTitle} columns={bioTableCols} rows={props.rows} itemsPerPage={7} />
      </Box>
    </Modal>
  )
}

export function DetailedElements(props: TabPanelProps) {
  // Each of these handles one modal
  const [open0, setOpen0] = React.useState(false)
  const handleOpen0 = () => setOpen0(true)
  const handleClose0 = () => setOpen0(false)

  const [open1, setOpen1] = React.useState(false)
  const handleOpen1 = () => setOpen1(true)
  const handleClose1 = () => setOpen1(false)

  const [open2, setOpen2] = React.useState(false)
  const handleOpen2 = () => setOpen2(true)
  const handleClose2 = () => setOpen2(false)

  const [open3, setOpen3] = React.useState(false)
  const handleOpen3 = () => setOpen3(true)
  const handleClose3 = () => setOpen3(false)

  const [open4, setOpen4] = React.useState(false)
  const handleOpen4 = () => setOpen4(true)
  const handleClose4 = () => setOpen4(false)

  const [open5, setOpen5] = React.useState(false)
  const handleOpen5 = () => setOpen5(true)
  const handleClose5 = () => setOpen5(false)

  const biosamples = props.biosamples != -1 ? props.biosamples.data : null

  //This is written with the assumption there's no lifeStage besides Embryonic and Adult
  const humanCellLines: Biosample[] = useMemo(
    () => ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter((x: Biosample) => x.sampleType === "cell line"),
    [biosamples]
  )
  const humanAdult: Biosample[] = useMemo(
    () =>
      ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter(
        (x: Biosample) => x.sampleType !== "cell line" && x.lifeStage === "adult"
      ),
    [biosamples]
  )
  const humanEmbryo: Biosample[] = useMemo(
    () =>
      ((biosamples && biosamples.human && biosamples.human.biosamples) || []).filter(
        (x: Biosample) => x.sampleType !== "cell line" && x.lifeStage === "embryonic"
      ),
    [biosamples]
  )
  const mouseCellLines: Biosample[] = useMemo(
    () => ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter((x: Biosample) => x.sampleType === "cell line"),
    [biosamples]
  )
  const mouseAdult: Biosample[] = useMemo(
    () =>
      ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter(
        (x: Biosample) => x.sampleType !== "cell line" && x.lifeStage === "adult"
      ),
    [biosamples]
  )
  const mouseEmbryo: Biosample[] = useMemo(
    () =>
      ((biosamples && biosamples.mouse && biosamples.mouse.biosamples) || []).filter(
        (x: Biosample) => x.sampleType !== "cell line" && x.lifeStage === "embryonic"
      ),
    [biosamples]
  )

  return (
    <>
      {props.value === 1 && (
        <div>
          <Grid2 container columnSpacing={6} rowSpacing={3} mt={1}>
            <Grid2 container xs={12} md={6}>
              <Grid2 display="flex" alignItems="flex-start" flexDirection="column" xs={10}>
                <Typography mt="auto" variant="h5">
                  Human (GRCh38/hg38)
                </Typography>
                {/* These are not showing up because of the flex container */}
                <Divider />
                <Typography variant="subtitle1">2,348,854 cCREs • 1,678 cell types</Typography>
              </Grid2>
              <Grid2 xs={2}>
                <Image src={Human} alt={"Human Icon"} height={75} />
              </Grid2>
              <Grid2 xs={12}>
                <DownloadButton href={Config.Downloads.HumanCCREs} label="Download All Human cCREs" />
              </Grid2>
              <Grid2 display={"flex"} flexWrap={"wrap"} justifyContent={"space-between"} xs={12}>
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.HumanPromoters}
                  label="Promoter-like (PLS) (47,532)"
                  bordercolor={PLS}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.HumanProximalEnhancers}
                  label="Proximal enhancer-like (pELS) (249,464)"
                  bordercolor={pELS}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.HumanDistalEnhancers}
                  label="Distal enhancer-like (dELS) (1,469,205)"
                  bordercolor={dELS}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.HumanCA_CTCF}
                  label="Chromatin Accessible with CTCF (126,034)"
                  bordercolor={CA_CTCF}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.HumanCA_H3K4me3}
                  label="Chromatin Accessible with H3K4me3 (79,246)"
                  bordercolor={CA_H3K4me3}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.HumanCA_TF}
                  label="Chromatin Accessible with TF (26,102)"
                  bordercolor={CA_TF}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.HumanCA_only}
                  label="Chromatin Accessible Only (245,985)"
                  bordercolor={CA_only}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.HumanTF_only}
                  label="TF Only (105,286)"
                  bordercolor={TF_only}
                />
                {/* Box added to align last row */}
                <Box width={"9rem"}></Box>
              </Grid2>
            </Grid2>
            <Grid2 container xs={12} md={6}>
              <Grid2 display="flex" alignItems="flex-start" flexDirection="column" xs={10}>
                <Typography variant="h5">Mouse (GRCm38/mm10)</Typography>
                <Divider />
                <Typography variant="subtitle1">926,843 cCREs • 366 cell types</Typography>
              </Grid2>
              <Grid2 display="flex" justifyContent="flex-end" xs={2}>
                <Image src={Mouse} alt={"Mouse Icon"} height={75} />
              </Grid2>
              <Grid2 xs={12}>
                <DownloadButton href={Config.Downloads.MouseCCREs} label="Download All Mouse cCREs" />
              </Grid2>
              <Grid2 display={"flex"} flexWrap={"wrap"} justifyContent={"space-between"} xs={12}>
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.MousePromoters}
                  label={`Promoter-like (PLS) (47,532)`}
                  bordercolor={PLS}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.MouseProximalEnhancers}
                  label="Proximal enhancer-like (pELS) (249,464)"
                  bordercolor={pELS}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.MouseDistalEnhancers}
                  label="Distal enhancer-like (dELS) (1,469,205)"
                  bordercolor={dELS}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.MouseCA_CTCF}
                  label="Chromatin Accessible with CTCF (126,034)"
                  bordercolor={CA_CTCF}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.MouseCA_H3K4me3}
                  label="Chromatin Accessible with H3K4me3 (79,246)"
                  bordercolor={CA_H3K4me3}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.MouseCA_TF}
                  label="Chromatin Accessible with TF (26,102)"
                  bordercolor={CA_TF}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.MouseCA_only}
                  label="Chromatin Accessible Only (245,985)"
                  bordercolor={CA_only}
                />
                <InlineDownloadButton
                  mode="download"
                  href={Config.Downloads.MouseTF_only}
                  label="TF Only (105,286)"
                  bordercolor={TF_only}
                />
                {/* Box added to align last row */}
                <Box width={"9rem"}></Box>
              </Grid2>
            </Grid2>
            <Grid2 xs={6}>
              <Typography variant="h6">Human cCREs by Cell Type</Typography>
            </Grid2>
            <Grid2 xs={6}>
              <Typography variant="h6">Mouse cCREs by Cell Type</Typography>
            </Grid2>
            <Grid2 display={"flex"} flexWrap={"wrap"} justifyContent={"space-between"} xs={6}>
              <InlineDownloadButton mode="search" onClick={handleOpen0} label="Cell Lines (206 Cell Types)" bordercolor={"#333333"} />
              <InlineDownloadButton
                mode="search"
                onClick={handleOpen1}
                label="Adult Primary Cells and Tissues (1093 cell types)"
                bordercolor={"#333333"}
              />
              <InlineDownloadButton
                mode="search"
                onClick={handleOpen2}
                label="Embryonic Tissues (379 cell types)"
                bordercolor={"#333333"}
              />
            </Grid2>
            <Grid2 display={"flex"} flexWrap={"wrap"} justifyContent={"space-between"} xs={6}>
              <InlineDownloadButton mode="search" onClick={handleOpen3} label="Cell Lines (27 Cell Types)" bordercolor={"#333333"} />
              <InlineDownloadButton
                mode="search"
                onClick={handleOpen4}
                label="Adult Primary Cells and Tissues (244 cell types)"
                bordercolor={"#333333"}
              />
              <InlineDownloadButton mode="search" onClick={handleOpen5} label="Embryonic Tissues (96 cell types)" bordercolor={"#333333"} />
            </Grid2>
          </Grid2>
          <BiosampleModals
            tableTitle="Download cCREs active in human immortalized cell lines"
            rows={humanCellLines}
            open={open0}
            handleClose={handleClose0}
          />
          <BiosampleModals
            tableTitle="Download cCREs active in human primary cells and tissues"
            rows={humanAdult}
            open={open1}
            handleClose={handleClose1}
          />
          <BiosampleModals
            tableTitle="Download cCREs active in human embryonic tissues"
            rows={humanEmbryo}
            open={open2}
            handleClose={handleClose2}
          />
          <BiosampleModals
            tableTitle="Download cCREs active in mouse immortalized cell lines"
            rows={mouseCellLines}
            open={open3}
            handleClose={handleClose3}
          />
          <BiosampleModals
            tableTitle="Download cCREs active in mouse primary cells and tissues"
            rows={mouseAdult}
            open={open4}
            handleClose={handleClose4}
          />
          <BiosampleModals
            tableTitle="Download cCREs active in mouse embryonic tissues"
            rows={mouseEmbryo}
            open={open5}
            handleClose={handleClose5}
          />
        </div>
      )}
    </>
  )
}
