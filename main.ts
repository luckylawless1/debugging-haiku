import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// Seventeen Syllables of Debugging — one haiku, 5-7-5.
// Line 1 (5): Mid-night(2) cur-sor(2) blinks(1)
// Line 2 (7): on(1) the(1) break-point(2) I(1) just(1) set(1)
// Line 3 (5): bug(1) lived(1) in(1) the(1) test(1)
const HAIKU = "Midnight cursor blinks\non the breakpoint I just set\nbug lived in the test\n";

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });

// Validation gate: the entry must be exactly three lines, 5-7-5
// syllables, at most 200 characters, and not only whitespace.
function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length === 0) return 0;
  const groups = w.match(/[aeiouy]+/g);
  let n = groups ? groups.length : 0;
  // Silent terminal "e" is not a syllable; neither is "-ed" when the
  // stem ends in a consonant other than t/d ("lived" = 1, but
  // "wanted"/"needed" = 2).
  if (w.endsWith("ed") && n > 1) {
    const before = w[w.length - 3];
    if (before !== "t" && before !== "d") n -= 1;
  } else if (w.endsWith("e") && n > 1) {
    n -= 1;
  }
  return Math.max(n, 1);
}

function validateHaiku(text: string): void {
  if (text.length < 1 || text.length > 200) {
    throw new Error(`haiku must be 1-200 characters, got ${text.length}`);
  }
  if (text.trim().length === 0) throw new Error("haiku must not be blank");
  const lines = text.replace(/\n$/, "").split("\n");
  if (lines.length !== 3) {
    throw new Error(`haiku must be exactly 3 lines, got ${lines.length}`);
  }
  const want = [5, 7, 5];
  lines.forEach((line, i) => {
    const got = line
      .split(/\s+/)
      .filter(Boolean)
      .reduce((sum, w) => sum + countSyllables(w), 0);
    if (got !== want[i]) {
      throw new Error(`line ${i + 1} must be ${want[i]} syllables, got ${got}`);
    }
  });
}

validateHaiku(HAIKU);
writeFileSync(join(outDir, "entry.txt"), HAIKU, "utf8");
