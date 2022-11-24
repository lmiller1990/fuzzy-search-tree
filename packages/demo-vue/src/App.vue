<script setup lang="ts">
import { computed, ref } from "vue";
import { deriveTree } from "@fuzzy-treeview/core";
import type { TreeOptions } from "@fuzzy-treeview/core";
import TreeView from "./TreeView.vue";
import File from "./MyFile.vue";
import Directory from "./MyDirectory.vue";

const files = [
  "foo/bar/merp.js",
  "foo/bar/baz.js",
  "foo/bar/baz/merp/lux/qux.js",
  "foo/foo.js",
];

const search = ref("");
const collapsed = ref(new Set<string>());
const tree = computed(() => deriveTree(files, { collapsed: collapsed.value }));
const options: TreeOptions = {
  search: ''
}
</script>

<template>
  <TreeView
    :files="files"
    :options="options"
    :UserDirectory="Directory"
    :UserFile="File"
  />
</template>
