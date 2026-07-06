import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
});
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "e Persona",
  description: "AI persona chat — talk to Hitesh Choudhary or Piyush Garg",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={cn(
        spaceGrotesk.variable,
        inter.variable,
        jetbrainsMono.variable,
        "font-sans",
      )}
    >
      <body className="antialiased" style={{ height: "100%", margin: 0 }}>
        <ClerkProvider
          appearance={{
            variables: {
              colorBackground: "#171512",
              colorPrimary: "#F2762A",
              colorForeground: "#F5F1EA", // was colorText
              colorMutedForeground: "#A8A29B", // was colorTextSecondary
              colorInput: "#0B0B0A", // was colorInputBackground
              colorInputForeground: "#F5F1EA", // was colorInputText
              borderRadius: "0.5rem",
            },
          }}
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
