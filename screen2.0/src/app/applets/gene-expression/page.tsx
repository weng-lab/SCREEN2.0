"use client"
import { Box } from "@mui/material"
import { GeneExpression } from "../../search/_ccredetails/geneexpression"
import { Suspense, startTransition, useEffect, useState, useTransition } from "react"
import { BIOSAMPLE_Data, biosampleQuery } from "../../../common/lib/queries"
import { ApolloQueryResult } from "@apollo/client"

export default function GeneExpressionApplet() {
  const [isPending, startTransition] = useTransition();
  const [biosampleData, setBiosampleData] = useState<ApolloQueryResult<BIOSAMPLE_Data>>(null)
  
  useEffect(() => {
    startTransition(async () => {
      const biosamples = await biosampleQuery()
      setBiosampleData(biosamples)
    })
  }, [])
  
  console.log("biosampleData",biosampleData)
  return (
    <Box maxWidth="95%" margin="auto" marginTop={3}>
      <Suspense>
        <GeneExpression
          assembly={"GRCh38"}
          applet
          biosampleData={biosampleData}
        />
      </Suspense>
    </Box>
  )
}