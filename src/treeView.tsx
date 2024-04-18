import type React from "react";
import { forwardRef, useCallback, useContext, useId, useRef, useState } from "react";
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

export interface TreeViewTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {}

export interface TreeViewContentProps extends React.HTMLAttributes<HTMLUListElement> {}


function focusFirstChild(nodeMap: Record<string, TreeNode>, node: string) {
  const firstChild = nodeMap[node].children[0]
  if(firstChild != undefined) {
    nodeMap[firstChild].ref.current?.focus()
  }
}

function focusParent(nodeMap: Record<string, TreeNode>, node: string) {
  const parent = nodeMap[node].parent
  if(parent != '') {
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
  if(parent != '') {
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
    if(parent == '') return
    node = parent
  }
  nodeMap[sibling].ref.current?.focus()
}

function focusFirst(nodeMap: Record<string, TreeNode>) {
  const first = nodeMap[''].children[0]
  nodeMap[first].ref.current?.focus()
}

function focusLast(nodeMap: Record<string, TreeNode>) {
  let node = ''
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
  const [selection, setSelection] = useState<string|null>(null)

  // refs
  const rootRef = useRef<HTMLUListElement>(null)
  const composedRefs = useComposedRefs(rootRef, ref)
  const focus = useRef('')

  const handleKeydown = useCallback((event: React.KeyboardEvent<HTMLUListElement>) => {
    if(!TREE_KEYS.includes(event.key) || !nodeMap.current) return

    switch(event.key) {
      case 'ArrowRight':
        if(!nodeMap.current[focus.current].isGroup) break
        if(rootValue.has(focus.current)) {
          focusFirstChild(nodeMap.current, focus.current)
        }
        else {
          setRootValue(prev => {
            prev.add(focus.current)
            return new Set(prev)
          })
        }
        break

      case 'ArrowLeft':
        if(rootValue.has(focus.current)) {
          setRootValue(prev => {
            prev.delete(focus.current)
            return new Set(prev)
          })
        }
        else {
          focusParent(nodeMap.current, focus.current)
        }
        break

      case 'ArrowUp':
        focusPrevious(nodeMap.current, focus.current)
        break
        
      case 'ArrowDown':  
        focusNext(nodeMap.current, focus.current)
        break

      case 'Home':
        focusFirst(nodeMap.current)
        break

      case 'End':
        focusLast(nodeMap.current)
        break

      case 'Enter':
        setSelection(focus.current)
        if(rootValue.has(focus.current)) {
          setRootValue(prev => {
            prev.delete(focus.current)
            return new Set(prev)
          })
        }
        else {
          setRootValue(prev => {
            prev.add(focus.current)
            return new Set(prev)
          })
        }
        break
    }
  }, [rootValue])

  const onKeyDownHandler = composeEventHandlers(onKeyDown, handleKeydown)

  return (
    <TreeViewContext.Provider value={{ rootValue, setRootValue, selection, setSelection, focus, nodeMap, pushToNodeMap }}>
      <GroupContext.Provider value={{ parent: '', getIndex }}>
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

export const TreeViewItem = forwardRef<HTMLLIElement, TreeViewItemProps>(({ value, onFocus, ...props }, ref) => {  
  // context
  const { selection, focus, nodeMap, pushToNodeMap } = useContext(TreeViewContext)
  const { parent, getIndex } = useContext(GroupContext)
  
  // refs
  const itemRef = useRef<HTMLLIElement>(null)
  const composedRefs = useComposedRefs(itemRef, ref)

  // handlers
  const onFocusHandler = composeEventHandlers(onFocus, handleFocus)
  function handleFocus(event: React.FocusEvent) {
    nodeMap.current?.[focus.current].ref.current?.setAttribute('tabindex', '-1')
    itemRef.current?.setAttribute('tabindex', '0')
    focus.current = value
    event.preventDefault()
  }

  const index = getIndex(value)
  pushToNodeMap(value, parent, index, false, itemRef)
  if(focus.current == '' && parent == '' && index == 0) {
    focus.current = value
  }

  return (
    <li
      ref={composedRefs}
      role="treenode"
      aria-selected={selection == value}
      tabIndex={focus.current == value ? 0 : -1}
      onFocus={onFocusHandler}
      {...props}
    />
  )
})

export const TreeViewGroup = forwardRef<HTMLLIElement, TreeViewGroupProps>(({ value, onFocus, ...props }, ref) => {
  const chilGetIndex = useIndex()
  
  // context
  const { rootValue, selection, focus, nodeMap, pushToNodeMap } = useContext(TreeViewContext)
  const { parent, getIndex } = useContext(GroupContext)
  
  // refs
  const groupRef = useRef<HTMLLIElement>(null)
  const composedRefs = useComposedRefs(groupRef, ref)

  // handlers
  const onFocusHandler = composeEventHandlers(onFocus, handleFocus)
  function handleFocus(event: React.FocusEvent) {
    nodeMap.current?.[focus.current].ref.current?.setAttribute('tabindex', '-1')
    groupRef.current?.setAttribute('tabindex', '0')
    focus.current = value
    event.preventDefault()
  }

  const index = getIndex(value)
  pushToNodeMap(value, parent, index, true, groupRef)
  if(focus.current == '' && parent == '' && index == 0) {
    focus.current = value
  }

  return (
    <GroupContext.Provider value={{ parent: value, getIndex: chilGetIndex }}>
      <li
        ref={composedRefs}
        role="treenode"
        aria-expanded={rootValue.has(value)}
        aria-selected={selection == value}
        tabIndex={focus.current == value ? 0 : -1}
        onFocus={onFocusHandler}
        {...props}
      />
    </GroupContext.Provider>
  )
})

export const TreeViewTrigger = forwardRef<HTMLButtonElement, TreeViewTriggerProps>(({ onClick, ...props }, ref) => {
  // context
  const { setRootValue, setSelection } = useContext(TreeViewContext)
  const { parent } = useContext(GroupContext)
  
  const onClickHandler = composeEventHandlers(onClick, handleClick)
  function handleClick() {
    setSelection(parent)
    setRootValue(prev => {
      if(prev.has(parent)) {
        prev.delete(parent)
      }
      else {
        prev.add(parent)
      }
      return new Set(prev)
    })
  }

  return (
    <span
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