import { RegistryBiosamplePlusRNA } from "../types";
import { useState } from "react";
import { Button, DialogActions, DialogContent, DialogContentText, DialogTitle, IconButton, Snackbar, Stack, Tooltip, Typography } from "@mui/material";
import { Close, CloseOutlined } from "@mui/icons-material";
import { v4 as uuidv4 } from "uuid"
import Config from "../../../config.json"
import SendIcon from '@mui/icons-material/Send';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DownloadIcon from '@mui/icons-material/Download';
import BiosampleTables from "../../_biosampleTables/BiosampleTables";


const CREATE_TRACKHUB_QUERY = `
  query ($assembly: String!,$uuid: String!,$celltypes: [CellTypeInput]!) {
    createTrackhubQuery(uuid: $uuid, celltypes: $celltypes, assembly:$assembly)
  }  
`

const ConfigureGenomeBrowser = (props: {
  coordinates: {
    assembly: "GRCh38" | "mm10"
    chromosome: string
    start: number
    end: number
  }
  accession: string
  /**
   * Specifying this also moves the copy/DL/Open button group to bottom right, as it assumes it's being used in cCRE details
   */
  handleClose?: () => void
}) => {
  const [currentURLs, setCurrentURLs] = useState<{urlUCSC: string, urlTrackhub: string, biosamples: RegistryBiosamplePlusRNA[]}>(null)
  const [openCopyConfirm, setOpenCopyConfirm] = useState(false);
  const [selectedBiosamples, setSelectedBiosamples] = useState<RegistryBiosamplePlusRNA[]>([])

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenCopyConfirm(false);
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
    const start = +(props.coordinates.start) - 7500
    const end = +(props.coordinates.end) + 7500

    const ucscbrowserurl =  `https://genome.ucsc.edu/cgi-bin/hgTracks?db=${props.coordinates.assembly === "GRCh38" ? "hg38" : "mm10"}&position=${props.coordinates.chromosome}:${start}-${end}&hubClear=${trackhuburl}&highlight=${props.coordinates.assembly}.${props.coordinates.chromosome}%3A${props.coordinates.start}-${props.coordinates.end}`

    setCurrentURLs({urlUCSC: ucscbrowserurl, urlTrackhub: trackhuburl, biosamples: selectedBiosamples})

    return {urlUCSC: ucscbrowserurl, urlTrackhub: trackhuburl, biosamples: selectedBiosamples}
  }

  const parsedBiosamples = selectedBiosamples.map(s => {
    return s.rnaseq ? {
      celltype: s.name,
      rnaseq: true,
      celltypedisplayname: s.displayname
    } : {
      celltype: s.name,
      celltypedisplayname: s.displayname
    }
  })

  const handleDownload = async (urlTrackhub: string) => {
    try {
      const response = await fetch(urlTrackhub);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `UCSC-${selectedBiosamples.map(x => x.displayname).join('+')}.txt`);
      link.click();
      URL.revokeObjectURL(url); // Clean up the object URL
    } catch (error) {
      console.error('Error downloading Trackhub: ', error);
      window.alert("Error fetching trackhub: " + error)
    }
  }

  const getURL = async (x: "ucsc" | "trackhub"): Promise<string> => {
    //If current urls are outdated, create new ones
    if (!currentURLs || (JSON.stringify(currentURLs.biosamples) !== JSON.stringify(selectedBiosamples))){
      return x === "ucsc" ? (await createTrackHub(parsedBiosamples)).urlUCSC : (await createTrackHub(parsedBiosamples)).urlTrackhub
    } else {
      return x === "ucsc" ? currentURLs.urlUCSC : currentURLs.urlTrackhub
    }  
  }

  const handleCopyToClipboard = async () => {
    const url = await getURL("trackhub")
    //setTimeout used as quick fix to make this work in safari, https://stackoverflow.com/questions/62327358/javascript-clipboard-api-safari-ios-notallowederror-message
    setTimeout(() => {
      navigator.clipboard.writeText(url).then(() => setOpenCopyConfirm(true))
    }, 0)
  }

  return (
    <>
      <Stack direction={"row"} justifyContent={"space-between"}>
        <DialogTitle>Configure UCSC Genome Browser Track Hub</DialogTitle>
        {props.handleClose && <IconButton size="large" onClick={props.handleClose} sx={{mr: 1}}><CloseOutlined fontSize="inherit"/></IconButton>}
      </Stack>
      <DialogContent sx={{pt: 0}}>
        <DialogContentText mb={2}>
          {`${props.accession} - ${props.coordinates.chromosome}:${props.coordinates.start.toLocaleString("en-US")}-${props.coordinates.end.toLocaleString("en-US")}`}
        </DialogContentText>
        <DialogContentText>
          Select biosamples to generate track hub with.
        </DialogContentText>
        <DialogContentText mb={2}>
          Note: For best UCSC performance, choose {"<"}10 cell types. Track hubs will be deleted after 24 hours.
        </DialogContentText>
        <Stack direction={{xs: "column", lg: "row"}} spacing={2}>
          <BiosampleTables
            assembly={props.coordinates.assembly}
            showRNAseq
            selected={selectedBiosamples.map(x => x.name)}
            onBiosampleClicked={(selected) => setSelectedBiosamples([...selectedBiosamples, selected])}
            slotProps={{paperStack: {minWidth: {xs: '300px', lg: '500px'}}}}
          />
          <div>
            <Typography minWidth={"300px"} visibility={selectedBiosamples.length > 0 ? "visible" : "hidden"} mt={2}>Selected Biosamples:</Typography>
            {selectedBiosamples.map((biosample, i) => {
              return (
                <Stack minWidth={"300px"} mt={1} direction="row" alignItems={"center"} key={i}>
                  <IconButton onClick={() => setSelectedBiosamples(selectedBiosamples.filter((x) => x.displayname !== biosample.displayname))}>
                    <Close />
                  </IconButton>
                  <Typography>{biosample.displayname}</Typography>
                </Stack>
              );
            })}
          </div>
        </Stack>
      </DialogContent>
      <DialogActions sx={!props.handleClose && { position: "fixed", bottom: 15, right: 15, zIndex: 1 }}>
        <Tooltip placement="top" arrow title="Copy link to Trackhub">
          <span>
            <IconButton disabled={selectedBiosamples.length === 0} onClick={handleCopyToClipboard}>
            <ContentCopyIcon />
          </IconButton>
          </span>
        </Tooltip>
        <Tooltip placement="top" arrow title="Download Trackhub (.txt)" sx={{mr: 1}}>
          <span>
            <IconButton disabled={selectedBiosamples.length === 0} onClick={async () => handleDownload(await getURL("trackhub"))}>
            <DownloadIcon />
          </IconButton>
          </span>
        </Tooltip>
        <Button
          sx={{textTransform: "none"}}
          endIcon={<SendIcon />}
          variant="contained"
          disabled={selectedBiosamples.length === 0}
          onClick={async () => window.open(await getURL("ucsc"))}
        >
          Open in UCSC
        </Button>
      </DialogActions>
      <Snackbar
        sx={{ "& .MuiSnackbarContent-message": {margin: "auto"}}}
        open={openCopyConfirm}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={2000}
        onClose={handleClose}
        message="URL copied to clipboard"
      />
    </>
  )
}

export default ConfigureGenomeBrowser