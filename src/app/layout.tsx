import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { createClient } from "@/lib/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BodiMate - Boarding Management System",
  description: "Find the perfect place to stay or list your boarding to thousands of students.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let role: "STUDENT" | "OWNER" | "ADMIN" | null = null;
  if (user) {
    const { data: userData } = await supabase
      .from("users")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    role = userData?.role ?? null;
  }

  const showPublicChrome = role !== "ADMIN";

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col bg-background text-foreground`}
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            {showPublicChrome && <Navbar />}
            <main className="flex-1 flex flex-col">{children}</main>
            {showPublicChrome && <Footer />}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
