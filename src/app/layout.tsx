import { AuthProvider } from "@/components/AuthProvider";
import { FirebaseAuth } from "@/components/FirebaseAuth";
import { GeunkaProvider } from "@/providers/genuka";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Floorplan Management",
  description: "Manage your restaurant floor plan and reservations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<>...</>}>
          <GeunkaProvider>
            <AuthProvider>
              <FirebaseAuth />
              {children}
            </AuthProvider>
          </GeunkaProvider>
        </Suspense>
      </body>
    </html>
  );
}
