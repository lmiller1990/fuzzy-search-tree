<script lang="ts" setup>
import { FileNode } from "@fuzzy-treeview/core";

const props = defineProps<{
  file: FileNode;
}>();
</script>

<template>
  <div :style="{ marginLeft: `${props.file.depth * 10 + 10}px` }">
    {{ props.file.displayName }}
  </div>
</template>
