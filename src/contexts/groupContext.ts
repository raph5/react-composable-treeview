import { createContext } from "react"

export interface GroupContextType {
  parent: string
  depth: number
}

export const GroupContext = createContext<GroupContextType>({
  parent: '',
  depth: -1
})
