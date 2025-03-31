import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

export const metadata = {
  title: "Stock Trader",
  description: "Stock Trader app with nextjs and fastapi",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="dark">{children}</body>
      <Toaster />
    </html>
  );
}
