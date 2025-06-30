import "./globals.css"
import { ApolloWrapper } from "../common/lib/apolloprovider"
import { Inter } from "next/font/google"
import ResponsiveAppBar from "./header"
import { Footer } from "./footer"
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter'
import { CssBaseline, Stack, ThemeProvider } from "@mui/material"
import { Analytics } from "@vercel/analytics/react"
import theme from "../theme"
import MuiXLicense from "../common/MuiXLicense";

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "SCREEN: Search Candidate cis-Regulatory Elements by ENCODE",
  description: "SCREEN: Search Candidate cis-Regulatory Elements by ENCODE",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} id="page-container">
        <ApolloWrapper> {/* Wrapper for Apollo Requests, exposes client to child components */}
          <AppRouterCacheProvider> {/* Wrapper for MUIxNextjs integration, see https://mui.com/material-ui/integrations/nextjs/ */}
            <CssBaseline /> {/* See https://mui.com/material-ui/react-css-baseline/ */}
            <ThemeProvider theme={theme}> {/* Exposes theme to children */}
              <Stack height={"100vh"} minHeight={0} id="app-wrapper">
                <ResponsiveAppBar maintenance={false}/>
                <Stack flexGrow={1} overflow={"auto"} minHeight={0} id="content-wrapper">
                  <Stack flexGrow={1}>{children}</Stack>
                  <Footer />
                </Stack>
              </Stack>
            </ThemeProvider>
          </AppRouterCacheProvider>
        </ApolloWrapper>
        <MuiXLicense />
        <Analytics />
      </body>
    </html>
  )
}
