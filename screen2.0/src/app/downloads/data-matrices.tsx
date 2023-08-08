import { Button, Divider, FormControl, FormControlLabel, FormLabel, Grid, Radio, RadioGroup, Select, TextField, Typography } from "@mui/material";
import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import { Box } from "@mui/system";
import Image from "next/image";
import Human from "../../../public/Human2.png"
import Mouse from "../../../public/Mouse2.png"
import { useState } from "react";

import { ArrowForward, Clear, Download } from "@mui/icons-material";
import { useRouter } from "next/navigation";

interface TabPanelProps {
  children?: React.ReactNode;
  value: number;
  matrices: any;
}

type Selected = {
  assembly: "Human" | "Mouse"
  assay: "DNase" | "H3K4me3" | "H3K27ac" | "CTCF"
}

export function DataMatrices(props: TabPanelProps) {
  const [selected, setSelected] = useState<null | Selected>(null)

  const router = useRouter()

  const selectorButton = (variant: Selected) => {
    return (
      <Button
        variant="contained"
        fullWidth
        onClick={() => {
          if (selected && selected.assembly === variant.assembly && selected.assay === variant.assay){
            router.push(`./downloads?tab=2`)
            setSelected(null)
          } else {
            router.push(`./downloads?tab=2&assembly=${variant.assembly}&assay=${variant.assay}`)
            setSelected(variant)
          }
        }}
        endIcon={(selected && selected.assembly === variant.assembly && selected.assay === variant.assay) ? <Clear /> : <ArrowForward />}
        sx={{ mb: 1 }}
      >
        {`${variant.assay}`}
      </Button>
    )
  }

  return (
    <div
      role="tabpanel"
      id={`simple-tabpanel-${2}`}
      aria-labelledby={`simple-tab-${2}`}
    >
      {props.value === 2 &&
        <Grid2 container spacing={3}>
          <Grid2 container spacing={1} xs={2.5}>
            <Grid2 xs={8}>
              <Typography mt="auto" variant="h5">Human</Typography>
              <Divider />
              <Typography variant="subtitle2">2,348,854 cCREs</Typography>
              <Typography variant="subtitle2">1,678 cell types</Typography>
            </Grid2>
            <Grid2 xs={4}>
              <Image src={Human} alt={"Human Icon"} width={50} />
            </Grid2>
            <Grid2 xs={12}>
              {selectorButton({ assembly: "Human", assay: "DNase" })}
              {selectorButton({ assembly: "Human", assay: "H3K4me3" })}
              {selectorButton({ assembly: "Human", assay: "H3K27ac" })}
              {selectorButton({ assembly: "Human", assay: "CTCF" })}
            </Grid2>
            <Grid2 xs={8}>
              <Typography variant="h5">Mouse</Typography>
              <Divider />
              <Typography variant="subtitle2">926,843 cCREs</Typography>
              <Typography variant="subtitle2">366 cell types</Typography>
            </Grid2>
            <Grid2 xs={4}>
              <Image src={Mouse} alt={"Mouse Icon"} width={50} />
            </Grid2>
            <Grid2 xs={12}>
              {selectorButton({ assembly: "Mouse", assay: "DNase" })}
              {selectorButton({ assembly: "Mouse", assay: "H3K4me3" })}
              {selectorButton({ assembly: "Mouse", assay: "H3K27ac" })}
              {selectorButton({ assembly: "Mouse", assay: "CTCF" })}
            </Grid2>
          </Grid2>
          <Grid2 container xs={9.5}>
            {selected ?
              <>
                <Grid2 xs={12}>
                  <Typography>{`UMAP Embedding: ${selected.assay} in ${selected.assembly}`}</Typography>
                  <Typography>{props.matrices.data.ccREBiosampleQuery.biosamples[0].name}</Typography>
                </Grid2>
                <Grid2 xs={4}>
                  <TextField size="small" label="Search for a Biosample..." fullWidth sx={{mb: 3}}/>
                  <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Color By:</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-radio-buttons-group-label"
                      defaultValue="sample type"
                      name="radio-buttons-group"
                      sx={{mb: 2}}
                    >
                      <FormControlLabel value="sample type" control={<Radio />} label="Sample Type" />
                      <FormControlLabel value="ontology" control={<Radio />} label="Ontology" />
                    </RadioGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Show:</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-radio-buttons-group-label"
                      defaultValue="all"
                      name="radio-buttons-group"
                      sx={{mb: 2}}
                    >
                      <FormControlLabel value="all" control={<Radio />} label="All" />
                      <FormControlLabel value="adult" control={<Radio />} label="Adult" />
                      <FormControlLabel value="embronic" control={<Radio />} label="Embyronic" />
                    </RadioGroup>
                  </FormControl>
                  <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">Hold shift, click, and draw a selection to:</FormLabel>
                    <RadioGroup
                      aria-labelledby="demo-radio-buttons-group-label"
                      defaultValue="select experiments"
                      name="radio-buttons-group"
                    >
                      <FormControlLabel value="select experiments" control={<Radio />} label="Select Experiments" />
                      <FormControlLabel value="zoom in" control={<Radio />} label="Zoom In" />
                    </RadioGroup>
                  </FormControl>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => null}
                    endIcon={<Download />}
                    sx={{mb: 1, mt: 3}}
                  >
                    Read-Depth Normalized Signal Matrix
                  </Button>
                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={() => null}
                    endIcon={<Download />}
                  >
                    Z-Score Matrix
                  </Button>
                </Grid2>
              </>
              :
              <Typography>Please select an assay (???)</Typography>
            }
          </Grid2>
        </Grid2>
      }
    </div>
  );
}