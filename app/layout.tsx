import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {ThemeProvider} from "@/contexts/theme-context"
import TopNavbar from "@/components/main/TopNavbar"
import BottomNavbar from "@/components/main/BottomNavbar"
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/main/Providers"
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expense Buddy",
  description: "Track your expenses easily",
  icons: {
    icon: '/favicon.ico',
    apple: '/apple.png',
  },
  openGraph: {
    title: 'Expense Buddy',
    description: 'Track your expenses easily',
    siteName: 'Expense Buddy',
    images: [
      {
        url: '/512.png',
        width: 512,
        height: 512,
        alt: 'Expense Buddy',
      },
    ],
    type: 'website',
  },
  manifest: '/manifest.json',
  themeColor:"#000000"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen h-screen `}
      >
        <ThemeProvider
          >
            <Providers>
              
            <TopNavbar/>
            {children}
            <Toaster
              position="top-center"
              reverseOrder={false}
              />
              <BottomNavbar/>
            </Providers>
           
          </ThemeProvider>
        
      </body>
    </html>
  );
}
