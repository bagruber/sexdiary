import { describe, expect, it } from "vitest";
import manifest from "../package.json" with { type: "json" };

/**
 * "Zero runtime dependencies" is the central claim this package makes to
 * an auditor (ADR-0002). notes/05 asks for it as a test that goes red
 * the moment core takes a dependency, rather than as an intention.
 * The lint rule covers the import side; this covers the manifest.
 */
// Read as a JSON module rather than through node:fs, so core's own
// typecheck keeps running without Node types — the absence of those is
// half of what "no I/O" means here.
const pkg = manifest as Record<string, unknown>;

describe("@sexdiary/core manifest", () => {
  it("declares no runtime dependencies", () => {
    expect(pkg.dependencies ?? {}).toEqual({});
    expect(pkg.peerDependencies ?? {}).toEqual({});
    expect(pkg.optionalDependencies ?? {}).toEqual({});
  });

  it("ships the built artefact, not the source", () => {
    expect(pkg.exports).toMatchObject({
      ".": { types: "./dist/index.d.ts", default: "./dist/index.js" },
    });
  });
});
