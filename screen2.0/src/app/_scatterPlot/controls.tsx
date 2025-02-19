import React, { useEffect } from "react";
import { ControlButtonsProps } from "./types";
import { Button, IconButton, Stack, Tooltip } from "@mui/material";
import { ZoomIn, ZoomOut, PanTool, Edit } from "@mui/icons-material"

const ControlButtons = ({
    handleSelectionModeChange,
    selectMode,
    zoomIn,
    zoomOut,
    zoomReset
}: ControlButtonsProps) => {

    useEffect(() => {
        // Function to handle key press
        const handleKeyDown = (e) => {
          if (e.key === 'Shift') {
            handleSelectionModeChange('pan'); // Switch to pan mode when Shift is pressed
          }
        };
    
        // Function to handle key release
        const handleKeyUp = (e) => {
          if (e.key === 'Shift') {
            handleSelectionModeChange('select'); // Switch back to select mode when Shift is released
          }
        };
    
        // Add event listeners for key press and release
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
    
        // Clean up event listeners on unmount
        return () => {
          window.removeEventListener('keydown', handleKeyDown);
          window.removeEventListener('keyup', handleKeyUp);
        };
      }, [handleSelectionModeChange]);
      
    return (
        <Stack direction="column" spacing={5} alignItems={"center"} justifyContent={"center"}>
            <Tooltip title="Drag to select">
                <IconButton aria-label="edit" onClick={() => handleSelectionModeChange('select')} sx={{ color: selectMode === "select" ? "primary.main" : "default" }}>
                    <Edit />
                </IconButton>
            </Tooltip>
            <Tooltip title="Drag to pan, or hold Shift and drag">
                <IconButton aria-label="pan" onClick={() => handleSelectionModeChange('pan')} sx={{ color: selectMode === "pan" ? "primary.main" : "default" }}>
                    <PanTool />
                </IconButton>
            </Tooltip>
            <Tooltip title="Zoom In">
                <IconButton aria-label="zoom-in" onClick={zoomIn}>
                    <ZoomIn />
                </IconButton>
            </Tooltip>
            <Tooltip title="Zoom Out">
                <IconButton aria-label="zoom-out" onClick={zoomOut}>
                    <ZoomOut />
                </IconButton>
            </Tooltip>
            <Button sx={{ height: '30px', textTransform: 'none' }} size="small" variant="outlined" onClick={zoomReset}>
                Reset
            </Button>
        </Stack>
    );
}

export default ControlButtons;