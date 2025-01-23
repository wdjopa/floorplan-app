"use client";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const companyId =
    searchParams.get("company_id") || localStorage.getItem("company_id");

  useEffect(() => {
    if (companyId) {
      router.push("/floorplan");
    }
  }, [companyId, router]);

  // If no company_id, show landing page
  if (!companyId) {
    // Get all URL Params
    return (
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
        <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          Floorplan App For Restaurants
        </main>
        <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
          <a
            className="flex items-center gap-2 hover:underline hover:underline-offset-4"
            href="https://genuka.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              aria-hidden
              src="/globe.svg"
              alt="Globe icon"
              width={16}
              height={16}
            />
            Go to genuka.com →
          </a>
        </footer>
      </div>
    );
  }

  // Show loading state while redirecting
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-xl">Redirecting to floorplan...</div>
    </main>
  );
}
