#!/usr/bin/env node
/*
  Normalizes reversed Tailwind order classes across TS/TSX files.
  Converts patterns like:
    - "order-2 lg:order-1" -> "order-1"
    - "order-1 lg:order-2" -> "order-2"
  Also handles when the breakpoint token comes first, e.g. "lg:order-1 order-2".

  Usage:
    node scripts/fix-hero-order.js         # write changes
    node scripts/fix-hero-order.js --dry   # dry run, no writes
*/

const fs = require('fs');
const path = require('path');

const DRY_RUN = process.argv.includes('--dry');
const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'src');

/** Recursively collect .ts and .tsx files */
function* walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // skip build output or node_modules if under src by accident
      if (entry.name === '.next' || entry.name === 'node_modules') continue;
      yield* walk(full);
    } else if (entry.isFile()) {
      if (/\.(tsx?|jsx?)$/i.test(entry.name)) {
        yield full;
      }
    }
  }
}

const patterns = [
  // order-2 <bp>:order-1  -> order-1
  { re: /\border-2\s+(?:sm:|md:|lg:|xl:|2xl:)?order-1\b/g, replacement: 'order-1' },
  // <bp>:order-1 order-2  -> order-2
  { re: /\b(?:sm:|md:|lg:|xl:|2xl:)?order-1\s+order-2\b/g, replacement: 'order-2' },
  // order-1 <bp>:order-2  -> order-2
  { re: /\border-1\s+(?:sm:|md:|lg:|xl:|2xl:)?order-2\b/g, replacement: 'order-2' },
  // <bp>:order-2 order-1  -> order-1
  { re: /\b(?:sm:|md:|lg:|xl:|2xl:)?order-2\s+order-1\b/g, replacement: 'order-1' },
];

let filesScanned = 0;
let filesChanged = 0;
let totalReplacements = 0;

for (const file of walk(SRC_DIR)) {
  filesScanned++;
  const original = fs.readFileSync(file, 'utf8');
  let updated = original;
  let replacementsInFile = 0;

  for (const { re, replacement } of patterns) {
    updated = updated.replace(re, (match) => {
      replacementsInFile++;
      totalReplacements++;
      return replacement;
    });
  }

  if (replacementsInFile > 0) {
    filesChanged++;
    if (!DRY_RUN) {
      fs.writeFileSync(file, updated, 'utf8');
    }
    console.log(`${DRY_RUN ? '[dry] ' : ''}fixed ${replacementsInFile.toString().padStart(2, ' ')} in ${path.relative(ROOT, file)}`);
  }
}

console.log(`\nScanned ${filesScanned} files. ${filesChanged} files ${DRY_RUN ? 'would change' : 'changed'}. Total replacements: ${totalReplacements}.`);
