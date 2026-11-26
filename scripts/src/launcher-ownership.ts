/**
 * Decide whether a Windows process belongs to THIS Resume Genie clone.
 * `scripts/stop.ps1` uses the same rule: the clone folder must show up in the
 * command line or executable path as a whole path, not merely as a prefix
 * (`C:\clones\a` must not match `C:\clones\ab`) and not merely because the
 * command mentions `@workspace/api-server` (that string is shared by every clone).
 */
const BOUNDARY = new Set(["\\", "/", '"', "'", " ", "\t", "\r", "\n", "&"]);

export function processOwnsClone(
  commandLine: string | undefined,
  executablePath: string | undefined,
  cloneRoot: string,
): boolean {
  const trimmed = cloneRoot.trim().replace(/[\\/]+$/, "");
  // Refuse drive roots ("C:", "/", "D:\") so a short needle cannot match everything.
  if (trimmed.length <= 3) return false;

  const needles = new Set<string>([
    trimmed.toLowerCase(),
    trimmed.replace(/\\/g, "/").toLowerCase(),
    trimmed.replace(/\//g, "\\").toLowerCase(),
  ]);
  const hay = `${commandLine ?? ""}\n${executablePath ?? ""}`.toLowerCase();

  for (const needle of needles) {
    if (needle.length > 3 && containsPath(hay, needle)) return true;
  }
  return false;
}

function containsPath(hay: string, needle: string): boolean {
  let from = 0;
  while (from <= hay.length) {
    const at = hay.indexOf(needle, from);
    if (at < 0) return false;
    const next = hay[at + needle.length];
    if (next === undefined || BOUNDARY.has(next)) return true;
    from = at + 1;
  }
  return false;
}

/** Repo root implied by a launcher path. `.ps1` lives in `scripts/`; `.vbs` lives at the root. */
export function cloneRootFromLauncher(launcherPath: string): string {
  const dir = pathDir(launcherPath);
  if (pathBase(dir).toLowerCase() === "scripts") return pathDir(dir);
  return dir;
}

function pathDir(value: string): string {
  const normalized = value.replace(/[\\/]+$/, "");
  const cut = Math.max(normalized.lastIndexOf("\\"), normalized.lastIndexOf("/"));
  return cut >= 0 ? normalized.slice(0, cut) : normalized;
}

function pathBase(value: string): string {
  const cut = Math.max(value.lastIndexOf("\\"), value.lastIndexOf("/"));
  return cut >= 0 ? value.slice(cut + 1) : value;
}
