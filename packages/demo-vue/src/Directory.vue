<script lang="ts" setup>
import { DirectoryNode } from "@fuzzy-treeview/core";
import { computed } from "vue";
import File from "./File.vue";

const props = defineProps<{
  directory: DirectoryNode;
  UserDirectory: any;
  UserFile: any;
}>();

const emit = defineEmits<{
  (e: "collapse", directory: DirectoryNode): void;
}>();
</script>

<template>
  <span @click="emit('collapse', props.directory)">
    <slot />
  </span>

  <template v-if="props.directory.expanded" >
    <Directory
      v-for="directory of props.directory.directories"
      :UserDirectory="props.UserDirectory"
      :UserFile="props.UserFile"
      :directory="directory"
      @collapse="(dir: DirectoryNode) => emit('collapse', dir)"
    >
      <component :is="props.UserDirectory" :directory="directory" />
    </Directory>
  </template>

  <template v-if="props.directory.expanded">
    <component
      :is="props.UserFile"
      v-for="file of props.directory.files"
      :file="file"
    />
  </template>
</template>
