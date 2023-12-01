import "./globals.css"
import { ApolloWrapper } from "../common/lib/apollo-provider"
import { Inter } from "next/font/google"
import ResponsiveAppBar from "./ResponsiveAppBar"
import Footer from "./Footer"
import { CssBaseline } from "@mui/material"
import ThemeRegistry from "../common/theme-registry/theme-registry"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "SCREEN: Search Candidate cis-Regulatory Elements by ENCODE",
  description: "SCREEN: Search Candidate cis-Regulatory Elements by ENCODE",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} id="page-container">
        {/* Wrapper for Apollo Requests */}
        <ApolloWrapper>
          {/* Wrapper for MUI theme */}
          <ThemeRegistry>
            <div id="content-wrapper">
              <ResponsiveAppBar />
              <div id="body-wrapper">
                {children}
              </div>
            </div>
            <Footer />
          </ThemeRegistry>
        </ApolloWrapper>
      </body>
    </html>
  )
}
