"use client"

import { Box, Button, Divider, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

export default function Applets() {
  const applets = [
    {
      id: 1,
      title: "Applet 1",
      description: "Description for Applet 1",
      imageUrl: "https://via.placeholder.com/150",
      link: "/applet1",
    },
    {
      id: 2,
      title: "Applet 2",
      description: "Description for Applet 2",
      imageUrl: "https://via.placeholder.com/150",
      link: "/applet2",
    },
  ];

  return (
    <main>
      <Divider variant="middle" sx={{mx: 25}}>
        <Stack justifyContent={"center"} alignItems={"center"} sx={{mx: 5}}>
          <Typography variant="h4">Applets</Typography>
          <ExpandMoreIcon/>
        </Stack>
      </Divider>
      {applets.map((applet, index) => (
        <Box
          key={applet.id}
        >
          <Grid container alignItems="center" justifyContent="space-around">
            {index % 2 === 0 ? (
              <>
                <Grid size={2}>
                  <Typography variant="h4" gutterBottom>
                    {applet.title}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {applet.description}
                  </Typography>
                  <Button variant="contained" color="primary" href={applet.link}>
                    Learn More
                  </Button>
                </Grid>
                <Grid size={2}>
                  <img
                    src={applet.imageUrl}
                    alt={applet.title}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Grid>
              </>
            ) : (
              <>
                <Grid size={2}>
                  <img
                    src={applet.imageUrl}
                    alt={applet.title}
                    style={{ width: "100%", borderRadius: "8px" }}
                  />
                </Grid>
                <Grid size={2}>
                  <Typography variant="h4" gutterBottom>
                    {applet.title}
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {applet.description}
                  </Typography>
                  <Button variant="contained" color="primary" href={applet.link}>
                    Learn More
                  </Button>
                </Grid>
              </>
            )}
          </Grid>
          {index < applets.length - 1 && <Divider variant="middle" sx={{ my: 4, mx: 25 }} />}
        </Box>
      ))}
    </main>
  );
}
