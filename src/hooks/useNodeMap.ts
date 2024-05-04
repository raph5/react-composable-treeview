import React, { useRef } from "react"

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
  React.RefObject<Record<string, TreeNode>>,                                                                     // nodeMap.current
  (value: string, parent: string, index: number, isGroup: boolean, ref: React.RefObject<HTMLLIElement>) => void  // pushToNodeMap
]

export function useNodeMap(): useNodeMapHook {
  const nodeMap = useRef<Record<string, TreeNode>>({})
  nodeMap.current = {
    __root__: { value: '__root__', parent: '', children: {}, index: 0, childrenLength: 0, isGroup: true, ref: { current: null } }
  }

  const pushToNodeMap = (value: string, parent: string, index: number, isGroup: boolean, ref: React.RefObject<HTMLLIElement>) => {
    nodeMap.current[value] = { value, parent, children: {}, childrenLength: 0, index, isGroup, ref }
    nodeMap.current[parent].children[index] = value
    if(index+1 > nodeMap.current[parent].childrenLength || nodeMap.current[nodeMap.current[parent].childrenLength-1] == undefined) {
      nodeMap.current[parent].childrenLength = index+1
    }
  }

  return [nodeMap, pushToNodeMap]
}
