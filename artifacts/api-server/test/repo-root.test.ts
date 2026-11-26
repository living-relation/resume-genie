import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { findEnvFile, findRepoRoot } from "@workspace/db/repo-root";

const originals = {
  root: process.env.RESUME_GENIE_ROOT,
};

afterEach(() => {
  if (originals.root === undefined) delete process.env.RESUME_GENIE_ROOT;
  else process.env.RESUME_GENIE_ROOT = originals.root;
});

function makeClone(parent: string, name: string, withEnv: boolean): string {
  const root = path.join(parent, name);
  fs.mkdirSync(path.join(root, "artifacts", "api-server"), { recursive: true });
  fs.writeFileSync(path.join(root, "pnpm-workspace.yaml"), "packages:\n  - artifacts/*\n");
  fs.writeFileSync(path.join(root, "package.json"), JSON.stringify({ name: "workspace", private: true }));
  if (withEnv) fs.writeFileSync(path.join(root, ".env"), "DATABASE_URL=postgres://example\n");
  return root;
}

describe("findRepoRoot", () => {
  it("finds the workspace from a nested working directory in two different clones", () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), "rg-root-"));
    const cloneA = makeClone(parent, "clone-a", true);
    const cloneB = makeClone(parent, "clone-b", true);
    delete process.env.RESUME_GENIE_ROOT;

    assert.equal(findRepoRoot(path.join(cloneA, "artifacts", "api-server")), cloneA);
    assert.equal(findRepoRoot(path.join(cloneB, "lib", "db")), cloneB);
    assert.equal(
      findEnvFile([path.join(cloneA, "artifacts", "api-server")]),
      path.join(cloneA, ".env"),
    );
    assert.notEqual(
      findEnvFile([path.join(cloneB, "artifacts", "api-server")]),
      path.join(cloneA, ".env"),
    );
  });

  it("RESUME_GENIE_ROOT wins over the directory we started from", () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), "rg-root-"));
    const cloneA = makeClone(parent, "clone-a", true);
    const cloneB = makeClone(parent, "clone-b", false);
    process.env.RESUME_GENIE_ROOT = cloneA;

    assert.equal(findRepoRoot(path.join(cloneB, "artifacts", "api-server")), cloneA);
    assert.equal(findEnvFile([path.join(cloneB, "artifacts", "api-server")]), path.join(cloneA, ".env"));
  });

  it("does not treat a nested package.json or a fixed ../../ hop as the repo root", () => {
    const parent = fs.mkdtempSync(path.join(os.tmpdir(), "rg-root-"));
    const cloneA = makeClone(parent, "clone-a", true);
    const nested = path.join(cloneA, "artifacts", "api-server");
    fs.writeFileSync(path.join(nested, "package.json"), JSON.stringify({ name: "@workspace/api-server" }));
    delete process.env.RESUME_GENIE_ROOT;

    assert.equal(findRepoRoot(nested), cloneA);
    // From the checkout root, ../../.env leaves the clone entirely.
    assert.notEqual(path.resolve(cloneA, "../../.env"), path.join(cloneA, ".env"));
    assert.equal(findEnvFile([cloneA]), path.join(cloneA, ".env"));
    assert.equal(findEnvFile([path.join(nested, "dist")]), path.join(cloneA, ".env"));
  });
});
