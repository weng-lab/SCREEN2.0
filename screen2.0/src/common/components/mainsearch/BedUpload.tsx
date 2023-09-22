"use client"

import React, { useCallback, useState } from "react"
import { Button, Typography, Box, Stack, Container, RadioGroup, FormControl, FormControlLabel, FormLabel, Radio } from "@mui/material"
import { useDropzone } from "react-dropzone"
import { useRouter } from 'next/navigation'
import UploadFileIcon from '@mui/icons-material/UploadFile';

const BedUpload = (props: {assembly: "mm10" | "GRCh38"}) => {
  const router = useRouter()
  
  const [files, setFiles] = useState<File[]>([])

  const onDrop = useCallback(acceptedFiles => {
    setFiles([...files, ...acceptedFiles])
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

  //Warn based on file size
  //Cap at 1
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
    // sessionStorage.setItem("filenames", filenames)
    // sessionStorage.setItem("bed intersect", accessions.join(' '))
    // router.push(`/search?intersect=t&assembly=${assembly}`)
  }

  //How do I handle multiple files? Disallow? Current accepts multiple at once
  //I can trigger a server action here, but how does this help me get the information to the main results table?
  //In this server action, I can fetch the info needed to generate the rows... but idk if/how I can pass that info along
  //What if I can make use of context, set it here with the list of accessions, and then access again in cCRE Search and fetch data in server action??
  return (
    <Box mt="1rem">
      <Container sx={{ border: `${isDragActive ? "2px dashed blue" : "2px dashed grey"}`, borderRadius: "10px", width: "30%", minWidth: "250px", pl: "0 !important", pr: "0 !important", color: `${isDragActive ? "text.secondary" : "text.primary"}` }}>
        <div {...getRootProps()} style={{ padding: "1rem" }}>
          <input {...getInputProps()} accept=".bed" />
          <Stack spacing={1} direction="column" alignItems={"center"}>
            <UploadFileIcon />
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
        return <Typography key={index}>{file.name} - {(file.size / 1000000).toFixed(1)} mb</Typography>
      })}
      {files.length > 0 && <Button onClick={() => setFiles([])}>Clear Files</Button>}
      {/* <FormControl>
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
      </FormControl> */}
      {files.length > 0 && <Button onClick={submitFiles}>Find Intersecting cCREs</Button>}
    </Box>
  )
}

export default BedUpload