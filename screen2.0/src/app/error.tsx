"use client" // Error components must be Client Components

// See https://nextjs.org/docs/app/api-reference/file-conventions/error

import { useEffect } from "react"
import { ErrorMessage } from "../common/lib/utility"
import { Button } from "@mui/material"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div>
      <ErrorMessage error={error} />
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
    </div>
  )
}
