import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import Providers from "@/components/Providers";
import { initializeData, setupSamplePOSiteModules } from '@/lib/init-data'

// Initialize database with sample data if needed
// This runs on the server during startup
initializeData().then(() => {
  setupSamplePOSiteModules()
}).catch(error => {
  console.error('Error during data initialization:', error)
})

export const metadata: Metadata = {
  title: 'Project Management System',
  description: 'Comprehensive project management system for tracking projects, tasks, and resources',
}

export default async function RootLayout({children,}: Readonly<{children: React.ReactNode;}>) 
{
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
            <main>
              {children}
            </main>
        </Providers>
      </body>
    </html>
  );
}
