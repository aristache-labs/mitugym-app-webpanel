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
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
        />
        <Script id="ios-viewport-fix" strategy="beforeInteractive">
          {`
            (function() {
              if (typeof window === 'undefined') return;

              const forceViewportReset = () => {
                const meta = document.querySelector('meta[name="viewport"]');
                if (!meta) return;
                const content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";
                // Apply twice to nudge Safari after orientation changes
                meta.setAttribute("content", content);
                setTimeout(() => meta.setAttribute("content", content), 50);
              };

              let ticking = false;
              const onResize = () => {
                if (ticking) return;
                ticking = true;
                requestAnimationFrame(() => {
                  forceViewportReset();
                  ticking = false;
                });
              };

              window.addEventListener("orientationchange", () => {
                forceViewportReset();
                setTimeout(forceViewportReset, 150);
                setTimeout(forceViewportReset, 400);
              });

              window.addEventListener("resize", onResize, { passive: true });

              // Initial pass
              forceViewportReset();
            })();
          `}
        </Script>
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} bg-background text-text antialiased`} suppressHydrationWarning>
        <Script id="suppress-hydration-warnings" strategy="beforeInteractive">
          {`
            if (typeof window !== 'undefined') {
              const originalError = console.error;
              const originalWarn = console.warn;
              
              // Suppress console errors
              console.error = (...args) => {
                const errorMessage = args[0];
                if (
                  typeof errorMessage === 'string' &&
                  (
                    errorMessage.includes('__gchrome_uniqueid') ||
                    errorMessage.includes('data-cursor-element-id') ||
                    errorMessage.includes('nextjs-portal') ||
                    errorMessage.includes('Hydration failed') ||
                    errorMessage.includes('did not match') ||
                    errorMessage.includes('There was an error while hydrating') ||
                    errorMessage.includes('Extra attributes from the server') ||
                    errorMessage.includes('A tree hydrated but some attributes')
                  )
                ) {
                  return;
                }
                originalError.apply(console, args);
              };
              
              // Suppress console warnings
              console.warn = (...args) => {
                const warnMessage = args[0];
                if (
                  typeof warnMessage === 'string' &&
                  (
                    warnMessage.includes('data-cursor-element-id') ||
                    warnMessage.includes('nextjs-portal')
                  )
                ) {
                  return;
                }
                originalWarn.apply(console, args);
              };
              
              // Suppress React error boundary for hydration errors
              window.addEventListener('error', (event) => {
                if (
                  event.message &&
                  (
                    event.message.includes('data-cursor-element-id') ||
                    event.message.includes('Hydration') ||
                    event.message.includes('did not match')
                  )
                ) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);
              
              // Suppress unhandled rejection for hydration errors
              window.addEventListener('unhandledrejection', (event) => {
                if (
                  event.reason &&
                  event.reason.message &&
                  (
                    event.reason.message.includes('data-cursor-element-id') ||
                    event.reason.message.includes('Hydration')
                  )
                ) {
                  event.stopImmediatePropagation();
                  event.preventDefault();
                }
              }, true);
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
