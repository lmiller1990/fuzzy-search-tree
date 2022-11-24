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
