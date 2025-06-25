import { Download } from "@mui/icons-material";
import { Button, Typography } from "@mui/material";
import { useState } from "react";

export type DownloadButtonProps = {
  href: string;
  label: string;
  fileSize?: string;
  bordercolor?: string;
};

//Needed for txt files so that clciking will not just open the file in browser
const forceDownload = async (url: string, filename: string) => {
  const response = await fetch(url);
  const blob = await response.blob();
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
};

// Download button for class/gene links files
export const DownloadButton = (props: DownloadButtonProps) => {
  const [isHovered, setIsHovered] = useState<boolean>(false)

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    const filename = props.href.split("/").pop();
    await forceDownload(props.href, filename);
  };
  
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
      onClick={handleClick}
      // href={props.href}
      // download
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