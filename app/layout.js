import "./globals.css";

export const metadata = {
  title: "Widow Blue — Mesh Network & Chat",
  description: "Chat decentralizzata, rete mesh crittografata e ricompense in token.",
  themeColor: "#000000",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it" className="dark bg-black">
      <body className="min-h-screen bg-black text-neutral-100 antialiased selection:bg-neutral-800 selection:text-white overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}