import { Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControl, FormControlLabel, FormGroup, MenuItem, Radio, RadioGroup, Select, Stack, Tooltip, Typography } from "@mui/material";
import React from "react";
import { ExpandMore, InfoOutlined } from "@mui/icons-material"
import { Alignment, DataScource, MotifQuality, SequenceAccordianProps } from "../types";
import Grid from "@mui/material/Grid2"

const SequenceFilters: React.FC<SequenceAccordianProps> = ({
    sequenceFilterVariables,
    updateSequenceFilter,
    isExpanded,
    handleAccordionChange
}) => {

    //update a specific quality
    const toggleQuality = (quality: keyof MotifQuality) => {
        updateSequenceFilter('motifQuality', {
            ...sequenceFilterVariables.motifQuality,
            [quality]: !sequenceFilterVariables.motifQuality[quality]
        });
    };

    //update a specific source
    const toggleDataSource = (source: keyof DataScource) => {
        updateSequenceFilter('dataSource', {
            ...sequenceFilterVariables.dataSource,
            [source]: !sequenceFilterVariables.dataSource[source]
        });
    };

    //functionality for the select all box for motif qualities
    const handleSelectAllQualities = (event) => {
        const isChecked = event.target.checked;

        updateSequenceFilter("motifQuality", {
            ...sequenceFilterVariables.motifQuality,
            ...Object.keys(sequenceFilterVariables.motifQuality).reduce((acc, key) => {
                acc[key] = isChecked;
                return acc;
            }, {})
        });
    };

    const areAllQualitiesChecked = () => {
        return Object.values(sequenceFilterVariables.motifQuality).every((isChecked) => isChecked);
    };

    const isIndeterminateQuality = () => {
        const checkedCount = Object.values(sequenceFilterVariables.motifQuality).filter((isChecked) => isChecked).length;
        const total = Object.keys(sequenceFilterVariables.motifQuality).length;

        return checkedCount > 0 && checkedCount < total;
    };

    //functionality for the select all box for motif Sources
    const handleSelectAllSources = (event) => {
        const isChecked = event.target.checked;

        updateSequenceFilter("dataSource", {
            ...sequenceFilterVariables.dataSource,
            ...Object.keys(sequenceFilterVariables.dataSource).reduce((acc, key) => {
                acc[key] = isChecked;
                return acc;
            }, {})
        });
    };

    const areAllSourcesChecked = () => {
        return Object.values(sequenceFilterVariables.dataSource).every((isChecked) => isChecked);
    };

    const isIndeterminateSources = () => {
        const checkedCount = Object.values(sequenceFilterVariables.dataSource).filter((isChecked) => isChecked).length;
        const total = Object.keys(sequenceFilterVariables.dataSource).length;

        return checkedCount > 0 && checkedCount < total;
    };

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
                                <MenuItem value={"447-mam-phyloP"}>447-Mammal(phyloP)</MenuItem>
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
                            {/* <FormControlLabel value="factorbook" control={<Radio />} label="Factorbook" disabled={!sequenceFilterVariables.useMotifs} /> */}
                            <FormControlLabel value="hocomoco" control={<Radio />} label="HOCOMOCO" disabled={!sequenceFilterVariables.useMotifs} />
                            {/* <FormControlLabel value="zMotif" control={<Radio />} label="ZMotif" disabled={!sequenceFilterVariables.useMotifs} /> */}
                        </RadioGroup>
                        {sequenceFilterVariables.motifCatalog === "hocomoco" &&
                            <>
                                <FormControl sx={{ mt: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography>Motif Quality</Typography>
                                        <Tooltip
                                            arrow
                                            placement="right-end"
                                            title={
                                                <div>
                                                    <b>A:</b> Found in both Chip-Seq and Ht-Selex <br />
                                                    <b>B:</b> Reproducible in Chip-Seq or HT-Selex <br />
                                                    <b>C:</b> Found in a single dataset <br />
                                                    <b>D:</b> Subtypes built from motifs exclusively inherited from HOCOMOCO-v12
                                                </div>
                                            }
                                        >
                                            <InfoOutlined fontSize="small" />
                                        </Tooltip>
                                    </Stack>

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={areAllQualitiesChecked()}
                                                indeterminate={isIndeterminateQuality()}
                                                onChange={(event) => { handleSelectAllQualities(event) }}
                                            />
                                        }
                                        label="Select All"
                                        disabled={!sequenceFilterVariables.useMotifs}
                                    />
                                    <FormGroup row sx={{ ml: 2 }}>
                                        <FormControlLabel
                                            checked={sequenceFilterVariables.motifQuality.a}
                                            onChange={() => toggleQuality('a')}
                                            control={<Checkbox />}
                                            label="A"
                                            value="a"
                                            disabled={!sequenceFilterVariables.useMotifs}
                                        />
                                        <FormControlLabel
                                            checked={sequenceFilterVariables.motifQuality.b}
                                            onChange={() => toggleQuality('b')}
                                            control={<Checkbox />}
                                            label="B"
                                            value="b"
                                            disabled={!sequenceFilterVariables.useMotifs}
                                        />
                                        <FormControlLabel
                                            checked={sequenceFilterVariables.motifQuality.c}
                                            onChange={() => toggleQuality('c')}
                                            control={<Checkbox />}
                                            label="C"
                                            value="c"
                                            disabled={!sequenceFilterVariables.useMotifs}
                                        />
                                        <FormControlLabel
                                            checked={sequenceFilterVariables.motifQuality.d}
                                            onChange={() => toggleQuality('d')}
                                            control={<Checkbox />}
                                            label="D"
                                            value="d"
                                            disabled={!sequenceFilterVariables.useMotifs}
                                        />
                                    </FormGroup>
                                </FormControl>
                                <FormControl sx={{ mt: 1 }}>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Typography>Data Source</Typography>
                                        <Tooltip
                                            arrow
                                            placement="right-end"
                                            title={
                                                <div>
                                                    <b>P:</b> Chip-Seq <br />
                                                    <b>S:</b> HT-Selex <br />
                                                    <b>M:</b> Methyl HT-Selex <br />
                                                    <b>G:</b> Genomic HT-Selex <br />
                                                    <b>I:</b> SMiLe-Seq <br />
                                                    <b>B:</b> PBM <br />
                                                </div>
                                            }
                                        >
                                            <InfoOutlined fontSize="small" />
                                        </Tooltip>
                                    </Stack>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={areAllSourcesChecked()}
                                                indeterminate={isIndeterminateSources()}
                                                onChange={(event) => { handleSelectAllSources(event) }}
                                            />
                                        }
                                        label="Select All"
                                        disabled={!sequenceFilterVariables.useMotifs}
                                    />
                                    <Grid container spacing={0} ml={2}>
                                        <Grid size={6}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    checked={sequenceFilterVariables.dataSource.p}
                                                    onChange={() => toggleDataSource('p')}
                                                    control={<Checkbox />}
                                                    label="Chip-Seq"
                                                    value="p"
                                                    disabled={!sequenceFilterVariables.useMotifs}
                                                />
                                                <FormControlLabel
                                                    checked={sequenceFilterVariables.dataSource.s}
                                                    onChange={() => toggleDataSource('s')}
                                                    control={<Checkbox />}
                                                    label="HT-Selex"
                                                    value="s"
                                                    disabled={!sequenceFilterVariables.useMotifs}
                                                />
                                                <FormControlLabel
                                                    checked={sequenceFilterVariables.dataSource.m}
                                                    onChange={() => toggleDataSource('m')}
                                                    control={<Checkbox />}
                                                    label="Methyl HT-Selex"
                                                    value="m"
                                                    disabled={!sequenceFilterVariables.useMotifs}
                                                />
                                            </FormGroup>
                                        </Grid>
                                        <Grid size={6}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    checked={sequenceFilterVariables.dataSource.g}
                                                    onChange={() => toggleDataSource('g')}
                                                    control={<Checkbox />}
                                                    label="Genomic HT-Selex"
                                                    value="g"
                                                    disabled={!sequenceFilterVariables.useMotifs}
                                                />
                                                <FormControlLabel
                                                    checked={sequenceFilterVariables.dataSource.i}
                                                    onChange={() => toggleDataSource('i')}
                                                    control={<Checkbox />}
                                                    label="SMiLe-Seq"
                                                    value="i"
                                                    disabled={!sequenceFilterVariables.useMotifs}
                                                />
                                                <FormControlLabel
                                                    checked={sequenceFilterVariables.dataSource.b}
                                                    onChange={() => toggleDataSource('b')}
                                                    control={<Checkbox />}
                                                    label="PBM"
                                                    value="b"
                                                    disabled={!sequenceFilterVariables.useMotifs}
                                                />
                                            </FormGroup>
                                        </Grid>
                                    </Grid>
                                </FormControl>
                            </>
                        }
                        {/* <FormControlLabel
                            label="Must Overlap TF Peak"
                            control={
                                <Checkbox
                                    onChange={() => updateSequenceFilter("overlapsTFPeak", !sequenceFilterVariables.overlapsTFPeak)}
                                    disabled={!sequenceFilterVariables.useMotifs || sequenceFilterVariables.motifCatalog !== "factorbook"}
                                    checked={sequenceFilterVariables.overlapsTFPeak && sequenceFilterVariables.motifCatalog === "factorbook"}
                                />
                            }
                        /> */}
                    </Stack>
                </FormGroup>
                <FormGroup>
                    <FormControl sx={{ marginLeft: 2 }}>
                        <Typography>Include in Ranking</Typography>
                        <FormControlLabel value="numMotifs" control={<Checkbox onChange={() => updateSequenceFilter("numOverlappingMotifs", !sequenceFilterVariables.numOverlappingMotifs)} checked={sequenceFilterVariables.numOverlappingMotifs} />} label="Number of Overlaping Motifs" disabled={!sequenceFilterVariables.useMotifs} />
                        <FormControlLabel value="motifScoreDelta" control={<Checkbox onChange={() => updateSequenceFilter("motifScoreDelta", !sequenceFilterVariables.motifScoreDelta)} checked={sequenceFilterVariables.motifScoreDelta} />} label="Motif Score Delta" disabled={!sequenceFilterVariables.useMotifs} />
                        {/* <FormControlLabel value="tfPeakStrength" control={<Checkbox onChange={() => updateSequenceFilter("tfPeakStrength", !sequenceFilterVariables.tfPeakStrength)} checked={sequenceFilterVariables.tfPeakStrength && sequenceFilterVariables.motifCatalog === "factorbook"} />} label="TF Peak Strength" disabled={!sequenceFilterVariables.useMotifs || !sequenceFilterVariables.overlapsTFPeak || sequenceFilterVariables.motifCatalog !== "factorbook"} /> */}
                    </FormControl>
                </FormGroup>
            </AccordionDetails>
        </Accordion>
    )
}

export default SequenceFilters;