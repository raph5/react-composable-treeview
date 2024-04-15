import React, { createContext } from "react";
import { TreeNode } from "../hooks/useNodeMap";

export interface TreeViewContextType {
  rootValue: Set<string>
  setSelection: React.Dispatch<React.SetStateAction<string|null>>
  selection: string|null
  setRootValue: React.Dispatch<React.SetStateAction<Set<string>>>
  nodeMap: React.RefObject<Record<string, TreeNode>>,
  setNodeParent: (value: string, parent: string|null) => void,
  setNodeChild: (value: string, firstChild: string|null) => void,
  setNodeSiblings: (value: string, nextSibling: string|null, previousSibling: string|null) => void
}

export const TreeViewContext = createContext<TreeViewContextType>({
  rootValue: new Set(),
  setRootValue: () => {},
  selection: null,
  setSelection: () => {},
  nodeMap: { current: {} },
  setNodeParent: () => {},
  setNodeChild: () => {},
  setNodeSiblings: () => {}
})