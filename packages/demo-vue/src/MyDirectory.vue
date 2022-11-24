<script lang="ts" setup>
import { DirectoryNode } from "@fuzzy-treeview/core";
import { computed } from "vue";

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
    <template v-for="{ char, highlight } of displayName">
      <span class="font-bold" v-if="highlight">{{ char }}</span>
      <span v-else>{{ char }}</span>
    </template>
  </div>
</template>
