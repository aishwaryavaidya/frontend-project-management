import "./globals.css";
import { ThemeProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import Providers from "@/components/Providers";

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
