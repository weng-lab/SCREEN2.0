"use client"

import React, { useCallback, useState } from "react"
import { Button, Typography, Box, Stack, Container, RadioGroup, FormControl, FormControlLabel, FormLabel, Radio, IconButton } from "@mui/material"
import { useDropzone } from "react-dropzone"
import { useRouter } from 'next/navigation'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Cancel, FileUpload, Search, UploadFile } from "@mui/icons-material"
import Grid2 from "@mui/material/Unstable_Grid2/Grid2"

const BedUpload = (props: { assembly: "mm10" | "GRCh38", header?: boolean }) => {
  const router = useRouter()

  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback(acceptedFiles => {
    // setFiles([...files, ...acceptedFiles])
    // Currently only accepting 1 file
    setFiles([acceptedFiles[0]])
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

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

  //TODO Warn based on file size, support multiple files
  const submitFiles = () => {
    // allLines holds a string of each line in each file
    console.log("submit files called")
    let allLines = []
    let filenames: string = ''
    let accessions: string[] = []
    files.forEach((f) => {
      filenames += (' ' + f.name)
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
        const j = { uuid: "", assembly: props.assembly, allLines }
        const jq = JSON.stringify(j)
        getIntersect(
          jq,
          //Success, NOT HANDLING ERROR IN GETINTERSECT PROPERLY
          (r) => {
            console.log('x')
            console.log(r.accessions)
            accessions = r.accessions
            sessionStorage.setItem("filenames", filenames)
            sessionStorage.setItem("bed intersect", accessions.join(' '))
            router.push(`/search?intersect=t&assembly=${props.assembly}`)
          },
          //Error
          (msg) => {
            console.log("Error", msg)
          }
        )
      }
      reader.readAsText(f)
    })
    console.log(filenames)
    console.log(accessions)
  }

  //This is hacky, couldn't figure out how to make it use textOverflow properly
  function truncateFileName(string, maxLength, ellipsis = "...") {
    if (string.length <= maxLength) {
      return string;
    }

    return string.substring(0, maxLength - ellipsis.length) + ellipsis;
  }

  //Disallowing other file extensions with accept=".bed" isn't working as expected
  return (
      <Stack direction={props.header ? "row" : "column"}>
        {/* Upload button, only shows when no files uploaded */}
        {props.header ?
          files.length === 0 && 
          <div {...getRootProps()} style={{ padding: "1rem" }}>
            <input {...getInputProps()} type="file" accept=".bed" />
            <Button
              variant="outlined"
              startIcon={
                <UploadFileIcon />
              }
              size="small"
              sx={{ minWidth: "10rem", textTransform: 'none' }}
              //This is a shortcut for now to color all elements in these buttons. Secondary is defined as white in the theme (not ideal)
              color="secondary"
            >
              Select File
            </Button>
          </div>
          :
          files.length === 0 &&
          <Container sx={{ border: `${isDragActive ? "2px dashed blue" : "2px dashed grey"}`, borderRadius: "10px", minWidth: "250px", pl: "0 !important", pr: "0 !important", color: `${isDragActive ? "text.secondary" : "text.primary"}` }}>
            <div {...getRootProps()} style={{ padding: "1rem" }}>
              <input {...getInputProps()} type="file" accept=".bed" />
              <Stack spacing={1} direction="column" alignItems={"center"}>
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
        }
        {/* When a file is uploaded */}
        {files.length > 0 &&
          <>
            {!props.header && <Typography mb={1} variant="h5">Uploaded:</Typography>}
            <Stack direction="row" alignItems="center">
              <Typography>{`${props.header ? truncateFileName(files[0].name, 20) : truncateFileName(files[0].name, 40)}\u00A0-\u00A0${(files[0].size / 1000000).toFixed(1)}\u00A0mb`}</Typography>
              <IconButton color={props.header ? "secondary" : "primary"} onClick={() => setFiles([])}>
                <Cancel />
              </IconButton>
            </Stack>
            <Button sx={{ mt: 1, textTransform: 'none', maxWidth: "18rem" }} endIcon={<Search />} variant="outlined" onClick={submitFiles} color={props.header ? "secondary" : "primary"}>
              Find Intersecting cCREs
            </Button>
          </>
        }
      </Stack>
  )
}

export default BedUpload