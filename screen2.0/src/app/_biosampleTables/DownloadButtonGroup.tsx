import { ButtonGroup, Button, Popper, Grow, Paper, ClickAwayListener, MenuList, MenuItem, Tooltip, Box } from "@mui/material";
import { useCallback, useMemo, useRef, useState } from "react";
import { ArrowDropDown, Download, } from "@mui/icons-material"
import { ontologyDownloadMap } from "../_utility/ontologyDownloads";

export type DownloadButtonGroupProps = {
    ontology: string
}

export const DownloadButtonGroup = ({ ontology }: DownloadButtonGroupProps) => {
    const [popperOpen, setPopperOpen] = useState(false);
    const buttonGroupAnchor = useRef<HTMLDivElement>(null);

    const downloadOptions = ['Non-cancerous Lines', 'All Cell Lines'];
    const availibleDownloads = useMemo(() => {
        const key = ontology.toLowerCase().replace(/\s+/g, "_");
        return ontologyDownloadMap[key] ?? [];
    }, [ontology]);


    const ncFile = availibleDownloads.find(d => d.label === "Non-cancerous Lines")?.filename ?? undefined;
    const allFile = availibleDownloads.find(d => d.label === "All Cell Lines")?.filename ?? undefined;

    const handleToggle = (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        event.stopPropagation();
        setPopperOpen((prevOpen) => !prevOpen);
    };

    const handleClose = (event: Event) => {
        if (
            buttonGroupAnchor.current &&
            buttonGroupAnchor.current.contains(event.target as HTMLElement)
        ) {
            return;
        }

        setPopperOpen(false);
    };

    const handleDownloadAll = useCallback(() => {
        if (!availibleDownloads || availibleDownloads.length === 0) return;

        availibleDownloads.forEach(({ filename }, index) => {
            if (!filename) return;

            setTimeout(() => {
                const link = document.createElement("a");
                link.href = `https://downloads.wenglab.org/${filename}`;
                link.download = filename;

                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, index * 500); // 500ms delay between downloads (some browsers prevent against mutliple downloads at once)
        });
    }, [availibleDownloads]);

    return (
        <>
            <ButtonGroup
                variant="contained"
                ref={buttonGroupAnchor}
                sx={{
                    width: 'fit-content',
                    minWidth: 'fit-content',
                }}
            >
                <Tooltip
                    title={
                        availibleDownloads.length === 0 ? (
                            "No Download Options"
                        ) : (
                            <Box>
                                <strong>Download cCREs active in {ontology.charAt(0).toUpperCase() + ontology.slice(1)}:</strong>
                                <ul style={{ margin: 0, paddingLeft: 16 }}>
                                    {availibleDownloads.map((d) => (
                                        <li key={d.filename}>{d.label}</li>
                                    ))}
                                </ul>
                            </Box>
                        )
                    }
                    placement="top"
                    arrow
                >
                    <span>
                        <Button
                            onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadAll();
                            }}
                            startIcon={<Download />}
                            disabled={availibleDownloads.length === 0}
                            variant="text"
                        >
                            Download
                        </Button>
                    </span>
                </Tooltip>
                <Tooltip title={availibleDownloads.length === 0 ? "No Download Options" : `Download Options`} placement="top" arrow>
                    <span>
                        <Button
                            size="small"
                            sx={{ height: "100%" }}
                            aria-controls={popperOpen ? 'split-button-menu' : undefined}
                            aria-expanded={popperOpen ? 'true' : undefined}
                            onClick={(e) => handleToggle(e)}
                            disabled={availibleDownloads.length === 0}
                            variant="text"
                        >
                            <ArrowDropDown />
                        </Button>
                    </span>
                </Tooltip>
            </ButtonGroup>
            <Popper
                sx={{ zIndex: 10 }}
                open={popperOpen}
                anchorEl={buttonGroupAnchor.current}
                role={undefined}
                transition
                disablePortal
            >
                {({ TransitionProps, placement }) => (
                    <Grow
                        {...TransitionProps}
                        style={{
                            transformOrigin:
                                placement === 'bottom' ? 'right top' : 'right bottom',
                        }}
                    >
                        <Paper>
                            <ClickAwayListener onClickAway={handleClose}>
                                <MenuList id="split-button-menu" autoFocusItem>
                                    {downloadOptions.map((type) => {
                                        const filename =
                                            type === "Non-cancerous Lines"
                                                ? ncFile
                                                : type === "All Cell Lines"
                                                    ? allFile
                                                    : undefined;

                                        return (
                                            <MenuItem
                                                component="a"
                                                key={type}
                                                download
                                                href={filename ? `https://downloads.wenglab.org/${filename}` : undefined}
                                                onClick={(e) => e.stopPropagation()}
                                                disabled={!filename}
                                            >
                                                {type}
                                            </MenuItem>
                                        );
                                    })}
                                </MenuList>
                            </ClickAwayListener>
                        </Paper>
                    </Grow>
                )}
            </Popper >
        </>
    )
}