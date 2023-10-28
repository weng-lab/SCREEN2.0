"use client"
import { Box } from "@mui/material"
import { GeneExpression } from "../../search/ccredetails/gene-expression"

export default function GeneExpressionApplet() {
  return (
    <Box maxWidth="95%" margin="auto" marginTop={3}>
      <GeneExpression
        assembly={"GRCh38"}
        applet
      />
    </Box>
  )
}