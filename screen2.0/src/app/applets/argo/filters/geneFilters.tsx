import React, { useMemo } from "react";
import { GeneAccordianProps, GeneLinkingMethod } from "../types";
import { Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControl, FormControlLabel, FormGroup, FormLabel, Radio, RadioGroup, Stack, Tooltip, Typography } from "@mui/material";
import { ExpandMore, InfoOutlined } from "@mui/icons-material"
import Grid from "@mui/material/Grid2"

const GeneFilters: React.FC<GeneAccordianProps> = ({
    geneFilterVariables,
    updateGeneFilter,
    isExpanded,
    handleAccordionChange
}) => {
    //This has poor readability, consider changing
    const handleMethodChange = (e: React.ChangeEvent<HTMLInputElement>, method: GeneLinkingMethod) => {
        updateGeneFilter("methodOfLinkage", {
            ...geneFilterVariables.methodOfLinkage,
            [`${method}`]: e.target.checked,
        });
    };

    const handleChangeAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked
        updateGeneFilter("methodOfLinkage", {
            distance: checked,
            eQTLs: checked,
            Intact_HiC: checked,
            CTCF_ChIAPET: checked,
            RNAPII_ChIAPET: checked,
            CRISPRi_FlowFISH: checked
        });
    }

    const allChecked = useMemo(() => Object.values(geneFilterVariables.methodOfLinkage).every(val => val === true), [geneFilterVariables.methodOfLinkage])
    const noneChecked = useMemo(() => Object.values(geneFilterVariables.methodOfLinkage).every(val => val === false), [geneFilterVariables.methodOfLinkage])

    return (
        <Accordion
            square
            disableGutters
            expanded={isExpanded('gene')}
            onChange={handleAccordionChange('gene')}
        >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: isExpanded('gene') ? '#030f98' : 'inherit' }} />}>
                <Stack direction="row" spacing={1} alignItems={'center'}>
                    <Typography
                        sx={{
                            color: isExpanded('gene') ? '#030f98' : 'inherit',
                            fontSize: isExpanded('gene') ? 'large' : 'normal',
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        }}
                    >
                        Genes
                    </Typography>
                    <Tooltip arrow placement="right-end" title={"Filter results based on linked genes and thier method of linkage"}>
                        <InfoOutlined fontSize="small" />
                    </Tooltip>
                </Stack>
            </AccordionSummary>
            <AccordionDetails>
                <FormControlLabel value="genes" control={<Checkbox onChange={() => updateGeneFilter("useGenes", !geneFilterVariables.useGenes)} checked={geneFilterVariables.useGenes} />} label="Linked Genes" />
                <Stack ml={2}>
                <FormControl disabled={!geneFilterVariables.useGenes}>
                        <FormLabel component="legend" sx={{ mt: 1 }}>Rank Expression Specificity By</FormLabel>
                        <RadioGroup
                            row
                            value={geneFilterVariables.rankBy}
                            onChange={(event) => updateGeneFilter("rankBy", event.target.value as "max" | "avg")}
                        >
                            <FormControlLabel
                                value="max"
                                control={<Radio />}
                                label="Max"
                            />
                            <FormControlLabel
                                value="avg"
                                control={<Radio />}
                                label="Average"
                            />
                        </RadioGroup>
                    </FormControl>
                    <FormControl disabled={!geneFilterVariables.useGenes} sx={{ mt: 1 }}>
                        <FormLabel component="legend">Method of Linkage</FormLabel>
                        <FormGroup>
                            <FormControlLabel
                                label="Select All"
                                control={<Checkbox indeterminate={!allChecked && !noneChecked} />}
                                checked={allChecked}
                                onChange={handleChangeAll}
                            />
                            <Grid container spacing={0} ml={2}>
                                <Grid size={6}>
                                    <FormControlLabel
                                        label="Distance"
                                        control={<Checkbox />}
                                        checked={geneFilterVariables.methodOfLinkage.distance}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMethodChange(e, "distance")}
                                    />
                                    <FormControlLabel
                                        label="Intact Hi-C Loops"
                                        control={<Checkbox />}
                                        checked={geneFilterVariables.methodOfLinkage.Intact_HiC}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMethodChange(e, "Intact_HiC")}
                                    />
                                    <FormControlLabel
                                        label="CTCF ChIA-PET Interactions"
                                        control={<Checkbox />}
                                        checked={geneFilterVariables.methodOfLinkage.CTCF_ChIAPET}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMethodChange(e, "CTCF_ChIAPET")}
                                    />
                                </Grid>
                                <Grid size={6}>
                                <FormControlLabel
                                        label="RNAPII ChIA-PET Interactions"
                                        control={<Checkbox />}
                                        checked={geneFilterVariables.methodOfLinkage.RNAPII_ChIAPET}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMethodChange(e, "RNAPII_ChIAPET")}
                                    />
                                    <FormControlLabel
                                        label="CRISPRi-FlowFISH"
                                        control={<Checkbox />}
                                        checked={geneFilterVariables.methodOfLinkage.CRISPRi_FlowFISH}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMethodChange(e, "CRISPRi_FlowFISH")}
                                    />
                                    <FormControlLabel
                                        label="eQTLs"
                                        control={<Checkbox />}
                                        checked={geneFilterVariables.methodOfLinkage.eQTLs}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleMethodChange(e, "eQTLs")}
                                    />
                                </Grid>
                            </Grid>
                        </FormGroup>
                    </FormControl>
                    <FormControl disabled={!geneFilterVariables.useGenes}>
                        <FormLabel component="legend" sx={{ mt: 1 }}>Gene Filters</FormLabel>
                        <FormGroup>
                            <FormControlLabel
                                label="Must be Protein Coding"
                                control={<Checkbox />}
                                checked={geneFilterVariables.mustBeProteinCoding}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneFilter("mustBeProteinCoding", e.target.checked)}
                            />
                            <FormControlLabel
                                label="Must have Mouse Ortholog"
                                control={<Checkbox />}
                                checked={geneFilterVariables.mustHaveOrtholog}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateGeneFilter("mustHaveOrtholog", e.target.checked)}
                            />
                        </FormGroup>
                    </FormControl>
                </Stack>
            </AccordionDetails>
        </Accordion>
    )
}

export default GeneFilters;