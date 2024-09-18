import ConfigureGenomeBrowser from "./configuregb";
import { Dialog } from "@mui/material";


interface Props {
  coordinates: {
    assembly: "mm10" | "GRCh38",
    chromosome: string,
    start: number,
    end: number,
  }
  accession: string
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const ConfigureGBModal: React.FC<Props> = ({
  coordinates,
  accession,
  open,
  setOpen
}) => {

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      disableRestoreFocus
      PaperProps={{ sx: { maxWidth: "none" } }}
    >
      <ConfigureGenomeBrowser
        coordinates={{
          assembly: coordinates.assembly,
          chromosome: coordinates.chromosome,
          start: coordinates.start,
          end: coordinates.end,
        }}
        accession={accession}
        handleClose={() => setOpen(false)}
      />
    </Dialog>
  )
}

export default ConfigureGBModal