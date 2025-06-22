import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { UserProvider, useUser } from "../components/context/UserContext";
import "antd/dist/reset.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Navbar from "@/components/navbar/Navbar";



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* <link
          href="https://cdn.jsdelivr.net/npm/flowbite@2.5.2/dist/flowbite.min.css"
          rel="stylesheet"
        /> */}
      </head>

      <body>
        <UserProvider>
          <AntdRegistry>
            <Navbar />
            {children}
          </AntdRegistry>
        </UserProvider>
      </body>
    </html>
  );
}
