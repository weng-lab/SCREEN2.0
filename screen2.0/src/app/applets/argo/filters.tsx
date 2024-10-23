import React, { useEffect, useState } from 'react';
import { FilterState, UpdateFilter } from './types';
import { Accordion, AccordionDetails, AccordionSummary, Box, Checkbox, Drawer, FormControl, FormControlLabel, FormGroup, FormLabel, IconButton, MenuItem, Paper, Radio, RadioGroup, Select, Stack, Typography } from '@mui/material';
import BiosampleTables from '../../_biosampleTables/BiosampleTables';
import Grid from "@mui/material/Grid2"
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { CancelRounded } from "@mui/icons-material"
import FilterListIcon from '@mui/icons-material/FilterList';

interface FilterProps {
    filterVariables: FilterState;
    updateFilter: UpdateFilter;
    toggleAssay: (assayName: keyof FilterState['assays']) => void;
    toggleClass: (className: keyof FilterState['classes']) => void;
    drawerOpen: boolean;
    toggleDrawer: () => void;
    rows: any;
}

const Filters: React.FC<FilterProps> = ({
    filterVariables,
    updateFilter,
    toggleAssay,
    toggleClass,
    drawerOpen,
    toggleDrawer,
    rows,
}) => {

    const [expandedAccordions, setExpandedAccordions] = useState<string[]>(["sequence"]);

    const handleAccordionChange = (panel: string) => () => {
        setExpandedAccordions((prevExpanded) =>
            prevExpanded.includes(panel)
                ? prevExpanded.filter((p) => p !== panel)
                : [...prevExpanded, panel]
        );
    };

    const isExpanded = (panel: string) => expandedAccordions.includes(panel);

    const handleSelectAllAssays = (event) => {
        const isChecked = event.target.checked;

        const updatedAssays = { ...filterVariables.assays };
        Object.keys(filterVariables.availableAssays).forEach((key) => {
            if (filterVariables.availableAssays[key]) {
                updatedAssays[key] = isChecked;
            }
        });
        updateFilter("assays", updatedAssays);
    };

    const areAllAssaysChecked = () => {
        return Object.keys(filterVariables.availableAssays).every((key) => (filterVariables.availableAssays[key] && filterVariables.assays[key]) || (!filterVariables.availableAssays[key] && !filterVariables.assays[key]));
    };

    const isIndeterminateAssay = () => {
        const checkedCount = Object.keys(filterVariables.availableAssays).filter((key) => filterVariables.availableAssays[key] && filterVariables.assays[key]).length;
        const totalAvailable = Object.keys(filterVariables.availableAssays).filter((key) => filterVariables.availableAssays[key]).length;

        return checkedCount > 0 && checkedCount < totalAvailable;
    };

    const handleSelectAllClasses = (event) => {
        const isChecked = event.target.checked;

        updateFilter("classes", {
            ...filterVariables.classes,
            ...Object.keys(filterVariables.classes).reduce((acc, key) => {
                acc[key] = isChecked;
                return acc;
            }, {})
        });
    };

    const areAllClassesChecked = () => {
        return Object.values(filterVariables.classes).every((isChecked) => isChecked);
    };

    const isIndeterminateClass = () => {
        const checkedCount = Object.values(filterVariables.classes).filter((isChecked) => isChecked).length;
        const totalClasses = Object.keys(filterVariables.classes).length;

        return checkedCount > 0 && checkedCount < totalClasses;
    };

    useEffect(() => {
        if (filterVariables.selectedBiosample) {
            updateFilter('availableAssays', {
                DNase: !!filterVariables.selectedBiosample.dnase,
                H3K4me3: !!filterVariables.selectedBiosample.h3k4me3,
                H3K27ac: !!filterVariables.selectedBiosample.h3k27ac,
                CTCF: !!filterVariables.selectedBiosample.ctcf,
                ATAC: !!filterVariables.selectedBiosample.atac_signal,
            });
            updateFilter('assays', {
                DNase: !!filterVariables.selectedBiosample.dnase,
                H3K4me3: !!filterVariables.selectedBiosample.h3k4me3,
                H3K27ac: !!filterVariables.selectedBiosample.h3k27ac,
                CTCF: !!filterVariables.selectedBiosample.ctcf,
                ATAC: !!filterVariables.selectedBiosample.atac_signal,
            });
        } if (!filterVariables.selectedBiosample) {
            updateFilter('availableAssays', {
                DNase: true,
                H3K4me3: true,
                H3K27ac: true,
                CTCF: true,
                ATAC: true,
            });
            updateFilter('assays', {
                DNase: true,
                H3K4me3: true,
                H3K27ac: true,
                CTCF: true,
                ATAC: true,
            });
        }
    }, [filterVariables.selectedBiosample]);

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
                            <FormControlLabel value="conservation" control={<Checkbox onChange={() => updateFilter("useConservation", !filterVariables.useConservation)} checked={filterVariables.useConservation} />} label="Conservation" />
                            <Stack ml={2}>
                                <FormGroup>
                                    <FormControl fullWidth>
                                        <Select size="small" value={filterVariables.alignment} disabled={!filterVariables.useConservation} onChange={(event) => updateFilter("alignment", event.target.value)}>
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
                                    <Select size="small" value={filterVariables.rankBy} disabled={!filterVariables.useConservation} onChange={(event) => updateFilter("rankBy", event.target.value)}>
                                        <MenuItem value={"min"}>Min</MenuItem>
                                        <MenuItem value={"max"}>Max</MenuItem>
                                        <MenuItem value={"avg"}>Average</MenuItem>
                                    </Select>
                                </FormControl>
                            </Stack>
                            <FormGroup>
                                <FormControlLabel value="TFMotifs" control={<Checkbox onChange={() => updateFilter("useMotifs", !filterVariables.useMotifs)} checked={filterVariables.useMotifs} />} label="TF Motifs" />
                                <Stack ml={2}>
                                    <RadioGroup value={filterVariables.motifCatalog} onChange={(event) => updateFilter("motifCatalog", event.target.value as "factorbook" | "factorbookTF" | "hocomoco" | "zMotif")}>
                                        <FormControlLabel value="factorbook" control={<Radio />} label="Factorbook" disabled={!filterVariables.useMotifs} />
                                        <FormControlLabel value="factorbookTF" control={<Radio />} label="Factorbook + TF Motif" disabled={!filterVariables.useMotifs} />
                                        <FormControlLabel value="hocomoco" control={<Radio />} label="HOCOMOCO" disabled={!filterVariables.useMotifs} />
                                        <FormControlLabel value="zMotif" control={<Radio />} label="ZMotif" disabled={!filterVariables.useMotifs} />
                                    </RadioGroup>
                                </Stack>
                            </FormGroup>
                            <FormGroup>
                                <Stack ml={2}>
                                    <Typography lineHeight={"40px"}>Rank By</Typography>
                                    <FormControlLabel value="numMotifs" control={<Checkbox onChange={() => updateFilter("numOverlappingMotifs", !filterVariables.numOverlappingMotifs)} checked={filterVariables.numOverlappingMotifs} />} label="Number of Overlaping Motifs" disabled={!filterVariables.useMotifs} />
                                    <FormControlLabel value="motifScoreDelta" control={<Checkbox onChange={() => updateFilter("motifScoreDelta", !filterVariables.motifScoreDelta)} checked={filterVariables.motifScoreDelta} />} label="Motif Score Delta" disabled={!filterVariables.useMotifs} />
                                    <FormControlLabel value="overlapsTFPeak" control={<Checkbox onChange={() => updateFilter("overlapsTFPeak", !filterVariables.overlapsTFPeak)} checked={filterVariables.overlapsTFPeak} />} label="Overlaps TF Peak " disabled={!filterVariables.useMotifs} />
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
                            <FormControlLabel value="cCREs" control={<Checkbox onChange={() => updateFilter("usecCREs", !filterVariables.usecCREs)} checked={filterVariables.usecCREs} />} label="cCREs" />
                            <Stack ml={2}>
                                <RadioGroup row value={filterVariables.cCREAssembly} onChange={(event) => updateFilter("cCREAssembly", event.target.value as "GRCh38" | "mm10")}>
                                    <FormControlLabel value="GRCh38" control={<Radio />} label="GRCH38" disabled={!filterVariables.usecCREs} />
                                    <FormControlLabel value="mm10" control={<Radio />} label="mm10" disabled={!filterVariables.usecCREs} />
                                </RadioGroup>
                                <FormControlLabel
                                    label="Only Orthologous cCREs"
                                    control={
                                        <Checkbox
                                            onChange={() => updateFilter("mustHaveOrtholog", !filterVariables.mustHaveOrtholog)}
                                            disabled={!filterVariables.usecCREs || filterVariables.cCREAssembly == "mm10"}
                                            checked={filterVariables.mustHaveOrtholog}
                                        />
                                    }
                                />
                                <Accordion square disableGutters disabled={!filterVariables.usecCREs}>
                                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                        Within a Biosample
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {filterVariables.selectedBiosample && (
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
                                                        {filterVariables.selectedBiosample.ontology.charAt(0).toUpperCase() +
                                                            filterVariables.selectedBiosample.ontology.slice(1) +
                                                            " - " +
                                                            filterVariables.selectedBiosample.displayname}
                                                    </Typography>
                                                    <IconButton
                                                        onClick={(event) => {
                                                            event.stopPropagation();
                                                            updateFilter("selectedBiosample", null);
                                                        }}
                                                        sx={{ m: 'auto', flexGrow: 0 }}
                                                    >
                                                        <CancelRounded />
                                                    </IconButton>
                                                </Stack>
                                            </Paper>


                                        )}
                                        <BiosampleTables
                                            selected={filterVariables.selectedBiosample?.name}
                                            onBiosampleClicked={(biosample) => updateFilter("selectedBiosample", biosample)}
                                            assembly={filterVariables.cCREAssembly}
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
                                        disabled={!filterVariables.usecCREs}
                                    />
                                    <Grid container spacing={0} ml={2}>
                                        <Grid size={6}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    checked={filterVariables.classes.CA}
                                                    onChange={() => toggleClass('CA')}
                                                    control={<Checkbox />}
                                                    label="CA"
                                                    value="CA"
                                                    disabled={!filterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={filterVariables.classes.CACTCF}
                                                    onChange={() => toggleClass('CACTCF')}
                                                    control={<Checkbox />}
                                                    label="CA-CTCF"
                                                    value="CACTCF"
                                                    disabled={!filterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={filterVariables.classes.CAH3K4me3}
                                                    onChange={() => toggleClass('CAH3K4me3')}
                                                    control={<Checkbox />}
                                                    label="CA-H3K4me3"
                                                    value="CAH3K4me3"
                                                    disabled={!filterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={filterVariables.classes.CATF}
                                                    onChange={() => toggleClass('CATF')}
                                                    control={<Checkbox />}
                                                    label="CA-TF"
                                                    value="CATF"
                                                    disabled={!filterVariables.usecCREs}
                                                />
                                            </FormGroup>
                                        </Grid>
                                        <Grid size={6}>
                                            <FormGroup>
                                                <FormControlLabel
                                                    checked={filterVariables.classes.dELS}
                                                    onChange={() => toggleClass('dELS')}
                                                    control={<Checkbox />}
                                                    label="dELS"
                                                    value="dELS"
                                                    disabled={!filterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={filterVariables.classes.pELS}
                                                    onChange={() => toggleClass('pELS')}
                                                    control={<Checkbox />}
                                                    label="pELS"
                                                    value="pELS"
                                                    disabled={!filterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={filterVariables.classes.PLS}
                                                    onChange={() => toggleClass('PLS')}
                                                    control={<Checkbox />}
                                                    label="PLS"
                                                    value="PLS"
                                                    disabled={!filterVariables.usecCREs}
                                                />
                                                <FormControlLabel
                                                    checked={filterVariables.classes.TF}
                                                    onChange={() => toggleClass('TF')}
                                                    control={<Checkbox />}
                                                    label="TF"
                                                    value="TF"
                                                    disabled={!filterVariables.usecCREs}
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
                                        disabled={!filterVariables.usecCREs}
                                    />
                                    <Grid container spacing={0} ml={2}>
                                        <Grid size={6}>
                                            <FormControlLabel
                                                label="DNase"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('DNase')}
                                                        disabled={!filterVariables.availableAssays.DNase || !filterVariables.usecCREs}
                                                        checked={filterVariables.assays.DNase}
                                                        value="dnase"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="H3K4me3"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('H3K4me3')}
                                                        disabled={!filterVariables.availableAssays.H3K4me3 || !filterVariables.usecCREs}
                                                        checked={filterVariables.assays.H3K4me3}
                                                        value="h3k4me3"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="H3K27ac"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('H3K27ac')}
                                                        disabled={!filterVariables.availableAssays.H3K27ac || !filterVariables.usecCREs}
                                                        checked={filterVariables.assays.H3K27ac}
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
                                                        disabled={!filterVariables.availableAssays.CTCF || !filterVariables.usecCREs}
                                                        checked={filterVariables.assays.CTCF}
                                                        value="ctcf"
                                                    />
                                                }
                                            />
                                            <FormControlLabel
                                                label="ATAC"
                                                control={
                                                    <Checkbox
                                                        onChange={() => toggleAssay('ATAC')}
                                                        disabled={!filterVariables.availableAssays.ATAC || !filterVariables.usecCREs}
                                                        checked={filterVariables.assays.ATAC}
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