import { SetStateAction, useEffect, useState, useTransition } from "react"
import BiosampleTables from "../search/biosampletables"
import { BIOSAMPLE_Data } from "../../common/lib/queries"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Box, Button, Checkbox, CircularProgress, CircularProgressProps, FormControl, FormControlLabel, FormGroup, FormLabel, IconButton, MenuItem, Radio, RadioGroup, Stack, TextField, Typography } from "@mui/material"
import { downloadBED } from "../search/searchhelpers"
import { parseGenomicRegion } from "../_mainsearch/parsegenomicregion"
import { Close, Download } from "@mui/icons-material"
import { ApolloQueryResult } from "@apollo/client"
import { RegistryBiosample } from "../search/types"

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

interface DownloadRangeProps {
  biosampleData: ApolloQueryResult<BIOSAMPLE_Data>
}

/**
 * @todo add linked genes info to query
 * @todo add genome switch to query mouse data. CONSERVATION data not available in mouse
 * @todo add estimated file size? Could be kind of cool
 * @todo make query only request the needed data
 * @todo allow changing the distance of linked genes searched
 */
export const DownloadRange: React.FC<DownloadRangeProps> = ({biosampleData}) => {
  const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
  const [inputValue, setInputValue] = useState<string>('chr11:5205263-5381894')
  //Only reason this is an array is to easily interface with BiosampleTables
  const [selectedBiosample, setSelectedBiosample] = useState<RegistryBiosample[]>([])
  const [bedLoadingPercent, setBedLoadingPercent] = useState<number>(null)
  const [selectedAssays, setSelectedAssays] = useState<{ atac: boolean, ctcf: boolean, dnase: boolean, h3k27ac: boolean, h3k4me3: boolean }>({ atac: true, ctcf: true, dnase: true, h3k27ac: true, h3k4me3: true })
  const [selectedConservation, setSelectedConservation] = useState<{ primate: boolean, mammal: boolean, vertebrate: boolean }>({ primate: true, mammal: true, vertebrate: true })
  // const [linkedGenes, setLinkedGenes] = useState<{ distancePC: boolean, distanceAll: boolean, ctcfChiaPet: boolean, rnapiiChiaPet: boolean }>({ distancePC: true, distanceAll: true, ctcfChiaPet: true, rnapiiChiaPet: true })

  const handleChange = (event: { target: { value: SetStateAction<string> } }) => {
    setInputValue(event.target.value)
  }

  const handleSetAssembly = (value: string) => {
    if (value === "mm10") {
      setSelectedConservation({ primate: null, mammal: null, vertebrate: null })
      // setLinkedGenes({ ...linkedGenes, ctcfChiaPet: null, rnapiiChiaPet: null })
    } else {
      setSelectedConservation({ primate: true, mammal: true, vertebrate: true })
      // setLinkedGenes({ distancePC: true, distanceAll: true, ctcfChiaPet: true, rnapiiChiaPet: true })
    }
    setSelectedBiosample([]);
    (value === "GRCh38" || value === "mm10") && setAssembly(value)
  }

  useEffect(() => {
    if (selectedBiosample.length > 0) {
      setSelectedAssays(
        {
          atac: selectedBiosample[0].atac ? !!selectedBiosample[0].atac : null,
          ctcf: selectedBiosample[0].ctcf ? !!selectedBiosample[0].ctcf : null,
          dnase: selectedBiosample[0].dnase ? !!selectedBiosample[0].dnase : null,
          h3k27ac: selectedBiosample[0].h3k27ac ? !!selectedBiosample[0].h3k27ac : null,
          h3k4me3: selectedBiosample[0].h3k4me3 ? !!selectedBiosample[0].h3k4me3 : null
        }
      )
    } else {
      setSelectedAssays({ atac: true, ctcf: true, dnase: true, h3k27ac: true, h3k4me3: true })
    }
  }, [selectedBiosample])

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
      selectedConservation,
      setBedLoadingPercent
    )
  }

  return (
    <Grid2 container spacing={3}>
      <Grid2 xs={6}>
        <BiosampleTables
          showRNAseq={false}
          showDownloads={false}
          biosampleSelectMode="replace"
          biosampleData={biosampleData}
          assembly={assembly}
          selectedBiosamples={selectedBiosample}
          setSelectedBiosamples={setSelectedBiosample}
        />
      </Grid2>
      <Grid2 xs={6}>
        <FormControl sx={{ mb: 1 }}>
          <FormLabel id="demo-row-radio-buttons-group-label">Assembly</FormLabel>
          <RadioGroup
            row
            value={assembly}
            onChange={(_, value: string) => handleSetAssembly(value)}
          >
            <FormControlLabel value="GRCh38" control={<Radio />} label="GRCh38" />
            <FormControlLabel value="mm10" control={<Radio />} label="mm10" />
          </RadioGroup>
        </FormControl>
        <TextField
          variant="outlined"
          InputLabelProps={{ shrink: true }}
          label="Enter a genomic region"
          placeholder={`chr11:${(5205263).toLocaleString()}-${(5381894).toLocaleString()}`}
          value={inputValue}
          fullWidth
          onChange={handleChange}
        />
        <Stack mt={1} direction="row" alignItems={"center"}>
          <Typography>{`Selected Biosample: ${selectedBiosample.length > 0 ? selectedBiosample[0].displayname : "none"}`}</Typography>
          {selectedBiosample.length > 0 &&
            <IconButton onClick={() => setSelectedBiosample([])}>
              <Close />
            </IconButton>
          }
        </Stack>
        <Stack direction="row" flexWrap={"wrap"}>
          <div>
            <FormControlLabel
              label="Assays"
              control={
                <Checkbox
                  checked={Object.values(selectedAssays).every(assay => assay || assay === null)}
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
          </div>
          <div>
            <FormControlLabel
              label="Conservation"
              control={
                <Checkbox
                  checked={Object.values(selectedConservation).every(x => x || x === null) && assembly !== "mm10"}
                  disabled={assembly === "mm10"}
                  indeterminate={
                    !(
                      //If every value is not true/null
                      Object.values(selectedConservation).every(x => x || x === null) ||
                      //Or every value is not false/null
                      Object.values(selectedConservation).every(x => !x || x === null)
                    )
                  }
                  onChange={(_, checked: boolean) => setSelectedConservation(
                    {
                      primate: selectedConservation.primate === null ? null : checked,
                      mammal: selectedConservation.mammal === null ? null : checked,
                      vertebrate: selectedConservation.vertebrate === null ? null : checked
                    }
                  )}
                />
              } />
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
              <FormControlLabel
                checked={selectedConservation.primate}
                onChange={(_, checked: boolean) => setSelectedConservation({ ...selectedConservation, primate: checked })}
                control={<Checkbox />}
                label={"Primate"}
                disabled={selectedConservation.primate === null || assembly === "mm10"}
              />
              <FormControlLabel
                checked={selectedConservation.mammal}
                onChange={(_, checked: boolean) => setSelectedConservation({ ...selectedConservation, mammal: checked })}
                control={<Checkbox />}
                label={"Mammal"}
                disabled={selectedConservation.mammal === null || assembly === "mm10"}
              />
              <FormControlLabel
                checked={selectedConservation.vertebrate}
                onChange={(_, checked: boolean) => setSelectedConservation({ ...selectedConservation, vertebrate: checked })}
                control={<Checkbox />}
                label={"Vertebrate"}
                disabled={selectedConservation.vertebrate === null || assembly === "mm10"}
              />
            </Box>
          </div>
          {/* <div>
            <FormControlLabel
              label="Linked Genes"
              control={
                <Checkbox
                  checked={Object.values(linkedGenes).every(x => x || x === null)}
                  indeterminate={
                    !(
                      //If every value is not true/null
                      Object.values(linkedGenes).every(x => x || x === null) ||
                      //Or every value is not false/null
                      Object.values(linkedGenes).every(x => !x || x === null)
                    )
                  }
                  onChange={(_, checked: boolean) => setLinkedGenes(
                    {
                      distancePC: linkedGenes.distancePC === null ? null : checked,
                      distanceAll: linkedGenes.distanceAll === null ? null : checked,
                      ctcfChiaPet: linkedGenes.ctcfChiaPet === null ? null : checked,
                      rnapiiChiaPet: linkedGenes.rnapiiChiaPet === null ? null : checked,
                    }
                  )}
                />
              } />
            <Box sx={{ display: 'flex', flexDirection: 'column', ml: 3 }}>
              <FormControlLabel
                checked={linkedGenes.distancePC}
                onChange={(_, checked: boolean) => setLinkedGenes({ ...linkedGenes, distancePC: checked })}
                control={<Checkbox />}
                label={"Distance (protein-coding)"}
                disabled={linkedGenes.distancePC === null}
              />
              <FormControlLabel
                checked={linkedGenes.distanceAll}
                onChange={(_, checked: boolean) => setLinkedGenes({ ...linkedGenes, distanceAll: checked })}
                control={<Checkbox />}
                label={"Distance (all)"}
                disabled={linkedGenes.distanceAll === null}
              />
              <FormControlLabel
                checked={linkedGenes.ctcfChiaPet}
                onChange={(_, checked: boolean) => setLinkedGenes({ ...linkedGenes, ctcfChiaPet: checked })}
                control={<Checkbox />}
                label={"CTCF-ChIA-PET"}
                disabled={linkedGenes.ctcfChiaPet === null || assembly === "mm10"}
              />
              <FormControlLabel
                checked={linkedGenes.rnapiiChiaPet}
                onChange={(_, checked: boolean) => setLinkedGenes({ ...linkedGenes, rnapiiChiaPet: checked })}
                control={<Checkbox />}
                label={"RNAPII-ChIA-PET"}
                disabled={linkedGenes.rnapiiChiaPet === null || assembly === "mm10"}
              />
            </Box>
          </div> */}
        </Stack>
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