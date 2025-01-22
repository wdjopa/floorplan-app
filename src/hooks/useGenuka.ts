import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { initializeGenuka } from "@/lib/genuka";
import { onAuthStateChanged } from "firebase/auth";
import Genuka from "genuka";

export function useGenuka() {
  const [genuka, setGenuka] = useState<Genuka | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Get the claims which include access_token
          const { claims } = await user.getIdTokenResult();
          const instance = await initializeGenuka({
            token: claims.access_token as string,
            companyId: claims.company_id as string,
          });
          setGenuka(instance);
        } catch (err) {
          setError(err as Error);
        }
      } else {
        setGenuka(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { genuka, loading, error };
}
