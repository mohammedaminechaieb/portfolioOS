import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mohamed Amine Chaieb // Portfolio",
  description:
    "Computer engineering student & full-stack developer. Explore my work through an interactive desk and OS experience.",
  keywords: [
    "Mohamed Amine Chaieb",
    "portfolio",
    "full-stack developer",
    "ENSI",
    "Tunisia",
    "React",
    "FastAPI",
    "Flutter",
  ],
  authors: [{ name: "Mohamed Amine Chaieb" }],
  openGraph: {
    title: "AmineOS // Mohamed Amine Chaieb",
    description: "Interactive portfolio — desk and OS modes",
    type: "website",
    locale: "en_US",
  },
  twitter: { card: "summary_large_image" },
  themeColor: "#0a0e14",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-os-bg text-os-text font-sans antialiased overflow-hidden h-screen w-screen">
        {children}
      </body>
    </html>
  );
}
