import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Logos | An Intellectual Sanctuary for Readers",
  description: "A specialized social platform for deep reading, intellectual discussion, and shared marginalia.",
};

import { LanguageProvider } from "@/context/LanguageContext";
import { AuthProvider } from "@/context/AuthContext";
import { QueryProvider } from "@/providers/QueryProvider";
import { ToastProvider } from "@/components/Toast";
import { ErrorBoundary } from "@/components/ErrorBoundary";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ErrorBoundary>
          <QueryProvider>
            <AuthProvider>
              <LanguageProvider>
                <ToastProvider>
                  {children}
                </ToastProvider>
              </LanguageProvider>
            </AuthProvider>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
