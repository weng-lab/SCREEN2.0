'use client'
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: "#000F9F",
      contrastText: "#FFFFFF"
    },
    secondary: {
      main: "#E7EEF8",
    },
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
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none"
        }
      }
    }
  },
});

export default theme;