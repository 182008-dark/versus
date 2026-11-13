#!/usr/bin/env node
/**
 * Contrôle des motifs interdits (§7.3 du plan), multiplateforme.
 *
 * Usage : `npm run check:forbidden` (code de sortie 1 si une violation est trouvée).
 * Exporte `findViolations(path, content)` pour les tests (scripts/check-forbidden.test.ts).
 */
import { readFileSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

/**
 * @typedef {{ path: string; line: number; rule: string; message: string; excerpt: string }} Violation
 */

/** Extensions analysées dans src/. */
const SCANNED_EXTENSIONS = [
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".mjs",
  ".cjs",
  ".mts",
  ".css",
  ".svg",
  ".md",
  ".json",
];

/** Bleus Apple de la maquette : interdits partout, liste blanche comprise. */
const FORBIDDEN_BLUES = /#(?:0071e3|0066cc|2997ff)(?![0-9a-f])/i;

/**
 * Littéral hexadécimal de couleur (#rgb, #rgba, #rrggbb, #rrggbbaa), hors entités HTML (&#123;)
 * et hors ancres : `chemin#ace`, `/#ace`, `href="#ace"`, `href: "#ace"`, `href={"#ace"}`.
 */
const HEX_COLOR =
  /(?<![\w&/])(?<!href\s*[=:]\s*\{?\s*["'`])#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\w-])/i;

/** Version exacte : x.y.z, avec éventuellement un suffixe de prépublication ou de build. */
const EXACT_VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

const DEPENDENCY_FIELDS = ["dependencies", "devDependencies", "optionalDependencies"];

/**
 * Normalise un chemin en chemin relatif à la racine, avec des barres obliques.
 * Les deux séparateurs sont convertis quelle que soit la plateforme : sous Linux (CI),
 * `path.sep` vaut déjà "/" et ne convertirait pas un chemin Windows.
 */
function normalizePath(path) {
  return path.replace(/\\/g, "/").replace(/^\.\//, "");
}

/**
 * Fichiers où un hexadécimal de couleur est permis (sauf les bleus interdits).
 * @param {string} path chemin relatif à la racine du dépôt
 */
export function isHexAllowed(path) {
  const p = normalizePath(path);
  return (
    p.startsWith("src/data/") ||
    p === "src/lib/brand-themes.ts" ||
    p === "src/app/globals.css" ||
    p.endsWith(".svg") ||
    p.endsWith("/opengraph-image.tsx") ||
    p === "opengraph-image.tsx"
  );
}

/** Règles appliquées ligne par ligne aux fichiers de src/. */
const LINE_RULES = [
  {
    rule: "getSession",
    test: (line) => /\bgetSession\s*\(/.test(line),
    message: "getSession() est interdit côté serveur : utiliser getClaims() (§3.3).",
  },
  {
    rule: "secret-public",
    test: (line) => /NEXT_PUBLIC_[A-Z0-9_]*SECRET/.test(line),
    message: "Une variable NEXT_PUBLIC_* ne doit jamais contenir de secret.",
  },
  {
    rule: "bleu-interdit",
    test: (line) => FORBIDDEN_BLUES.test(line),
    message: "Les bleus Apple de la maquette (#0071E3, #0066CC, #2997FF) sont interdits partout.",
  },
  {
    rule: "href-diese",
    // Attribut JSX (href="#", href={"#"}) ou objet de configuration (href: "#").
    test: (line) => /href\s*[=:]\s*(?:(["'`])#\1|\{\s*(["'`])#\2\s*\})/.test(line),
    message: 'href="#" est interdit : un lien doit mener à une page ou à une ancre existante.',
  },
  {
    rule: "hex-hors-liste-blanche",
    test: (line, path) =>
      !isHexAllowed(path) && !FORBIDDEN_BLUES.test(line) && HEX_COLOR.test(line),
    message:
      "Couleur hexadécimale hors liste blanche (src/data/**, src/lib/brand-themes.ts, src/app/globals.css, **/*.svg, **/opengraph-image.tsx) : utiliser un token.",
  },
];

/**
 * Vérifie que toutes les dépendances de package.json ont une version exacte.
 * @param {string} content
 * @returns {Violation[]}
 */
function checkPackageJson(content) {
  /** @type {Violation[]} */
  const violations = [];
  let pkg;
  try {
    pkg = JSON.parse(content);
  } catch {
    return [
      {
        path: "package.json",
        line: 1,
        rule: "package-json",
        message: "package.json illisible.",
        excerpt: "",
      },
    ];
  }
  const lines = content.split(/\r?\n/);
  for (const field of DEPENDENCY_FIELDS) {
    for (const [name, version] of Object.entries(pkg[field] ?? {})) {
      if (typeof version === "string" && EXACT_VERSION.test(version)) continue;
      const index = lines.findIndex((l) => l.includes(`"${name}"`));
      violations.push({
        path: "package.json",
        line: index + 1,
        rule: "version-non-exacte",
        message: `${field}.${name} = "${version}" : seules les versions exactes x.y.z sont permises.`,
        excerpt: index >= 0 ? (lines[index] ?? "").trim() : "",
      });
    }
  }
  return violations;
}

/**
 * Renvoie les violations d'un fichier, à partir de son chemin (relatif à la racine) et de son contenu.
 * Seuls `package.json` (racine) et les fichiers de `src/` sont concernés.
 * @param {string} path
 * @param {string} content
 * @returns {Violation[]}
 */
export function findViolations(path, content) {
  const p = normalizePath(path);
  if (p === "package.json") return checkPackageJson(content);
  if (!p.startsWith("src/")) return [];

  /** @type {Violation[]} */
  const violations = [];
  content.split(/\r?\n/).forEach((line, index) => {
    for (const { rule, test, message } of LINE_RULES) {
      if (test(line, p)) {
        violations.push({
          path: p,
          line: index + 1,
          rule,
          message,
          excerpt: line.trim().slice(0, 160),
        });
      }
    }
  });
  return violations;
}

/** Liste récursivement les fichiers analysés d'un dossier. */
function listFiles(dir) {
  /** @type {string[]} */
  const files = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...listFiles(full));
    else if (SCANNED_EXTENSIONS.some((ext) => entry.name.endsWith(ext))) files.push(full);
  }
  return files;
}

/** Analyse le dépôt et renvoie toutes les violations. */
export function scanRepository(root = process.cwd()) {
  const files = [join(root, "package.json"), ...listFiles(join(root, "src"))];
  return files.flatMap((file) => findViolations(relative(root, file), readFileSync(file, "utf8")));
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isMain) {
  const root = join(fileURLToPath(new URL(".", import.meta.url)), "..");
  const violations = scanRepository(root);
  if (violations.length === 0) {
    console.log("check:forbidden : aucun motif interdit.");
  } else {
    for (const v of violations) {
      console.error(`${v.path}:${v.line} [${v.rule}] ${v.message}\n    ${v.excerpt}`);
    }
    console.error(`\ncheck:forbidden : ${violations.length} violation(s).`);
    process.exitCode = 1;
  }
}
