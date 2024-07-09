"use client"

import React, { useCallback, useState } from "react"
import { Button, Typography, Stack, Container, IconButton } from "@mui/material"
import { useDropzone } from "react-dropzone"
import { useRouter } from 'next/navigation'
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { Cancel, Search } from "@mui/icons-material"
import { LoadingButton } from "@mui/lab"
import config from "../../config.json"
import { client } from "../search/_ccredetails/client"
import { useLazyQuery, NetworkStatus } from "@apollo/client"
import { BED_INTERSECT_QUERY } from "./queries"
import { log } from "console"

const BedUpload = (props: { assembly: "mm10" | "GRCh38", header?: boolean }) => {
  const router = useRouter()

  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [getOutput] = useLazyQuery(BED_INTERSECT_QUERY)

  const onDrop = useCallback(acceptedFiles => {
    // setFiles([...files, ...acceptedFiles])
    // Currently only accepting 1 file
    setFiles([acceptedFiles[0]])
  }, [])

 

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const getIntersect = (allLines, successF, errF) => {
    getOutput({
      variables: {user_ccres: allLines},
      client: client,
      fetchPolicy: 'cache-and-network',
      onCompleted(data) {
        successF(data)
      },
      onError(error) {
          errF(error)
      },
    })
  }

  //TODO Warn based on file size, support multiple files
  const submitFiles = () => {
    setLoading(true)
    let allLines = []
    let filenames: string = ''
    let accessions: string[] = []
    files.forEach((f) => {
      filenames += (' ' + f.name)
      const reader = new FileReader()
      reader.onload = (r) => {
        const contents = r.target.result
        const lines = contents.toString().split("\n")
        lines.forEach((e) => {
          allLines.push(e.split("\t"))
        })
      }
      reader.onabort = () => console.log("file reading was aborted")
      reader.onerror = () => console.log("file reading has failed")
      reader.onloadend = (e) => {
        getIntersect(
          allLines,
          (data) => {
            console.log(data);
            accessions = data['intersection'].map((elem) => elem[4])
            sessionStorage.setItem("filenames", filenames)
            sessionStorage.setItem("bed intersect", accessions.join(' '))
            if (accessions.length === 1000){
              sessionStorage.setItem("warning", "true")
            } else {
              sessionStorage.setItem("warning", "false")
            }
            window.open(`/search?intersect=t&assembly=${props.assembly}`, "_self")

          },
          //Error
          (msg) => {
            console.log("Error", msg)
            setLoading(false)
          }
        )
      }
      reader.readAsText(f)
    })
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
          <LoadingButton
            loading={loading}
            loadingPosition="end"
            sx={{textTransform: 'none', maxWidth: "18rem", '&.MuiLoadingButton-root': props.header && {color: 'white', borderColor: 'white' }}}
            onClick={submitFiles}
            variant="outlined"
            color={props.header ? "secondary" : "primary"}
            endIcon={<Search />}
          >
            <span>
              Find Intersecting cCREs
            </span>
          </LoadingButton>
        </>
      }
    </Stack>
  )
}

export default BedUpload
