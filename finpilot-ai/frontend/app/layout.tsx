import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "FinPilot AI — Personal Finance Assistant",
  description: "AI-powered personal finance tracking, insights, and advice",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#161b27",
              color: "#e2e8f0",
              border: "1px solid #1e2535",
              borderRadius: "10px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#000" } },
          }}
        />
      </body>
    </html>
  );
}
