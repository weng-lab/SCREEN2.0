import React, { useCallback, useEffect, useState } from "react"
import { Button, Typography, Stack, IconButton, FormControl, Box, TextField, Alert, Container, Table, TableBody, TableCell, TableRow, RadioGroup, FormControlLabel, Radio, Accordion, AccordionSummary, AccordionDetails, Tooltip } from "@mui/material"
import { useDropzone } from "react-dropzone"
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Cancel } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import { InputRegions, UploadProps } from "./types";
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { useLazyQuery } from "@apollo/client";
import FileUploadIcon from '@mui/icons-material/FileUpload';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore"
import { REF_CHECK_QUERY } from "./queries";

const ArgoUpload: React.FC<UploadProps> = ({
    selectedSearch,
    handleSearchChange,
    onRegionsConfigured
}) => {
    const [files, setFiles] = useState<File>(null)
    const onDrop = useCallback(acceptedFiles => {
        setFiles(acceptedFiles[0]);
    }, [])
    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState([false, ""]); // status, message
    const [filesSubmitted, setFilesSubmitted] = useState(false);
    const [textValue, setTextValue] = useState(""); // State to control the TextField value
    const [submittedText, setSubmittedText] = useState("")
    const [textChanged, setTextChanged] = useState(true);
    const [getAllele] = useLazyQuery(REF_CHECK_QUERY);
    const [cellErr, setCellErr] = useState("");
    const [expanded, setExpanded] = useState(true);

    //expand the accordion
    const handleExpand = () => {
        setExpanded(!expanded)
    }

    //check to see if the value in the text box has changed
    useEffect(() => {
        setTextChanged(true)
    }, [textValue])

    const handleReset = (searchChange: string) => {
        setCellErr(""); //clear the errored cells
        setTextValue(""); // Clear the text box
        setFiles(null); //clear uploaded files
        handleSearchChange(searchChange); //change search to selected search
        setError([false, ""]); // clear the error message
        setFilesSubmitted(false); //clear submitted files
        setExpanded(true); //expand the accordion
        setTextChanged(true); //text has changed
        setSubmittedText(""); //no submitted text
    };

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

    const compareRegionsToReferences = useCallback(async (regions: InputRegions, regionRefs: string[]): Promise<string> => {
        const response = await getAllele({
            variables: {
                inputs: regions.map(region => ({
                    chrom: region.chr,
                    start: region.start,
                    end: region.end,
                    regionid: region.regionID as string,
                    ref: region.ref,
                    strand: region.strand
                })),
            },
            fetchPolicy: "cache-first",
        });
    
        // Extract mismatched regions from the response
        const mismatchedRegions = response.data?.refcheckmotifranking ?? [];
    
        // If there are no mismatches, return an empty string
        if (mismatchedRegions.length === 0) {
            return "";
        }
    
        // Format the error message for mismatched regions
        return mismatchedRegions.map(region => 
            `Reference allele does not match at regionID: ${region.regionid} 
            (${region.chrom} ${region.start} ${region.end}), the correct reference allele would be ${region.refTrue}`
        ).join("\n");
    }, [getAllele]);

    //check for errors in input file / text
    const validateRegions = useCallback(async (regions: InputRegions): Promise<string | null> => {
        // Validate fields are separated by tabs
        const tabErrorIndex = regions.find(region =>
            Object.values(region).some(value =>
                typeof value === "string" && value.includes(" ")
            )
        );
        if (tabErrorIndex) {
            return `Fields must be separated by tabs in region at regionID: ${tabErrorIndex.regionID}
            (${Object.values(tabErrorIndex).slice(0, -1).join(' ')})`;
        }

        // Validate chromosomes have numbers
        const chrErrorIndex = regions.find(region =>
            Number(region.chr.replace('chr', '')) === 0 || isNaN(Number(region.chr.replace('chr', '')))
        );
        if (chrErrorIndex) {
            setCellErr("chr");
            return `Provide valid chromosome numbers at regionID: ${chrErrorIndex.regionID}
            (${Object.values(chrErrorIndex).slice(0, -1).join(' ')})`;
        }

        // Validate start and end are numbers
        const startEndErrorIndex = regions.find(region =>
            isNaN(region.start) || isNaN(region.end)
        );
        if (startEndErrorIndex) {
            setCellErr("numbers");
            return `Start and End must be numbers at regionID: ${startEndErrorIndex.regionID}
            (${Object.values(startEndErrorIndex).slice(0, -1).join(' ')})`;
        }

        // Validate end position greater than start
        const greaterThanErrorIndex = regions.find(region =>
            region.end <= region.start
        );
        if (greaterThanErrorIndex) {
            setCellErr("numbers");
            return `End position must be greater than start position at regionID: ${greaterThanErrorIndex.regionID}
            (${Object.values(greaterThanErrorIndex).slice(0, -1).join(' ')})`;
        }

        // Validate total base pairs is less than 10,000
        const totalBasePairs = regions.reduce(
            (sum, region) => sum + (region.end - region.start),
            0
        );
        if (totalBasePairs > 10000) {
            return "The total base pairs in the input regions must not exceed 10,000.";
        }

        // Validate reference alleles
        const regionRefs = regions.map((region) => region.ref);
        const refError = await compareRegionsToReferences(regions, regionRefs);
        if (refError !== "") {
            setCellErr("ref")
            return refError;
        }

        const validAlts = /^[CGTA-]+$/;
        const altErrorIndex = regions.find(region => !validAlts.test(region.alt));
        if (altErrorIndex) {
            setCellErr("alt")
            return `Alternate allele must only include these 5 characters [A, C, T, G, -] at regionID: ${altErrorIndex.regionID}
            (${Object.values(altErrorIndex).slice(0, -1).join(' ')})`;
        }

        const validStrands = ["+", "-"];
        const strandErrorIndex = regions.find(region => !validStrands.includes(region.strand));
        if (strandErrorIndex) {
            setCellErr("strand")
            return `Strand must only but + or - at regionID: ${strandErrorIndex.regionID}
            (${Object.values(strandErrorIndex).slice(0, -1).join(' ')})`;
        }

        // If no errors, return null
        return null;
    }, [compareRegionsToReferences])

    //map parsed file / text to Genomic region type and sort them
    const configureInputedRegions = useCallback(async (data) => {
        const regions: InputRegions = data.map((item, index) => ({
            chr: item[0],
            start: Number(item[1]),
            end: Number(item[2]),
            ref: item[3],
            alt: item[4],
            strand: item[5],
            regionID: item.length === 7 ? item[6].replace("\r", "") : index + 1,
        }));

        setLoading(true);

        // Validate regions
        const errorMessage = await validateRegions(regions);
        if (errorMessage) {
            setError([true, errorMessage]);
            setLoading(false);
            return;
        }

        // Sort the regions
        const sortedRegions = regions.sort((a, b) => {
            const chrA = Number(a.chr.replace('chr', ''));
            const chrB = Number(b.chr.replace('chr', ''));

            if (chrA !== chrB) {
                return chrA - chrB;
            }
            return a.start - b.start;
        });

        setLoading(false);
        setFilesSubmitted(true);
        setSubmittedText(textValue)
        setTextChanged(false);
        setExpanded(false);
        onRegionsConfigured(sortedRegions);
    }, [onRegionsConfigured, textValue, validateRegions])


    function submitTextUpload(event) {
        setLoading(true)
        setError([false, ""])
        setCellErr("")
        const uploadedData = event.get("textUploadFile").toString()
        const inputData = parseDataInput(uploadedData)
        configureInputedRegions(inputData)
    }

    const submitUploadedFile = useCallback((file: File) => {
        setLoading(true)
        setError([false, ""])
        setCellErr("")
        let allLines = []
        let filenames: string = ''
        filenames += (' ' + file.name)
        if (file.type !== "tsv" && file.name.split('.').pop() !== "tsv") {
            console.error("File type is not tsv");
            setLoading(false)
            setFiles(null)
            setError([true, "File type is not tsv"])
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
        reader.readAsText(file)
    }, [configureInputedRegions])

    //coppied from BedUpload
    function truncateFileName(string, maxLength, ellipsis = "...") {
        if (string.length <= maxLength) {
            return string;
        }

        return string.substring(0, maxLength - ellipsis.length) + ellipsis;
    }

    //set files to the example file provided
    const handleUseExample = async () => {
        handleReset("TSV File")
        const url = "/ArgoExample.tsv";
        // const url = "/ARGOTESTING.tsv";
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const blob = await response.blob();
            const file = new File([blob], "ArgoExample.tsv", { type: blob.type });

            setFiles(file);
            submitUploadedFile(file)
        } catch (error) {
            console.error("Failed to fetch and set the file:", error);
        }
    };

    return (
        <>
            {error[0] && <Alert variant="outlined" severity="error" sx={{ mb: 2 }}>{error[1]}</Alert>}
            <Accordion
                defaultExpanded
                disableGutters
                expanded={expanded}
                onChange={() => handleExpand()}
            >
                <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: expanded ? '#030f98' : 'inherit' }} />} sx={{
                    fontSize: '1.25rem',
                    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif'
                }}>
                    {/* When a file is submitted */}
                    {filesSubmitted ? (
                        <>
                            <Stack
                                borderRadius={1}
                                direction={"row"}
                                spacing={3}
                                sx={{ backgroundColor: theme => theme.palette.secondary.main, padding: 1 }}
                                alignItems={"center"}
                                justifyContent={"space-between"}
                            >
                                <Typography mb={1} variant="h5">Submitted:</Typography>
                                <Typography>
                                    {selectedSearch === "Text Box"
                                        ? submittedText.includes("\n")
                                            ? `${submittedText.split("\n")[0]}...`
                                            : submittedText
                                        : `${truncateFileName(files.name, 40)}\u00A0-\u00A0${(files.size / 1000000).toFixed(1)}\u00A0mb`}
                                </Typography>
                                <IconButton color="primary" onClick={(event) => { handleReset(null); event.stopPropagation(); }}>
                                    <Cancel />
                                </IconButton>
                            </Stack>
                        </>
                    ) : (
                        <Typography mb={1} variant="h5">Submit Your Regions</Typography>
                    )
                    }
                </AccordionSummary>
                <AccordionDetails>
                    <Stack direction={"row"} spacing={3} mt="10px" alignItems="stretch" justifyContent={"space-between"}>
                        <Stack>
                            <Stack direction={"row"} alignItems={"flex-start"} flexWrap={"wrap"} justifyContent={"space-between"}>
                                <Typography variant={"h5"} mr={1}>
                                    Upload Through
                                </Typography>
                                <Stack
                                    alignItems={"center"}
                                    spacing={2}
                                >
                                    <FormControl>
                                        <RadioGroup
                                            row
                                            value={selectedSearch}
                                            onChange={(event) => handleReset(event.target.value)}
                                        >
                                            <FormControlLabel
                                                value="TSV File"
                                                control={<Radio />}
                                                label="TSV File"
                                            />
                                            <FormControlLabel
                                                value="Text Box"
                                                control={<Radio />}
                                                label="Text Box"
                                            />
                                        </RadioGroup>
                                    </FormControl>
                                </Stack>
                            </Stack>
                            <Box
                                mt="20px"
                                width="30vw"
                                sx={{
                                    ...(files === null && {
                                        flexGrow: 1,
                                        display: "flex",
                                    }),
                                }}
                            >
                                {selectedSearch === "TSV File" ? (
                                    files === null && (
                                        <Container
                                            sx={{
                                                border: isDragActive ? "2px dashed blue" : "2px dashed grey",
                                                borderRadius: "10px",
                                                minWidth: "250px",
                                                pl: "0 !important",
                                                pr: "0 !important",
                                                color: isDragActive ? "text.secondary" : "text.primary",
                                            }}
                                        >
                                            <div {...getRootProps()} style={{ padding: "1rem" }}>
                                                <input {...getInputProps()} type="file" accept=".tsv" />
                                                <Stack spacing={1} direction="column" alignItems="center">
                                                    <UploadFileIcon />
                                                    <Typography>
                                                        Drag and drop a .tsv file
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
                                                rows={6}
                                                placeholder="Copy and paste your data from Excel here"
                                                onKeyDown={handleKeyDown}
                                                value={textValue}
                                                onChange={(e) => setTextValue(e.target.value)}
                                            />
                                            <Stack
                                                direction="row"
                                                alignItems="center"
                                                justifyContent="space-between"
                                                sx={{ mt: 1 }}
                                            >
                                                <LoadingButton
                                                    loading={loading}
                                                    loadingPosition="end"
                                                    type="submit"
                                                    size="medium"
                                                    variant="outlined"
                                                    disabled={!textChanged}
                                                    sx={{ textTransform: "none" }}
                                                >
                                                    Submit
                                                </LoadingButton>
                                                <Button
                                                    color="error"
                                                    type="button"
                                                    size="medium"
                                                    variant="outlined"
                                                    onClick={() => handleReset(null)}
                                                    sx={{ textTransform: "none" }}
                                                >
                                                    Reset
                                                </Button>
                                            </Stack>
                                        </form>
                                    </FormControl>
                                )}
                                {/* When a file is uploaded */}
                                {files !== null &&
                                    <>
                                        <Typography mb={1} variant="h5">Uploaded:</Typography>
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Typography>{`${truncateFileName(files.name, 40)}\u00A0-\u00A0${(files.size / 1000000).toFixed(1)}\u00A0mb`}</Typography>
                                            <IconButton color="primary" onClick={() => handleReset(null)}>
                                                <Cancel />
                                            </IconButton>
                                        </Stack>
                                        <LoadingButton
                                            loading={loading}
                                            loadingPosition="end"
                                            sx={{ textTransform: 'none', maxWidth: "18rem" }}
                                            onClick={() => { submitUploadedFile(files) }}
                                            variant="outlined"
                                            color="primary"
                                            disabled={filesSubmitted}
                                        >
                                            <span>
                                                Submit
                                            </span>
                                        </LoadingButton>
                                    </>
                                }
                            </Box>
                        </Stack>
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
                            <Typography variant="body1" fontSize="1.1rem" fontWeight="bold">
                                Required Fields:
                            </Typography>
                            <Table
                                sx={{
                                    border: "1px solid",
                                    borderColor: "black",
                                    width: "100%",
                                    "& td, & th": {
                                        padding: "8px",
                                        fontSize: "1rem",
                                        textAlign: "center",
                                        border: "1px solid",
                                        borderColor: "black",
                                    },
                                }}
                            >
                                <TableBody>
                                    <TableRow>
                                        <TableCell sx={{ backgroundColor: cellErr === "chr" ? "error.light" : "transparent" }}>
                                            <Tooltip title="Chromosome where the variant is located Ex: Chr1" arrow>
                                                <span>Chromosome</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: cellErr === "numbers" ? "error.light" : "transparent" }}>
                                            <Tooltip title="Start position of the variant Ex: 1000000" arrow>
                                                <span>Start</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: cellErr === "numbers" ? "error.light" : "transparent" }}>
                                            <Tooltip title="End position of the variant Ex: 1000001" arrow>
                                                <span>End</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: cellErr === "ref" ? "error.light" : "transparent" }}>
                                            <Tooltip title="Original Sequence Ex: G" arrow>
                                                <span>Reference Allele</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: cellErr === "alt" ? "error.light" : "transparent" }}>
                                            <Tooltip title="Mutated Sequence, Insertion Ex: C, Deletion Ex: -" arrow>
                                                <span>Alternate Allele</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell sx={{ backgroundColor: cellErr === "strand" ? "error.light" : "transparent" }}>
                                            <Tooltip title="Strand information (+ or -)" arrow>
                                                <span>Strand</span>
                                            </Tooltip>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Optional region identifier, String or Number" arrow>
                                                <span>Region ID (optional)</span>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                            <Typography variant="body1" fontSize="1rem">
                                If using the text box, separate fields with a tab. Below is an example file to help you
                                format your data correctly.
                            </Typography>
                            <Stack direction={"row"} justifyContent={"space-between"}>
                                <Button
                                    variant="text"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "primary.main",
                                        fontSize: "1rem",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        marginTop: "8px",
                                    }}
                                    startIcon={
                                        <FileDownloadIcon />
                                    }
                                    onClick={() => {
                                        const url = "/ArgoExample.tsv";
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = "ArgoExample.tsv";
                                        link.click();
                                    }}
                                >
                                    Download Example File
                                </Button>
                                <Button
                                    variant="text"
                                    sx={{
                                        fontWeight: "bold",
                                        color: "primary.main",
                                        fontSize: "1rem",
                                        display: "inline-flex",
                                        alignItems: "center",
                                        marginTop: "8px",
                                    }}
                                    startIcon={
                                        <FileUploadIcon />
                                    }
                                    onClick={handleUseExample}
                                >
                                    Use Example File
                                </Button>
                            </Stack>
                        </Stack>
                    </Stack>
                </AccordionDetails>
            </Accordion>

        </>
    )
}

export default ArgoUpload