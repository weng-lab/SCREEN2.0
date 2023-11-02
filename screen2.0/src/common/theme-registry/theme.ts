import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#000F9F",
    },
    //This is used to color buttons white, may not be best way to do so
    secondary: {
      main: "#ffffff",
    },
  },
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  components: {
    //This came with file, not sure what it does
    MuiAlert: {
      styleOverrides: {
        root: ({ ownerState }) => ({
          ...(ownerState.severity === 'info' && {
            backgroundColor: '#60a5fa',
          }),
        }),
      },
    },
  },
});

export default theme;