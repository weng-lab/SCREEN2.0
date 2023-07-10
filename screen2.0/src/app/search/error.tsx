'use client' // Error components must be Client Components
 
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

  const router = useRouter()
 
  return (
    <div>
      <h2>Something went wrong!</h2>
      <Button
        onClick={
          // Attempt to recover by trying to re-render the segment
          () => reset()
        }
      >
        Try again
      </Button>
      <br/>
      <Button
        onClick={
          //Not sure why soft navigating doesn't re-render the UI. Need to look into this, super annoying
          () => {router.back()}
        }
      >
        Go Back
      </Button>
    </div>
  )
}