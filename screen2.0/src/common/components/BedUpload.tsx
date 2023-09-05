"use client"

import React, { useCallback, useState } from "react"
import { Button, Typography, Box, Stack, Container, RadioGroup, FormControl, FormControlLabel, FormLabel, Radio } from "@mui/material"
import { useDropzone } from "react-dropzone"

import FileUploadIcon from '@mui/icons-material/FileUpload';


/**
 * TODO
 * - Prevent upload of non BED files from drag n drop
 * - Selectively Clearing files
 * - Convert byte size to mb/gb
 * - Import necessary code from old SCREEN
 */
const BedUpload = () => {
  const [files, setFiles] = useState<File[]>([])
  const [assembly, setAssembly] = useState("GRCh38")

  const onDrop = useCallback(acceptedFiles => {
    setFiles([...files, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAssembly((event.target as HTMLInputElement).value);
  };

  const getIntersect = (jq, successF, errF) => {
    //Need to put this url in config file
    console.log("getIntersect called")
    const url = "https://screen-beta-api.wenglab.org/postws/lines"
    fetch(url, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      method: "POST",
      body: jq,
    })
      .then((response) => response.json())
      .then(successF)
      .catch(errF)
  }

  const submitFiles = () => {
    // allLines holds a string of each line in each file
    console.log("submit files called")
    let allLines = []
    files.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (r) => {
        const contents = r.target.result
        // const lines = contents.split("\n")
        const lines = contents.toString().split("\n")
        lines.forEach((e) => {
          allLines.push(e)
        })
      }
      reader.onabort = () => console.log("file reading was aborted")
      reader.onerror = () => console.log("file reading has failed")
      reader.onloadend = (e) => {
        //uuid set to empty, assembly changed to state variable
        const j = { uuid: "", assembly: assembly, allLines }
        const jq = JSON.stringify(j)
        getIntersect(
          jq,
          //Success
          (r) => {
            console.log(r)
          },
          //Error
          (msg) => {
            console.log("Error", msg)
          }
        )
      }
      reader.readAsText(f)
    })
  }

  //How do I handle multiple files? Disallow? Current accepts multiple at once
  return (
    <Box mt="1rem">
      <Container sx={{ border: `${isDragActive ? "2px dashed blue" : "2px dashed grey"}`, borderRadius: "10px", width: "30%", minWidth: "250px", pl: "0 !important", pr: "0 !important", color: `${isDragActive ? "text.secondary" : "text.primary"}` }}>
        <div {...getRootProps()} style={{ padding: "1rem" }}>
          <input {...getInputProps()} accept=".bed" />
          <Stack spacing={1} direction="column" alignItems={"center"}>
            <FileUploadIcon />
            <Typography>
              Drag file to upload
            </Typography>
            <Typography>
              or
            </Typography>
            <Button variant="outlined" disabled={isDragActive} sx={{ textTransform: "none" }}>
              Click to select files
            </Button>
            <Typography>
              Support file type: .BED
            </Typography>
          </Stack>
        </div>
      </Container>
      <br />
      {files.map((file: File, index: number) => {
        return <Typography key={index}>{file.name} - {file.size} bytes</Typography>
      })}
      {files.length > 0 && <Button onClick={() => setFiles([])}>Clear Files</Button>}
      <FormControl>
        <FormLabel id="demo-controlled-radio-buttons-group">Assembly</FormLabel>
        <RadioGroup
          aria-labelledby="demo-controlled-radio-buttons-group"
          name="controlled-radio-buttons-group"
          value={assembly}
          onChange={handleChange}
        >
          <FormControlLabel value="GRCh38" control={<Radio />} label="GRCh38" />
          <FormControlLabel value="mm10" control={<Radio />} label="mm10" />
        </RadioGroup>
      </FormControl>
      {files.length > 0 && <Button onClick={submitFiles}>Find Intersecting cCREs</Button>}
    </Box>
  )
}

export default BedUpload