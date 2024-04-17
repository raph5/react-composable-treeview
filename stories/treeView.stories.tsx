import type { Meta, StoryObj } from '@storybook/react'
import TreeView from '../src/index'
import React from 'react'

export default {
  title: 'TreeView'
} as Meta

export const Simple: StoryObj = {
  render: () => (
    <TreeView.Root>
      <TreeView.Group value="src">
        <TreeView.Trigger>src</TreeView.Trigger>
        <TreeView.Content>
          <TreeView.Item value="src/index.ts">index.ts</TreeView.Item>
          <TreeView.Item value="src/treeView.tsx">treeView.tsx</TreeView.Item>
        </TreeView.Content>
      </TreeView.Group>
      <TreeView.Item value="tsconfig.json">tsconfig.json</TreeView.Item>
      <TreeView.Item value="package.json">package.json</TreeView.Item>
    </TreeView.Root>
  )
}