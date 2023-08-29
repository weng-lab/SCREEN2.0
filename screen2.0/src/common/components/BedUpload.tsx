"use client"

import React, { useState } from "react"
import { Button, Typography, Box } from "@mui/material"
import Dropzone from "react-dropzone"


/**
 * Things to improve upon old upload:
 * - Prevent upload of non BED files
 * - Clear files
 * - Convert byte size to mb/gb
 */
const BedUpload = () => {
  const [files, setFiles] = useState<File[]>([])

  function handleFileUploads(uploads){
    setFiles([...files, ...uploads])
  }

  return (
    <Box mt="1rem">
      <Dropzone onDrop={acceptedFiles => handleFileUploads(acceptedFiles)}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps()}>
              <input {...getInputProps()} />
              <Button>Drag and drop some files here, or click to select files</Button>
            </div>
          </section>
        )}
      </Dropzone>
      <br />
      {files.map((file: File, index: number) => {
        return <Typography key={index}>{file.name} - {file.size} bytes</Typography>
      })}
      {files.length > 0 && <Button onClick={() => setFiles([])}>Clear Files</Button>}
    </Box>
  )
}

export default BedUpload