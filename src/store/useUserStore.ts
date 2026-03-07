import { create } from 'zustand'
import { Database } from '@/types/database.types'

type User = Database['public']['Tables']['users']['Row']

interface UserState {
    user: User | null
    setUser: (user: User | null) => void
    isLoading: boolean
    setIsLoading: (isLoading: boolean) => void
    logout: () => void
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    setUser: (user) => set({ user }),
    isLoading: true,
    setIsLoading: (isLoading) => set({ isLoading }),
    logout: () => set({ user: null }),
}))
