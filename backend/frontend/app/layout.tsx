import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Noto_Sans_Devanagari, Roboto_Condensed } from "next/font/google";
import "./globals.css";
import "./header-branding.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  variable: "--font-noto-sans-devanagari",
  subsets: ["devanagari"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const robotoCondensed = Roboto_Condensed({
  variable: "--font-roboto-condensed",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RLG Eye Hospital — Patient Feedback & Support",
  description: "Ramlal Golchha Eye Hospital Foundation — Patient Feedback & Support Portal",
  icons: {
    icon: "/hd-logo.png",
    apple: "/hd-logo.png",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${notoSansDevanagari.variable} ${robotoCondensed.variable} medical-app-shell min-h-dvh w-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem("theme");var dark=t==="dark";if(t!=="light"&&t!=="dark"){dark=false;}document.documentElement.setAttribute("data-theme",dark?"dark":"light");document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light only";}catch(e){document.documentElement.setAttribute("data-theme","light");document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light only";}})();`,
          }}
        />
      </head>
      <body className="medical-app-body min-h-dvh w-full max-w-full overflow-x-hidden">{children}</body>
    </html>
  );
}
