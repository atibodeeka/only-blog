import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc";
import { AuthProvider } from "@/lib/auth-context";
import { UserMenu } from "@/components/user-menu";
import Link from "next/link";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OnlyBlog — A modern blog",
  description: "A clean, minimal blog powered by Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">
        <TRPCProvider>
          <AuthProvider>
            {/* Header */}
            <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
              <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
                <Link href="/" className="text-xl font-bold tracking-tight">
                  OnlyBlog
                </Link>
                <nav className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                  <Link
                    href="/"
                    className="transition-colors hover:text-foreground">
                    Home
                  </Link>
                  <Link
                    href="/about"
                    className="transition-colors hover:text-foreground">
                    About
                  </Link>
                  <Link
                    href="/new"
                    className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90">
                    Write
                  </Link>
                  <UserMenu />
                </nav>
              </div>
            </header>

            {/* Main content */}
            <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-10">
              {children}
            </main>

            {/* Footer */}
            <footer className="border-t">
              <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-6 text-sm text-muted-foreground">
                <p>&copy; {new Date().getFullYear()} OnlyBlog</p>
                <p></p>
              </div>
            </footer>
          </AuthProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
