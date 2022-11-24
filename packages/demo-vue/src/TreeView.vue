<script lang="ts" setup>
import { deriveTree, DirectoryNode, getPath } from "@fuzzy-treeview/core";
import { computed, ComputedRef, ref } from "vue";
import Directory from "./Directory.vue";
import DirStub from "./DirStub.vue";
import FileStub from "./FileStub.vue";

const props = defineProps<{
  files: string[];
  UserDirectory: typeof DirStub;
  UserFile: typeof FileStub;
}>();

const collapsed = ref(new Set<string>());
const tree: ComputedRef<DirectoryNode> = computed(() =>
  deriveTree(props.files, { collapsed: collapsed.value, search: "f" })
);

const handleCollapse = (folder: DirectoryNode) => {
  console.log(folder)
  const rel = getPath(folder.relative);
  const c = new Set([...collapsed.value]);
  if (c.has(rel)) {
    c.delete(rel);
  } else {
    c.add(rel);
  }
  collapsed.value = c;
};
</script>

<template>
  <div>
    <Directory
      v-for="directory of tree.directories"
      :UserDirectory="props.UserDirectory"
      :UserFile="props.UserFile"
      :directory="directory"
      @collapse="node => handleCollapse(node)"
    >
      <component :is="props.UserDirectory" :directory="directory" />
    </Directory>
  </div>
</template>
