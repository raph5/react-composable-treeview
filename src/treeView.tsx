import type React from "react";
import { forwardRef, useContext, useRef, useState } from "react";
import { TreeViewContext } from "./contexts/treeViewContext";
import { useNodeMap } from "./hooks/useNodeMap";
import { NodeContext } from "./contexts/nodeContext";
import { useControlledState } from "./hooks/useControlledState";
import { composeEventHandlers } from "./utils";
import { useComposedRefs } from "./hooks/useComposedRefs";


export interface TreeViewRootProps extends Omit<React.HTMLAttributes<HTMLUListElement>, 'defaultValue'> {
  value?: Set<string>
  onValueChange?: (v: Set<string>) => void
  defaultValue?: Set<string>
}

export interface TreeViewNodeProps extends React.HTMLAttributes<HTMLLIElement> {
  value: string
}

export interface TreeViewTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  
}

export interface TreeViewContentProps extends React.HTMLAttributes<HTMLDivElement> {}


export const TreeViewRoot = forwardRef<HTMLUListElement, TreeViewRootProps>(({ value: controlledValue, onValueChange, defaultValue, ...props }, ref) => {
  const [nodeMap, setNodeParent, setNodeChild, setNodeSiblings] = useNodeMap()
  const [value, setValue] = useControlledState(controlledValue, onValueChange, defaultValue ?? new Set())
  const [selection, setSelection] = useState<string|null>(null)

  setTimeout(() => setSelection('tsconfig.json'), 1000)
  // TODO: check if li .focus() work

  return (
    <TreeViewContext.Provider value={{ rootValue: value, setRootValue: setValue, selection, setSelection, nodeMap, setNodeParent, setNodeChild, setNodeSiblings }}>
      <NodeContext.Provider value={{ parent: null }}>
        <ul
          ref={ref}
          role="tree"
          aria-multiselectable="false"
          {...props}
        />
      </NodeContext.Provider>
    </TreeViewContext.Provider>
  )
})

export const TreeViewNode = forwardRef<HTMLLIElement, TreeViewNodeProps>(({ value, ...props }, ref) => {
  const { rootValue, selection, nodeMap } = useContext(TreeViewContext)
  const { parent } = useContext(NodeContext)
  const nodeRef = useRef<HTMLLIElement>(null)
  const composedRefs = useComposedRefs(nodeRef, ref)

  if(selection == value) nodeRef.current?.focus()

  return (
    <NodeContext.Provider value={{ parent: value }}>
      <li
        ref={composedRefs}
        role="treenode"
        aria-expanded={rootValue.has(value)}
        aria-selected={selection == value}
        tabIndex={selection == value ? 0 : -1}
        {...props}
      />
    </NodeContext.Provider>
  )
})

export const TreeViewTrigger = forwardRef<HTMLButtonElement, TreeViewTriggerProps>(({ onClick, ...props }, ref) => {
  const { rootValue, setRootValue, setSelection } = useContext(TreeViewContext)
  const { parent } = useContext(NodeContext) as { parent: string }
  const onClickHandler = composeEventHandlers(onClick, toggle)
  
  function toggle() {
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
    <button
      ref={ref}
      onClick={onClickHandler}
      {...props}
    />
  )
})

export const TreeViewContent = forwardRef<HTMLDivElement, TreeViewContentProps>(({ ...props }, ref) => {
  const { rootValue } = useContext(TreeViewContext)
  const { parent } = useContext(NodeContext) as { parent: string }

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