'use client'
import { 
  TextField,
  Typography,
  Box,
  Container
} from "@mui/material"

import MainSearch from "../components/MainSearch"

export default function Home() {
  return (
    <main>
      <Typography>
        This is the home page
      </Typography>
      <Container sx={{ width: '40%' }}>
        <Typography variant="h4">
          Search
        </Typography>
        <MainSearch />
      </Container>
    </main>
  )
}
