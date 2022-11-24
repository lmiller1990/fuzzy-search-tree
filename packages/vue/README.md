# @fuzzy-treeview/vue

Vue integration for `fuzzy-treeview`.

## Usage

`@fuzzy-treeview/vue` is a headless component. You need to provide your own `File` and `Directory` components.

`File` receives a `FileNode` prop and `Directory` a `DirectoryNode` prop. These have all the required properties to apply fuzzy highlighting, depth, etc.

```vue
<!-- File.vue -->
<script setup lang="ts">
import { FileNode } from "@fuzzy-treeview/core";

const props = defineProps<{
  file: FileNode;
}>();
</script>

<template>
  <li :style="{ marginLeft: `${props.file.depth + 1 * 15}px` }">
    {{ props.file.displayName }}
  </li>
</template>
```

```vue
<!-- Directory.vue -->
<script lang="ts" setup>
import { DirectoryNode } from "@fuzzy-treeview/core";

const props = defineProps<{
  directory: DirectoryNode;
}>();
</script>

<template>
  <div :style="{ marginLeft: `${props.directory.depth * 10}px` }">
    {{ props.directory.displayName }}
  </div>
</template>
```

Usage - use teh `TreeView` component.

```vue
<script setup lang="ts">
import { ref } from "vue";
import TreeView from "./TreeView.vue";
import file from "./File.vue";
import directory from "./Directory.vue";

const files = [
  "foo/bar/merp.js",
  "foo/bar/baz.js",
  "foo/bar/baz/merp/lux/qux.js",
  "foo/foo.js",
];

const search = ref("");
</script>

<template>
  <input v-model="search" placeholder="Search..." />
  <TreeView
    :files="files"
    :search="search"
    :components="{
      file,
      directory
    }"
  />
</template>
```