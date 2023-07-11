'use client' // Error components must be Client Components

import { useEffect } from 'react'
import { ErrorMessage } from '../../common/lib/utility'
import { Button } from '@mui/material'


export default function Error({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])


  return (
    <div>
      {ErrorMessage(error)}
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