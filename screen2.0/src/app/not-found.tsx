'use client'

import { Button, Typography, Stack } from '@mui/material'
import Link from 'next/link'

export default function NotFound() {
    return (
        <Stack
            height="100%"
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'center', px: 2 }}
            spacing={2}
        >
            <Typography variant="h1" fontWeight={500} color="primary">
                404
            </Typography>
            <Typography variant="h5" gutterBottom>
                Page Not Found
            </Typography>
            <Typography variant="body1">
                Sorry, the page you’re looking for doesn’t exist or has been moved.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500 }}>
                If you followed an old link or have this page bookmarked, feel free to contact us and let us know
            </Typography>
            <Stack direction={"row"} spacing={2}>
                <Button component={Link} href="/" variant="outlined" size="large">
                    Return Home
                </Button>
                <Button component={Link} href="/about#contact-us" variant="outlined" size="large">
                    Contact Us
                </Button>
            </Stack>
        </Stack>
    )
}
