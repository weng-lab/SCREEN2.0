"use client"
import { Box } from "@mui/material"
import { GeneExpression } from "./geneexpression"
import { Suspense } from "react"


export default function GeneExpressionApplet() {
  return (
    <Box maxWidth="95%" margin="auto" marginTop={3}>
      <Suspense>
        <GeneExpression
          assembly={"GRCh38"}
          applet
        />
      </Suspense>
    </Box>
  )
}