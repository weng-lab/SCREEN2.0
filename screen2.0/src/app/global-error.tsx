"use client" // Error components must be Client Components

// See https://nextjs.org/docs/app/api-reference/file-conventions/error#global-errorjs

import { useEffect } from "react"
import { ErrorMessage } from "../common/lib/utility"
import { Button } from "@mui/material"

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html>
      <body>
        <ErrorMessage error={error} />
        <Button
          onClick={
            // Attempt to recover by trying to re-render the segment
            () => reset()
          }
        >
          Try again
        </Button>
      </body>
    </html>
  )
}
