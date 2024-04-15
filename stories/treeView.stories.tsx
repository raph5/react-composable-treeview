import type { Meta, StoryObj } from '@storybook/react'
import TreeView from '../src/index'
import React from 'react'

export default {
  title: 'TreeView'
} as Meta

export const Simple: StoryObj = {
  render: () => (
    <TreeView.Root>
      <TreeView.Node value="src">
        <TreeView.Trigger>src</TreeView.Trigger>
        <TreeView.Content>
          <TreeView.Node value="src/index.ts">index.ts</TreeView.Node>
          <TreeView.Node value="src/treeView.tsx">treeView.tsx</TreeView.Node>
        </TreeView.Content>
      </TreeView.Node>
      <TreeView.Node value="tsconfig.json">tsconfig.json</TreeView.Node>
      <TreeView.Node value="package.json">package.json</TreeView.Node>
    </TreeView.Root>
  )
}