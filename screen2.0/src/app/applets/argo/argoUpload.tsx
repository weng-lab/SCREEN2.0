import React, { useCallback, useState } from "react"
import { Button, Typography, Stack, IconButton, FormControl, Select, MenuItem, Box, TextField, Alert, Link, Container } from "@mui/material"
import { useDropzone } from "react-dropzone"
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Cancel, Search } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import { InputRegions, UploadProps } from "./types";
import FileDownloadIcon from '@mui/icons-material/FileDownload';

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

    //Allow the user to insert a tab in the text box
    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Tab') {
            event.preventDefault();
            const target = event.target as HTMLTextAreaElement;
            const start = target.selectionStart;
            const end = target.selectionEnd;

            // Insert tab character at the cursor position
            target.value =
                target.value.substring(0, start) +
                '\t' +
                target.value.substring(end);

            // Move the cursor after the inserted tab character
            target.selectionStart = target.selectionEnd = start + 1;
        }
    };

    //coppied from BedUpload
    function parseDataInput(data) {
        const allLines = []
        data.split("\n").forEach((line) => {
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
                allLines = parseDataInput(lines)
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

    //map parsed file / text to Genomic region type and sort them
    function configureInputedRegions(data) {
        const regions: InputRegions = data.map((item, index) => ({
            chr: item[0],         // Index 0 for inputed chromosome
            start: Number(item[1]), // Index 1 for inputed start, convert to number
            end: Number(item[2]),    // Index 2 for inputed end, convert to number
            ref: item[3],   // Index 3 for reference allele
            alt: item[4],  //Index 3 for alternate allele
            strand: item[5],  //Index 5 for strand pos/neg
            regionID: item.length === 7 ? item[6] : index + 1,  //Index 6 for region ID, if they do not provide one, supply one
        }));

        // Sort the regions
        const sortedRegions = regions.sort((a, b) => {
            const chrA = Number(a.chr.replace('chr', ''));
            const chrB = Number(b.chr.replace('chr', ''));

            if (chrA !== chrB) {
                return chrA - chrB;
            }
            if (a.start !== b.start) {
                return a.start - b.start;
            }
        });
        setLoading(false)
        onRegionsConfigured(sortedRegions);
    }

    //coppied from BedUpload
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
                <Stack
                    direction={"column"}
                    spacing={2}
                    sx={{
                        padding: "16px",
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: "8px",
                        backgroundColor: "grey.100",
                    }}
                >
                    <Typography variant="body1" fontSize="1.1rem">
                        <strong>Required Fields:</strong> <br />
                        <strong>Chromosome</strong>, <strong>Start</strong>, <strong>End</strong>,{" "}
                        <strong>Reference Allele</strong>, <strong>Alternate Allele</strong>, {" "}
                        <strong>Strand</strong>, and{" "}
                        <strong>Region ID</strong>
                    </Typography>
                    <Typography variant="body1" fontSize="1rem">
                        If using the text box, separate fields with a tab. Below is an example file to help you
                        format your data correctly.
                    </Typography>
                    <Link
                        href="/path/to/example-file.bed"
                        download
                        underline="hover"
                        sx={{
                            fontWeight: "bold",
                            color: "primary.main",
                            fontSize: "1rem",
                            display: "inline-block",
                            marginTop: "8px",
                        }}
                    >
                        <IconButton color="primary">
                            <FileDownloadIcon />
                        </IconButton>
                        Download Example File
                    </Link>
                </Stack>
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
                                onChange={(event) => { setFiles([]); handleSearchChange(event); }}
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
                                onKeyDown={handleKeyDown}
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
                            <IconButton color="primary" onClick={() => { setFiles([]); handleSearchChange(null); }}>
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