import React, { createContext } from "react";
import { useNodeMapHook } from "../hooks/useNodeMap";

export interface TreeViewContextType {
  rootValue: Set<string>
  setRootValue: React.Dispatch<React.SetStateAction<Set<string>>>
  selection: string|null
  setSelection: React.Dispatch<React.SetStateAction<string|null>>
  focus: string
  setFocus: React.Dispatch<React.SetStateAction<Set<string>>>
  nodeMap: useNodeMapHook[0]
  pushToNodeMap: useNodeMapHook[1]
}

export const TreeViewContext = createContext<TreeViewContextType>({
  rootValue: new Set(),
  setRootValue: () => {},
  selection: null,
  setSelection: () => {},
  focus: '',
  setFocus: () => {},
  nodeMap: { current: {} },
  pushToNodeMap: () => {},
})