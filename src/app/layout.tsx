import {ClerkProvider} from "@clerk/nextjs";
import type {Metadata} from "next";
import {Bricolage_Grotesque, Figtree} from "next/font/google";
import {SettingsProvider} from "@/context/SettingsContext";
import "./globals.css";

const display = Bricolage_Grotesque({
  subsets: ["latin", "latin-ext"],
  variable: "--font-display",
});

const body = Figtree({
  subsets: ["latin", "latin-ext"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "MamTo",
  description: "Twój osobisty organizer — pojazdy, polisy, zapasy i wizyty.",
  icons: {
    icon: "/mamto-mark.svg",
    apple: "/mamto-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="pl" className={`${display.variable} ${body.variable}`}>
        <body className="antialiased">
          <SettingsProvider>{children}</SettingsProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
