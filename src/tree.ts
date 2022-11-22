// interface TreeOptions {
//   noCircularDeps: boolean;
// }

interface Entry {
  name: string;
  relative: string;
  originalRelative: string;
  parent: string;
  files: Array<{
    name: string;
    relative: string
  }>
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
  target: string,
  knownDirs: Array<string[]>
): Entry {
  let longest: string[] = [];

  for (let i = 0; i < knownDirs.length; i++) {
    const curr = knownDirs[i];
    const next = longestCommonPath(curr, dir);
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

  const e: Entry = {
    relative,
    name,
    parent,
    originalRelative: target,
    files: [{
      name: file,
      relative: curr.join('/')
  }],
  };

  return e;
}

function getPath(file: string) {
  const s = file.split("/");
  return s.slice(0, s.length - 1).join("/");
}

function getFilename(file: string) {
  const s = file.split("/");
  return s.slice(s.length - 1)[0];
}

function makeEntry(
  target: string,
  files: string[],
  knownDirs: Array<string[]>,
  entries: Entry[]
): { best?: string[]; entry: Entry } {
  const knownSibling = entries.find((x) => x.relative === getPath(target));

  if (knownSibling) {
    return {
      entry: {
        ...knownSibling,
        files: knownSibling.files.concat({ name: getFilename(target), relative: target }),
      },
    };
  }

  const others = files.filter((x) => x !== target).map((x) => x.split(`/`));
  const curr = target.split("/");

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

export interface Item {
  displayName: string;
  highlight: number[];
  relative: string;
}

export type FileNode = Item

interface InternalDirectoryNode extends Item {
  directories: DirectoryNode[];
  files: Item[];
  parent?: InternalDirectoryNode;
}

export type DirectoryNode = Omit<InternalDirectoryNode, "parent">;

export interface Tree {
  directories: DirectoryNode[];
}

export function deriveTree(files: string[]): DirectoryNode {
  files.sort((x, y) => (x.split("/").length < y.split("/").length ? -1 : 1));

  const entries: Entry[] = [];
  const dirs: Array<string[]> = [];
  const map = new Map<string, Entry>();

  for (const file of files) {
    const { entry, best } = makeEntry(file, files, dirs, entries);
    entries.push(entry);
    if (best) {
      dirs.push(best);
    }
    map.set(entry.relative, entry);
  }

  const root: InternalDirectoryNode = {
    displayName: "/",
    parent: undefined,
    highlight: [],
    relative: "/",
    files: [],
    directories: [],
  };

  const dirmap = new Map<string, InternalDirectoryNode>();

  for (const entry of entries) {
    const parent =
      entry.relative === entry.name ? root : dirmap.get(entry.parent)!;
    dirmap.set(entry.relative, {
      displayName: entry.name,
      parent,
      highlight: [],
      relative: entry.originalRelative,
      files: entry.files
        .map((x) => {
          return {
            relative: x.relative,
            displayName: x.name,
            highlight: [],
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
