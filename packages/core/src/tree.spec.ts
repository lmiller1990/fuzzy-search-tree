import { describe, it, expect } from "vitest";
import { deriveTree } from "./tree.js";


const files = [
  "foo/bar/merp.js",
  "foo/bar/baz.js",
  "foo/bar/baz/merp/lux/qux.js",
  "foo/foo.js",
];

describe("deriveTree", () => {
  it("works", () => {
    const actual = deriveTree(files);

    expect(actual).toMatchInlineSnapshot(`
      {
        "depth": 0,
        "directories": [
          {
            "depth": 0,
            "directories": [
              {
                "depth": 1,
                "directories": [
                  {
                    "depth": 2,
                    "directories": [],
                    "displayName": "baz/merp/lux",
                    "expanded": true,
                    "files": [
                      {
                        "depth": 2,
                        "displayName": "qux.js",
                        "highlight": [],
                        "relative": "foo/bar/baz/merp/lux/qux.js",
                      },
                    ],
                    "highlight": [],
                    "relative": "foo/bar/baz/merp/lux/qux.js",
                  },
                ],
                "displayName": "bar",
                "expanded": true,
                "files": [
                  {
                    "depth": 1,
                    "displayName": "merp.js",
                    "highlight": [],
                    "relative": "foo/bar/merp.js",
                  },
                  {
                    "depth": 1,
                    "displayName": "baz.js",
                    "highlight": [],
                    "relative": "foo/bar/baz.js",
                  },
                ],
                "highlight": [],
                "relative": "foo/bar/merp.js",
              },
            ],
            "displayName": "foo",
            "expanded": true,
            "files": [
              {
                "depth": 0,
                "displayName": "foo.js",
                "highlight": [],
                "relative": "foo/foo.js",
              },
            ],
            "highlight": [],
            "relative": "foo/foo.js",
          },
        ],
        "displayName": "/",
        "expanded": true,
        "files": [],
        "highlight": [],
        "parent": undefined,
        "relative": "/",
      }
    `)
  });
});
