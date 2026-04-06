import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Latziyela Prints – Request a Quote",
  description:
    "Request a custom screen printing quote from Latziyela Prints. T-shirts, hoodies, posters, and more.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <header className="bg-brand text-white py-5 px-6 shadow-md">
          <div className="max-w-3xl mx-auto flex items-center gap-3">
            <span className="text-2xl font-black tracking-widest uppercase">
              Latziyela Prints
            </span>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-brand text-white text-center text-xs py-4 mt-10">
          © {new Date().getFullYear()} Latziyela Prints. All rights reserved.
        </footer>
      </body>
    </html>
  );
}
