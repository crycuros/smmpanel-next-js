import type React from "react"
import type { Metadata, Viewport } from "next"
import { Poppins, Lora, IBM_Plex_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ToastProvider } from "@/components/toast-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { CustomCursor } from "@/components/custom-cursor"
import { EmojiParser } from "@/components/emoji-parser"
import { Security } from "@/components/security"
import { ChatBot } from "@/components/chatbot"
import "./globals.css"
import Script from "next/script"

// PP Neue Montreal alternative: Poppins (modern, geometric sans-serif)
const poppinsFont = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-pp-neue-montreal",
})

// Canela alternative: Lora (distinctive editorial serif)
const loraFont = Lora({
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  variable: "--font-canela",
})

// IBM Plex Mono - Google Font (UI Labels)
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-ibm-plex-mono",
})

export const metadata: Metadata = {
  title: "SMMFeeds - Best SMM Panel Philippines",
  description: "Get instant social media followers, likes, views and engagement. Affordable pricing with 24/7 support.",
  generator: 'v0.app',
  icons: {
    icon: '/mnd-favicon.svg',
    apple: '/mnd-favicon.svg',
  },
  openGraph: {
    title: "SMMFeeds - Best SMM Panel Philippines",
    description: "Get instant social media followers, likes, views and engagement. Affordable pricing with 24/7 support.",
    url: "https://smmfeeds.com",
    siteName: "SMMFeeds",
    locale: "en_PH",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SMMFeeds - Best SMM Panel Philippines",
    description: "Get instant social media followers, likes, views and engagement.",
  },
}

export const viewport: Viewport = {
  themeColor: "#1a1a1a",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${poppinsFont.variable} ${loraFont.variable} ${ibmPlexMono.variable} relative`}>
      <body className="font-sans antialiased overflow-x-hidden">
        <Security />
        <EmojiParser />
        <CustomCursor />
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            <div className="noise-overlay" />
            {children}
            <ChatBot />
            <Analytics />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
