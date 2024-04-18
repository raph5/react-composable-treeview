import { createContext } from "react"
import { useIndexType } from "../hooks/useIndex"

export interface GroupContextType {
  parent: string
  getIndex: useIndexType
}

export const GroupContext = createContext<GroupContextType>({
  parent: '',
  getIndex: () => -1
})