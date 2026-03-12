import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { ToastContainer } from "../components/Toast";
import LayoutWrapper from "../components/LayoutWrapper";
import Providers from "./providers";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hasamex Expert Database",
  description: "Manage and track expert profiles efficiently",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="font-sans antialiased"
      >
        <Providers>
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
          <ToastContainer />
        </Providers>
      </body>
    </html>
  );
}
