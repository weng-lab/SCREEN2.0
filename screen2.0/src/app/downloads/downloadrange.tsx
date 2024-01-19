import { SetStateAction, startTransition, useEffect, useState, useTransition } from "react"
import BiosampleTables from "../search/biosampletables"
import { Biosample, CellTypeData } from "../search/types"
import { getGlobals } from "../../common/lib/queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Box, Button, Checkbox, CircularProgress, CircularProgressProps, FormControl, FormControlLabel, FormGroup, FormLabel, IconButton, MenuItem, Stack, TextField, Typography } from "@mui/material"
import { downloadBED } from "../search/searchhelpers"
import { parseGenomicRegion } from "../_mainsearch/parsegenomicregion"
import { Close, Download } from "@mui/icons-material"

function CircularProgressWithLabel(
  props: CircularProgressProps & { value: number },
) {
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <CircularProgress variant="determinate" {...props} />
      <Box
        sx={{
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          position: 'absolute',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          variant="caption"
          component="div"
          color="text.secondary"
        >{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

/**
 * @todo add linked genes info to query
 * @todo add estimated file size? Could be kind of cool
 */
export const DownloadRange: React.FC = () => {
  const [isPending, startTransition] = useTransition()
  const [globals, setGlobals] = useState<CellTypeData>(null)
  const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
  const [inputValue, setInputValue] = useState<string>('')
  //Only reason this is an array is to easily interface with BiosampleTables
  const [selectedBiosample, setSelectedBiosample] = useState<Biosample[]>([])
  const [bedLoadingPercent, setBedLoadingPercent] = useState<number>(null)
  const [selectedAssays, setSelectedAssays] = useState<{ atac: boolean, ctcf: boolean, dnase: boolean, h3k27ac: boolean, h3k4me3: boolean }>({ atac: true, ctcf: true, dnase: true, h3k27ac: true, h3k4me3: true })

  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setInputValue(event.target.value)
  }

  useEffect(() => {
    if (selectedBiosample.length > 0) {
      const assays = selectedBiosample[0].assays
      setSelectedAssays(
        {
          atac: assays.atac ? assays.atac : null,
          ctcf: assays.ctcf ? assays.ctcf : null,
          dnase: assays.dnase ? assays.dnase : null,
          h3k27ac: assays.h3k27ac ? assays.h3k27ac : null,
          h3k4me3: assays.h3k4me3 ? assays.h3k4me3 : null
        }
      )
    } else {
      setSelectedAssays({ atac: true, ctcf: true, dnase: true, h3k27ac: true, h3k4me3: true })
    }
  }, [selectedBiosample])

  //fetch globals
  useEffect(() => {
    startTransition(async () => {
      setGlobals(await getGlobals(assembly))
    })
  }, [assembly])

  const handleDownloadBed = () => {
    const region = parseGenomicRegion(inputValue)

    downloadBED(
      assembly,
      region.chromosome,
      +region.start,
      +region.end,
      selectedBiosample.length > 0 && selectedBiosample[0],
      false,
      null,
      selectedAssays,
      setBedLoadingPercent
    )
  }

  return (
    <Grid2 container spacing={3}>
      <Grid2 xs={6}>
        <BiosampleTables
          showRNAseq={true}
          biosampleSelectMode="replace"
          byCellType={globals}
          selectedBiosamples={selectedBiosample}
          setSelectedBiosamples={setSelectedBiosample}
        />
      </Grid2>
      <Grid2 xs={6}>
        {/*
          checkboxes for assays avaiable
          checkboxes for conservation data
          checkboxes for linked genes data
        */}
        <TextField
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          label="Enter a genomic region"
          placeholder="chr11:5205263-5381894"
          value={inputValue}
          fullWidth
          onChange={handleChange}
        />
        <Stack mt={1} direction="row" alignItems={"center"}>
          <Typography>{`Selected Biosample: ${selectedBiosample.length > 0 ? selectedBiosample[0].summaryName : "none"}`}</Typography>
          {selectedBiosample.length > 0 &&
            <IconButton onClick={() => setSelectedBiosample([])}>
              <Close />
            </IconButton>
          }
        </Stack>
        <FormControlLabel
          label="Assays"
          control={
            <Checkbox
              checked={Object.values(selectedAssays).every(assay => assay === true || assay === null) }
              indeterminate={
                !(
                  //If every value is not true/null
                  Object.values(selectedAssays).every(assay => assay || assay === null) || 
                  //Or every value is not false/null
                  Object.values(selectedAssays).every(assay => !assay || assay === null)
                )
              }
              onChange={(_, checked: boolean) => setSelectedAssays(
                {
                  atac: selectedAssays.atac === null ? null : checked,
                  ctcf: selectedAssays.ctcf === null ? null : checked,
                  dnase: selectedAssays.dnase === null ? null : checked,
                  h3k27ac: selectedAssays.h3k27ac === null ? null : checked,
                  h3k4me3: selectedAssays.h3k4me3 === null ? null : checked
                }
              )}
            />
          } />
        <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
          <FormControlLabel
            checked={selectedAssays.dnase}
            onChange={(_, checked: boolean) => setSelectedAssays({ ...selectedAssays, dnase: checked })}
            control={<Checkbox />}
            label={"DNase"}
            disabled={selectedAssays.dnase === null}
          />
          <FormControlLabel
            checked={selectedAssays.atac}
            onChange={(_, checked: boolean) => setSelectedAssays({ ...selectedAssays, atac: checked })}
            control={<Checkbox />}
            label={"ATAC"}
            disabled={selectedAssays.atac === null}
          />
          <FormControlLabel
            checked={selectedAssays.ctcf}
            onChange={(_, checked: boolean) => setSelectedAssays({ ...selectedAssays, ctcf: checked })}
            control={<Checkbox />}
            label={"CTCF"}
            disabled={selectedAssays.ctcf === null}
          />
          <FormControlLabel
            checked={selectedAssays.h3k27ac}
            onChange={(_, checked: boolean) => setSelectedAssays({ ...selectedAssays, h3k27ac: checked })}
            control={<Checkbox />}
            label={"H3K27ac"}
            disabled={selectedAssays.h3k27ac === null}
          />
          <FormControlLabel
            checked={selectedAssays.h3k4me3}
            onChange={(_, checked: boolean) => setSelectedAssays({ ...selectedAssays, h3k4me3: checked })}
            control={<Checkbox />}
            label={"H3K4me3"}
            disabled={selectedAssays.h3k4me3 === null}
          />
        </Box>
        <Stack direction="row" alignItems={"center"} sx={{ mt: 1 }}>
          <Button
            disabled={typeof bedLoadingPercent === "number" || !inputValue}
            variant="outlined"
            sx={{ textTransform: 'none' }}
            onClick={handleDownloadBed}
            endIcon={<Download />}
            fullWidth
          >
            Download Search Results (.bed)
          </Button>
          {bedLoadingPercent !== null && <CircularProgressWithLabel value={bedLoadingPercent} />}
        </Stack>
      </Grid2>
    </Grid2>
  )
}