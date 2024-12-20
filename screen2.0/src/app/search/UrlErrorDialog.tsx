import { Home, KeyboardArrowRight, ReportProblem } from "@mui/icons-material"
import { Accordion, AccordionDetails, AccordionSummary, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Stack } from "@mui/material"
import Link from "next/link"

type UrlErrorDialogProps = {
  open: boolean
  searchParams: { [key: string]: string | undefined }
  errorMsg: string
}

const UrlErrorDialog = ({errorMsg, open, searchParams}: UrlErrorDialogProps) => {

  return (
    <Dialog open={open}>
      <DialogTitle>
        Whoops, we ran into an error parsing that search!
      </DialogTitle>
      <DialogContent>
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
          <AccordionSummary expandIcon={<KeyboardArrowRight />}>
            Full Error
          </AccordionSummary>
          <AccordionDetails>
            {errorMsg}
          </AccordionDetails>
        </Accordion>
        <DialogContentText>
          If this is unexpected based on the info above, please feel free to <Link href="/about#contact-us">report it using our "Contact Us" form</Link> and provide us the error you're facing.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Stack direction="row" justifyContent="space-between">
          <Button LinkComponent={Link} href="/about#contact-us" endIcon={<ReportProblem />}>
            Report This Error
          </Button>
          <Button LinkComponent={Link} href="/" endIcon={<Home />}>
            Go To Home
          </Button>
        </Stack>
      </DialogActions>
    </Dialog>
  )
}

export default UrlErrorDialog