<script lang="ts" setup>
import { DirectoryNode } from "@fuzzy-treeview/core";
import DirectoryStub from "./DirectoryStub.vue";
import FileStub from "./FileStub.vue";

const props = defineProps<{
  directory: DirectoryNode;
  components: {
    directory: typeof DirectoryStub;
    file: typeof FileStub;
  }
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
      :components="props.components"
      :directory="directory"
      @collapse="(dir: DirectoryNode) => emit('collapse', dir)"
    >
      <component :is="props.components.directory" :directory="directory" />
    </Directory>
  </template>

  <template v-if="props.directory.expanded">
    <component
      :is="props.components.file"
      v-for="file of props.directory.files"
      :file="file"
    />
  </template>
</template>
