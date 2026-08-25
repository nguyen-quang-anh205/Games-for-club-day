import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "USTH Cybersecurity · Nonogram Việt",
  description: "Thử thách Digital Forensics Nonogram của USTH Cybersecurity.",
  manifest: "/manifest.webmanifest",
  applicationName: "Nonogram Cyber Lab",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Nonogram Cyber Lab",
  },
  openGraph: {
    title: "USTH Cybersecurity · Nonogram Việt",
    description: "Digital Forensics Lab — giải Nonogram và khôi phục dữ liệu hình ảnh.",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Nonogram Việt" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "USTH Cybersecurity · Nonogram Việt",
    description: "Digital Forensics Lab — giải Nonogram và khôi phục dữ liệu hình ảnh.",
    images: ["/og.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/icon-192.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
