import { SetStateAction, useState } from "react"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"
import { Box, Button, Checkbox, CircularProgress, CircularProgressProps, FormControl, FormControlLabel, FormLabel, IconButton, Radio, RadioGroup, Stack, TextField, Typography } from "@mui/material"
import { downloadBED } from "../search/searchhelpers"
import { parseGenomicRegion } from "../_mainsearch/parsegenomicregion"
import { Close, Download } from "@mui/icons-material"
import GwasBiosampleTables from "../applets/gwas/gwasbiosampletables/gwasbiosampletables"
import { RegistryBiosample } from "../applets/gwas/gwasbiosampletables/types"

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
 * @todo add genome switch to query mouse data. CONSERVATION data not available in mouse
 * @todo add estimated file size? Could be kind of cool
 * @todo make query only request the needed data
 * @todo allow changing the distance of linked genes searched
 */
export const DownloadRange: React.FC = () => {
  const [assembly, setAssembly] = useState<"GRCh38" | "mm10">("GRCh38")
  const [inputValue, setInputValue] = useState<string>('chr11:5205263-5381894')
  const [selectedBiosample, setSelectedBiosample] = useState<RegistryBiosample>(null)
  const [bedLoadingPercent, setBedLoadingPercent] = useState<number>(null)
  //Used to disable assay checkboxes
  const [availableAssays, setAvailableAssays] = useState<{ atac: boolean, ctcf: boolean, dnase: boolean, h3k27ac: boolean, h3k4me3: boolean }>({ atac: true, ctcf: true, dnase: true, h3k27ac: true, h3k4me3: true })
  //Checkboxes
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
    handleSetSelectedBiosample(null);
    (value === "GRCh38" || value === "mm10") && setAssembly(value)
  }

  const handleSetSelectedBiosample = (biosample: RegistryBiosample) => {
    setSelectedBiosample(biosample)
    if (biosample) {
      console.log(biosample)
      setSelectedAssays(
        {
          atac: !!biosample.atac,
          ctcf: !!biosample.ctcf,
          dnase: !!biosample.dnase,
          h3k27ac: !!biosample.h3k27ac,
          h3k4me3: !!biosample.h3k4me3
        }
      )
      setAvailableAssays(
        {
          atac: biosample.atac !== null,
          ctcf: biosample.ctcf !== null,
          dnase: biosample.dnase !== null,
          h3k27ac: biosample.h3k27ac !== null,
          h3k4me3: biosample.h3k4me3 !== null
        }
      )
    } else {
      setSelectedAssays({ atac: true, ctcf: true, dnase: true, h3k27ac: true, h3k4me3: true })
      setAvailableAssays({ atac: true, ctcf: true, dnase: true, h3k27ac: true, h3k4me3: true })
    }
  }

  const handleDownloadBed = () => {
    const region = parseGenomicRegion(inputValue)

    /**
     * @todo make sure this works
     */
    downloadBED(
      assembly,
      region.chromosome,
      +region.start,
      +region.end,
      selectedBiosample?.name,
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
        <GwasBiosampleTables
          assembly={assembly}
          selected={selectedBiosample?.name}
          onBiosampleClicked={(selected: RegistryBiosample) => handleSetSelectedBiosample(selected)}
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
          <Typography>{`Selected Biosample: ${selectedBiosample ? selectedBiosample.displayname : "none"}`}</Typography>
          {selectedBiosample &&
            <IconButton onClick={() => handleSetSelectedBiosample(null)}>
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
                  //For every available assay, check to make sure it's selected
                  checked={Object.entries(availableAssays).every((assay: [string, boolean]) => !assay[1] || selectedAssays[assay[0]])} 
                  indeterminate={
                    //True if all available assays are not either true/false at the same time
                    !Object.entries(availableAssays).every((assay: [string, boolean]) => !assay[1] || selectedAssays[assay[0]])
                    && !Object.entries(availableAssays).every((assay: [string, boolean]) => !assay[1] || !selectedAssays[assay[0]])
                  }
                  onChange={(_, checked: boolean) => setSelectedAssays(
                    {
                      atac: availableAssays.atac ? checked : false,
                      ctcf: availableAssays.ctcf ? checked : false,
                      dnase: availableAssays.dnase ? checked : false,
                      h3k27ac: availableAssays.h3k27ac ? checked : false,
                      h3k4me3: availableAssays.h3k4me3 ? checked : false
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
                disabled={!availableAssays.dnase}
              />
              <FormControlLabel
                checked={selectedAssays.atac}
                onChange={(_, checked: boolean) => setSelectedAssays({ ...selectedAssays, atac: checked })}
                control={<Checkbox />}
                label={"ATAC"}
                disabled={!availableAssays.atac}
              />
              <FormControlLabel
                checked={selectedAssays.ctcf}
                onChange={(_, checked: boolean) => setSelectedAssays({ ...selectedAssays, ctcf: checked })}
                control={<Checkbox />}
                label={"CTCF"}
                disabled={!availableAssays.ctcf}
              />
              <FormControlLabel
                checked={selectedAssays.h3k27ac}
                onChange={(_, checked: boolean) => setSelectedAssays({ ...selectedAssays, h3k27ac: checked })}
                control={<Checkbox />}
                label={"H3K27ac"}
                disabled={!availableAssays.h3k27ac}
              />
              <FormControlLabel
                checked={selectedAssays.h3k4me3}
                onChange={(_, checked: boolean) => setSelectedAssays({ ...selectedAssays, h3k4me3: checked })}
                control={<Checkbox />}
                label={"H3K4me3"}
                disabled={!availableAssays.h3k4me3}
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