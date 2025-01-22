import { Inter } from "next/font/google";
import { GeunkaProvider } from "@/providers/genuka";
import "./globals.css";
import { FirebaseAuth } from "@/components/FirebaseAuth";
import { AuthProvider } from "@/components/AuthProvider";

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
        <AuthProvider>
          <GeunkaProvider>
            <FirebaseAuth />
            {children}
          </GeunkaProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
