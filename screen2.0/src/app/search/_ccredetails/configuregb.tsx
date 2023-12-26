import Grid2 from "@mui/material/Unstable_Grid2";
import { BiosampleTables } from "../biosampletables";
import { CellTypeData, Biosample, cCREData, MainQueryParams, MainResultTableRow } from "../types";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar, Stack, Tooltip, Typography } from "@mui/material";
import { Close, CloseOutlined } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid"
import Config from "../../../config.json"
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';

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
  const [trackhubURL, setTrackhubURL] = useState<{url: string, biosamples: Biosample[]}>(null)
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

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

    setTrackhubURL({url: ucscbrowserurl, biosamples: props.selectedBiosamples})
    return ucscbrowserurl
  }

  const parsedBiosamples = props.selectedBiosamples.map(s => {
    return s.rnaseq ? {
      celltype: s.queryValue,
      rnaseq: true
    } : {
      celltype: s.queryValue
    }
  })

  const getURL = async () => {
    if (!trackhubURL || (JSON.stringify(trackhubURL.biosamples) !== JSON.stringify(props.selectedBiosamples))){
      return await createTrackHub(parsedBiosamples)
    } else {
      return trackhubURL.url
    }  
  }

  const updateClipboard = (newClip) => { navigator.clipboard.writeText(newClip) }

  const handleDownload = (UCSCLink: string) => {
    // Create a Blob object representing the text file
    const blob = new Blob([UCSCLink], { type: "text/plain" });
  
    // Create a URL for the Blob object
    const url = URL.createObjectURL(blob);
  
    // Create a temporary link and simulate a click to download the file
    const link = document.createElement("a");
    link.href = url;
    link.download = `UCSC-${props.selectedBiosamples.map(x => x.summaryName).join('+')}.txt`;
    link.click();
  
    // Revoke the Object URL after the download is complete
    URL.revokeObjectURL(url);
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
      <DialogActions sx={!props.handleClose && { position: "fixed", bottom: 15, right: 15 }}>
        <Tooltip placement="top" arrow title="Copy Track URL">
          <IconButton disabled={props.selectedBiosamples.length === 0} onClick={async () => {updateClipboard(await getURL()); handleOpen();}}>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" arrow title="Download Track URL (.txt)" sx={{mr: 1}}>
          <IconButton disabled={props.selectedBiosamples.length === 0} onClick={async () => handleDownload(await getURL())}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Button
          sx={{textTransform: "none"}}
          endIcon={<SendIcon />}
          variant="contained"
          disabled={props.selectedBiosamples.length === 0}
          onClick={async () => window.open(await getURL())}
        >
          Open in UCSC
        </Button>
      </DialogActions>
      <Snackbar
        sx={{ "& .MuiSnackbarContent-message": {margin: "auto"}}}
        open={open}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={2000}
        onClose={handleClose}
        message="URL coppied to clipboard"
      />
    </>
  )
}

export default ConfigureGenomeBrowser