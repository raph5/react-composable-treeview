import {
  TreeViewRoot,
  TreeViewNode,
  TreeViewTrigger,
  TreeViewContent
} from "./treeView"
export type {
  TreeViewNodeProps,
  TreeViewRootProps,
  TreeViewContentProps,
  TreeViewTriggerProps
} from "./treeView"

const TreeView = {
  Root: TreeViewRoot,
  Node: TreeViewNode,
  Trigger: TreeViewTrigger,
  Content: TreeViewContent
}

export default TreeView