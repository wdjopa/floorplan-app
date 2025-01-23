import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { signInWithCustomToken } from "firebase/auth";
import { useSearchParams } from "next/navigation";

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    async function authenticate() {
      try {
        let token = localStorage.getItem("token");
        console.log("token", token);
        if (token) {
          const response = await signInWithCustomToken(auth, token);
          console.log("response", response);
        }
        const companyId =
          searchParams.get("company_id") || localStorage.getItem("company_id");
        const timestamp =
          searchParams.get("timestamp") || localStorage.getItem("timestamp");
        const hmac = searchParams.get("hmac") || localStorage.getItem("hmac");

        if (!companyId || !timestamp || !hmac) {
          setLoading(false);
          return;
        }

        console.log("params", searchParams.toString(), companyId, timestamp, hmac);
        // Get Firebase token from our API
        const response = await fetch(`/api/auth?hmac=${hmac}&timestamp=${timestamp}&company_id=${companyId}`);
        if (!response.ok) {
          throw new Error("Authentication failed");
        }

        const result = await response.json();
        token = result.token as string;
        localStorage.setItem("token", token);
        // Sign in to Firebase
        await signInWithCustomToken(auth, token);
      } catch (err) {
        console.error("response err", err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    authenticate();
  }, [searchParams]);

  return { loading, error };
}
