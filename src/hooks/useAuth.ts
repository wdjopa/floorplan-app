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
        const companyId = searchParams.get("company_id");
        const timestamp = searchParams.get("timestamp");
        const hmac = searchParams.get("hmac");

        if (!companyId || !timestamp || !hmac) {
          setLoading(false);
          return;
        }

        // Get Firebase token from our API
        const response = await fetch(`/api/auth?${searchParams.toString()}`);
        if (!response.ok) {
          throw new Error("Authentication failed");
        }
        
        const result = await response.json();
        const { token } = result;
        console.log( result);

        // Sign in to Firebase
        await signInWithCustomToken(auth, token);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    authenticate();
  }, [searchParams]);

  return { loading, error };
}
