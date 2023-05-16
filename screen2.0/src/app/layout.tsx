import './globals.css'
import { Inter } from 'next/font/google'
import ResponsiveAppBar from '../components/ResponsiveAppBar'
import Footer from '../components/Footer'

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
      <body className={inter.className}>
        <ResponsiveAppBar />
        {children}
        <Footer />
      </body>
    </html>
  )
}
