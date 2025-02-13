import React from "react";
import { CCREAssays, CCREClasses, ElementAccordianProps } from "../types";
import { Accordion, AccordionDetails, AccordionSummary, Checkbox, FormControl, FormControlLabel, FormGroup, IconButton, Paper, Radio, RadioGroup, Stack, Tooltip, Typography } from "@mui/material";
import BiosampleTables from "../../../_biosampleTables/BiosampleTables";
import Grid from "@mui/material/Grid2"
import { CancelRounded, InfoOutlined, ExpandMore } from "@mui/icons-material"

const ElementFilters: React.FC<ElementAccordianProps> = ({
    elementFilterVariables,
    updateElementFilter,
    isExpanded,
    handleAccordionChange
}) => {

    //update a specific assay
    const toggleAssay = (assayName: keyof CCREAssays) => {
        updateElementFilter('assays', {
            ...elementFilterVariables.assays,
            [assayName]: !elementFilterVariables.assays[assayName]
        });
    };

    //update a specific class
    const toggleClass = (className: keyof CCREClasses) => {
        updateElementFilter('classes', {
            ...elementFilterVariables.classes,
            [className]: !elementFilterVariables.classes[className]
        });
    };

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
        <Accordion
            defaultExpanded
            square
            disableGutters
            expanded={isExpanded('element')}
            onChange={handleAccordionChange('element')}
        >
            <AccordionSummary expandIcon={<ExpandMore sx={{ color: isExpanded('element') ? '#030f98' : 'inherit' }} />}>
                <Stack direction="row" spacing={1} alignItems={'center'}>
                    <Typography
                        sx={{
                            color: isExpanded('element') ? '#030f98' : 'inherit',
                            fontSize: isExpanded('element') ? 'large' : 'normal',
                            fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
                        }}
                    >
                        Elements
                    </Typography>
                    <Tooltip arrow placement="right-end" title={"Filter results based on overlapping cCREs and thier classification or assay Z-scores"}>
                        <InfoOutlined fontSize="small" />
                    </Tooltip>
                </Stack>
            </AccordionSummary>
            <AccordionDetails>
                <FormControlLabel value="cCREs" control={<Checkbox onChange={() => updateElementFilter("usecCREs", !elementFilterVariables.usecCREs)} checked={elementFilterVariables.usecCREs} />} label="Overlapping cCREs" />
                <Stack ml={2}>
                    <RadioGroup row value={elementFilterVariables.cCREAssembly} onChange={(event) => { updateElementFilter("cCREAssembly", event.target.value as "GRCh38" | "mm10"); handleDeselectBiosample() }}>
                        <FormControlLabel value="GRCh38" control={<Radio />} label="GRCh38" disabled={!elementFilterVariables.usecCREs} />
                        <FormControlLabel value="mm10" control={<Radio />} label="mm10" disabled={!elementFilterVariables.usecCREs} />
                    </RadioGroup>
                    <FormControlLabel
                        label="cCREs Must Have Mouse Ortholog"
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
                                sx={{ backgroundColor: theme => theme.palette.secondary.main }}
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
                        <AccordionSummary expandIcon={<ExpandMore />}>
                            Within a Biosample
                        </AccordionSummary>
                        <AccordionDetails>
                            <BiosampleTables
                                selected={elementFilterVariables.selectedBiosample?.name}
                                onChange={(biosample) => handleSelectedBiosample(biosample)}
                                assembly={elementFilterVariables.cCREAssembly}
                            />
                        </AccordionDetails>
                    </Accordion>
                    <FormControl sx={{mt: 1}}>
                        <Typography>Include Classes</Typography>
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
                    </FormControl>
                    <FormControl>
                        <Typography mt={2}>Include Assay Z-Scores</Typography>
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
                    </FormControl>
                </Stack>
                <FormControl sx={{ ml: 2, mt: 1}}>
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
    )
}

export default ElementFilters;