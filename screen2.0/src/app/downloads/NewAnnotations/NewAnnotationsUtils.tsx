import React, { useEffect, useState } from "react";
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

// Download button for class/gene links files
export const InlineDownloadButton = (props: { href: string; label: string; bordercolor?: string }) => {
  const [fileSize, setFileSize] = useState<number | null>(null);
  useEffect(() => {
    fetchFileSize(props.href, setFileSize);
  }, [props.href]);
  return (
    <Button
      sx={{
      textTransform: "none",
      borderLeft: props.bordercolor && `0.375rem solid ${props.bordercolor}`,
      justifyContent: "space-between",
      backgroundColor: "white",
      color: "black",
      }}
      variant="contained"
      href={props.href}
      endIcon={<DownloadIcon />}
      fullWidth
      download
    >
      <Typography variant="body2" sx={{ flexGrow: 1 }}>{props.label}</Typography>
      {fileSize ? (fileSize / 1000000).toFixed(1) + ' MB' : '\u00A0'}
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