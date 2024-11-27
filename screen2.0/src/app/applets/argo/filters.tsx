import React, { useState } from 'react';
import { Alignment, FilterProps } from './types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, Drawer, FormControl, FormControlLabel, FormGroup, IconButton, MenuItem, Paper, Radio, RadioGroup, Select, Stack, Typography } from '@mui/material';
import BiosampleTables from '../../_biosampleTables/BiosampleTables';
import Grid from "@mui/material/Grid2"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { CancelRounded } from "@mui/icons-material"
import FilterListIcon from '@mui/icons-material/FilterList';

const Filters: React.FC<FilterProps> = ({
    sequenceFilterVariables,
    elementFilterVariables,
    geneFilterVariables,
    updateSequenceFilter,
    updateElementFilter,
    updateGeneFilter,
    toggleAssay,
    toggleClass,
    drawerOpen,
    toggleDrawer,
}) => {

    //Keep track of which tab is expanded in the drawer
    const [expandedAccordions, setExpandedAccordions] = useState<string[]>(["sequence"]);
    const handleAccordionChange = (panel: string) => () => {
        setExpandedAccordions((prevExpanded) =>
            prevExpanded.includes(panel)
                ? prevExpanded.filter((p) => p !== panel)
                : [...prevExpanded, panel]
        );
    };
    const isExpanded = (panel: string) => expandedAccordions.includes(panel);

    //functionality for the select all box for assays
    const handleSelectAllAssays = (event) => {
        const isChecked = event.target.checked;

        const updatedAssays = { ...elementFilterVariables.assays };
        Object.keys(elementFilterVariables.availableAssays).forEach((key) => {
            if (elementFilterVariables.availableAssays[key]) {
                updatedAssays[key] = isChecked;
            }
        });
        updateElementFilter("assays", updatedAssays);
    };

    const areAllAssaysChecked = () => {
        return Object.keys(elementFilterVariables.availableAssays).every((key) => (elementFilterVariables.availableAssays[key] && elementFilterVariables.assays[key]) || (!elementFilterVariables.availableAssays[key] && !elementFilterVariables.assays[key]));
    };

    const isIndeterminateAssay = () => {
        const checkedCount = Object.keys(elementFilterVariables.availableAssays).filter((key) => elementFilterVariables.availableAssays[key] && elementFilterVariables.assays[key]).length;
        const totalAvailable = Object.keys(elementFilterVariables.availableAssays).filter((key) => elementFilterVariables.availableAssays[key]).length;

        return checkedCount > 0 && checkedCount < totalAvailable;
    };

    //functionality for the select all box for classes
    const handleSelectAllClasses = (event) => {
        const isChecked = event.target.checked;

        updateElementFilter("classes", {
            ...elementFilterVariables.classes,
            ...Object.keys(elementFilterVariables.classes).reduce((acc, key) => {
                acc[key] = isChecked;
                return acc;
            }, {})
        });
    };

    const areAllClassesChecked = () => {
        return Object.values(elementFilterVariables.classes).every((isChecked) => isChecked);
    };

    const isIndeterminateClass = () => {
        const checkedCount = Object.values(elementFilterVariables.classes).filter((isChecked) => isChecked).length;
        const totalClasses = Object.keys(elementFilterVariables.classes).length;

        return checkedCount > 0 && checkedCount < totalClasses;
    };

    //change assays and availible assays depending on if there is a biosample selected or not
    const handleSelectedBiosample = (biosample) => {
        updateElementFilter("selectedBiosample", biosample)
        updateElementFilter('availableAssays', {
            dnase: !!biosample.dnase,
            h3k4me3: !!biosample.h3k4me3,
            h3k27ac: !!biosample.h3k27ac,
            ctcf: !!biosample.ctcf,
            atac: !!biosample.atac_signal,
        });
        updateElementFilter('assays', {
            dnase: !!biosample.dnase,
            h3k4me3: !!biosample.h3k4me3,
            h3k27ac: !!biosample.h3k27ac,
            ctcf: !!biosample.ctcf,
            atac: !!biosample.atac_signal,
        });
    }

    const handleDeselectBiosample = () => {
        updateElementFilter("selectedBiosample", null);
        updateElementFilter('availableAssays', {
            dnase: true,
            h3k4me3: true,
            h3k27ac: true,
            ctcf: true,
            atac: true,
        });
        updateElementFilter('assays', {
            dnase: true,
            h3k4me3: true,
            h3k27ac: true,
            ctcf: true,
            atac: true,
        });
    }

    return (
        <div>
            {!drawerOpen && (
                <Box alignItems={"flex-start"} padding={2}>
                    <IconButton
                        onClick={toggleDrawer}
                        color="primary"
                    >
                        <FilterListIcon />
                    </IconButton>
                </Box>
            )}
            <Drawer
                anchor="left"
                open={drawerOpen}
                onClose={toggleDrawer}
                variant="persistent"
                sx={{
                    '& .MuiDrawer-paper': {
                        width: '25vw',
                        top: theme => `${theme.mixins.toolbar.minHeight}px`,
                        zIndex: theme => theme.zIndex.appBar - 1,
                    }
                }}
            >
                <Box
                    height="calc(100vh - 56px)"
                    overflow="auto"
                >
                    <Stack direction={"row"} justifyContent={"space-between"} padding={1}>
                        <Typography sx={{ fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }} alignContent={"center"}>Filters</Typography>
                        <IconButton
                            color="primary"
                            onClick={toggleDrawer}
                            style={{
                                transform: 'rotate(90deg)',
                            }}
                        >
                            <ExpandMoreIcon />
                        </IconButton>
                    </Stack>
                    <Accordion
                        defaultExpanded
                        square
                        disableGutters
                        expanded={isExpanded('sequence')}
                        onChange={handleAccordionChange('sequence')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: isExpanded('sequence') ? '#030f98' : 'inherit' }} />} sx={{
                            color: isExpanded('sequence') ? '#030f98' : 'inherit',
                            fontSize: isExpanded('sequence') ? 'large' : 'normal',
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                        }}>
                            Sequence
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
                                <Stack ml={2}>
                                    <Typography lineHeight={"40px"}>Include in Ranking</Typography>
                                    <FormControlLabel value="numMotifs" control={<Checkbox onChange={() => updateSequenceFilter("numOverlappingMotifs", !sequenceFilterVariables.numOverlappingMotifs)} checked={sequenceFilterVariables.numOverlappingMotifs} />} label="Number of Overlaping Motifs" disabled={!sequenceFilterVariables.useMotifs} />
                                    <FormControlLabel value="motifScoreDelta" control={<Checkbox onChange={() => updateSequenceFilter("motifScoreDelta", !sequenceFilterVariables.motifScoreDelta)} checked={sequenceFilterVariables.motifScoreDelta} />} label="Motif Score Delta" disabled={!sequenceFilterVariables.useMotifs} />
                                    <FormControlLabel value="tfPeakStrength" control={<Checkbox onChange={() => updateSequenceFilter("tfPeakStrength", !sequenceFilterVariables.tfPeakStrength)} checked={sequenceFilterVariables.tfPeakStrength && sequenceFilterVariables.motifCatalog === "factorbook"} />} label="TF Peak Strength" disabled={!sequenceFilterVariables.useMotifs || !sequenceFilterVariables.overlapsTFPeak || sequenceFilterVariables.motifCatalog !== "factorbook"} />
                                </Stack>
                            </FormGroup>
                        </AccordionDetails>
                    </Accordion>
                    <Accordion
                        defaultExpanded
                        square
                        disableGutters
                        expanded={isExpanded('element')}
                        onChange={handleAccordionChange('element')}
                    >
                        <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: isExpanded('element') ? '#030f98' : 'inherit' }} />} sx={{
                            color: isExpanded('element') ? '#030f98' : 'inherit',
                            fontSize: isExpanded('element') ? 'large' : 'normal',
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                        }}>
                            Elements
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControlLabel value="cCREs" control={<Checkbox onChange={() => updateElementFilter("usecCREs", !elementFilterVariables.usecCREs)} checked={elementFilterVariables.usecCREs} />} label="Overlapping cCREs" />
                            <Stack ml={2}>
                                <RadioGroup row value={elementFilterVariables.cCREAssembly} onChange={(event) => { updateElementFilter("cCREAssembly", event.target.value as "GRCh38" | "mm10"); handleDeselectBiosample() }}>
                                    <FormControlLabel value="GRCh38" control={<Radio />} label="GRCH38" disabled={!elementFilterVariables.usecCREs} />
                                    <FormControlLabel value="mm10" control={<Radio />} label="mm10" disabled={!elementFilterVariables.usecCREs} />
                                </RadioGroup>
                                <FormControlLabel
                                    label="Only Orthologous cCREs"
                                    control={
                                        <Checkbox
                                            onChange={() => updateElementFilter("mustHaveOrtholog", !elementFilterVariables.mustHaveOrtholog)}
                                            disabled={!elementFilterVariables.usecCREs || elementFilterVariables.cCREAssembly == "mm10"}
                                            checked={elementFilterVariables.mustHaveOrtholog}
                                        />
                                    }
                                />
                                {elementFilterVariables.selectedBiosample && (
                                    <Paper elevation={0}>
                                        <Stack
                                            borderRadius={1}
                                            direction={"row"}
                                            spacing={3}
                                            sx={{ backgroundColor: "#E7EEF8" }}
                                            alignItems={"center"}
                                        >
                                            <Typography
                                                flexGrow={1}
                                                sx={{ color: "#2C5BA0", pl: 1 }}
                                            >
                                                {elementFilterVariables.selectedBiosample.ontology.charAt(0).toUpperCase() +
                                                    elementFilterVariables.selectedBiosample.ontology.slice(1) +
                                                    " - " +
                                                    elementFilterVariables.selectedBiosample.displayname}
                                            </Typography>
                                            <IconButton
                                                onClick={() => { handleDeselectBiosample() }}
                                                sx={{ m: 'auto', flexGrow: 0 }}
                                            >
                                                <CancelRounded />
                                            </IconButton>
                                        </Stack>
                                    </Paper>
                                )}
                                <Accordion square disableGutters disabled={!elementFilterVariables.usecCREs}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        Within a Biosample
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        <BiosampleTables
                                            selected={elementFilterVariables.selectedBiosample?.name}
                                            onBiosampleClicked={(biosample) => handleSelectedBiosample(biosample)}
                                            assembly={elementFilterVariables.cCREAssembly}
                                        />
                                    </AccordionDetails>
                                </Accordion>

                                <FormGroup>
                                    <Typography mt={2}>Include Classes</Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={areAllClassesChecked()}
                                                indeterminate={isIndeterminateClass()}
                                                onChange={(event) => { handleSelectAllClasses(event) }}
                                            />
                                        }
                                        label="Select All"
                                        disabled={!elementFilterVariables.usecCREs}
                                    />
                                    <Grid container spacing={0} ml={2}>
                                        <Grid size={6}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    checked={elementFilterVariables.classes.CA}
                                                    onChange={() => toggleClass('CA')}
                                                    control={<Checkbox />}
                                                    label="CA"
                                                    value="CA"
                                                    disabled={!elementFilterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={elementFilterVariables.classes["CA-CTCF"]}
                                                    onChange={() => toggleClass('CA-CTCF')}
                                                    control={<Checkbox />}
                                                    label="CA-CTCF"
                                                    value="CACTCF"
                                                    disabled={!elementFilterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={elementFilterVariables.classes["CA-H3K4me3"]}
                                                    onChange={() => toggleClass('CA-H3K4me3')}
                                                    control={<Checkbox />}
                                                    label="CA-H3K4me3"
                                                    value="CAH3K4me3"
                                                    disabled={!elementFilterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={elementFilterVariables.classes["CA-TF"]}
                                                    onChange={() => toggleClass('CA-TF')}
                                                    control={<Checkbox />}
                                                    label="CA-TF"
                                                    value="CATF"
                                                    disabled={!elementFilterVariables.usecCREs}
                                                />
                                            </FormGroup>
                                        </Grid>
                                        <Grid size={6}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    checked={elementFilterVariables.classes.dELS}
                                                    onChange={() => toggleClass('dELS')}
                                                    control={<Checkbox />}
                                                    label="dELS"
                                                    value="dELS"
                                                    disabled={!elementFilterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={elementFilterVariables.classes.pELS}
                                                    onChange={() => toggleClass('pELS')}
                                                    control={<Checkbox />}
                                                    label="pELS"
                                                    value="pELS"
                                                    disabled={!elementFilterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={elementFilterVariables.classes.PLS}
                                                    onChange={() => toggleClass('PLS')}
                                                    control={<Checkbox />}
                                                    label="PLS"
                                                    value="PLS"
                                                    disabled={!elementFilterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={elementFilterVariables.classes.TF}
                                                    onChange={() => toggleClass('TF')}
                                                    control={<Checkbox />}
                                                    label="TF"
                                                    value="TF"
                                                    disabled={!elementFilterVariables.usecCREs}
                                                />
                                            </FormGroup>
                                        </Grid>
                                    </Grid>
                                </FormGroup>
                                <FormGroup>
                                    <Typography>Include Assay Z-Scores</Typography>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={areAllAssaysChecked()}
                                                indeterminate={isIndeterminateAssay()}
                                                onChange={(event) => handleSelectAllAssays(event)}
                                            />
                                        }
                                        label="Select All"
                                        disabled={!elementFilterVariables.usecCREs}
                                    />
                                    <Grid container spacing={0} ml={2}>
                                        <Grid size={6}>
                                            <FormControlLabel
                                                label="DNase"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('dnase')}
                                                        disabled={!elementFilterVariables.availableAssays.dnase || !elementFilterVariables.usecCREs}
                                                        checked={elementFilterVariables.assays.dnase}
                                                        value="dnase"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="H3K4me3"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('h3k4me3')}
                                                        disabled={!elementFilterVariables.availableAssays.h3k4me3 || !elementFilterVariables.usecCREs}
                                                        checked={elementFilterVariables.assays.h3k4me3}
                                                        value="h3k4me3"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="H3K27ac"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('h3k27ac')}
                                                        disabled={!elementFilterVariables.availableAssays.h3k27ac || !elementFilterVariables.usecCREs}
                                                        checked={elementFilterVariables.assays.h3k27ac}
                                                        value="h3k27ac"
                                                    />
                                                }
                                            />
                                        </Grid>
                                        <Grid size={3}>
                                            <FormControlLabel
                                                label="CTCF"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('ctcf')}
                                                        disabled={!elementFilterVariables.availableAssays.ctcf || !elementFilterVariables.usecCREs}
                                                        checked={elementFilterVariables.assays.ctcf}
                                                        value="ctcf"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="ATAC"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('atac')}
                                                        disabled={!elementFilterVariables.availableAssays.atac || !elementFilterVariables.usecCREs}
                                                        checked={elementFilterVariables.assays.atac}
                                                        value="atac"
                                                    />
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                </FormGroup>
                            </Stack>
                            <FormControl sx={{ ml: 2 }}>
                                <Typography>Rank cCREs With Matching Input Region By</Typography>
                                <RadioGroup
                                    row
                                    value={elementFilterVariables.rankBy}
                                    onChange={(event) => updateElementFilter("rankBy", event.target.value as "avg" | "max")}
                                >
                                    <FormControlLabel
                                        value="max"
                                        control={<Radio disabled={!elementFilterVariables.usecCREs} />}
                                        label="Max"
                                    />
                                    <FormControlLabel
                                        value="avg"
                                        control={<Radio disabled={!elementFilterVariables.usecCREs} />}
                                        label="Average"
                                    />
                                </RadioGroup>
                            </FormControl>
                        </AccordionDetails>
                    </Accordion>
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
                                        disabled={!geneFilterVariables.useGenes}/>}
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
                </Box>
            </Drawer>
        </div>
    );
};

export default Filters;