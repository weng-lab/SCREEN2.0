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
      description: "Explore gene expression patterns across hundreds of cell and tissue types",
      imageUrl: "/GeneExpressionPlaceHolder.png",
      link: "../applets/gene-expression",
      buttonText: "Explore Genes"
    },
    {
      id: 2,
      title: "GWAS",
      description: "Investigate the overlap between cCREs and GWAS results to prioritize causal variants and identify potential regulatory mechanisms.",
      imageUrl: "/GWASPlaceHolder.png",
      link: "../applets/gwas",
      buttonText: "Explore Studies"
    },
    // {
    //   id: 3,
    //   title: "ARGO",
    //   description: "Rank genomic regions based on overlapping annotations",
    //   imageUrl: "/argo.png",
    //   link: "",
    //   buttonText: "Under Construction"
    // },
  ];

  return (
    <main>
      <Carousel />
      <Divider variant="middle" sx={{ mx: 40, mb: 2, mt: 2 }}>
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
