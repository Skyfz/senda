import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import { Link } from "@nextui-org/link";
import clsx from "clsx";
import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans } from "@/config/fonts";
import { Navbar } from "@/components/navbar";
import { SpeedInsights } from "@vercel/speed-insights/next"

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>

          {/* Decorative blur elements */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/2 right-1/2 w-96 h-96 bg-gradient-to-tr from-orange-500 to-rose-600 rounded-full blur-3xl opacity-20" />
            <div className="absolute bottom-1/2 left-1/2 w-96 h-96 bg-gradient-to-bl from-emerald-500 to-cyan-600 rounded-full blur-3xl opacity-30" />
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-gradient-to-tr from-violet-500 to-indigo-600 rounded-full blur-3xl opacity-20" />
            <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-gradient-to-bl from-teal-500 to-blue-600 rounded-full blur-3xl opacity-30" />
          </div>

          <div className="relative flex flex-col h-screen">
            <Navbar />
            <main className="container mx-auto max-w-7xl pt-2 px-6 flex-grow">
              {children}
            </main>
            <footer className="w-full flex items-center justify-center py-3">
              <Link
                isExternal
                className="flex items-center gap-1 text-current"
                href="https://skyfz.github.io"
                title="nextui.org homepage"
              >
                <span className="text-default-600 text-xs">Powered by</span>
                <p className="text-primary text-xs">Skypoint</p>
              </Link>
            </footer>
          </div>
        </Providers>
        <SpeedInsights />
      </body>
    </html>
  );
}
