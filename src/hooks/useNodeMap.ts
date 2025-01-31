import React from "react"

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
  Record<string, TreeNode>,                                                                                      // nodeMap.current
  (value: string, parent: string, index: number, isGroup: boolean, ref: React.RefObject<HTMLLIElement>) => void  // pushToNodeMap
]

export function useNodeMap(): useNodeMapHook {
  const nodeMap: Record<string, TreeNode> = {
    __root__: { value: '__root__', parent: '', children: {}, index: 0, childrenLength: 0, isGroup: true, ref: { current: null } }
  }

  const pushToNodeMap = (value: string, parent: string, index: number, isGroup: boolean, ref: React.RefObject<HTMLLIElement>) => {
    nodeMap[value] = { value, parent, children: {}, childrenLength: 0, index, isGroup, ref }
    nodeMap[parent].children[index] = value
    if(index+1 > nodeMap[parent].childrenLength || nodeMap[nodeMap[parent].childrenLength-1] == undefined) {
      nodeMap[parent].childrenLength = index+1
    }
  }

  return [nodeMap, pushToNodeMap]
}
