import {
  TreeViewRoot,
  TreeViewGroup,
  TreeViewTrigger,
  TreeViewContent,
  TreeViewItem
} from "./treeView"
export type {
  TreeViewGroupProps as TreeViewNodeProps,
  TreeViewRootProps,
  TreeViewContentProps,
  TreeViewTriggerProps,
  TreeViewItemProps
} from "./treeView"

const TreeView = {
  Root: TreeViewRoot,
  Group: TreeViewGroup,
  Trigger: TreeViewTrigger,
  Content: TreeViewContent,
  Item: TreeViewItem
}

export default TreeView