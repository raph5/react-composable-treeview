
https://medium.com/simform-engineering/building-a-component-library-with-react-typescript-and-storybook-a-comprehensive-guide-ba189accdaf5

## Exemple

```tsx
<TreeView.Root>
  <TreeView.Item>
    <TreeView.Trigger>
      <ChevronDownIcon />
      src
    </TreeView.Trigger>
    <TreeView.Content>
      <TreeView.Item>index.ts</TreeView.Item>
      <TreeView.Item>treeView.tsx</TreeView.Item>
    </TreeView.Content>
  </TreeView.Item>

  <TreeView.Item>tsconfig.json</TreeView.Item>
  <TreeView.Item>package.json</TreeView.Item>
</TreeView.Root>
```

## TODO

- type-ahead :
Type a character: focus moves to the next node with a name that starts with the typed character.
Type multiple characters in rapid succession: focus moves to the next node with a name that starts with the string of characters typed.