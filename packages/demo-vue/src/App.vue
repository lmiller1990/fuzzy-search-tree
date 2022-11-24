<script setup lang="ts">
import { ref } from "vue";
import TreeView from "./TreeView.vue";
import file from "./MyFile.vue";
import directory from "./MyDirectory.vue";

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
