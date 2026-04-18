import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Opportunity Inbox Copilot",
    template: "%s | Opportunity Inbox Copilot",
  },
  description:
    "AI-powered email ranking for Pakistani students — find scholarships, internships, and competitions before deadlines pass.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
