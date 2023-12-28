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
  const [currentURLs, setCurrentURLs] = useState<{urlUCSC: string, urlTrackhub: string, biosamples: Biosample[]}>(null)
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

    setCurrentURLs({urlUCSC: ucscbrowserurl, urlTrackhub: trackhuburl, biosamples: props.selectedBiosamples})

    return {urlUCSC: ucscbrowserurl, urlTrackhub: trackhuburl, biosamples: props.selectedBiosamples}
  }

  const parsedBiosamples = props.selectedBiosamples.map(s => {
    return s.rnaseq ? {
      celltype: s.queryValue,
      rnaseq: true,
      celltypedisplayname: s.summaryName
    } : {
      celltype: s.queryValue,
      celltypedisplayname: s.summaryName
    }
  })

  const getURL = async (x: "ucsc" | "trackhub") => {
    //If current urls are outdated, create new ones
    if (!currentURLs || (JSON.stringify(currentURLs.biosamples) !== JSON.stringify(props.selectedBiosamples))){
      return x === "ucsc" ? (await createTrackHub(parsedBiosamples)).urlUCSC : (await createTrackHub(parsedBiosamples)).urlTrackhub
    } else {
      return x === "ucsc" ? currentURLs.urlUCSC : currentURLs.urlTrackhub
    }  
  }

  const updateClipboard = (newClip) => { navigator.clipboard.writeText(newClip) }

  const handleDownload = async (urlTrackhub: string) => {
    try {
      const response = await fetch(urlTrackhub);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `UCSC-${props.selectedBiosamples.map(x => x.summaryName).join('+')}.txt`);
      link.click();
      URL.revokeObjectURL(url); // Clean up the object URL
    } catch (error) {
      console.error('Error downloading Trackhub: ', error);
      window.alert("Error fetching trackhub: " + error)
    }
  }

  return (
    <>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <DialogTitle>Configure UCSC Genome Browser Trackhub</DialogTitle>
        {props.handleClose && <IconButton size="large" onClick={props.handleClose} sx={{mr: 1}}><CloseOutlined fontSize="inherit"/></IconButton>}
      </Stack>
      <DialogContent>
        <DialogContentText mb={2}>
          {`${props.accession} - ${props.coordinates.chromosome}:${props.coordinates.start}-${props.coordinates.end}`}
        </DialogContentText>
        <DialogContentText>
          Select biosamples to generate trackhub with.
        </DialogContentText>
        <DialogContentText mb={2}>
          Note: For best UCSC performance, choose {"<"}10 cell types. Trackhubs will be deleted after 30 days.
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
        <Tooltip placement="top" arrow title="Copy link to Trackhub">
          <IconButton disabled={props.selectedBiosamples.length === 0} onClick={async () => {updateClipboard(await getURL("trackhub")); handleOpen();}}>
            <ContentCopyIcon />
          </IconButton>
        </Tooltip>
        <Tooltip placement="top" arrow title="Download Trackhub (.txt)" sx={{mr: 1}}>
          <IconButton disabled={props.selectedBiosamples.length === 0} onClick={async () => handleDownload(await getURL("trackhub"))}>
            <DownloadIcon />
          </IconButton>
        </Tooltip>
        <Button
          sx={{textTransform: "none"}}
          endIcon={<SendIcon />}
          variant="contained"
          disabled={props.selectedBiosamples.length === 0}
          onClick={async () => window.open(await getURL("ucsc"))}
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
        message="URL copied to clipboard"
      />
    </>
  )
}

export default ConfigureGenomeBrowser