import React, { useCallback, useState } from "react"
import { Button, Typography, Stack, Container, IconButton, FormControl, Select, MenuItem, Box, TextField, Alert } from "@mui/material"
import { useDropzone } from "react-dropzone"
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Cancel, Search } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import { UploadProps } from "./types";

const ArgoUpload: React.FC<UploadProps> = ({
    selectedSearch,
    handleSearchChange,
    onRegionsConfigured
}) => {
    const [files, setFiles] = useState<File[]>([])
    const onDrop = useCallback(acceptedFiles => {
        // Currently only accepting 1 file
        setFiles([acceptedFiles[0]])
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState([false, ""]) // status, message

    function parseDataInput(data) {
        const allLines = []
        data.split("\n").forEach((line) => {
            // The if statement checks if the BED file has a header and does not push those
            // Also checks for empty lines
            if (!(line.startsWith("#") ||
                line.startsWith("browser") ||
                line.startsWith("track") ||
                line.length === 0
            )) {
                allLines.push(line.split("\t"))
            }
        })
        return allLines
    }

    function submitTextUpload(event) {
        const uploadedData = event.get("textUploadFile").toString()
        const inputData = parseDataInput(uploadedData)
        configureInputedRegions(inputData)
    }

    //TODO Warn based on file size, support multiple files
    const submitUploadedFile = () => {
        setLoading(true)
        setError([false, ""])
        let allLines = []
        let filenames: string = ''
        files.forEach((f) => {
            filenames += (' ' + f.name)
            if (f.type !== "bed" && f.name.split('.').pop() !== "bed") {
                console.error("File type is not bed");
                setLoading(false)
                setFiles([])
                setError([true, "File type is not bed"])
                return
            }
            const reader = new FileReader()
            reader.onload = (r) => {
                const contents = r.target.result
                const lines = contents.toString()
                allLines = parseDataInput(lines).slice(0, 1000)
            }
            reader.onabort = () => console.log("file reading was aborted")
            reader.onerror = () => console.log("file reading has failed")
            reader.onloadend = () => {
                sessionStorage.setItem("filenames", filenames)
                configureInputedRegions(allLines)
            }
            reader.readAsText(f)
        })
    }

    function configureInputedRegions(data) {
        const regions = data.map(item => ({
            chr: item[0],         // Index 0 for inputed chromosome
            start: Number(item[1]), // Index 1 for inputed start, convert to number
            end: Number(item[2])     // Index 2 for inputed end, convert to number
        }));

        // Sort the regions
        const sortedRegions = regions.sort((a, b) => {
            const chrA = a.chr.replace('chr', '');
            const chrB = b.chr.replace('chr', '');

            if (chrA !== chrB) {
                return chrA - chrB;
            }
            if (a.start !== b.start) {
                return a.start - b.start;
            }
        });
        onRegionsConfigured(sortedRegions);
    }

    function truncateFileName(string, maxLength, ellipsis = "...") {
        if (string.length <= maxLength) {
            return string;
        }

        return string.substring(0, maxLength - ellipsis.length) + ellipsis;
    }

    return (
        <>
            <Stack direction={"column"} spacing={3} mt="10px">
                {error[0] && <Alert variant="filled" severity="error">{error[1]}</Alert>}
                <Stack direction={"row"} alignItems={"center"} flexWrap={"wrap"}>
                    <Typography variant={"h5"} mr={1} alignSelf="center">
                        Upload Through
                    </Typography>
                    <Stack
                        direction={"row"}
                        alignItems={"center"}
                        flexWrap={"wrap"}
                    >
                        <FormControl
                            variant="standard"
                            size="medium"
                            sx={{ '& .MuiInputBase-root': { fontSize: '1.5rem' } }}
                        >
                            <Select
                                fullWidth
                                id="select-search"
                                value={selectedSearch}
                                onChange={handleSearchChange}
                                SelectDisplayProps={{
                                    style: { paddingBottom: '0px', paddingTop: '1px' },
                                }}
                            >
                                <MenuItem value={"BED File"}>BED File</MenuItem>
                                <MenuItem value={"Text Box"}>Text Box</MenuItem>
                            </Select>
                        </FormControl>
                    </Stack>
                </Stack>
            </Stack>
            <Box mt="20px" width="30vw">
                {selectedSearch === "BED File" ? (
                    files.length === 0 && (
                        <Container
                            sx={{
                                border: isDragActive ? "2px dashed blue" : "2px dashed grey",
                                borderRadius: "10px",
                                minWidth: "250px",
                                pl: "0 !important",
                                pr: "0 !important",
                                color: isDragActive ? "text.secondary" : "text.primary"
                            }}
                        >
                            <div {...getRootProps()} style={{ padding: "1rem" }}>
                                <input {...getInputProps()} type="file" accept=".bed" />
                                <Stack spacing={1} direction="column" alignItems="center">
                                    <UploadFileIcon />
                                    <Typography>
                                        Drag and drop a .bed file
                                    </Typography>
                                    <Typography>
                                        or
                                    </Typography>
                                    <Button variant="outlined" disabled={isDragActive} sx={{ textTransform: "none" }}>
                                        Click to select a file
                                    </Button>
                                </Stack>
                            </div>
                        </Container>
                    )
                ) : (
                    <FormControl fullWidth>
                        <form action={submitTextUpload}>
                            <TextField
                                name="textUploadFile"
                                multiline
                                fullWidth
                                rows={5}
                                placeholder="Copy and paste your data from Excel here"
                            />
                            <Button type="submit" size="medium" variant="outlined">
                                Submit
                            </Button>
                        </form>
                    </FormControl>
                )}
                {/* When a file is uploaded */}
                {files.length > 0 &&
                    <>
                        <Typography mb={1} variant="h5">Uploaded:</Typography>
                        <Stack direction="row" alignItems="center">
                            <Typography>{`${truncateFileName(files[0].name, 40)}\u00A0-\u00A0${(files[0].size / 1000000).toFixed(1)}\u00A0mb`}</Typography>
                            <IconButton color="primary" onClick={() => { setFiles([]); handleSearchChange(null); onRegionsConfigured([]); }}>
                                <Cancel />
                            </IconButton>
                        </Stack>
                        <LoadingButton
                            loading={loading}
                            loadingPosition="end"
                            sx={{ textTransform: 'none', maxWidth: "18rem" }}
                            onClick={submitUploadedFile}
                            variant="outlined"
                            color="primary"
                            endIcon={<Search />}
                        >
                            <span>
                                Submit
                            </span>
                        </LoadingButton>
                    </>
                }

            </Box>
        </>

    )
}

export default ArgoUpload