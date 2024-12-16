"use client"

import { Box, Button, Divider, IconButton, Stack, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2"
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useRouter } from "next/navigation";
import React from "react";
import Carousel from "./carousel";

export default function Applets() {
  const router = useRouter();

  const applets = [
    {
      id: 1,
      title: "Gene Expression",
      description: "View gene expression by RNA-seq in ENCODE biosamples",
      imageUrl: "https://via.placeholder.com/150",
      link: "../applets/gene-expression",
      buttonText: "Explore Genes"
    },
    {
      id: 2,
      title: "GWAS",
      description: "Visualize data retrieved from an assortment of Genome-Wide Association (GWAS) studies",
      imageUrl: "https://via.placeholder.com/150",
      link: "../applets/gwas",
      buttonText: "Explore Studies"
    },
    {
      id: 3,
      title: "ARGO",
      description: "ARGO (Aggregate Rank Generator), allows users to input a set of candidate variants and obtain a prioritized list based on overlapping annotations",
      imageUrl: "https://via.placeholder.com/150",
      link: "",
      buttonText: "Under Construction"
    },
  ];

  return (
    <main>
      <Carousel />
      <Divider variant="middle" sx={{ mx: 40, mb: 2 }}>
        <Stack justifyContent={"center"} alignItems={"center"} sx={{ mx: 5 }}>
          <Typography variant="h4">Applets</Typography>
          <IconButton
            onClick={() => {
              window.scrollTo({ top: window.innerHeight * 0.6, behavior: 'smooth' });
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Stack>
      </Divider>
      {applets.map((applet, index) => (
        <React.Fragment key={applet.id}>
          <Box
            paddingX={5}
          >
            <Grid container alignItems="center" justifyContent="center" spacing={10}>
              {index % 2 === 0 ? (
                <>
                  <Grid size={3}>
                    <Typography variant="h4" gutterBottom>
                      {applet.title}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {applet.description}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => router.push(applet.link)} disabled={applet.buttonText === "Under Construction"}>
                      {applet.buttonText}
                    </Button>
                  </Grid>
                  <Grid size={3}>
                    <img
                      src={applet.imageUrl}
                      alt={applet.title}
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  </Grid>
                </>
              ) : (
                <>
                  <Grid size={3}>
                    <img
                      src={applet.imageUrl}
                      alt={applet.title}
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  </Grid>
                  <Grid size={3}>
                    <Typography variant="h4" gutterBottom>
                      {applet.title}
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {applet.description}
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => router.push(applet.link)}>
                      {applet.buttonText}
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </Box>
          {index < applets.length - 1 && <Divider variant="middle" sx={{ my: 4, mx: 40 }} />}
        </React.Fragment>
      ))}
    </main>
  );
}
