import { useState } from "react";
import { Box, IconButton, Tooltip } from "@mui/material";
import { Download } from "@mui/icons-material";
import { BiosampleData } from "./types";
import Link from "next/link";

export type DownloadButtonProps<T extends boolean> = {
  row: BiosampleData<T>
  downloadType: "dnase" | "h3k4me3" | "h3k27ac" | "ctcf" | "atac" | "celltypeccres"
}

const fetchFileSize = async (url: string, setFileSize: React.Dispatch<React.SetStateAction<number>>) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      setFileSize(parseInt(contentLength, 10));
    }
  } catch (error) {
    console.error("error fetching file size for ", url)
    console.error(error)
  }
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
  const [fileSize, setFileSize] = useState<number>(null)

  let url: string
  let fileName: string
  switch (downloadType) {
    case "dnase":
      url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.dnase}-${row.dnase_signal}.tsv`
      fileName = `${row.dnase}-${row.dnase_signal}.tsv`
      break
    case "h3k4me3":
      url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.h3k4me3}-${row.h3k4me3_signal}.tsv`
      fileName = `${row.h3k4me3}-${row.h3k4me3_signal}.tsv`
      break
    case "h3k27ac":
      url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.h3k27ac}-${row.h3k27ac_signal}.tsv`
      fileName = `${row.h3k27ac}-${row.h3k27ac_signal}.tsv`
      break
    case "ctcf":
      url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.ctcf}-${row.ctcf_signal}.tsv`
      fileName = `${row.ctcf}-${row.ctcf_signal}.tsv`
      break
    case "atac":
      url = `https://downloads.wenglab.org/Registry-V4/SCREEN/Signal-Files/${row.atac}-${row.atac_signal}.tsv`
      fileName = `${row.atac}-${row.atac_signal}.tsv`
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

  const handleSetHover = (isHovered: boolean) => {
    if (isHovered && !fileSize) {
      fetchFileSize(url, setFileSize)
    }
  }

  if (row[downloadType] || (downloadType === "celltypeccres" && (row.dnase || row.ctcf || row.h3k27ac || row.h3k4me3))) {

    return (
      <Box
        onMouseEnter={() => handleSetHover(true)}
        onMouseLeave={() => handleSetHover(false)}
      >
        <Tooltip title={fileSize ? fileSize && (fileSize / 1000000).toFixed(1) + ' MB' : "Loading file size"}>
          <IconButton LinkComponent={Link} href={url} download={fileName}>
            <Download />
          </IconButton>
        </Tooltip>
      </Box>
    )
  } else return null
}