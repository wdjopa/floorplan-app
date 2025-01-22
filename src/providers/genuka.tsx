"use client";
import { createContext, useContext, ReactNode } from "react";
import { useGenuka } from "@/hooks/useGenuka";

const GenukaContext = createContext<ReturnType<typeof useGenuka> | undefined>(
  undefined
);

export function GeunkaProvider({ children }: { children: ReactNode }) {
  const genukaState = useGenuka();
  return (
    <GenukaContext.Provider value={genukaState}>
      {children}
    </GenukaContext.Provider>
  );
}

export function useGenukaContext() {
  const context = useContext(GenukaContext);
  if (context === undefined) {
    throw new Error("useGenukaContext must be used within a GeunkaProvider");
  }
  return context;
}
