import { fuzzysort } from "./fuzzysort.js";

interface Entry {
  name: string;
  relative: string;
  originalRelative: string;
  indexes: number[];
  parent: string;
  files: Array<{
    name: string;
    relative: string;
    indexes: number[];
  }>
}

export interface Item {
  displayName: string;
  highlight: number[];
  relative: string;
  depth: number;
}

export type FileNode = Item;

interface InternalDirectoryNode extends Item {
  directories: DirectoryNode[];
  files: Item[];
  parent?: InternalDirectoryNode;
  expanded: boolean;
  depth: number;
}

export type DirectoryNode = Omit<InternalDirectoryNode, "parent">;

export interface Tree {
  directories: DirectoryNode[];
}

function longestCommonPath(a: string[], b: string[]): string[] {
  let cand: string[] = [];
  for (let j = 0; j < b.length; j++) {
    if (!a[j] || !b[j]) {
      return cand;
    }
    if (a[j] === b[j]) {
      cand.push(a[j]);
    }
  }
  return cand;
}

function collapse(
  curr: string[],
  dir: string[],
  target: FuzzyFile,
  knownDirs: Array<{ relative: string[]; indexes: number[] }>
): Entry {
  let longest: string[] = [];

  for (let i = 0; i < knownDirs.length; i++) {
    const curr = knownDirs[i];
    const next = longestCommonPath(curr.relative, dir);
    if (next.length > longest.length) {
      longest = next;
    }
  }
  let parent = longest.join("/");
  parent === "" ? "/" : parent;
  const trun = curr.slice(longest.length);
  const relative = curr.slice(0, curr.length - 1).join("/");
  const name = trun.slice(0, trun.length - 1).join("/");
  const file = curr.slice(-1)[0];

  // need to adjust indexes
  const adjusted = adjustIndexes(file, target, "lastIndexOf");
  const pathAdjusted = adjustIndexes(name, target, "indexOf");

  const e: Entry = {
    relative,
    name,
    indexes: pathAdjusted,
    parent,
    originalRelative: target.relative,
    files: [
      {
        name: file,
        relative: curr.join("/"),
        indexes: adjusted,
      },
    ],
  };

  return e;
}

export function getPath(file: string) {
  const s = file.split("/");
  return s.slice(0, s.length - 1).join("/");
}

function getFilename(file: string) {
  const s = file.split("/");
  return s.slice(s.length - 1)[0];
}

function adjustIndexes(
  file: string,
  target: FuzzyFile,
  pos: "indexOf" | "lastIndexOf"
) {
  // need to adjust indexes
  const startsAt = target.relative[pos](file);
  return target.indexes
    .filter((idx) => idx >= startsAt && idx <= startsAt + file.length)
    .map((x) => x - startsAt);
}

function makeEntry(
  target: FuzzyFile,
  files: FuzzyFile[],
  knownDirs: Array<{ relative: string[]; indexes: number[] }>,
  entries: Entry[]
): { best?: string[]; entry: Entry } {
  const knownSibling = entries.find(
    (x) => x.relative === getPath(target.relative)
  );

  if (knownSibling) {
    const file = getFilename(target.relative);
    const adjusted = adjustIndexes(file, target, "lastIndexOf");

    return {
      entry: {
        ...knownSibling,
        files: knownSibling.files.concat({
          name: file,
          indexes: adjusted,
          relative: target.relative,
        }),
      },
    };
  }

  const others = files
    .filter((x) => x !== target)
    .map((x) => x.relative.split(`/`));
  const curr = target.relative.split("/");

  let best: string[] = [];
  for (let i = 0; i < others.length; i++) {
    const next = longestCommonPath(curr, others[i]);
    if (next.length > best.length) {
      best = next;
    }
  }

  const entry = collapse(curr, best, target, knownDirs);
  return {
    best,
    entry,
  };
}

interface FuzzyFile {
  /** This is the filename (includes relative path) */
  relative: string;
  /** fuzzy indexes */
  indexes: number[];
}

function sortByRelative<T extends { relative: string }>(x: T, y: T): -1 | 1 {
  return x.relative.split("/").length < y.relative.split("/").length ? -1 : 1;
}

export type TreeOptions = Partial<{
  search: string;
  collapsed: Set<string>;
}>

export function deriveTree(files: string[], options: TreeOptions = {}): DirectoryNode {
  const filtered: FuzzyFile[] = (options.search ? fuzzysort(options.search, files) : files)
    .map((x) => ({
      indexes: (x as any).indexes ?? [],
      relative: (x as any).target ?? x,
    }))
    .sort(sortByRelative);

  const entries: Entry[] = [];
  const dirs: Array<{ relative: string[]; indexes: number[] }> = [];
  const map = new Map<string, Entry>();

  for (const file of filtered) {
    const { entry, best } = makeEntry(file, filtered, dirs, entries);
    entries.push(entry);
    if (best) {
      const joined = best.join("/");
      const indexes = adjustIndexes(joined, file, "indexOf");
      dirs.push({ relative: best, indexes });
    }
    map.set(entry.relative, entry);
  }

  const root: InternalDirectoryNode = {
    displayName: "/",
    expanded: true,
    parent: undefined,
    depth: 0,
    highlight: [],
    relative: "/",
    files: [],
    directories: [],
  };

  const dirmap = new Map<string, InternalDirectoryNode>();

  function getDepth(n: InternalDirectoryNode) {
    // We start at -1 since node.parent is always defined at least once,
    // since even the top level nodes have `root` as their parent.
    let i = 0;
    let node: InternalDirectoryNode | null = n;
    while ((node = node?.parent ?? null)) {
      i++;
    }
    return i;
  }

  for (const entry of entries) {
    const parent =
      entry.relative === entry.name ? root : dirmap.get(entry.parent)!;

      const depth = getDepth(parent);
    dirmap.set(entry.relative, {
      expanded: !options.collapsed?.has(getPath(entry.originalRelative)),
      displayName: entry.name,
      parent,
      highlight: entry.indexes,
      relative: entry.originalRelative,
      depth,
      files: entry.files
        .map((x) => {
          return {
            relative: x.relative,
            displayName: x.name,
            highlight: x.indexes,
            depth,
          };
        })
        .sort((x, y) => {
          return y.displayName.localeCompare(x.displayName) > 0 ? 1 : -1;
        }),
      directories: [],
    });
  }

  for (const v of dirmap.values()) {
    v.parent!.directories.push(v);
    delete v.parent;
  }

  return root as DirectoryNode;
}
