import { useCallback, useRef } from "react"

export interface TreeNode {
  value: string
  parent: string|null
  firstChild: string|null
  nextSibling: string|null
  previousSibling: string|null
}


export type useNodeMapHook = [
  React.RefObject<Record<string, TreeNode>>,                                       // node map
  (value: string, parent: string|null) => void,                                    // setNodeParent
  (value: string, firstChild: string|null) => void,                                // setNodeChild
  (value: string, nextSibling: string|null, previousSibling: string|null) => void  // setNodeSiblings
]

export function useNodeMap(): useNodeMapHook {

  const nodeMap = useRef<Record<string, TreeNode>>({})

  const setNodeParent = useCallback((value: string, parent: string|null) => {
    if(nodeMap.current[value]) {
      nodeMap.current[value].parent = parent
    }
    else {
      nodeMap.current[value] = { value, parent, firstChild: null, nextSibling: null, previousSibling: null }
    }
  }, [])

  const setNodeChild = useCallback((value: string, firstChild: string|null) => {
    if(nodeMap.current[value]) {
      nodeMap.current[value].firstChild = firstChild
    }
    else {
      nodeMap.current[value] = { value, firstChild, parent: null, nextSibling: null, previousSibling: null }
    }
  }, [])

  const setNodeSiblings = useCallback((value: string, nextSibling: string|null, previousSibling: string|null) => {
    if(nodeMap.current[value]) {
      nodeMap.current[value].nextSibling = nextSibling
      nodeMap.current[value].previousSibling = previousSibling
    }
    else {
      nodeMap.current[value] = { value, nextSibling, previousSibling, parent: null, firstChild: null }
    }
  }, [])

  return [nodeMap, setNodeParent, setNodeChild, setNodeSiblings]

}