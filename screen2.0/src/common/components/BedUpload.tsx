"use client"

import React, { useCallback, useState } from "react"
import { Button, Typography, Box, Stack, Container } from "@mui/material"
import { useDropzone } from "react-dropzone"

import FileUploadIcon from '@mui/icons-material/FileUpload';


/**
 * Things to improve upon old upload:
 * - Prevent upload of non BED files
 * - Clear files
 * - Convert byte size to mb/gb
 */
const BedUpload = () => {
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback(acceptedFiles => {
    setFiles([...files, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  //How do I handle multiple files? Disallow? Current accepts multiple at once
  return (
    <Box mt="1rem">
      <Container sx={{ border: `${isDragActive ? "2px dashed blue" : "2px dashed grey"}`, borderRadius: "10px", width: "30%", minWidth: "250px", pl: "0 !important", pr: "0 !important" }}>
        <div {...getRootProps()} style={{ padding: "1rem" }}>
          <input {...getInputProps()} accept=".bed" />
          {/* {
            isDragActive ?
              <p>Drop the files here ...</p> :
              <p>Drag 'n' drop some files here, or click to select files</p>
          } */}
          <Stack spacing={1} direction="column" alignItems={"center"}>
            <FileUploadIcon />
            <Typography>
              Drag file to upload
            </Typography>
            <Typography>
              or
            </Typography>
            <Button variant="outlined" sx={{ textTransform: "none" }}>
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
    </Box>
  )
}

export default BedUpload