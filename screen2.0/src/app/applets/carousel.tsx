import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Box, Button, Stack, Typography } from "@mui/material";
import "swiper/swiper-bundle.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useRouter } from "next/navigation";

const theme = createTheme({
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            backgroundColor: "#030f98",
            color: "white",
            borderRadius: "8px",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
            fontSize: "16px",
            fontWeight: "500",
            padding: "8px 20px",
            width: "fit-content",
            position: "relative",
            "&:hover": {
              backgroundColor: "#021170",
            },
          },
        },
      },
    },
  });

// Slide Data
const slides = [
    {
        id: 1,
        image: "/GeneExpressionSS.png",
        text: "Gene Expression",
        description: "Dive into comprehensive gene expression data across 324 human and 78 mouse datasets. Explore how genes are expressed in hundreds of cell and tissue types, providing valuable insights into their regulatory and functional roles. This tool enables researchers to identify context-specific expression patterns for their genes of interest.",
        link: "../applets/gene-expression",
    },
    {
        id: 2,
        image: "/GWASSS.png",
        text: "GWAS",
        description: "Analyze over 1 million variants associated with human phenotypes and diseases through the lens of cCRE overlap. This app helps prioritize causal variants by linking genetic associations to potential regulatory elements. Gain a deeper understanding of the regulatory landscape underlying complex traits and diseases.",
        link: "../applets/gwas",
    },
    // {
    //     id: 3,
    //     image: "/ARGOSS.png",
    //     text: "ARGO",
    //     description: "ARGO (Aggregate Rank Generator), allows users to input a set of candidate variants and obtain a prioritized list based on overlapping annotations",
    //     link: ""
    // },
];

const ExpandableCarousel = () => {
    const router = useRouter();

    return (
        <ThemeProvider theme={theme}>
            <Swiper
                modules={[Navigation, Pagination, Autoplay, EffectFade]}
                effect="fade"
                speed={1000}
                slidesPerView={1}
                pagination={{ clickable: true }}
                navigation
                loop
                autoplay={{
                    delay: 5000,
                    disableOnInteraction: true,
                }}
            >
                {slides.map((slide) => (
                    <SwiperSlide key={slide.id}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                height: "60vh",
                                position: "relative",
                            }}
                        >
                            <Box
                                sx={{
                                    flex: 1,
                                    height: "100%",
                                    backgroundColor: "#101720",
                                    color: "white",
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    padding: 3,
                                }}
                            >
                                <Stack justifyContent={"center"} alignItems={"center"} spacing={3} paddingX={3}>
                                    <Typography variant="h5" textAlign="center" gutterBottom>
                                        {slide.text}
                                    </Typography>
                                    <Typography variant="body1" textAlign="center" gutterBottom>
                                        {slide.description}
                                    </Typography>
                                    <Button onClick={() => router.push(slide.link)} disabled={slide.text === "ARGO"}>Learn More<ArrowForwardIcon sx={{ marginLeft: "8px" }}/></Button>
                                </Stack>
                            </Box>
                            <Box
                                sx={{
                                    flex: 2,
                                    height: "100%",
                                    backgroundImage: `linear-gradient(to right, #101720, transparent), url(${slide.image})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                }}
                            />
                        </Box>
                    </SwiperSlide>
                ))}
            </Swiper>
        </ThemeProvider>
    );
};

export default ExpandableCarousel;
