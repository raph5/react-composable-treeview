import type React from "react";
import { forwardRef, useCallback, useContext, useEffect, useRef, useState } from "react";
import { TreeViewContext } from "./contexts/treeViewContext";
import { getFirstChild, getFirstNode, getLastNode, getNextNode, getPreviousNode, useNodeMap, useNodeMapHook } from "./hooks/useNodeMap";
import { GroupContext } from "./contexts/groupContext";
import { useControlledState } from "./hooks/useControlledState";
import { composeEventHandlers } from "./utils";
import { useComposedRefs } from "./hooks/useComposedRefs";

const TREE_KEYS = [ 'ArrowRight', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'Home', 'End', 'Enter' ]


export interface TreeViewRootProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'defaultValue'> {
  value?: Set<string>
  onValueChange?: (v: Set<string>) => void
  defaultValue?: Set<string>
  defaultSelection?: string
}

export interface TreeViewGroupProps extends React.HTMLAttributes<HTMLLIElement> {
  value: string
  index: number
}

export interface TreeViewItemProps extends React.HTMLAttributes<HTMLLIElement> {
  value: string
  index: number
}

export interface TreeViewTriggerProps extends React.HTMLAttributes<HTMLDivElement> {}

export interface TreeViewContentProps extends React.HTMLAttributes<HTMLUListElement> {}


function focusFirstChild(nodeMap: useNodeMapHook[0], node: string) {
  const firstChild = getFirstChild(nodeMap, node)
  if (firstChild) {
    nodeMap.current?.get(firstChild)?.ref.current?.focus()
  }
}

function focusParent(nodeMap: useNodeMapHook[0], node: string) {
  const parent = nodeMap.current?.get(node)?.parent
  if (parent && parent != '__root__') {
    nodeMap.current?.get(parent)?.ref.current?.focus()
  }
}

function focusPrevious(nodeMap: useNodeMapHook[0], node: string) {
  const previous = getPreviousNode(nodeMap, node)
  if (previous && previous != '__root__') {
    nodeMap.current?.get(previous)?.ref.current?.focus()
  }
}

function focusNext(nodeMap: useNodeMapHook[0], node: string) {
  const next = getNextNode(nodeMap, node)
  if (next && next != '__root__') {
    nodeMap.current?.get(next)?.ref.current?.focus()
  }
}

function focusFirst(nodeMap: useNodeMapHook[0]) {
  const first = getFirstNode(nodeMap)
  if (first && first != '__root__') {
    nodeMap.current?.get(first)?.ref.current?.focus()
  }
}

function focusLast(nodeMap: useNodeMapHook[0]) {
  const last = getLastNode(nodeMap)
  if (last && last != '__root__') {
    nodeMap.current?.get(last)?.ref.current?.focus()
  }
}


export const TreeViewRoot = forwardRef<HTMLUListElement, TreeViewRootProps>(({ value: controlledValue, onValueChange, defaultValue, defaultSelection, onKeyDown, ...props }, ref) => {
  const [nodeMap, registerNode, removeNode] = useNodeMap()

  // states
  const [rootValue, setRootValue] = useControlledState(controlledValue, onValueChange, defaultValue ?? new Set())
  const [selection, setSelection] = useState<string>('')

  // refs
  const rootRef = useRef<HTMLUListElement>(null)
  const composedRefs = useComposedRefs(rootRef, ref)
  const focus = useRef('')

  const handleKeydown = useCallback((event: React.KeyboardEvent<HTMLUListElement>) => {
    if (!TREE_KEYS.includes(event.key) || !nodeMap) return

    switch(event.key) {
      case 'ArrowRight':
        const focusNode = nodeMap.current?.get(focus.current)
        if (!focusNode || !focusNode.isGroup) break
        event.preventDefault()
        if (rootValue.has(focus.current)) {
          focusFirstChild(nodeMap, focus.current)
        } else {
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
    <TreeViewContext.Provider value={{ rootValue, setRootValue, selection, setSelection, focus, nodeMap, registerNode, removeNode }}>
      <GroupContext.Provider value={{ parent: '__root__', depth: 0 }}>
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

export const TreeViewItem = forwardRef<HTMLLIElement, TreeViewItemProps>(({ value, index, onFocus, onClick, ...props }, ref) => {  
  // context
  const { selection, setSelection, focus, nodeMap, registerNode, removeNode } = useContext(TreeViewContext)
  const { parent, depth } = useContext(GroupContext)
  
  // refs
  const itemRef = useRef<HTMLLIElement>(null)
  const composedRefs = useComposedRefs(itemRef, ref)

  // handlers
  const onFocusHandler = composeEventHandlers(onFocus, handleFocus)
  const onClickHandler = composeEventHandlers(onClick, handleClick)
  function handleFocus(event: React.FocusEvent) {
    nodeMap.current?.get(focus.current)?.ref.current?.setAttribute('tabindex', '-1')
    itemRef.current?.setAttribute('tabindex', '0')
    focus.current = value
    event.stopPropagation()
  }
  function handleClick() {
    setSelection(value)
  }

  if(focus.current == '' && parent == '__root__' && index == 0) {
    focus.current = value
  }
  useEffect(() => {
    registerNode(value, parent, index, false, itemRef)
    return () => removeNode(value)
  }, [value, parent, index])

  // unmount
  useEffect(() => () => {
    if(focus.current == value) {
      focus.current = ''
    }
  }, [])

  return (
    <li
      ref={composedRefs}
      role="treeitem"
      aria-selected={selection == value}
      tabIndex={focus.current == value ? 0 : -1}
      onFocus={onFocusHandler}
      onClick={onClickHandler}
      data-depth={depth}
      {...props}
    />
  )
})

export const TreeViewGroup = forwardRef<HTMLLIElement, TreeViewGroupProps>(({ value, index, onFocus, ...props }, ref) => {
  // context
  const { rootValue, selection, focus, nodeMap, registerNode, removeNode } = useContext(TreeViewContext)
  const { parent, depth } = useContext(GroupContext)

  // refs
  const groupRef = useRef<HTMLLIElement>(null)
  const composedRefs = useComposedRefs(groupRef, ref)

  // handlers
  const onFocusHandler = composeEventHandlers(onFocus, handleFocus)
  function handleFocus(event: React.FocusEvent) {
    nodeMap.current?.get(focus.current)?.ref.current?.setAttribute('tabindex', '-1')
    groupRef.current?.setAttribute('tabindex', '0')
    focus.current = value
    event.stopPropagation()
  }

  if(focus.current == '' && parent == '__root__' && index == 0) {
    focus.current = value
  }
  useEffect(() => {
    registerNode(value, parent, index, true, groupRef)
    return () => removeNode(value)
  }, [value, parent, index])

  // unmount
  useEffect(() => () => {
    if(focus.current == value) {
      focus.current = ''
    }
  }, [])

  return (
    <GroupContext.Provider value={{ parent: value, depth: depth+1 }}>
      <li
        ref={composedRefs}
        role="treeitem"
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
