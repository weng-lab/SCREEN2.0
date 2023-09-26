"use client"

import React, { useCallback, useState } from "react"
import { Button, Typography, Box, Stack, Container, RadioGroup, FormControl, FormControlLabel, FormLabel, Radio, IconButton } from "@mui/material"
import { useDropzone } from "react-dropzone"
import { useRouter } from 'next/navigation'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Cancel, Search } from "@mui/icons-material"
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

  //Disallowing opther file extensions with accept=".bed" isn't working as expected
  return (
    <Grid2 container spacing={2}>
      <Grid2 xs={6}>
        {props.header ?
          <div {...getRootProps()} style={{ padding: "1rem" }}>
            <input {...getInputProps()} type="file" accept=".bed" />
            <Button variant="contained">
              Select a File
            </Button>
          </div>
          :
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
      </Grid2>
      <Grid2 xs={6}>
        {files.map((file: File, index: number) => {
          return (
            <>
              <Typography mb={1} variant="h5">Uploaded:</Typography>
              <Stack direction="row" alignItems="center">
                <Typography key={index}>{truncateFileName(file.name, 30)} - {(file.size / 1000000).toFixed(1)} mb</Typography>
                <IconButton onClick={() => setFiles([])}>
                  <Cancel />
                </IconButton>
              </Stack>
            </>
          )
        })}
        {files.length > 0 &&
          <Button sx={{ mt: 1 }} endIcon={<Search />} variant="outlined" onClick={submitFiles}>
            Find Intersecting cCREs
          </Button>}
      </Grid2>
    </Grid2>
  )
}

export default BedUpload