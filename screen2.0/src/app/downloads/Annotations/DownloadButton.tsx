import { Download } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { useState } from "react";

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
        borderLeftWidth: props.bordercolor && (isHovered ? '0.65rem' : '0.375rem'),
        borderLeftStyle: 'solid',
        borderLeftColor: props.bordercolor,
        transition: 'all 0.1s',
        justifyContent: "space-between",
        backgroundColor: "white",
        color: "black",
        textAlign: "left"
      }}
      variant="contained"
      endIcon={<Download />}
      fullWidth
      href={props.href}
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