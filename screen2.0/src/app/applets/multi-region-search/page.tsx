"use client"
import { Typography } from "@mui/material"
import BedUpload from "../../../common/components/BedUpload"

export default function MultiRegionSearch() {
  return (
    <main>
      <Typography variant="h6" mt={2}>Find Intersecting cCREs from BED file</Typography>
      <BedUpload />
    </main>
  )
}
