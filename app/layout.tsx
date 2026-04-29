import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";
import { Metadata } from "next";

const inter = Inter({ 
  subsets: ['latin'], 
  variable: '--font-sans',
  display: 'swap',
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: "ticktock | Modern Timesheet Management",
    template: "%s | ticktock",
  },
  description: "Revolutionize how you manage employee work hours. ticktock is a high-performance timesheet application for tracking attendance, projects, and weekly productivity.",
  keywords: ["timesheet", "work tracking", "employee management", "project hours", "productivity", "SaaS", "Next.js"],
  authors: [{ name: "ticktock Team" }],
  creator: "ticktock",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://abdullah-tentwenty-ticktock.vercel.app",
    title: "ticktock | Professional Timesheet Management",
    description: "Effortlessly track and monitor employee attendance and productivity from anywhere, anytime.",
    siteName: "ticktock",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "ticktock Timesheet Management Dashboard Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ticktock | Timesheet Management",
    description: "Modern work hour tracking for high-performance teams.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable,
        fontMono.variable
      )}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
