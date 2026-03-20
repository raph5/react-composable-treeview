import React, { useRef } from "react"

export interface TreeNode {
  value: string
  parent: string
  index: number
  isGroup: boolean
  ref: React.RefObject<HTMLLIElement>
}


export type useNodeMapHook = [
  React.RefObject<Map<string, TreeNode>>,  // nodeMap
  (value: string, parent: string, index: number, isGroup: boolean, ref: React.RefObject<HTMLLIElement>) => void,  // registerNode
  (value: string) => void,  // removeNode
]

export function useNodeMap(): useNodeMapHook {
  const nodeMap: React.RefObject<Map<string, TreeNode>> = useRef(new Map([
    ['__root__', { value: '__root__', parent: '', index: 0, isGroup: true, ref: { current: null } }],
  ]))

  const registerNode = (value: string, parent: string, index: number, isGroup: boolean, ref: React.RefObject<HTMLLIElement>) => {
    nodeMap.current?.set(value, { value, parent, index, isGroup, ref })
  }

  const removeNode = (value: string) => {
    nodeMap.current?.delete(value)
  }

  return [nodeMap, registerNode, removeNode]
}

export function getFirstChild(nodeMap: useNodeMapHook[0], value: string): string {
  if (!nodeMap.current) return ''
  for (const [_, n] of nodeMap.current) {
    if (n.parent == value && n.index == 0) {
      return n.value
    }
  }
  return ''
}

function getPreviousSiblingNode(nodeMap: useNodeMapHook[0], value: string): string {
  if (!nodeMap.current) return ''
  const node = nodeMap.current.get(value)
  if (node) {
    for (const [_, n] of nodeMap.current) {
      if (n.parent == node.parent && n.index == node.index - 1) {
        return n.value
      }
    }
    return ''
  } else {
    return ''
  }
}

export function getPreviousNode(nodeMap: useNodeMapHook[0], value: string): string {
  if (!nodeMap.current) return ''
  const node = nodeMap.current.get(value)
  if (node) {
    if (node.index == 0) {
      return node.parent
    } else {
      let n = nodeMap.current.get(getPreviousSiblingNode(nodeMap, node.value))
      while (n && n.isGroup) {
        const lastChild = nodeMap.current.get(getLastChild(nodeMap, n.value))
        if (!lastChild) {
          return n.value
        }
        n = lastChild
      }
      return n ? n.value : ''
    }
  } else {
    return ''
  }
}

function getNextSiblingNode(nodeMap: useNodeMapHook[0], value: string): string {
  if (!nodeMap.current) return ''
  const node = nodeMap.current.get(value)
  if (node) {
    for (const [_, n] of nodeMap.current) {
      if (n.parent == node.parent && n.index == node.index + 1) {
        return n.value
      }
    }
    return ''
  } else {
    return ''
  }
}

export function getNextNode(nodeMap: useNodeMapHook[0], value: string): string {
  if (!nodeMap.current) return ''
  const node = nodeMap.current.get(value)
  if (node) {
    if (node.isGroup) {
      const firstChild = getFirstChild(nodeMap, value)
      if (firstChild) {
        return firstChild
      }
    }
    let n = node
    while (true) {
      const sibling = getNextSiblingNode(nodeMap, n.value)
      if (sibling) {
        return sibling
      } else {
        const parent = nodeMap.current.get(n.parent)
        if (!parent || n.value == '__root__') {
          return ''
        }
        n = parent
      }
    }
  } else {
    return ''
  }
}

export function getFirstNode(nodeMap: useNodeMapHook[0]) {
  if (!nodeMap.current) return ''
  for (const [_, n] of nodeMap.current) {
    if (n.parent == '__root__' && n.index == 0) {
      return n.value
    }
  }
  return ''
}

function getLastChild(nodeMap: useNodeMapHook[0], node: string): string {
  if (!nodeMap.current) return ''
  let child: TreeNode|null = null
  for (const [_, n] of nodeMap.current) {
    if (n.parent == node && (!child || n.index > child.index)) {
      child = n
    }
  }
  return child ? child.value : ''
}

export function getLastNode(nodeMap: useNodeMapHook[0]) {
  if (!nodeMap.current) return ''
  let n = nodeMap.current.get('__root__')
  while (n && n.isGroup) {
    const lastChild = nodeMap.current.get(getLastChild(nodeMap, n.value))
    if (!lastChild) {
      return n.value
    }
    n = lastChild
  }
  return n ? n.value : ''
}
