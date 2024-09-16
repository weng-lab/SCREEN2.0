/**
 * Helpers for Biosample Tables Componet
 */

import { useState, useEffect } from "react"
import { Close, Download } from "@mui/icons-material"
import { CircularProgressProps, Box, CircularProgress, Typography, IconButton } from "@mui/material"
import { RegistryBiosample, RegistryBiosamplePlusRNA, CheckboxState } from "./types"

/**
 * 
 * @param biosamples 
 * @param checkboxes 
 * @returns biosamples filtered by state of checkboxes
 */
export const filterBiosamples = (
  biosamples: { [key: string]: (RegistryBiosample | RegistryBiosamplePlusRNA)[] },
  checkboxes: CheckboxState
) => {
  const filteredBiosamples: { [key: string]: (RegistryBiosample | RegistryBiosamplePlusRNA)[] } = {}

  for (const ontology in biosamples) {
    filteredBiosamples[ontology] = biosamples[ontology].filter((biosample) => {
      let passesType: boolean = false
      if (checkboxes.Tissue && biosample.sampleType === "tissue") {
        passesType = true
      } else if (checkboxes.PrimaryCell && biosample.sampleType === "primary cell") {
        passesType = true
      } else if (checkboxes.CellLine && biosample.sampleType === "cell line") {
        passesType = true
      } else if (checkboxes.InVitro && biosample.sampleType === "in vitro differentiated cells") {
        passesType = true
      } else if (checkboxes.Organoid && biosample.sampleType === "organoid") {
        passesType = true
      }
      let passesLifestage = false
      if (checkboxes.Embryo && biosample.lifeStage === "embryonic") {
        passesLifestage = true
      } else if (checkboxes.Adult && biosample.lifeStage === "adult") {
        passesLifestage = true
      }
      //Assign to Ancillary as baseline
      let collection = "Ancillary"
      if (biosample.dnase) {
        //Assign to Partial if at least dnase is available
        collection = "Partial"
        if (biosample.ctcf && biosample.h3k4me3 && biosample.h3k27ac) {
          //If all other marks (ignoring atac) are available, assign to core
          collection = "Core"
        }
      }
      let passesCollection = false
      if (
        (checkboxes.Core && collection == "Core") 
        || (checkboxes.Partial && collection == "Partial") 
        || (checkboxes.Ancillary && collection == "Ancillary")
      ) {
        passesCollection = true
      }
      return (passesType && passesLifestage && passesCollection)
    })
  }
  return filteredBiosamples
}

/**
 * 
 * @param assays 
 * @returns string to display on hover above available assay wheel
 */
export function assayHoverInfo(assays: { dnase: boolean; h3k27ac: boolean; h3k4me3: boolean; ctcf: boolean; atac: boolean }) {
  const dnase = assays.dnase
  const h3k27ac = assays.h3k27ac
  const h3k4me3 = assays.h3k4me3
  const ctcf = assays.ctcf
  const atac = assays.atac

  if (dnase && h3k27ac && h3k4me3 && ctcf && atac) {
    return "All assays available"
  } else if (!dnase && !h3k27ac && !h3k4me3 && !ctcf && !atac) {
    return "No assays available"
  } else
    return `Available:\n${dnase ? "DNase\n" : ""}${h3k27ac ? "H3K27ac\n" : ""}${h3k4me3 ? "H3K4me3\n" : ""}${ctcf ? "CTCF\n" : ""}${
      atac ? "ATAC\n" : ""
    }`
}

export function DownloadBiosamplecCREsButton(row: RegistryBiosample | RegistryBiosamplePlusRNA, x: "dnase" | "h3k4me3" | "h3k27ac" | "ctcf" | "atac" | "celltypeccres") {
  const [progress, setProgress] = useState<number>(null) //for progress wheel
  const [hover, setHover] = useState<boolean>(false) //for tracking if user is hovering over progress wheel
  const [controller, setController] = useState(null); //used to hold an AbortController created in handleDL, which allows aborting download

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

  if (row[x] || (x === "celltypeccres" && (row.dnase || row.ctcf || row.h3k27ac || row.h3k4me3))) {
    let url: string
    let fileName: string
    switch (x) {
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
      case "celltypeccres":
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
        let chunks = [];

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
      progress ?
        <Box
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
        >
          {hover ?
            <IconButton onClick={handleAbort}>
              <Close />
            </IconButton>
            :
            <CircularProgressWithLabel value={progress} />
          }
        </Box>
        :
        <IconButton onClick={handleDL}>
          <Download />
        </IconButton>
    )
  } else return null
}

//Imported from old SCREEN
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob)
  const downloadLink = document.createElement("a")
  downloadLink.href = url
  downloadLink.download = filename
  document.body.appendChild(downloadLink)
  downloadLink.click()
  document.body.removeChild(downloadLink)
}

//Imported from old SCREEN
function downloadTSV(text, filename) {
  downloadBlob(new Blob([text], { type: "text/plain" }), filename)
}