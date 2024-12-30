import { Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControl, FormControlLabel, FormGroup, MenuItem, Radio, RadioGroup, Select, Stack, Tooltip, Typography } from "@mui/material";
import React from "react";
import { ExpandMore, InfoOutlined } from "@mui/icons-material"
import { Alignment, SequenceAccordianProps } from "../types";

const SequenceFilters: React.FC<SequenceAccordianProps> = ({
    sequenceFilterVariables,
    updateSequenceFilter,
    isExpanded,
    handleAccordionChange
}) => {
    return (
        <Accordion
            defaultExpanded
            square
            disableGutters
            expanded={isExpanded('sequence')}
            onChange={handleAccordionChange('sequence')}
        >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: isExpanded('sequence') ? '#030f98' : 'inherit' }} />}>
                <Stack direction="row" spacing={1} alignItems={'center'}>
                    <Typography
                        sx={{
                            color: isExpanded('sequence') ? '#030f98' : 'inherit',
                            fontSize: isExpanded('sequence') ? 'large' : 'normal',
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        }}
                    >
                        Sequence
                    </Typography>
                    <Tooltip arrow placement="right-end" title={"Filter results based on conservation score (Mammal, Primate, and Vertebrate) or TF Motif details"}>
                        <InfoOutlined fontSize="small" />
                    </Tooltip>
                </Stack>
            </AccordionSummary>
            <AccordionDetails>
                <FormControlLabel value="conservation" control={<Checkbox onChange={() => updateSequenceFilter("useConservation", !sequenceFilterVariables.useConservation)} checked={sequenceFilterVariables.useConservation} />} label="Conservation" />
                <Stack ml={2}>
                    <FormGroup>
                        <FormControl fullWidth>
                            <Select size="small" value={sequenceFilterVariables.alignment} disabled={!sequenceFilterVariables.useConservation} onChange={(event) => updateSequenceFilter("alignment", event.target.value as Alignment)}>
                                <MenuItem value={"241-mam-phyloP"}>241-Mammal(phyloP)</MenuItem>
                                {/* <MenuItem value={"447-mam-phyloP"}>447-Mammal(phyloP)</MenuItem> */}
                                <MenuItem value={"241-mam-phastCons"}>241-Mammal(phastCons)</MenuItem>
                                <MenuItem value={"43-prim-phyloP"}>43-Primate(phyloP)</MenuItem>
                                <MenuItem value={"43-prim-phastCons"}>43-Primate(phastCons)</MenuItem>
                                <MenuItem value={"243-prim-phastCons"}>243-Primate(phastCons)</MenuItem>
                                <MenuItem value={"100-vert-phyloP"}>100-Vertebrate(phyloP)</MenuItem>
                                <MenuItem value={"100-vert-phastCons"}>100-Vertebrate(phastCons)</MenuItem>
                            </Select>
                        </FormControl>
                    </FormGroup>
                    <FormControl sx={{ mt: 1 }}>
                        <Typography>Rank Conservation Scores By</Typography>
                        <RadioGroup
                            row
                            value={sequenceFilterVariables.rankBy}
                            onChange={(event) => updateSequenceFilter("rankBy", event.target.value)}
                        >
                            <FormControlLabel
                                value="min"
                                control={<Radio disabled={!sequenceFilterVariables.useConservation} />}
                                label="Min"
                            />
                            <FormControlLabel
                                value="max"
                                control={<Radio disabled={!sequenceFilterVariables.useConservation} />}
                                label="Max"
                            />
                            <FormControlLabel
                                value="avg"
                                control={<Radio disabled={!sequenceFilterVariables.useConservation} />}
                                label="Average"
                            />
                        </RadioGroup>
                    </FormControl>
                </Stack>
                <FormGroup>
                    <FormControlLabel value="TFMotifs" control={<Checkbox onChange={() => updateSequenceFilter("useMotifs", !sequenceFilterVariables.useMotifs)} checked={sequenceFilterVariables.useMotifs} />} label="TF Motifs" />
                    <Stack ml={2}>
                        <RadioGroup
                            row
                            value={sequenceFilterVariables.motifCatalog}
                            onChange={(event) => {
                                const selectedValue = event.target.value as "factorbook" | "hocomoco" | "zMotif";
                                if (selectedValue === "factorbook") {
                                    updateSequenceFilter("tfPeakStrength", false);
                                    updateSequenceFilter("overlapsTFPeak", false);
                                }
                                updateSequenceFilter("motifCatalog", selectedValue);
                            }}
                        >
                            <FormControlLabel value="factorbook" control={<Radio />} label="Factorbook" disabled={!sequenceFilterVariables.useMotifs} />
                            <FormControlLabel value="hocomoco" control={<Radio />} label="HOCOMOCO" disabled={!sequenceFilterVariables.useMotifs} />
                            {/* <FormControlLabel value="zMotif" control={<Radio />} label="ZMotif" disabled={!sequenceFilterVariables.useMotifs} /> */}
                        </RadioGroup>
                        <FormControlLabel
                            label="Must Overlap TF Peak"
                            control={
                                <Checkbox
                                    onChange={() => updateSequenceFilter("overlapsTFPeak", !sequenceFilterVariables.overlapsTFPeak)}
                                    disabled={!sequenceFilterVariables.useMotifs || sequenceFilterVariables.motifCatalog !== "factorbook"}
                                    checked={sequenceFilterVariables.overlapsTFPeak && sequenceFilterVariables.motifCatalog === "factorbook"}
                                />
                            }
                        />
                    </Stack>
                </FormGroup>
                <FormGroup>
                    <FormControl sx={{marginLeft: 2}}>
                        <Typography>Include in Ranking</Typography>
                        <FormControlLabel value="numMotifs" control={<Checkbox onChange={() => updateSequenceFilter("numOverlappingMotifs", !sequenceFilterVariables.numOverlappingMotifs)} checked={sequenceFilterVariables.numOverlappingMotifs} />} label="Number of Overlaping Motifs" disabled={!sequenceFilterVariables.useMotifs} />
                        <FormControlLabel value="motifScoreDelta" control={<Checkbox onChange={() => updateSequenceFilter("motifScoreDelta", !sequenceFilterVariables.motifScoreDelta)} checked={sequenceFilterVariables.motifScoreDelta} />} label="Motif Score Delta" disabled={!sequenceFilterVariables.useMotifs} />
                        <FormControlLabel value="tfPeakStrength" control={<Checkbox onChange={() => updateSequenceFilter("tfPeakStrength", !sequenceFilterVariables.tfPeakStrength)} checked={sequenceFilterVariables.tfPeakStrength && sequenceFilterVariables.motifCatalog === "factorbook"} />} label="TF Peak Strength" disabled={!sequenceFilterVariables.useMotifs || !sequenceFilterVariables.overlapsTFPeak || sequenceFilterVariables.motifCatalog !== "factorbook"} />
                    </FormControl>
                </FormGroup>
            </AccordionDetails>
        </Accordion>
    )
}

export default SequenceFilters;