import Grid2 from "@mui/material/Unstable_Grid2";
import { BiosampleTables } from "../biosampletables";
import { CellTypeData, Biosample, cCREData, MainQueryParams, MainResultTableRow } from "../types";
import { Dispatch, SetStateAction } from "react";
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Stack, Typography } from "@mui/material";
import { Close, CloseOutlined } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid"
import Config from "../../../config.json"
import SendIcon from '@mui/icons-material/Send';

const CREATE_TRACKHUB_QUERY = `
  query ($assembly: String!,$uuid: String!,$celltypes: [CellTypeInput]!) {
    createTrackhubQuery(uuid: $uuid, celltypes: $celltypes, assembly:$assembly)
  }  
`

//Should I finally use context to pass globals file
const ConfigureGenomeBrowser = (props: {
  byCellType: CellTypeData,
  selectedBiosamples: Biosample[],
  setSelectedBiosamples: Dispatch<SetStateAction<Biosample[]>>,
  coordinates: {
    assembly: "GRCh38" | "mm10"
    chromosome: string
    start: string
    end: string
  }
  accession: string
  handleClose?: () => void
}) => {

  //This appears to be creating a trackhub by appending the selecting biosample to the existing ones selected before?
  const createTrackHub = async (value) => {
    const response = await fetch(Config.API.CcreAPI, {
      method: "POST",
      body: JSON.stringify({
        query: CREATE_TRACKHUB_QUERY,
        variables: {
          celltypes: value,
          uuid: uuidv4(),
          assembly: props.coordinates.assembly.toLowerCase()
        },
      }),
      headers: { "Content-Type": "application/json" },
    })
    const trackhuburl = (await response.json()).data?.createTrackhubQuery
    const start = +(props.coordinates.start.replaceAll(",","")) - 7500
    const end = +(props.coordinates.end.replaceAll(",","")) + 7500

    const ucscbrowserurl =  `https://genome.ucsc.edu/cgi-bin/hgTracks?db=${props.coordinates.assembly}&position=${props.coordinates.chromosome}:${start}-${end}&hubClear=${trackhuburl}&highlight=${props.coordinates.assembly}.${props.coordinates.chromosome}%3A${props.coordinates.start.replaceAll(",","")}-${props.coordinates.end.replaceAll(",","")}`
    window.open(ucscbrowserurl)
  }

  const handleSubmit = () => {
    let ct = props.selectedBiosamples.map(s => {
      return s.rnaseq ? {
        celltype: s.queryValue,
        rnaseq: true
      } : {
        celltype: s.queryValue
      }
    })
    createTrackHub(ct)
  }

  return (
    <>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <DialogTitle>Configure UCSC Genome Browser Track</DialogTitle>
        {props.handleClose && <IconButton size="large" onClick={props.handleClose} sx={{mr: 1}}><CloseOutlined fontSize="inherit"/></IconButton>}
      </Stack>
      <DialogContent>
        <DialogContentText mb={2}>
          {`${props.accession} - ${props.coordinates.chromosome}:${props.coordinates.start}-${props.coordinates.end}`}
        </DialogContentText>
        <DialogContentText>
          Select biosamples and use the handles to change the order in
          which they will display in the browser.
        </DialogContentText>
        <DialogContentText mb={2}>
          Note: For best UCSC performance, choose {"<"}10 cell types.
        </DialogContentText>
        <Grid2 container spacing={2}>
          <Grid2 xs={8}>
            <BiosampleTables
              configGB={true}
              byCellType={props.byCellType}
              selectedBiosamples={props.selectedBiosamples}
              setSelectedBiosamples={props.setSelectedBiosamples} />
          </Grid2>
          <Grid2 xs={4}>
            <Typography width="400px" visibility={props.selectedBiosamples.length > 0 ? "visible" : "hidden"} mt={2}>Selected Biosamples:</Typography>
            {props.selectedBiosamples.map((biosample, i) => {
              return (
                <Stack mt={1} width="400px" direction="row" alignItems={"center"} key={i}>
                  <IconButton onClick={() => props.setSelectedBiosamples(props.selectedBiosamples.filter((x) => x.summaryName !== biosample.summaryName))}>
                    <Close />
                  </IconButton>
                  <Typography>{biosample.summaryName}</Typography>
                </Stack>
              );
            })}
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button endIcon={<SendIcon />} variant="contained" disabled={props.selectedBiosamples.length === 0} onClick={handleSubmit} sx={!props.handleClose && {position: "fixed", bottom: 15, right: 15}}>Open in UCSC</Button>
      </DialogActions></>

  )
}

export default ConfigureGenomeBrowser