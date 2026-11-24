// Alien Field Notes: The Two Day Earth Review — make.fun entry.
//
// Writes one original line — a review of planet Earth left by an alien
// tourist — to entry.txt, and prints the same line to stdout.
//
// The entry file holds exactly the line with no trailing newline; stdout
// carries the line plus one trailing newline and nothing else. The run is
// deterministic: the same line on every run, with no network access.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ENTRY =
  "Beautiful planet, lovely locals, but they made me pay rent to stand on it. Four stars — would orbit again.";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

try {
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "entry.txt"), ENTRY, "utf8");
} catch {
  // A failed write must never break the run: stdout still carries the line.
}

process.stdout.write(ENTRY + "\n");
