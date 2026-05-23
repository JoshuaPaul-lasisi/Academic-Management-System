import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAppStore = create(
  persist(
    (set) => ({
      school: null,
      currentSession: null,
      currentTerm: null,
      selectedAnnex: 'Lagos',
      classes: [],
      annexes: [],

      setSchool: (school) => set({ school }),
      setCurrentSession: (session) => set({ currentSession: session }),
      setCurrentTerm: (term) => set({ currentTerm: term }),
      setSelectedAnnex: (annex) => set({ selectedAnnex: annex }),
      setClasses: (classes) => set({ classes }),
      setAnnexes: (annexes) => set({ annexes }),
      clearStore: () => set({
        school: null, currentSession: null, currentTerm: null,
        selectedAnnex: 'Lagos', classes: [], annexes: [],
      }),
    }),
    { name: 'debbyfield-state' }
  )
)
