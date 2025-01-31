import type React from "react";
import { forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react";
import { TreeViewContext } from "./contexts/treeViewContext";
import { TreeNode, useNodeMap } from "./hooks/useNodeMap";
import { GroupContext } from "./contexts/groupContext";
import { useControlledState } from "./hooks/useControlledState";
import { composeEventHandlers } from "./utils";
import { useComposedRefs } from "./hooks/useComposedRefs";
import { useIndex } from "./hooks/useIndex";

const TREE_KEYS = [ 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End', 'Enter' ]


export interface TreeViewRootProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'defaultValue'> {
  value?: Set<string>
  onValueChange?: (v: Set<string>) => void
  defaultValue?: Set<string>
}

export interface TreeViewGroupProps extends React.HTMLAttributes<HTMLLIElement> {
  value: string
}

export interface TreeViewItemProps extends React.HTMLAttributes<HTMLLIElement> {
  value: string
}

export interface TreeViewTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface TreeViewContentProps extends React.HTMLAttributes<HTMLUListElement> {}


function focusFirstChild(nodeMap: Record<string, TreeNode>, node: string) {
  const firstChild = nodeMap[node].children[0]
  if(firstChild != undefined) {
    nodeMap[firstChild].ref.current?.focus()
  }
}

function focusParent(nodeMap: Record<string, TreeNode>, node: string) {
  const parent = nodeMap[node].parent
  if(parent != '__root__') {
    nodeMap[parent].ref.current?.focus()
  }
}

function focusPrevious(nodeMap: Record<string, TreeNode>, node: string) {
  const parent = nodeMap[node].parent
  const index = nodeMap[node].index
  if(index != 0) {
    let sibling = nodeMap[parent].children[index-1]
    let lastChild
    while(nodeMap[sibling].isGroup) {
      lastChild = nodeMap[sibling].children[nodeMap[sibling].childrenLength - 1]
      if(lastChild == undefined || nodeMap[lastChild].ref.current == undefined) break
      sibling = lastChild
    }
    nodeMap[sibling].ref.current?.focus()
    return
  }
  if(parent != '__root__') {
    nodeMap[parent].ref.current?.focus()
  }
}

function focusNext(nodeMap: Record<string, TreeNode>, node: string) {
  if(nodeMap[node].isGroup) {
    const firstChild = nodeMap[nodeMap[node].children[0]]?.ref.current
    if(firstChild) {
      firstChild.focus()
      return
    }
  }
  let parent, sibling
  while(true) {
    parent = nodeMap[node].parent
    sibling = nodeMap[parent].children[nodeMap[node].index+1]
    if(sibling != undefined) break
    if(parent == '__root__') return
    node = parent
  }
  nodeMap[sibling].ref.current?.focus()
}

function focusFirst(nodeMap: Record<string, TreeNode>) {
  const first = nodeMap['__root__'].children[0]
  nodeMap[first].ref.current?.focus()
}

function focusLast(nodeMap: Record<string, TreeNode>) {
  let node = '__root__'
  let last
  while(nodeMap[node].isGroup) {
    last = nodeMap[node].children[nodeMap[node].childrenLength - 1]
    if(last == undefined || nodeMap[last].ref.current == undefined) break
    node = last
  }
  nodeMap[node].ref.current?.focus()
}


export const TreeViewRoot = forwardRef<HTMLUListElement, TreeViewRootProps>(({ value: controlledValue, onValueChange, defaultValue, onKeyDown, ...props }, ref) => {
  const [nodeMap, pushToNodeMap] = useNodeMap()
  const getIndex = useIndex()

  // states
  const [rootValue, setRootValue] = useControlledState(controlledValue, onValueChange, defaultValue ?? new Set())
  const [selection, setSelection] = useState<string>('')

  // refs
  const rootRef = useRef<HTMLUListElement>(null)
  const composedRefs = useComposedRefs(rootRef, ref)
  const focus = useRef('')

  const handleKeydown = useCallback((event: React.KeyboardEvent<HTMLUListElement>) => {
    if(!TREE_KEYS.includes(event.key) || !nodeMap) return

    switch(event.key) {
      case 'ArrowRight':
        if(!nodeMap[focus.current].isGroup) break
        event.preventDefault()
        if(rootValue.has(focus.current)) {
          focusFirstChild(nodeMap, focus.current)
        }
        else {
          setRootValue(prev => new Set([...prev, focus.current]))
        }
        break

      case 'ArrowLeft':
        event.preventDefault()
        if(rootValue.has(focus.current)) {
          setRootValue(prev => new Set([...prev].filter(v => v !== focus.current)))
        }
        else {
          focusParent(nodeMap, focus.current)
        }
        break

      case 'ArrowUp':
        event.preventDefault()
        focusPrevious(nodeMap, focus.current)
        break
        
      case 'ArrowDown':  
        event.preventDefault()
        focusNext(nodeMap, focus.current)
        break

      case 'Home':
        event.preventDefault()
        focusFirst(nodeMap)
        break

      case 'End':
        event.preventDefault()
        focusLast(nodeMap)
        break

      case 'Enter':
        event.preventDefault()
        setSelection(focus.current)
        if(rootValue.has(focus.current)) {
          setRootValue(prev => new Set([...prev].filter(v => v !== focus.current)))
        }
        else {
          setRootValue(prev => new Set([...prev, focus.current]))
        }
        break
    }
  }, [rootValue])

  const onKeyDownHandler = composeEventHandlers(onKeyDown, handleKeydown)

  return (
    <TreeViewContext.Provider value={{ rootValue, setRootValue, selection, setSelection, focus, nodeMap, pushToNodeMap }}>
      <GroupContext.Provider value={{ parent: '__root__', getIndex, depth: 0 }}>
        <ul
          ref={composedRefs}
          role="tree"
          aria-multiselectable="false"
          onKeyDown={onKeyDownHandler}
          {...props}
        />
      </GroupContext.Provider>
    </TreeViewContext.Provider>
  )
})

export const TreeViewItem = forwardRef<HTMLLIElement, TreeViewItemProps>(({ value, onFocus, onClick, ...props }, ref) => {  
  // context
  const { selection, setSelection, focus, nodeMap, pushToNodeMap } = useContext(TreeViewContext)
  const { parent, getIndex, depth } = useContext(GroupContext)
  
  // refs
  const itemRef = useRef<HTMLLIElement>(null)
  const composedRefs = useComposedRefs(itemRef, ref)

  // handlers
  const onFocusHandler = composeEventHandlers(onFocus, handleFocus)
  const onClickHandler = composeEventHandlers(onClick, handleClick)
  function handleFocus(event: React.FocusEvent) {
    nodeMap?.[focus.current]?.ref.current?.setAttribute('tabindex', '-1')
    itemRef.current?.setAttribute('tabindex', '0')
    focus.current = value
    event.stopPropagation()
  }
  function handleClick() {
    setSelection(value)
  }

  const index = getIndex(value)
  pushToNodeMap(value, parent, index, false, itemRef)
  if(focus.current == '' && parent == '__root__' && index == 0) {
    focus.current = value
  }

  // unmount
  useEffect(() => () => {
    if(focus.current == value) {
      focus.current = ''
    }
  }, [])

  return (
    <li
      ref={composedRefs}
      role="treenode"
      aria-selected={selection == value}
      tabIndex={focus.current == value ? 0 : -1}
      onFocus={onFocusHandler}
      onClick={onClickHandler}
      data-depth={depth}
      {...props}
    />
  )
})

export const TreeViewGroup = forwardRef<HTMLLIElement, TreeViewGroupProps>(({ value, onFocus, ...props }, ref) => {
  const chilGetIndex = useIndex()

  // context
  const { rootValue, selection, focus, nodeMap, pushToNodeMap } = useContext(TreeViewContext)
  const { parent, getIndex, depth } = useContext(GroupContext)

  // refs
  const groupRef = useRef<HTMLLIElement>(null)
  const composedRefs = useComposedRefs(groupRef, ref)

  // handlers
  const onFocusHandler = composeEventHandlers(onFocus, handleFocus)
  function handleFocus(event: React.FocusEvent) {
    nodeMap?.[focus.current]?.ref.current?.setAttribute('tabindex', '-1')
    groupRef.current?.setAttribute('tabindex', '0')
    focus.current = value
    event.stopPropagation()
  }

  const index = getIndex(value)
  pushToNodeMap(value, parent, index, true, groupRef)
  if(focus.current == '' && parent == '__root__' && index == 0) {
    focus.current = value
  }

  // unmount
  useEffect(() => () => {
    if(focus.current == value) {
      focus.current = ''
    }
  }, [])

  return (
    <GroupContext.Provider value={{ parent: value, getIndex: chilGetIndex, depth: depth+1 }}>
      <li
        ref={composedRefs}
        role="treenode"
        data-state={rootValue.has(value) ? 'open' : 'closed'}
        data-depth={depth}
        aria-expanded={rootValue.has(value)}
        aria-selected={selection == value}
        tabIndex={focus.current == value ? 0 : -1}
        onFocus={onFocusHandler}
        {...props}
      />
    </GroupContext.Provider>
  )
})

export const TreeViewTrigger = forwardRef<HTMLDivElement, TreeViewTriggerProps>(({ onClick, ...props }, ref) => {
  // context
  const { setRootValue, setSelection } = useContext(TreeViewContext)
  const { parent } = useContext(GroupContext)

  const onClickHandler = composeEventHandlers(onClick, handleClick)
  function handleClick() {
    setSelection(parent)
    setRootValue(prev => {
      if(prev.has(parent)) {
        return new Set([...prev].filter(v => v !== parent))
      }
      else {
        return new Set([...prev, parent])
      }
    })
  }

  return (
    <div
      ref={ref}
      onClick={onClickHandler}
      {...props}
    />
  )
})

export const TreeViewContent = forwardRef<HTMLUListElement, TreeViewContentProps>(({ ...props }, ref) => {
  // context
  const { rootValue } = useContext(TreeViewContext)
  const { parent } = useContext(GroupContext)

  if(rootValue.has(parent)) {
    return (
      <ul
        ref={ref}
        role="group"
        {...props}
      />
    )
  }
})
