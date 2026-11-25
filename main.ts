// main.ts — make.fun entry: "Alien Field Notes: The Two Day Earth Review".
//
// A one-line field report from an alien ocean researcher visiting Earth:
// baffled by the locals, sunburned, and still giving the planet five stars.
//
// Behaviour:
//   * stdout: the review line followed by exactly one trailing newline.
//   * $MAKEFUN_OUTPUT_DIR/entry.txt (default /output): the same line with
//     no trailing newline.
//   * Node 22 standard library only; no network access; the same output
//     on every run.
//   * A failed file write is reported on stderr but never stops the run.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

// The review, stored as its three sentences so each clause stands alone.
// They are joined with single spaces at runtime to form the entry line.
const SENTENCES: readonly string[] = [
  "Came to study the oceans.",
  "The locals swim in salt water on purpose and call it relaxing.",
  "Five stars — gloriously confusing, and I am sunburned.",
];

const MIN_CHARS = 1;
const MAX_CHARS = 200;
const FALLBACK_DIR = "/output";

/** Assemble the entry line from its sentences. */
function buildLine(parts: readonly string[]): string {
  return parts.join(" ");
}

/**
 * Check the assembled line against the competition gate before anything
 * is written or printed: 1-200 characters (counted as code points, so
 * the em dash counts once), a single line, and no surrounding whitespace.
 * Throws on any violation; the line is a constant, so a throw here can
 * only ever mean the source was edited into an invalid state.
 */
function validateLine(line: string): void {
  const chars = [...line].length;
  if (chars < MIN_CHARS || chars > MAX_CHARS) {
    throw new RangeError(
      `entry must be ${MIN_CHARS}-${MAX_CHARS} characters, got ${chars}`,
    );
  }
  if (/[\r\n]/.test(line)) {
    throw new Error("entry must be a single line");
  }
  if (line !== line.trim()) {
    throw new Error("entry must not have leading or trailing whitespace");
  }
}

/** Resolve the output directory: $MAKEFUN_OUTPUT_DIR when set, else /output. */
function resolveOutputDir(): string {
  const raw = process.env.MAKEFUN_OUTPUT_DIR;
  return raw !== undefined && raw.trim() !== "" ? raw : FALLBACK_DIR;
}

/**
 * Write the line to `<dir>/entry.txt` as UTF-8 bytes, with no trailing
 * newline. Creates the directory when it is missing. Returns true when
 * the file was written; on any filesystem failure it warns on stderr and
 * returns false so the caller can still print the line to stdout.
 * A file that was written is re-read and compared byte-for-byte against
 * what was encoded; a mismatch throws, because a corrupt entry file
 * must fail the run rather than pass silently.
 */
function persistLine(line: string, dir: string): boolean {
  const target = resolve(dir, "entry.txt");
  const bytes = new TextEncoder().encode(line);
  try {
    mkdirSync(resolve(dir), { recursive: true });
    writeFileSync(target, bytes);
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    process.stderr.write(`warning: could not write entry.txt: ${detail}\n`);
    return false;
  }
  verifyWritten(target, bytes);
  return true;
}

/** Re-read `target` and fail unless its bytes equal `expected` exactly. */
function verifyWritten(target: string, expected: Uint8Array): void {
  const actual = readFileSync(target);
  if (!actual.equals(Buffer.from(expected))) {
    throw new Error(
      `entry.txt verification failed: ${target} does not match the entry byte-for-byte`,
    );
  }
}

function main(): void {
  const line = buildLine(SENTENCES);
  validateLine(line);
  try {
    persistLine(line, resolveOutputDir());
  } catch (error) {
    // Read-back verification failed: the entry file on disk is not what
    // was encoded. Report it and fail the run (exit code 1), but still
    // print the line to stdout so the stdout contract holds.
    const detail = error instanceof Error ? error.message : String(error);
    process.stderr.write(`error: ${detail}\n`);
    process.exitCode = 1;
  }
  process.stdout.write(`${line}\n`);
}

main();
