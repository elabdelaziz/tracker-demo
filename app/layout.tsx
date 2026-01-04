import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { AppSidebar } from '@/components/app-sidebar'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'
import { ThemeProvider } from '@/components/theme-provider'
import { SiteHeader } from '@/components/site-header'
import { Toaster } from '@/components/ui/sonner'
import { RateLimitProvider } from '@/components/providers/rate-limit-provider'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: 'Memtime Tracker',
  description: 'Memtime Tracker Application',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <RateLimitProvider>
            <div className="relative flex min-h-screen flex-col">
              <SidebarProvider>
                <AppSidebar />
                <SidebarInset className="max-h-svh overflow-hidden">
                  <SiteHeader />
                  <div className="flex flex-1 flex-col gap-4 overflow-hidden">
                    {children}
                  </div>
                </SidebarInset>
              </SidebarProvider>
            </div>
            <Toaster />
          </RateLimitProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
