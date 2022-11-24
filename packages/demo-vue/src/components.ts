import { deriveTree, DirectoryNode, FileNode } from "@fuzzy-treeview/core";
import { computed, ComputedRef, defineComponent, FunctionalComponent, h, ref } from "vue";

const indent = 15;

type FileClickHandler = (file: FileNode) => void;

type FolderClickHander = (folder: DirectoryNode) => void;

export const TreeView = defineComponent({
  props: {
    files: {
      type: Array as () => string[],
      required: true
    }
  },
  setup (props, ctx) {
    const search = ref("");
    const collapsed = ref(new Set<string>());
    const tree: ComputedRef<DirectoryNode> = computed(() => deriveTree(props.files, { collapsed: collapsed.value  }));

    return () => ctx.slots?.default?.(tree.value)
  }
})

export const Directory: FunctionalComponent<{
  directory: DirectoryNode;
  depth: number;
  onFolderClick: FolderClickHander;
  onFileClick: FileClickHandler;
}> = (props, ctx) => {
  return ctx.slots?.default?.(props)
  // return h("div", {}, props.directory.displayName);
};
// <div
//   style={{ marginLeft: `${props.depth * indent}px` }}
//   onClick={() => props.onFolderClick(props.directory)}
// >
//   <div>
//     {props.directory.displayName
//       .split("")
//       .map((char, idx) =>
//         props.directory.highlight.includes(idx) ? (
//           <b>{char}</b>
//         ) : (
//           <span>char</span>
//         )
//       )}
//   </div>
// </div>
// {props.directory.expanded &&
//   props.directory.directories.map((directory) => (
//     <Directory
//       directory={directory}
//       key={directory.relative}
//       depth={props.depth + 1}
//       onFolderClick={props.onFolderClick}
//       onFileClick={props.onFileClick}
//     />
//   ))}
// {props.directory.expanded &&
//   props.directory.files.map((file) => (
//     <File
//       file={file}
//       key={file.relative}
//       depth={props.depth + 1}
//       onFileClick={props.onFileClick}
//     />
//   ))}
// </>

const File: FunctionalComponent = (props) => {
  // file: FileNode;
  // depth: number;
  // onFileClick: (file: FileNode) => void;
  return h("div", "ok!");
  // <div
  //   style={{ marginLeft: `${props.depth * indent + 0}px` }}
  //   onClick={() => props.onFileClick(props.file)}
  // >
  //   {props.file.displayName
  //     .split("")
  //     .map((char, idx) =>
  //       props.file.highlight.includes(idx) ? <b key={idx}>{char}</b> : char
  //     )}
  // </div>
};
