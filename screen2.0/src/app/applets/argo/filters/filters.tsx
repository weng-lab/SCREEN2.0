import React, { useState } from 'react';
import { FilterProps, Panel } from '../types';
import { Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import FilterListIcon from '@mui/icons-material/FilterList';
import SequenceFilters from './sequenceFilters';
import ElementFilters from './elementFilters';
import GeneFilters from './geneFilters';

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

    //Keep track of which tab is expanded in the drawer
    /**
     * 
     * 
     * 
     * Change this back before merging changes
     * 
     * 
     * 
     */
    const [expandedAccordions, setExpandedAccordions] = useState<Panel[]>(["gene"]);

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