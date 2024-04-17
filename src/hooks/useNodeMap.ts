import { useCallback, useRef } from "react"

export interface TreeNode {
  value: string
  parent: string
  children: Record<string, string>
  isGroup: boolean
}


export type useNodeMapHook = [
  React.RefObject<Record<string, TreeNode>>,                                // nodeMap
  (value: string, parent: string, index: number, isGroup: boolean) => void  // pushToNodeMap
]

export function useNodeMap(): useNodeMapHook {
  const nodeMap = useRef<Record<string, TreeNode>>({
    '': { value: '', parent: '', children: {}, isGroup: true }
  })
  
  const waitingList = useRef<Record<string, [string, string, number, boolean][]>>({})

  const pushToNodeMap = useCallback((value: string, parent: string, index: number, isGroup: boolean) => {
    if(!nodeMap.current[parent]) {
      if(!waitingList.current[parent]) {
        waitingList.current[parent] = [[value, parent, index, isGroup]]
      }
      else {
        waitingList.current[parent].push([value, parent, index, isGroup])
      }
      return
    }

    nodeMap.current[value] = { value, parent, children: {}, isGroup }
    nodeMap.current[parent].children[index] = value

    if(waitingList.current[value]) {
      for(const args of waitingList.current[value]) {
        pushToNodeMap(...args)
      }
      delete waitingList.current[value]
    }
  }, [])

  return [nodeMap, pushToNodeMap]
}