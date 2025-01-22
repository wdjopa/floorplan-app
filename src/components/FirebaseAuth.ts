"use client";

import { useEffect } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useSearchParams, useRouter } from "next/navigation";

export function FirebaseAuth() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      signInWithCustomToken(auth, token)
        .then(() => {
          // Remove token from URL after successful sign in
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.delete("token");
          router.replace(newUrl.pathname + newUrl.search);
        })
        .catch(console.error);
    }
  }, [searchParams, router]);

  return null;
}
