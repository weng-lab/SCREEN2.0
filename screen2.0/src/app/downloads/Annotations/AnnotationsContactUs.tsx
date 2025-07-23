import { Box, Button, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";

const AnnotationsContactUs: React.FC = () => (
  <Box
    sx={{
      width: "100%",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      px: 3,
      py: 2,
      borderRadius: 2,
      background: `linear-gradient(to right, white, #dbe5fc)`,
      boxShadow: 1,
    }}
  >
    <Box>
      <Typography variant="subtitle1" fontWeight={600} color="primary.dark">
        Can’t find the dataset you’re looking for?
      </Typography>
      <Typography variant="body2" color="primary.main">
        Let us know what you need — we’re here to help you!
      </Typography>
    </Box>
    <Button variant="outlined" size="small" LinkComponent={Link} href="/about#contact-us" sx={{backgroundColor: 'white'}}>
      Contact Us
    </Button>
  </Box>
);

export default AnnotationsContactUs;
