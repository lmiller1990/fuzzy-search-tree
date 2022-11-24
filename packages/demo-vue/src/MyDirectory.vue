<script lang="ts" setup>
import { DirectoryNode } from "@fuzzy-treeview/core";
import { computed } from "vue";
import HighlightedText from "./HighlightedText.vue";

const props = defineProps<{
  directory: DirectoryNode;
}>();

const displayName = computed(() => {
  return props.directory.displayName
    .split("")
    .map((char, idx) =>
      props.directory.highlight.includes(idx)
        ? { highlight: true, char }
        : { highlight: false, char }
    );
});
</script>

<template>
  <div :style="{ marginLeft: `${props.directory.depth * 10}px` }">
    <HighlightedText
      :text="props.directory.displayName"
      :indexes="props.directory.highlight"
    />
  </div>
</template>
