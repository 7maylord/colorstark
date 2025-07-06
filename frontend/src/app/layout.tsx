import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StarknetProvider from "../config/StarknetProvider";
import Navbar from "../components/Navbar";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ColorStark - Starknet Color Matching Game",
  description: "A fun and interactive color bottle matching game built on Starknet blockchain",
  keywords: ["Starknet", "blockchain", "game", "DApp", "Cairo", "Web3"],
  authors: [{ name: "ColorStark Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light">
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-gradient-to-br from-gray-50 to-starknet-50`}>
        <StarknetProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-gray-100 border-t border-gray-200 py-2">
              <div className="container mx-auto px-4 text-center text-sm text-gray-600">
                <p>
                  Built with ❤️ on{" "}
                  <a 
                    href="https://starknet.io" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-starknet-600 hover:text-starknet-700 font-medium"
                  >
                    Starknet
                  </a>
                  {" | "}
                  <a 
                    href="https://github.com/7maylord/colorstark" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-starknet-600 hover:text-starknet-700 font-medium"
                  >
                    GitHub
                  </a>
                </p>
              </div>
            </footer>
          </div>
        </StarknetProvider>
      </body>
    </html>
  );
}
