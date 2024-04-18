
# Composable Tree View

## Exemple

```tsx
<TreeView.Root>
  <TreeView.Group>
    <TreeView.Trigger>
      <ChevronDownIcon />
      src
    </TreeView.Trigger>
    <TreeView.Content>
      <TreeView.Item>index.ts</TreeView.Item>
      <TreeView.Item>treeView.tsx</TreeView.Item>
    </TreeView.Content>
  </TreeView.Group>

  <TreeView.Item>tsconfig.json</TreeView.Item>
  <TreeView.Item>package.json</TreeView.Item>
</TreeView.Root>
```


## States

### rootValue

The `rootValue` is a Set which contains the values of open groups. This state can be either controled or uncontroled.

### selection

The `selection` keep track of the curent selected item or group. There can only be one selected element. This state can't be controled.

### focus

The `focus` state keep track of the curent focused item or group. This state is managed the browser. This state can't be controled.


## To do

- type-ahead :
Type a character: focus moves to the next node with a name that starts with the typed character.
Type multiple characters in rapid succession: focus moves to the next node with a name that starts with the string of characters typed.


## Rescouces

https://medium.com/simform-engineering/building-a-component-library-with-react-typescript-and-storybook-a-comprehensive-guide-ba189accdaf5