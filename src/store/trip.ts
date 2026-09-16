import { create } from 'zustand'

interface TripUIState {
  selectedDayIndex: number
  setSelectedDayIndex: (index: number) => void
  activeTab: 'timeline' | 'expenses'
  setActiveTab: (tab: 'timeline' | 'expenses') => void
}

export const useTripUIStore = create<TripUIState>((set) => ({
  selectedDayIndex: 0,
  setSelectedDayIndex: (index) => set({ selectedDayIndex: index }),
  activeTab: 'timeline',
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
