"use client"

import { useEffect, useState } from "react"
import { Stack } from "@mui/material"
import ResponsiveAppBar from "./header"
import { Footer } from "./footer"

export default function ClientAppWrapper({ children }: { children: React.ReactNode }) {
  const [maintenance, setMaintenance] = useState(false)
  useEffect(() => {
    const checkAPIHealth = async () => {
      try {
        const res = await fetch("https://screen.api.wenglab.org/graphql", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: "{ __typename }" }),
        })

        if (!res.ok) throw new Error("API down")
        const json = await res.json()
        if (json.errors || !json.data) throw new Error("API returned errors")
      } catch (err) {
        console.error("API unreachable:", err)
        setMaintenance(true)
      }
    }
    checkAPIHealth()
  }, [])

  return (
    <Stack height={"100vh"} minHeight={0} id="app-wrapper">
      <ResponsiveAppBar maintenance={maintenance} />
      <Stack flexGrow={1} overflow={"auto"} minHeight={0} id="content-wrapper">
        <Stack flexGrow={1}>{children}</Stack>
        <Footer />
      </Stack>
    </Stack>
  )
}
