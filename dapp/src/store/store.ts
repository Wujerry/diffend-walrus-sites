import { create } from 'zustand'

type State = {
  refetch: () => Promise<void>
}

type Action = {
  setRefetch: (list: State['refetch']) => void
}

export const useHistoryStore = create<State & Action>((set) => ({
  refetch: async () => {},
  setRefetch: (fn) => set(() => ({ refetch: fn })),
}))
