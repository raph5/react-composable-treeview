import type { Meta, StoryObj } from '@storybook/react'
import TreeView from '../src/index'
import React, { useState } from 'react'

export default {
  title: 'TreeView'
} as Meta

export const FileExplorer: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Set<string>>(new Set())

    return (
      <TreeView.Root value={value} onValueChange={setValue}>
        <TreeView.Group index={0} value="/dist">
          <TreeView.Trigger>
            dist
          </TreeView.Trigger>
          <TreeView.Content>
            <TreeView.Item index={0} value="/dist/index.js">index.js</TreeView.Item>
          </TreeView.Content>
        </TreeView.Group>

        <TreeView.Group index={1} value="/src">
          <TreeView.Trigger>
            src
          </TreeView.Trigger>
          <TreeView.Content>
            <TreeView.Item index={0} value="/src/index.ts">index.ts</TreeView.Item>
            <TreeView.Item index={1} value="/src/treeView.tsx">treeView.tsx</TreeView.Item>
          </TreeView.Content>
        </TreeView.Group>

        <TreeView.Item index={2} value="/tsconfig.json">tsconfig.json</TreeView.Item>
        <TreeView.Item index={3} value="/package.json">package.json</TreeView.Item>
      </TreeView.Root>
    )
  }
}
