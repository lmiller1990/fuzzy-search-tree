import { describe, it, expect } from "vitest";
import { fuzzysort } from "./fuzzysort";

describe("fuzzysort", () => {
  it("finds a file", () => {
    const result = fuzzysort("foo", ["foo.js", "bar.js"]);

    expect(result).toMatchInlineSnapshot(`
      [
        {
          "indexes": [
            0,
            1,
            2,
          ],
          "target": "foo.js",
        },
      ]
    `);
  });

  it("returns empty array for empty search string", () => {
    const result = fuzzysort("", ["foo.js", "bar.js"]);

    expect(result).toMatchInlineSnapshot('[]');
  });
});
