import type React from "react";
import { forwardRef, useContext, useEffect, useRef, useState } from "react";
import { TreeViewContext } from "./contexts/treeViewContext";
import { useNodeMap } from "./hooks/useNodeMap";
import { GroupContext, GroupContextType } from "./contexts/groupContext";
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

export interface TreeViewContentProps extends React.HTMLAttributes<HTMLDivElement> {}


export const TreeViewRoot = forwardRef<HTMLUListElement, TreeViewRootProps>(({ value: controlledValue, onValueChange, defaultValue, onKeyDown, ...props }, ref) => {
  const [nodeMap, pushToNodeMap] = useNodeMap()
  const getIndex = useIndex()

  // states
  const [value, setValue] = useControlledState(controlledValue, onValueChange, defaultValue ?? new Set())
  const [selection, setSelection] = useState<string|null>(null)

  // refs
  const rootRef = useRef<HTMLUListElement>(null)
  const composedRefs = useComposedRefs(rootRef, ref)

  // TODO: wrap function in useCallback
  function handleKeydown(event: React.KeyboardEvent<HTMLUListElement>) {
    if(!TREE_KEYS.includes(event.key) || !nodeMap.current || !selection) return

    switch(event.key) {
      case 'ArrowRight':
        if(!nodeMap.current[selection].isGroup) break
        if(value.has(selection)) {
          setSelection(nodeMap.current[selection].children[0])
        } else {
          setValue(prev => {
            prev.add(selection)
            return new Set(prev)
          })
        }
        break

      case 'ArrowLeft':
        if(value.has(selection)) {
          setValue(prev => {
            prev.delete(selection)
            return new Set(prev)
          })
        } else if(nodeMap.current[selection].parent != '') {
          setSelection(nodeMap.current[selection].parent)
        }
        break
    }
  }

  const onKeyDownHandler = composeEventHandlers(onKeyDown, handleKeydown)

  return (
    <TreeViewContext.Provider value={{ rootValue: value, setRootValue: setValue, selection, setSelection, nodeMap, pushToNodeMap }}>
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
  const { selection, pushToNodeMap } = useContext(TreeViewContext)
  const { parent, getIndex } = useContext(GroupContext)

  const index = getIndex()
  pushToNodeMap(value, parent, index, false)

  return (
    <li
      ref={ref}
      role="treenode"
      aria-selected={selection == value}
      tabIndex={selection == value || selection == null && parent == '' && index == 0 ? 0 : -1}
      {...props}
    />
  )
})

export const TreeViewGroup = forwardRef<HTMLLIElement, TreeViewGroupProps>(({ value, ...props }, ref) => {
  const chilGetIndex = useIndex()
  
  // context
  const { rootValue, selection, pushToNodeMap } = useContext(TreeViewContext)
  const { parent, getIndex } = useContext(GroupContext)
  
  // refs
  const nodeRef = useRef<HTMLLIElement>(null)
  const composedRefs = useComposedRefs(nodeRef, ref)

  const index = getIndex()
  pushToNodeMap(value, parent, index, true)
  if(selection == value) nodeRef.current?.focus()

  return (
    <GroupContext.Provider value={{ parent: value, getIndex: chilGetIndex }}>
      <li
        ref={composedRefs}
        role="treenode"
        aria-expanded={rootValue.has(value)}
        aria-selected={selection == value}
        tabIndex={selection == value || selection == null && parent == '' && index == 0 ? 0 : -1}
        {...props}
      />
    </GroupContext.Provider>
  )
})

export const TreeViewTrigger = forwardRef<HTMLButtonElement, TreeViewTriggerProps>(({ onClick, ...props }, ref) => {
  // context
  const { setRootValue, setSelection } = useContext(TreeViewContext)
  const { parent } = useContext(GroupContext)
  
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

  const onClickHandler = composeEventHandlers(onClick, handleClick)

  return (
    <span
      ref={ref}
      onClick={onClickHandler}
      {...props}
    />
  )
})

export const TreeViewContent = forwardRef<HTMLDivElement, TreeViewContentProps>(({ ...props }, ref) => {
  // context
  const { rootValue } = useContext(TreeViewContext)
  const { parent } = useContext(GroupContext)

  if(rootValue.has(parent)) {
    return (
      <div
        ref={ref}
        role="group"
        {...props}
      />
    )
  }
})