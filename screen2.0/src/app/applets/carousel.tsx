import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay, EffectFade } from "swiper/modules";
import { Box, Button, Stack, Typography } from "@mui/material";
import "swiper/swiper-bundle.css";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
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
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
    },
    {
        id: 2,
        image: "/GWASSS.png",
        text: "GWAS",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
    },
    {
        id: 3,
        image: "https://via.placeholder.com/800x400",
        text: "ARGO",
        description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco",
    },
];

const ExpandableCarousel = () => {
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
                                <Stack>
                                    <Typography variant="h5" textAlign="center" gutterBottom>
                                        {slide.text}
                                    </Typography>
                                    <Typography variant="body1" textAlign="center" gutterBottom>
                                        {slide.description}
                                    </Typography>
                                    <Button>Learn More</Button>
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
