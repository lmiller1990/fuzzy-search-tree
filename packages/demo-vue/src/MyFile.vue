<script lang="ts" setup>
import { FileNode } from "@fuzzy-treeview/core";
import HighlightedText from "./HighlightedText.vue";

const props = defineProps<{
  file: FileNode;
}>();
</script>

<template>
  <div :style="{ marginLeft: `${props.file.depth * 10 + 10}px` }">
    <HighlightedText
      :text="props.file.displayName"
      :indexes="props.file.highlight"
    />
  </div>
</template>
