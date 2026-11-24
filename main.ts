// Alien Field Notes: The Two Day Earth Review — make.fun entry.
//
// Prints one original line — a review of planet Earth left by an alien
// tourist — to stdout, and writes that same line to entry.txt.
//
// Contract: stdout carries exactly the line plus one trailing newline and
// nothing else; entry.txt holds exactly the line with no trailing newline.
// The run is deterministic (the same line on every run), uses only the
// Node 22 standard library, and makes no network access. A failed file
// write must never break the run.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Beautiful planet, lovely locals, but they made me pay rent to stand on it. Four stars — would orbit again.";

/**
 * Persist the entry line to `<dir>/entry.txt`.
 *
 * Creates the directory when it is missing and writes exactly the line,
 * with no trailing newline. Any failure (missing permissions, read-only
 * filesystem, unset or unusable directory) is swallowed silently so the
 * caller can still print the line to stdout.
 */
function saveEntryText(dir: string, line: string): void {
  try {
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "entry.txt"), line, "utf8");
  } catch {
    // A failed write must never break the run.
  }
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

saveEntryText(outDir, ENTRY);

process.stdout.write(ENTRY + "\n");
