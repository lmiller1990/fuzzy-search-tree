import React, { useState } from "react";
import type { DirectoryNode, FileNode } from "@fuzzy-treeview/core";
import { getPath, deriveTree } from "@fuzzy-treeview/core";

const indent = 15;

type FileClickHandler = (file: FileNode) => void;

type FolderClickHander = (folder: DirectoryNode) => void;

const Directory: React.FC<{
  directory: DirectoryNode;
  depth: number;
  onFolderClick: FolderClickHander;
  onFileClick: FileClickHandler;
}> = (props) => {
  return (
    <>
      <div
        style={{ marginLeft: `${props.depth * indent}px` }}
        onClick={() => props.onFolderClick(props.directory)}
      >
        <div>
          {props.directory.displayName
            .split("")
            .map((char, idx) =>
              props.directory.highlight.includes(idx) ? (
                <b key={idx}>{char}</b>
              ) : (
                char
              )
            )}
        </div>
      </div>

      {props.directory.expanded &&
        props.directory.directories.map((directory) => (
          <Directory
            directory={directory}
            key={directory.relative}
            depth={props.depth + 1}
            onFolderClick={props.onFolderClick}
            onFileClick={props.onFileClick}
          />
        ))}

      {props.directory.expanded &&
        props.directory.files.map((file) => (
          <File
            file={file}
            key={file.relative}
            depth={props.depth + 1}
            onFileClick={props.onFileClick}
          />
        ))}
    </>
  );
};

const File: React.FC<{
  file: FileNode;
  depth: number;
  onFileClick: (file: FileNode) => void;
}> = (props) => {
  return (
    <div
      style={{ marginLeft: `${props.depth * indent + 0}px` }}
      onClick={() => props.onFileClick(props.file)}
    >
      {props.file.displayName
        .split("")
        .map((char, idx) =>
          props.file.highlight.includes(idx) ? <b key={idx}>{char}</b> : char
        )}
    </div>
  );
};

function App() {
  const files = [
    "foo/bar/merp.js",
    "foo/bar/baz.js",
    "foo/bar/baz/merp/lux/qux.js",
    "foo/foo.js",
  ];

  const [search, setSearch] = useState("");
  const [collapsed, setCollapsed] = useState(new Set<string>());
  const [tree, setTree] = useState(deriveTree(files, { collapsed }));

  function onSearch(search: string) {
    setSearch(search);
    const c = new Set<string>();
    setCollapsed(c);
    setTree(deriveTree(files, { search, collapsed: c }));
  }

  const onFolderClick: FolderClickHander = (folder) => {
    const rel = getPath(folder.relative);
    const c = new Set([...collapsed]);
    if (c.has(rel)) {
      c.delete(rel);
    } else {
      c.add(rel);
    }
    setCollapsed(c);
    setTree(deriveTree(files, { search, collapsed: c }));
  };

  const onFileClick: FileClickHandler = (file) => {
    console.log(`Clicked`, file);
  };

  return (
    <div>
      <input value={search} onInput={(e) => onSearch(e.currentTarget.value)} />
      {tree.directories.map((item) => (
        <Directory
          directory={item}
          key={item.relative}
          depth={0}
          onFolderClick={onFolderClick}
          onFileClick={onFileClick}
        />
      ))}
    </div>
  );
}

export default App;
