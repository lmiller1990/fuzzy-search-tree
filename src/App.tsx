import { useState } from "react";
import * as fuzzy from './fuzzysort'
import type { DirectoryNode, FileNode } from "./tree";
import { deriveTree } from "./tree";
import "./App.css";

const indent = 15;

const Directory: React.FC<{
  directory: DirectoryNode;
  depth: number;
}> = (props) => {
  return (
    <>
      <div style={{ marginLeft: `${props.depth * indent}px` }}>
        {props.directory.displayName
          .split("")
          .map((char, idx) =>
            props.directory.highlight.includes(idx) ? <b>{char}</b> : char
          )}
      </div>

      {props.directory.directories.map((directory) => (
        <Directory
          directory={directory}
          key={directory.relative}
          depth={props.depth + 1}
        />
      ))}

      {props.directory.files.map((file) => (
        <File file={file} key={file.relative} depth={props.depth + 1} />
      ))}
    </>
  );
};

const File: React.FC<{
  file: FileNode;
  depth: number;
}> = (props) => {
  return (
    <div style={{ marginLeft: `${props.depth * indent + 0}px` }}>
      {props.file.displayName
        .split("")
        .map((char, idx) =>
          props.file.highlight.includes(idx) ? <b>{char}</b> : char
        )}
    </div>
  );
};

interface Options {
  search: string;
}

function App() {
  window.fuzzy = fuzzy
  const files = [
    "foo/bar/merp.js",
    "foo/bar/baz.js",
    "foo/bar/baz/merp/lux/qux.js",
    "foo/foo.js",
  ];
  window.files = files

  const [search, setSearch] = useState("");
  const [tree, setTree] = useState(deriveTree(files));

  function onSearch(search: string) {
    setSearch(search);
    setTree(deriveTree(files));
  }

  return tree.directories.map((item) => (
    <Directory directory={item} key={item.relative} depth={0} />
  ));
}

export default App;
