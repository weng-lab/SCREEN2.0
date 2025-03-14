import React, { useMemo, useState } from 'react';
import { ElementFilterState, FilterProps, GeneFilterState, Panel, SequenceFilterState } from './types';
import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import FilterListIcon from '@mui/icons-material/FilterList';
import SequenceFilters from './sequence/sequenceFilters';
import ElementFilters from './elements/elementFilters';
import GeneFilters from './genes/geneFilters';
import { Clear } from "@mui/icons-material"

const Filters: React.FC<FilterProps> = ({
    sequenceFilterVariables,
    elementFilterVariables,
    geneFilterVariables,
    updateSequenceFilter,
    updateElementFilter,
    updateGeneFilter,
    drawerOpen,
    toggleDrawer,
}) => {

    const [expandedAccordions, setExpandedAccordions] = useState<Panel[]>([]);

    // Initial filter states
    const initialSequenceFilterState: SequenceFilterState = {
        useConservation: true,
        alignment: "241-mam-phyloP",
        rankBy: "max",
        useMotifs: true,
        motifCatalog: "hocomoco",
        motifQuality: { a: true, b: true, c: true, d: true },
        dataSource: { p: true, s: true, m: true, g: true, i: true, b: true },
        numOverlappingMotifs: true,
        motifScoreDelta: true,
        overlapsTFPeak: false,
        tfPeakStrength: false
    };

    const initialElementFilterState: ElementFilterState = {
        usecCREs: true,
        cCREAssembly: "GRCh38",
        mustHaveOrtholog: false,
        selectedBiosample: null,
        assays: { dnase: true, atac: true, ctcf: true, h3k4me3: true, h3k27ac: true },
        rankBy: "avg",
        availableAssays: { dnase: true, atac: true, ctcf: true, h3k4me3: true, h3k27ac: true },
        classes: {
            CA: true, "CA-CTCF": true, "CA-H3K4me3": true, "CA-TF": true,
            dELS: true, pELS: true, PLS: true, TF: true
        }
    };

    const initialGeneFilterState: GeneFilterState = {
        useGenes: true,
        methodOfLinkage: {
            distance: true, eQTLs: true, CRISPRi_FlowFISH: true,
            Intact_HiC: true, CTCF_ChIAPET: true, RNAPII_ChIAPET: true
        },
        mustBeProteinCoding: false,
        mustHaveOrtholog: false,
        rankExpSpecBy: "max",
        rankGeneExpBy: "max",
        selectedBiosample: null
    };

    // Function to reset filters
    const handleClearFilters = () => {
        Object.entries(initialSequenceFilterState).forEach(([key, value]) =>
            updateSequenceFilter(key as keyof SequenceFilterState, value)
        );

        Object.entries(initialElementFilterState).forEach(([key, value]) =>
            updateElementFilter(key as keyof ElementFilterState, value)
        );

        Object.entries(initialGeneFilterState).forEach(([key, value]) =>
            updateGeneFilter(key as keyof GeneFilterState, value)
        );
    };

    // Check if any filter has changed
    const filtersChanged = useMemo(() => {
        return (
            JSON.stringify(sequenceFilterVariables) !== JSON.stringify(initialSequenceFilterState) ||
            JSON.stringify(elementFilterVariables) !== JSON.stringify(initialElementFilterState) ||
            JSON.stringify(geneFilterVariables) !== JSON.stringify(initialGeneFilterState)
        );
    }, [sequenceFilterVariables, elementFilterVariables, geneFilterVariables]);

    const isExpanded = (panel: Panel) => expandedAccordions.includes(panel);

    const handleAccordionChange = (panel: Panel) => () => {
        setExpandedAccordions((prevExpanded) =>
            prevExpanded.includes(panel)
                ? prevExpanded.filter((p) => p !== panel)
                : [...prevExpanded, panel]
        );
    };


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
                        minWidth: 300
                    }
                }}
            >

                <Stack direction={"row"} justifyContent={"space-between"} padding={1} sx={{borderBottom: "1px solid #ddd"}}>
                    <Typography variant="h5" sx={{ fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif' }} alignContent={"center"}>Filters</Typography>
                    {filtersChanged && (
                        <Stack direction={"row"} spacing={1} alignItems={"center"}>
                            <Typography>Clear Filters</Typography>
                            <IconButton onClick={handleClearFilters}>
                                <Clear />
                            </IconButton>
                        </Stack>
                    )}
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
                <Box
                    height="calc(100vh - 113px)"
                    overflow="auto"
                >
                    <SequenceFilters
                        sequenceFilterVariables={sequenceFilterVariables}
                        updateSequenceFilter={updateSequenceFilter}
                        isExpanded={isExpanded}
                        handleAccordionChange={handleAccordionChange}
                    />
                    <ElementFilters
                        elementFilterVariables={elementFilterVariables}
                        updateElementFilter={updateElementFilter}
                        isExpanded={isExpanded}
                        handleAccordionChange={handleAccordionChange}
                    />
                    <GeneFilters
                        geneFilterVariables={geneFilterVariables}
                        updateGeneFilter={updateGeneFilter}
                        isExpanded={isExpanded}
                        handleAccordionChange={handleAccordionChange}
                    />
                </Box>
            </Drawer>
        </div>
    );
};

export default Filters;