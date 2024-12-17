"use client"

import { Stack, Typography } from "@mui/material"
import { useState } from "react"
import BiosampleTables from "../_biosampleTables/BiosampleTables"
import { RegistryBiosamplePlusRNA } from "../_biosampleTables/types"

export default function Applets() {
  const [selected, setSelected] = useState<RegistryBiosamplePlusRNA>(null)

  /**
   * Should select all select all prefilter or post filter? How should we determine if 
   */
  
  return (
    <main>
      <Stack m={3} gap={3}>
        <Typography>
          This is the applets page <br />
          Here we can have info on the different applets
        </Typography>
        <Typography>{JSON.stringify(selected)}</Typography>
        <BiosampleTables
          assembly="GRCh38"
          showRNAseq
          onBiosampleClicked={(selected) => setSelected(selected)}
          selected={selected?.displayname}
        />
      </Stack>
    </main>
  )
}
