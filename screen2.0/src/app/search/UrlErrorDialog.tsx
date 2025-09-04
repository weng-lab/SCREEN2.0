import { ExpandMore, Home, ReportProblem } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Typography } from "@mui/material"
import Link from "next/link"
import { List, ListItem, ListItemIcon, ListItemText } from "@mui/material";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

type UrlErrorDialogProps = {
  open: boolean
  searchParams: { [key: string]: string | undefined }
  errorMsg: string
  
}

const UrlErrorDialog = ({errorMsg, open, searchParams}: UrlErrorDialogProps) => {

  return (
    <Dialog open={open}>
     
     <DialogTitle>
  {errorMsg?.includes("V2 cCRE redirection error :") ? (
    <>
      {searchParams.q || searchParams.accessions}{" "}
      <Typography
        component="span"
        variant="body2"
        color="text.secondary"
        sx={{ fontSize: "0.95rem" }}
      >
        ({errorMsg.split("..")[1]})
      </Typography>{" "}
      is a v2 cCRE
    </>
  ) : (
    "Whoops, we ran into an error parsing that search!"
  )}
</DialogTitle>
      <DialogContent>

      
        {errorMsg?.includes("V2 cCRE redirection error :") ? errorMsg.split("..")[2]==="" ? <DialogContentText>This cCRE accession has been deprecated</DialogContentText> : <DialogContentText>
          Please refer to following intersecting v4 cCRE(s) in assembly {searchParams.assembly}:
          <List dense>
            {errorMsg.split("..")[2].split(",").map((acc, idx) => (
              <ListItem key={idx}>
                <ListItemIcon sx={{ minWidth: "20px" }}>
                  <FiberManualRecordIcon sx={{ fontSize: "0.6rem" }} />
                </ListItemIcon>
                <span>
                  <Link
                    target="_blank"
                    href={`/search?q=${acc}&assembly=${searchParams.assembly}`}
                  >
                    {acc}
                  </Link>{" "}
                  ({errorMsg.split("..")[3].split(",")[idx]})
                </span>
              </ListItem>
            ))}
          </List>
        </DialogContentText> :<>
        <DialogContentText>
          Trying to parse:
        </DialogContentText>
        <DialogContentText>
          {JSON.stringify(searchParams)}
        </DialogContentText>
        <DialogContentText>
          Please try search again from the homepage
        </DialogContentText>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMore />}>
            Full Error
          </AccordionSummary>
          <AccordionDetails>
            {errorMsg}
          </AccordionDetails>
        </Accordion>
        <DialogContentText>
          If this is unexpected based on the info above, please feel free to <Link href="/about#contact-us">report it using our "Contact Us" form</Link> and provide us the error you're facing. Please copy the error before navigating! It will be lost.
        </DialogContentText>
        </>}
      </DialogContent>
      <DialogActions sx={{justifyContent: "space-between"}}>
          <Button LinkComponent={Link} href="/about#contact-us" endIcon={<ReportProblem />} variant="outlined">
            Report This Error
          </Button>
          <Button LinkComponent={Link} href="/" endIcon={<Home />} variant="outlined">
            Go To Home
          </Button>
      </DialogActions>
      

    </Dialog>
  )
}

export default UrlErrorDialog