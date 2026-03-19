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
  React.RefObject<Record<string, TreeNode>>,  // nodeMap
  (value: string, parent: string, index: number, isGroup: boolean, ref: React.RefObject<HTMLLIElement>) => void,  // registerNode
  (value: string) => void,  // removeNode
]

export function useNodeMap(): useNodeMapHook {
  const nodeMap: React.RefObject<Record<string, TreeNode>> = useRef({
    __root__: { value: '__root__', parent: '', children: {}, index: 0, childrenLength: 0, isGroup: true, ref: { current: null } }
  })

  const registerNode = (value: string, parent: string, index: number, isGroup: boolean, ref: React.RefObject<HTMLLIElement>) => {
    if (nodeMap.current == null) return
    const map = nodeMap.current

    map[value] = { value, parent, children: {}, childrenLength: 0, index, isGroup, ref }
    map[parent].children[index] = value
    if(index+1 > map[parent].childrenLength || map[map[parent].childrenLength-1] == undefined) {
      map[parent].childrenLength = index+1
    }
  }

  const removeNode = (value: string) => {
    if (nodeMap.current == null) return

    const node = nodeMap.current[value]
    const parentNode = nodeMap.current[node.parent]
    delete parentNode.children[node.index]
    while (parentNode.childrenLength > 0 && parentNode.children[parentNode.childrenLength-1] == undefined) {
      parentNode.childrenLength -= 1
    }
    delete nodeMap.current[value]
  }

  return [nodeMap, registerNode, removeNode]
}
