import './globals.css'
import { Inter } from 'next/font/google'
import ResponsiveAppBar from '../common/components/ResponsiveAppBar'
import Footer from '../common/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'SCREEN: Search Candidate cis-Regulatory Elements by ENCODE',
  description: 'SCREEN: Search Candidate cis-Regulatory Elements by ENCODE',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className} id="page-container">
        <div id="content-wrapper">
          <ResponsiveAppBar />
          {children}
        </div>
        <Footer />
      </body>
    </html>
  )
}
