
# Composable Tree View

A composable, headless, fully accessible tree view component for react. This component is following [radix philosophy](https://github.com/radix-ui/primitives/blob/main/philosophy.md) and [ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/). Keyboard navigation is fully supported.

## Installation

Installation using npm

```bash
npm install react-composable-treeview
```

## File Explorer Exemple

```tsx
import Accordion from 'react-composable-treeview';

<TreeView.Root>
  <TreeView.Group value="/src">
    <TreeView.Trigger>
      <ChevronDownIcon />
      src
    </TreeView.Trigger>
    <TreeView.Content>
      <TreeView.Item value="/src/index.ts">index.ts</TreeView.Item>
      <TreeView.Item value="/src/treeView.tsx">treeView.tsx</TreeView.Item>
    </TreeView.Content>
  </TreeView.Group>

  <TreeView.Item value="/tsconfig.json">tsconfig.json</TreeView.Item>
  <TreeView.Item value="/package.json">package.json</TreeView.Item>
</TreeView.Root>
```

## States

### rootValue

The `rootValue` is a Set which contains the values of open groups. This state can be either controled or uncontroled.

### selection

The `selection` keep track of the curent selected item or group. There can only be one selected element. This state can't be controled.

### focus

The `focus` state keep track of the curent focused item or group. This state is managed the browser. This state can't be controled.

## API Reference

### Root

Contains all the parts of an tree view

| Prop          | Type                    | Default     |
| ------------- | ----------------------- | ----------- |
| value         | `Set<string>`           | `new Set()` |
| defaultValue  | `Set<string>`           | `new Set()` |
| onValueChange | `(Set<string>) => void` | -           |

### Group

Contains all the parts of a collapsible group.

| Prop  | Type     | Default |
| ----- | -------- | ------- |
| value | `string` | ''      |

| Data attribute | Values             |
| -------------- | ------------------ |
| data-state     | "open" \| "closed" |

### Item

Contains an item.

| Prop  | Type     | Default |
| ----- | -------- | ------- |
| value | `string` | ''      |

### Trigger

Toggles the collapsed state of its associated group.

### Content

Contains the collapsible content for an item.

## Rescouces

[ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/patterns/treeview/)

[Radix Philosophy](https://github.com/radix-ui/primitives/blob/main/philosophy.md)

[Guide to building composable, headless components](https://dev.to/haribhandari/react-build-your-own-composable-headless-components-170b)

[Guide to building react component lib](https://medium.com/simform-engineering/building-a-component-library-with-react-typescript-and-storybook-a-comprehensive-guide-ba189accdaf5)
