import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Analytics } from "@vercel/analytics/next";

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
              colorBackground: "#1C1917",
              colorPrimary: "#F2762A",
              colorForeground: "#F5F1EA",
              colorMutedForeground: "#B8B2A8",
              colorInput: "#28241E", // lighter input bg — was too close to page-black
              colorInputForeground: "#F5F1EA",
              colorNeutral: "#3A342C",
              borderRadius: "0.75rem",
            },
            elements: {
              socialButtonsBlockButton: {
                backgroundColor: "#28241E", // lighter — was nearly invisible against the card
                border: "1px solid #3A342C",
                color: "#F5F1EA",
                "&:hover": { backgroundColor: "#332D25" },
              },
              socialButtonsBlockButtonText: {
                color: "#F5F1EA",
                fontWeight: 500,
              },
              formFieldInput: {
                backgroundColor: "#28241E", // same lighter tone as the Google button, for consistency
                border: "1px solid #3A342C",
                color: "#F5F1EA",
                "&:focus": {
                  borderColor: "#F2762A",
                },
              },
              formFieldLabel: {
                color: "#F5F1EA",
                fontWeight: 500,
              },
              dividerLine: { backgroundColor: "#3A342C" },
              dividerText: { color: "#8C8880" },
              footerActionText: { color: "#A8A29B" },
              footerActionLink: { color: "#F2762A", fontWeight: 500 },
            },
          }}
        >
          {children}
        </ClerkProvider>
        <Analytics />
      </body>
    </html>
  );
}
