
import "./globals.css";
import { UserProvider, useUser } from "../components/context/UserContext";
import "antd/dist/reset.css";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Navbar from "@/components/navbar/Navbar";





export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter&display=swap" />
        <meta httpEquiv="Cache-Control" content="no-store" />
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
