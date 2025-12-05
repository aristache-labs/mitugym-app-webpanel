import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/providers/app-providers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MITUGYM Admin",
  description: "Operational dashboard for MITUGYM staff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-text antialiased`} suppressHydrationWarning>
        <Script id="suppress-hydration-warnings" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              const originalError = console.error;
              console.error = (...args) => {
                const errorMessage = args[0];
                if (
                  typeof errorMessage === 'string' &&
                  (
                    errorMessage.includes('__gchrome_uniqueid') ||
                    errorMessage.includes('Hydration failed') ||
                    errorMessage.includes('did not match') ||
                    errorMessage.includes('There was an error while hydrating')
                  )
                ) {
                  return;
                }
                originalError.apply(console, args);
              };
            }
          `}
        </Script>
        <AppProviders>{children}</AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
