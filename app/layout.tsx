import { Geist_Mono, Inter } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils";
import { Providers } from "@/components/providers";

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
