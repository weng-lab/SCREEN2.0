'use client'

import {  Button, Typography, Stack } from '@mui/material'
import Link from 'next/link'

export default function NotFound() {
  return (
    <Stack height={"100%"} sx={{display: "flex", justifyContent: "center", alignItems: "center"}}>
      <Typography variant="h1" fontWeight={500} color="primary">
        404
      </Typography>
      <Typography variant="h5" gutterBottom>
        Page Not Found
      </Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        Sorry, the page you’re looking for doesn’t exist or has been moved.
      </Typography>
      <Button
        component={Link}
        href="/"
        variant="outlined"
        size="large"
      >
        Return Home
      </Button>
    </Stack>
  )
}
