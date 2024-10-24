import React, { useEffect, useState } from 'react';
import { FilterProps } from './types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, Drawer, FormControl, FormControlLabel, FormGroup, FormLabel, IconButton, MenuItem, Paper, Radio, RadioGroup, Select, Stack, Typography } from '@mui/material';
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
    rows,
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
    useEffect(() => {
        if (elementFilterVariables.selectedBiosample) {
            updateElementFilter('availableAssays', {
                DNase: !!elementFilterVariables.selectedBiosample.dnase,
                H3K4me3: !!elementFilterVariables.selectedBiosample.h3k4me3,
                H3K27ac: !!elementFilterVariables.selectedBiosample.h3k27ac,
                CTCF: !!elementFilterVariables.selectedBiosample.ctcf,
                ATAC: !!elementFilterVariables.selectedBiosample.atac_signal,
            });
            updateElementFilter('assays', {
                DNase: !!elementFilterVariables.selectedBiosample.dnase,
                H3K4me3: !!elementFilterVariables.selectedBiosample.h3k4me3,
                H3K27ac: !!elementFilterVariables.selectedBiosample.h3k27ac,
                CTCF: !!elementFilterVariables.selectedBiosample.ctcf,
                ATAC: !!elementFilterVariables.selectedBiosample.atac_signal,
            });
        } if (!elementFilterVariables.selectedBiosample) {
            updateElementFilter('availableAssays', {
                DNase: true,
                H3K4me3: true,
                H3K27ac: true,
                CTCF: true,
                ATAC: true,
            });
            updateElementFilter('assays', {
                DNase: true,
                H3K4me3: true,
                H3K27ac: true,
                CTCF: true,
                ATAC: true,
            });
        }
    }, [elementFilterVariables.selectedBiosample]);

    return (
        <div>
            {!drawerOpen && (
                <Box alignItems={"flex-start"} padding={2}>
                    <IconButton
                        onClick={toggleDrawer}
                        color="primary"
                        disabled={rows.length <= 0}
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
                    height="100vh"
                    overflow="auto"
                >
                    <Stack direction={"row"} justifyContent={"space-between"} padding={1}>
                        <Typography alignContent={"center"}>Filters</Typography>
                        <IconButton
                            color="primary"
                            onClick={toggleDrawer}
                        >
                            <FilterListIcon />
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
                        }}>
                            Sequence
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControlLabel value="conservation" control={<Checkbox onChange={() => updateSequenceFilter("useConservation", !sequenceFilterVariables.useConservation)} checked={sequenceFilterVariables.useConservation} />} label="Conservation" />
                            <Stack ml={2}>
                                <FormGroup>
                                    <FormControl fullWidth>
                                        <Select size="small" value={sequenceFilterVariables.alignment} disabled={!sequenceFilterVariables.useConservation} onChange={(event) => updateSequenceFilter("alignment", event.target.value)}>
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
                                <FormControl sx={{ width: "50%" }}>
                                    <FormLabel>Rank By</FormLabel>
                                    <Select size="small" value={sequenceFilterVariables.rankBy} disabled={!sequenceFilterVariables.useConservation} onChange={(event) => updateSequenceFilter("rankBy", event.target.value)}>
                                        <MenuItem value={"min"}>Min</MenuItem>
                                        <MenuItem value={"max"}>Max</MenuItem>
                                        <MenuItem value={"avg"}>Average</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                            <FormGroup>
                                <FormControlLabel value="TFMotifs" control={<Checkbox onChange={() => updateSequenceFilter("useMotifs", !sequenceFilterVariables.useMotifs)} checked={sequenceFilterVariables.useMotifs} />} label="TF Motifs" />
                                <Stack ml={2}>
                                    <RadioGroup value={sequenceFilterVariables.motifCatalog} onChange={(event) => updateSequenceFilter("motifCatalog", event.target.value as "factorbook" | "factorbookTF" | "hocomoco" | "zMotif")}>
                                        <FormControlLabel value="factorbook" control={<Radio />} label="Factorbook" disabled={!sequenceFilterVariables.useMotifs} />
                                        <FormControlLabel value="factorbookTF" control={<Radio />} label="Factorbook + TF Motif" disabled={!sequenceFilterVariables.useMotifs} />
                                        <FormControlLabel value="hocomoco" control={<Radio />} label="HOCOMOCO" disabled={!sequenceFilterVariables.useMotifs} />
                                        <FormControlLabel value="zMotif" control={<Radio />} label="ZMotif" disabled={!sequenceFilterVariables.useMotifs} />
                                    </RadioGroup>
                                </Stack>
                            </FormGroup>
                            <FormGroup>
                                <Stack ml={2}>
                                    <Typography lineHeight={"40px"}>Rank By</Typography>
                                    <FormControlLabel value="numMotifs" control={<Checkbox onChange={() => updateSequenceFilter("numOverlappingMotifs", !sequenceFilterVariables.numOverlappingMotifs)} checked={sequenceFilterVariables.numOverlappingMotifs} />} label="Number of Overlaping Motifs" disabled={!sequenceFilterVariables.useMotifs} />
                                    <FormControlLabel value="motifScoreDelta" control={<Checkbox onChange={() => updateSequenceFilter("motifScoreDelta", !sequenceFilterVariables.motifScoreDelta)} checked={sequenceFilterVariables.motifScoreDelta} />} label="Motif Score Delta" disabled={!sequenceFilterVariables.useMotifs} />
                                    <FormControlLabel value="overlapsTFPeak" control={<Checkbox onChange={() => updateSequenceFilter("overlapsTFPeak", !sequenceFilterVariables.overlapsTFPeak)} checked={sequenceFilterVariables.overlapsTFPeak} />} label="Overlaps TF Peak " disabled={!sequenceFilterVariables.useMotifs} />
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
                        }}>
                            Element
                        </AccordionSummary>
                        <AccordionDetails>
                            <FormControlLabel value="cCREs" control={<Checkbox onChange={() => updateElementFilter("usecCREs", !elementFilterVariables.usecCREs)} checked={elementFilterVariables.usecCREs} />} label="cCREs" />
                            <Stack ml={2}>
                                <RadioGroup row value={elementFilterVariables.cCREAssembly} onChange={(event) => updateElementFilter("cCREAssembly", event.target.value as "GRCh38" | "mm10")}>
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
                                <Accordion square disableGutters disabled={!elementFilterVariables.usecCREs}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        Within a Biosample
                                    </AccordionSummary>
                                    <AccordionDetails>
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
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            updateElementFilter("selectedBiosample", null);
                                                        }}
                                                        sx={{ m: 'auto', flexGrow: 0 }}
                                                    >
                                                        <CancelRounded />
                                                    </IconButton>
                                                </Stack>
                                            </Paper>


                                        )}
                                        <BiosampleTables
                                            selected={elementFilterVariables.selectedBiosample?.name}
                                            onBiosampleClicked={(biosample) => updateElementFilter("selectedBiosample", biosample)}
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
                                                    checked={elementFilterVariables.classes.CACTCF}
                                                    onChange={() => toggleClass('CACTCF')}
                                                    control={<Checkbox />}
                                                    label="CA-CTCF"
                                                    value="CACTCF"
                                                    disabled={!elementFilterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={elementFilterVariables.classes.CAH3K4me3}
                                                    onChange={() => toggleClass('CAH3K4me3')}
                                                    control={<Checkbox />}
                                                    label="CA-H3K4me3"
                                                    value="CAH3K4me3"
                                                    disabled={!elementFilterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={elementFilterVariables.classes.CATF}
                                                    onChange={() => toggleClass('CATF')}
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
                                                        onChange={() => toggleAssay('DNase')}
                                                        disabled={!elementFilterVariables.availableAssays.DNase || !elementFilterVariables.usecCREs}
                                                        checked={elementFilterVariables.assays.DNase}
                                                        value="dnase"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="H3K4me3"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('H3K4me3')}
                                                        disabled={!elementFilterVariables.availableAssays.H3K4me3 || !elementFilterVariables.usecCREs}
                                                        checked={elementFilterVariables.assays.H3K4me3}
                                                        value="h3k4me3"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="H3K27ac"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('H3K27ac')}
                                                        disabled={!elementFilterVariables.availableAssays.H3K27ac || !elementFilterVariables.usecCREs}
                                                        checked={elementFilterVariables.assays.H3K27ac}
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
                                                        onChange={() => toggleAssay('CTCF')}
                                                        disabled={!elementFilterVariables.availableAssays.CTCF || !elementFilterVariables.usecCREs}
                                                        checked={elementFilterVariables.assays.CTCF}
                                                        value="ctcf"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="ATAC"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('ATAC')}
                                                        disabled={!elementFilterVariables.availableAssays.ATAC || !elementFilterVariables.usecCREs}
                                                        checked={elementFilterVariables.assays.ATAC}
                                                        value="atac"
                                                    />
                                                }
                                            />
                                        </Grid>
                                    </Grid>
                                </FormGroup>
                            </Stack>
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
                        }}>
                            Gene
                        </AccordionSummary>
                        <AccordionDetails>
                            <Stack>
                                <Typography lineHeight={"40px"}>Linked Genes</Typography>
                            </Stack>
                        </AccordionDetails>
                    </Accordion>
                </Box>
            </Drawer>
        </div>
    );
};

export default Filters;