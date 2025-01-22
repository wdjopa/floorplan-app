import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Company } from '@/types'

interface CompanyState {
  currentCompany: Company | null
  setCompany: (company: Company) => void
  clearCompany: () => void
}

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set) => ({
      currentCompany: null,
      setCompany: (company) => set({ currentCompany: company }),
      clearCompany: () => set({ currentCompany: null }),
    }),
    {
      name: 'company-storage',
    }
  )
);
