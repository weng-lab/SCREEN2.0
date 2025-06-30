"use client"
import { Typography, Box } from "@mui/material"

import MuiLink from "@mui/material/Link"

export function Footer() {
  return (
    <Box id="Footer" sx={{ textAlign: "center", width: "100%", marginY: 1 }}>
      <Typography variant="body2" color="text.secondary">
        {"Copyright © "}
        <MuiLink color="inherit" href="https://www.umassmed.edu/zlab/">
          Weng Lab
        </MuiLink>
        {", "}
        <MuiLink color="inherit" href="https://sites.google.com/view/moore-lab/">
          Moore Lab
        </MuiLink>{" "}
        {new Date().getFullYear()}.
      </Typography>
      <Typography variant="body2" color="text.secondary">
        How to Cite the ENCODE Encyclopedia, the Registry of cCREs, and SCREEN:
      </Typography>
      <Typography variant="body2" color="text.secondary">
        <MuiLink color="inherit" href="https://www.nature.com/articles/s41586-020-2493-4">
          &quot;ENCODE Project Consortium, et al. Nature 2020.&quot;
        </MuiLink>
      </Typography>
    </Box>
  )
}
