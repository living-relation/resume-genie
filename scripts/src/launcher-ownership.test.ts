import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { cloneRootFromLauncher, processOwnsClone } from "./launcher-ownership";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("process ownership across clone locations", () => {
  const cloneA = "C:\\projects\\sparks\\resume-genie";
  const cloneB = "D:\\checkouts\\resume-genie";

  it("matches a process started by this clone's start.ps1", () => {
    const command = `cmd.exe /c set "RESUME_GENIE_ROOT=${cloneA}"&& pnpm dev:api > "${cloneA}\\logs\\api.log" 2>&1`;
    assert.equal(processOwnsClone(command, undefined, cloneA), true);
  });

  it("does not match the other clone or a package-name-only command", () => {
    const other = `cmd.exe /c set "RESUME_GENIE_ROOT=${cloneB}"&& pnpm dev:api > "${cloneB}\\logs\\api.log" 2>&1`;
    assert.equal(processOwnsClone(other, undefined, cloneA), false);
    assert.equal(
      processOwnsClone("node pnpm dev:api --filter @workspace/api-server", "C:\\Program Files\\nodejs\\node.exe", cloneA),
      false,
    );
  });

  it("does not treat a shorter path as owning a longer neighbor folder", () => {
    assert.equal(
      processOwnsClone(`node ${cloneA}-other\\dist\\index.mjs`, undefined, cloneA),
      false,
    );
  });

  it("matches either slash style and refuses a drive root", () => {
    assert.equal(
      processOwnsClone("node D:/checkouts/resume-genie/artifacts/api-server/dist/index.mjs", undefined, cloneB),
      true,
    );
    assert.equal(processOwnsClone("nginx", "C:\\nginx\\nginx.exe", "C:\\"), false);
    assert.equal(processOwnsClone("anything", undefined, "/"), false);
  });

  it("derives the repo folder from ps1 and vbs launcher paths", () => {
    assert.equal(
      cloneRootFromLauncher(`${cloneA}\\scripts\\start.ps1`),
      cloneA,
    );
    assert.equal(
      cloneRootFromLauncher(`${cloneB}\\Start Resume Genie.vbs`),
      cloneB,
    );
    assert.notEqual(
      cloneRootFromLauncher(`${cloneA}\\scripts\\stop.ps1`),
      cloneRootFromLauncher(`${cloneB}\\scripts\\stop.ps1`),
    );
  });
});

describe("launcher scripts stay tied to the clone that contains them", () => {
  const start = fs.readFileSync(path.join(repoRoot, "scripts/start.ps1"), "utf8");
  const stop = fs.readFileSync(path.join(repoRoot, "scripts/stop.ps1"), "utf8");
  const startVbs = fs.readFileSync(path.join(repoRoot, "Start Resume Genie.vbs"), "utf8");
  const stopVbs = fs.readFileSync(path.join(repoRoot, "Stop Resume Genie.vbs"), "utf8");

  it("resolves the repo from the script file, not a hardcoded drive path", () => {
    assert.match(start, /\$PSScriptRoot/);
    assert.match(stop, /\$PSScriptRoot/);
    assert.match(startVbs, /WScript\.ScriptFullName/);
    assert.match(stopVbs, /WScript\.ScriptFullName/);
    assert.match(startVbs, /scripts\\start\.ps1/);
    assert.match(stopVbs, /scripts\\stop\.ps1/);
    for (const text of [start, stop, startVbs, stopVbs]) {
      assert.doesNotMatch(text, /[A-Z]:\\projects/i);
    }
  });

  it("never stops a listener just because the port or package name matches", () => {
    assert.doesNotMatch(start, /taskkill/i);
    assert.match(start, /RESUME_GENIE_ROOT/);
    assert.match(start, /\.pid/);
    assert.match(stop, /Test-OwnsClone/);
    assert.match(stop, /Test-PathInText/);
    assert.match(stop, /left alone/);
    assert.doesNotMatch(stop, /@workspace\/api-server/);
    assert.doesNotMatch(stop, /@workspace\/resume-ai/);
    assert.match(stop, /-Force does not stop unrelated programs/);
  });
});
