import { createContext } from "react"

export interface GroupContextType {
  parent: string
  getIndex: () => number
}

export const GroupContext = createContext<GroupContextType>({
  parent: '',
  getIndex: () => -1
})