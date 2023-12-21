import Grid2 from "@mui/material/Unstable_Grid2";
import { BiosampleTables } from "../biosampletables";
import { CellTypeData, Biosample } from "../types";
import { Dispatch, SetStateAction } from "react";
import { IconButton, Stack, Typography } from "@mui/material";
import { Close } from "@mui/icons-material";

//Should I finally use context to pass globals file
const ConfigureGenomeBrowser = (props: {
  byCellType: CellTypeData,
  selectedBiosamples: Biosample[],
  setSelectedBiosamples: Dispatch<SetStateAction<Biosample[]>>,
}) => {
  return (
    <Grid2 container spacing={2}>
      <Grid2 xs={6}>
        <BiosampleTables
          configGB={true}
          byCellType={props.byCellType}
          selectedBiosamples={props.selectedBiosamples}
          setSelectedBiosamples={props.setSelectedBiosamples}
        />
      </Grid2>
      <Grid2 xs={6}>
        <Typography width="400px" visibility={props.selectedBiosamples.length > 0 ? "visible" : "hidden"} mt={2}>Selected Biosamples:</Typography>
        {
          props.selectedBiosamples.map((biosample, i) => {
            return (
              <Stack mt={1} width="400px" direction="row" alignItems={"center"} key={i}>
                <IconButton onClick={() => props.setSelectedBiosamples(props.selectedBiosamples.filter((x) => x.summaryName !== biosample.summaryName))}>
                  <Close />
                </IconButton>
                <Typography>{biosample.summaryName}</Typography>
              </Stack>
            )
          })
        }
      </Grid2>
    </Grid2>
  )
}

export default ConfigureGenomeBrowser