import React, { useCallback, useRef } from "react"

export interface TreeNode {
  value: string
  parent: string
  children: Record<string, string>
  childrenLength: number
  index: number
  isGroup: boolean
  ref: React.RefObject<HTMLLIElement>
}


export type useNodeMapHook = [
  React.RefObject<Record<string, TreeNode>>,                                                                     // nodeMap
  (value: string, parent: string, index: number, isGroup: boolean, ref: React.RefObject<HTMLLIElement>) => void  // pushToNodeMap
]

export function useNodeMap(): useNodeMapHook {
  const nodeMap = useRef<Record<string, TreeNode>>({
    '': { value: '', parent: '', children: {}, index: 0, childrenLength: 0, isGroup: true, ref: { current: null } }
  })
  
  const waitingList = useRef<Record<string, [string, string, number, boolean, React.RefObject<HTMLLIElement>][]>>({})

  const pushToNodeMap = useCallback((value: string, parent: string, index: number, isGroup: boolean, ref: React.RefObject<HTMLLIElement>) => {
    if(!nodeMap.current[parent]) {
      if(!waitingList.current[parent]) {
        waitingList.current[parent] = [[value, parent, index, isGroup, ref]]
      }
      else {
        waitingList.current[parent].push([value, parent, index, isGroup, ref])
      }
      return
    }

    nodeMap.current[value] = { value, parent, children: {}, childrenLength: 0, index, isGroup, ref }
    nodeMap.current[parent].children[index] = value
    if(index+1 > nodeMap.current[parent].childrenLength || nodeMap.current[nodeMap.current[parent].childrenLength-1] == undefined) {
      nodeMap.current[parent].childrenLength = index+1
    }

    if(waitingList.current[value]) {
      for(const args of waitingList.current[value]) {
        pushToNodeMap(...args)
      }
      delete waitingList.current[value]
    }
  }, [])

  return [nodeMap, pushToNodeMap]
}