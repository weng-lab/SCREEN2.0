import React, { useState } from "react";
import DownloadIcon from "@mui/icons-material/Download";
import Button from "@mui/material/Button";
import { Typography } from "@mui/material";
/**
 * @todo move these to this files
 */
import { Assembly, Dataset, TabValue } from "./NewAnnotationsTabs";

// Utility to fetch file size
export const fetchFileSize = async (url: string, setFileSize: React.Dispatch<React.SetStateAction<number>>) => {
  try {
    const response = await fetch(url, { method: 'HEAD' });
    const contentLength = response.headers.get('Content-Length');
    if (contentLength) {
      setFileSize(parseInt(contentLength, 10));
    }
  } catch (error) {
    console.error(error)
  }
};

export type DownloadButtonProps = {
  href: string;
  label: string;
  fileSize?: string;
  bordercolor?: string;
};

// Download button for class/gene links files
export const DownloadButton = (props: DownloadButtonProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)
  
  return (
    <Button
      sx={{
        textTransform: "none",
        borderLeftColor: props.bordercolor && `${props.bordercolor}`,
        borderLeftWidth: props.bordercolor && (isHovered ? '0.65rem' : '0.375rem'),
        borderLeftStyle: 'solid',
        transition: 'all 0.1s',
        justifyContent: "space-between",
        backgroundColor: "white",
        color: "black",
      }}
      variant="contained"
      href={props.href}
      endIcon={<DownloadIcon />}
      fullWidth
      download
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Typography variant="body2" sx={{ flexGrow: 1 }}>
        {props.label}
      </Typography>
      {props.fileSize}
    </Button>
  );
};

const tabValDelim = "/";

export const encodeTabValue = (tabVal: TabValue) => {
  return tabVal.assembly + tabValDelim + tabVal.value;
};

export const decodeTabValue = (tabValStr: string): TabValue => {
  const [assembly, value] = tabValStr.split(tabValDelim);
  return {
    assembly: assembly as Assembly,
    value: value as Dataset,
  };
};