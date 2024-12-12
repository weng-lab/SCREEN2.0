import { useState, useEffect } from "react";
import { CircularProgressProps, Box, CircularProgress, Typography, IconButton, Tooltip } from "@mui/material";
import { Close, Download } from "@mui/icons-material";
import { downloadTSV } from "../downloads/utils";
import { BiosampleData } from "./types";
import { fetchFileSize } from "../downloads/annotations";

export type DownloadButtonProps<T extends boolean> = {
  row: BiosampleData<T>
  downloadType: "dnase" | "h3k4me3" | "h3k27ac" | "ctcf" | "atac" | "celltypeccres"
}

/**
 * 
 * @prop row
 * @prop downloadType
 * ```jsx
 * "dnase" | "h3k4me3" | "h3k27ac" | "ctcf" | "atac" | "celltypeccres"
 * ```
 * @returns 
 */
export const DownloadButton = <T extends boolean>({ row, downloadType }: DownloadButtonProps<T>) => {
  const [progress, setProgress] = useState<number>(null) //for progress wheel
  const [hover, setHover] = useState<boolean>(false) //for tracking if user is hovering over progress wheel
  const [controller, setController] = useState(null); //used to hold an AbortController created in handleDL, which allows aborting download
  const [fileSize, setFileSize] = useState<number>(null)

  let url: string
  let fileName: string
  switch (downloadType) {
    case "dnase":
      url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.dnase}-${row.dnase_signal}.txt`
      fileName = `${row.dnase}-${row.dnase_signal}.txt`
      break
    case "h3k4me3":
      url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.h3k4me3}-${row.h3k4me3_signal}.txt`
      fileName = `${row.h3k4me3}-${row.h3k4me3_signal}.txt`
      break
    case "h3k27ac":
      url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.h3k27ac}-${row.h3k27ac_signal}.txt`
      fileName = `${row.h3k27ac}-${row.h3k27ac_signal}.txt`
      break
    case "ctcf":
      url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.ctcf}-${row.ctcf_signal}.txt`
      fileName = `${row.ctcf}-${row.ctcf_signal}.txt`
      break
    case "atac":
      url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.atac}-${row.atac_signal}.txt`
      fileName = `${row.atac}-${row.atac_signal}.txt`
      break
    case "celltypeccres": {
      const signalIDs = [
        row.dnase_signal,
        row.h3k4me3_signal,
        row.h3k27ac_signal,
        row.ctcf_signal
      ].filter(id => id !== null && id !== undefined);
      url = `https://downloads.wenglab.org/Registry-V4/${signalIDs.join('_')}.bed`
      fileName = `${signalIDs.join('_')}.bed`
      break
    }
  }

  useEffect(() => {
    return () => {
      // Cleanup: Abort the fetch request if the component is unmounted
      if (controller) {
        controller.abort();
      }
    };
  }, [controller]);

  const handleAbort = () => {
    // Trigger the abort signal
    if (controller) {
      controller.abort();
    }
  };

  function CircularProgressWithLabel(
    props: CircularProgressProps & { value: number },
  ) {
    return (
      <Box
        sx={{ position: 'relative', display: 'inline-flex' }}
      >
        <CircularProgress variant="determinate" {...props} />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="caption"
            component="div"
            color="text.secondary"
          >{`${Math.round(props.value)}%`}</Typography>
        </Box>
      </Box>
    );
  }

  const handleSetHover = (isHovered: boolean) => {
    setHover(isHovered)
    if (isHovered && !fileSize){
      fetchFileSize(url, setFileSize)
    }
  }

  if (row[downloadType] || (downloadType === "celltypeccres" && (row.dnase || row.ctcf || row.h3k27ac || row.h3k4me3))) {
    

    const handleDL = async () => {
      // Cleanup previous controller if any
      if (controller) {
        controller.abort();
      }

      // Create a new AbortController
      const newController = new AbortController();
      setController(newController);

      // Create a progress callback function
      const handleProgress = (progress) => {
        setProgress((progress.loaded / progress.total) * 100);
      };

      try {
        const response = await fetch(url, {
          signal: newController.signal, // Pass the signal to the fetch request
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const reader = response.body!.getReader();
        const contentLength = +response.headers.get('Content-Length')!;

        let receivedLength = 0;
        const chunks = [];

        const read = async () => {
          const { done, value } = await reader.read();

          if (done) {
            return;
          }

          receivedLength += value!.length;
          chunks.push(value!);

          handleProgress({ loaded: receivedLength, total: contentLength });

          // Continue reading the next chunk unless aborted
          if (!newController.signal.aborted) {
            return read();
          }
        };

        await read();

        if (!newController.signal.aborted) {
          const dataArray = new Uint8Array(receivedLength);
          let position = 0;
          for (const chunk of chunks) {
            dataArray.set(chunk, position);
            position += chunk.length;
          }

          const dataString = new TextDecoder('utf-8').decode(dataArray);

          downloadTSV(dataString, fileName);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          window.alert('Download failed:' + error);
        }
      } finally {
        setController(null);
        setProgress(null);
      }
    };

    return (
      <Box
        onMouseEnter={() => handleSetHover(true)}
        onMouseLeave={() => handleSetHover(false)}
      >
        {progress ?
          hover ?
            <IconButton onClick={handleAbort}>
              <Close />
            </IconButton>
            :
            <CircularProgressWithLabel value={progress} />
          :
          <Tooltip title={fileSize ? fileSize && (fileSize / 1000000).toFixed(1) + ' MB' : "Loading file size"}>
            <IconButton onClick={handleDL}>
              <Download />
            </IconButton>
          </Tooltip>
        }
      </Box>
    )
  } else return null
}