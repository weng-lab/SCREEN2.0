'use client'

import { Typography } from "@mui/material";

const TypographyCSR = (props: {contains: string}) => {

  return (
    <Typography>
        { props.contains }
    </Typography>
  );
}

export default TypographyCSR;