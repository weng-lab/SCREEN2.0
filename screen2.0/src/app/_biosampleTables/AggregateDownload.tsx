import { Button, Tooltip, Box, Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Stack, Typography, Divider } from "@mui/material";
import { useCallback, useMemo, useState } from "react";
import { Download } from "@mui/icons-material"
import { ontologyDownloadMap } from "../_utility/ontologyDownloads";

export type AggregateDownloadProps = {
    ontology: string
}

export const AggregateDownloadButton = ({ ontology }: AggregateDownloadProps) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [noccl, setNoccl] = useState(false)
    const [all, setAll] = useState(false)

    const availibleDownloads = useMemo(() => {
        const key = ontology.toLowerCase().replace(/\s+/g, "_");
        return ontologyDownloadMap[key] ?? [];
    }, [ontology]);


    const ncFile = availibleDownloads.find(d => d.label === "Excluding Cancer Cell Lines")?.filename ?? undefined;
    const allFile = availibleDownloads.find(d => d.label === "All Biosamples")?.filename ?? undefined;

    const handleDownload = useCallback(() => {
        if (!availibleDownloads || availibleDownloads.length === 0) return;

        const checked = [];
        if (noccl) checked.push(ncFile)
        if (all) checked.push(allFile)

        checked.forEach((filename, index) => {
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
    }, [all, allFile, availibleDownloads, ncFile, noccl]);

    return (
        <>
            <Tooltip
                title={
                    availibleDownloads.length === 0 ? (
                        "No Aggregate cCRE Download Options"
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
                            setIsDialogOpen(true);
                        }}
                        endIcon={<Download />}
                        disabled={availibleDownloads.length === 0}
                        variant="outlined"
                        // rendering a button inseide accordian summary cause hydration error
                        component="div"
                    >
                        Download
                    </Button>
                </span>
            </Tooltip>
            <Dialog
                open={isDialogOpen}
                onClose={(event) => {
                    (event as React.MouseEvent).stopPropagation();
                    setIsDialogOpen(false);
                }}
                aria-labelledby="export-dialog-title"
                disableScrollLock
                slotProps={{
                    backdrop: {
                        sx: {
                            backgroundColor: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(2px)",
                        },
                    },
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <DialogTitle id="export-dialog-title">
                    Download cCREs active in {ontology.charAt(0).toUpperCase() + ontology.slice(1)}:
                </DialogTitle>
                <DialogContent>
                    <Stack>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={all}
                                    onChange={(e) => setAll(e.target.checked)}
                                    disabled={!allFile}
                                />}
                            label="Aggregate cCREs (all biosamples)"
                        />
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={noccl}
                                    onChange={(e) => setNoccl(e.target.checked)}
                                    disabled={!ncFile}
                                />
                            }
                            label="Aggregate cCREs (excluding cancer cell lines)"
                        />
                        {availibleDownloads.length <= 1 && (
                            <>
                                <Divider sx={{ marginTop: 1 }} />
                                <Typography marginTop={1}><strong>No cancerous cell lines available in this tissue</strong></Typography>
                            </>
                        )}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setIsDialogOpen(false)
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            handleDownload();
                            setIsDialogOpen(false);
                        }}
                    >
                        Download
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    )
}