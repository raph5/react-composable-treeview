import type { Meta, StoryObj } from '@storybook/react'
import TreeView from '../src/index'
import React, { useRef, useState } from 'react'

export default {
  title: 'TreeView'
} as Meta

export const FileExplorer: StoryObj = {
  render: () => {
    const [value, setValue] = useState<Set<string>>(new Set())
    const [state, setState] = useState(false)
    const timeout = useRef(false)

    if(!timeout.current) {
      setTimeout(() => setState(true), 1000)
    }

    return (
      <TreeView.Root value={value} onValueChange={setValue}>
        <TreeView.Group value="/dist">
          <TreeView.Trigger>
            dist
          </TreeView.Trigger>
          <TreeView.Content>
            <TreeView.Item value="/dist/index.js">index.js</TreeView.Item>
          </TreeView.Content>
        </TreeView.Group>

        <TreeView.Group value="/src">
          <TreeView.Trigger>
            src
          </TreeView.Trigger>
          <TreeView.Content>
            <TreeView.Item value="/src/index.ts">index.ts</TreeView.Item>
            <TreeView.Item value="/src/treeView.tsx">treeView.tsx</TreeView.Item>
            { !state && <TreeView.Item value="test">test</TreeView.Item> }
          </TreeView.Content>
        </TreeView.Group>

        { state && <TreeView.Item value="test">test</TreeView.Item> }
        <TreeView.Item value="/tsconfig.json">tsconfig.json</TreeView.Item>
        <TreeView.Item value="/package.json">package.json</TreeView.Item>
      </TreeView.Root>
    )
  }
}
