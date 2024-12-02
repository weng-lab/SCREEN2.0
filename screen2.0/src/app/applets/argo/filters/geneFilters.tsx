import React from "react";
import { GeneAccordianProps } from "../types";
import { Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControl, FormControlLabel, Radio, RadioGroup, Stack, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"

const GeneFilters: React.FC<GeneAccordianProps> = ({
    geneFilterVariables,
    updateGeneFilter,
    isExpanded,
    handleAccordionChange
}) => {
    return (
        <Accordion
            defaultExpanded
            square
            disableGutters
            expanded={isExpanded('gene')}
            onChange={handleAccordionChange('gene')}
        >
            <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: isExpanded('gene') ? '#030f98' : 'inherit' }} />} sx={{
                color: isExpanded('gene') ? '#030f98' : 'inherit',
                fontSize: isExpanded('gene') ? 'large' : 'normal',
                fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
            }}>
                Genes
            </AccordionSummary>
            <AccordionDetails>
                <FormControlLabel value="genes" control={<Checkbox onChange={() => updateGeneFilter("useGenes", !geneFilterVariables.useGenes)} checked={geneFilterVariables.useGenes} />} label="Linked Genes" />
                <Stack ml={2}>
                    <Typography>Method of Linkage</Typography>
                    <Stack ml={2}>
                        <FormControl sx={{ mt: 1 }}>
                            <RadioGroup
                                row
                                value={geneFilterVariables.methodOfLinkage}
                                onChange={(event) => updateGeneFilter("methodOfLinkage", event.target.value)}
                            >
                                <FormControlLabel
                                    value="distance"
                                    control={<Radio disabled={!geneFilterVariables.useGenes} />}
                                    label="Distance"
                                />
                                <FormControlLabel
                                    value="3DChromatin"
                                    control={<Radio disabled={!geneFilterVariables.useGenes} />}
                                    label="3D Chromatin Links"
                                />
                                <FormControlLabel
                                    value="eQTLs"
                                    control={<Radio disabled={!geneFilterVariables.useGenes} />}
                                    label="eQTLs"
                                />
                                <FormControlLabel
                                    value="compPredictions"
                                    control={<Radio disabled={!geneFilterVariables.useGenes} />}
                                    label="Computational Predictions"
                                />
                            </RadioGroup>
                        </FormControl>
                    </Stack>
                    <FormControlLabel
                        value="protein"
                        control={<Checkbox
                            onChange={() => updateGeneFilter("proteinOnly", !geneFilterVariables.proteinOnly)}
                            checked={geneFilterVariables.proteinOnly}
                            disabled={!geneFilterVariables.useGenes} />}
                        label="Only Protein Coding Genes" />
                    <FormControlLabel
                        value="mustHaveOrtholog"
                        control={<Checkbox
                            onChange={() => updateGeneFilter("mustHaveOrtholog", !geneFilterVariables.mustHaveOrtholog)}
                            checked={geneFilterVariables.mustHaveOrtholog}
                            disabled={!geneFilterVariables.useGenes} />}
                        label="Only Orthologous Genes" />
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}

export default GeneFilters;