import "./globals.css";


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
    </html>
  );
}
