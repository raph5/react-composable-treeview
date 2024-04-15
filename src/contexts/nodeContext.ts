import { createContext } from "react"

export interface NodeContextType {
  parent: string|null
}

export const NodeContext = createContext<NodeContextType>({ parent: null })