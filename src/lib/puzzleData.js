// Tangram shape geometry (static) + puzzle definitions (CMS-authored) +
// a derived store that re-skins the shapes with the active chromogramme's colours.

import { derived } from 'svelte/store';
import { activeArtworks, activeChromogramId, chromogramSets } from './chromogramStore.js';

// Unit-based coordinate system for perfect alignment
const UNIT = 27;       // 270px / 10 units
const OFFSET = 15;     // margin
const U = (n) => OFFSET + UNIT * n;
const P = (pts) => pts.map(([x, y]) => `${U(x)},${U(y)}`).join(' ');

// Color for pieces that are not found or not completed
export const PIECE_GREY_COLOR = '#e7e7e7';

// Tangram has 7 fixed shapes. Geometry never changes, so it stays in code.
// `name` + `points` only — colour/story come from the active chromogramme set.
export const SHAPE_GEOMETRY = {
  1: { name: 'Le Grand Triangle', points: P([[0, 0], [5, 5], [10, 0]]) },
  2: { name: 'Le Second Grand Triangle', points: P([[0, 0], [5, 5], [0, 10]]) },
  3: { name: 'Le Petit Triangle', points: P([[5, 5], [7.5, 7.5], [7.5, 2.5]]) },
  4: { name: 'Le Carré', points: P([[5, 5], [7.5, 7.5], [5, 10], [2.5, 7.5]]) },
  5: { name: 'Le Parallélogramme', points: P([[7.5, 2.5], [7.5, 7.5], [10, 5], [10, 0]]) },
  6: { name: 'Le 2e Petit Triangle', points: P([[0, 10], [5, 10], [2.5, 7.5]]) },
  7: { name: 'Le Moyen Triangle', points: P([[5, 10], [10, 5], [10, 10]]) }
};

// Map each tangram shape (1..7) to the artwork piece id that skins it.
const SHAPE_TO_ARTWORK = { 1: 3, 2: 5, 3: 4, 4: 6, 5: 1, 6: 2, 7: 7 };

// Calculate viewBox for each piece
function calculateViewBox(pointsStr) {
  const points = pointsStr.split(' ').map((p) => p.split(',').map(Number));
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    viewBox: `${minX} ${minY} ${maxX - minX} ${maxY - minY}`,
    width: maxX - minX,
    height: maxY - minY
  };
}

// Static geometry + viewBox/width/height (no colour). Used by the editor and
// geometry-only consumers (puzzleDebug).
export const SHAPE_GEOMETRY_WITH_VIEWBOX = Object.fromEntries(
  Object.entries(SHAPE_GEOMETRY).map(([id, shape]) => [
    id,
    { ...shape, ...calculateViewBox(shape.points) }
  ])
);

/**
 * Merge the active set's artwork colour/story onto the static shape geometry.
 * @param {Record<string, any>} artworks artwork-id-keyed map for the active set
 */
function mergeShapes(artworks) {
  return Object.fromEntries(
    Object.entries(SHAPE_GEOMETRY_WITH_VIEWBOX).map(([id, shape]) => {
      const art = artworks[SHAPE_TO_ARTWORK[id]] ?? {};
      return [
        id,
        {
          ...shape,
          color: art.color,
          story: art.story,
          artwork: art.titre_artwork
        }
      ];
    })
  );
}

/**
 * Tangram shapes (1..7) with geometry + the active set's colour/story/artwork.
 * Drop-in replacement for the old static `PIECES_DATA_WITH_VIEWBOX`.
 */
export const shapesWithViewBox = derived(activeArtworks, ($artworks) => mergeShapes($artworks));

// Puzzles are CMS-authored JSON files (global; reused across all sets).
const puzzleModules = import.meta.glob('/content/puzzles/*.json', { eager: true });

// A puzzle may carry its geometry either as top-level `container` + `pieces`
// (legacy/generated) or as a `layout` field holding the JSON exported from the
// /editor (`{ container, pieces }`, pasted as a string in the CMS). Normalise
// both to top-level `container` + `pieces` so every consumer stays the same.
function normalizePuzzle(p) {
  if (p.layout == null || p.layout === '') return p;
  try {
    const parsed = typeof p.layout === 'string' ? JSON.parse(p.layout) : p.layout;
    const { layout, ...rest } = p;
    return { ...rest, container: parsed.container, pieces: parsed.pieces ?? [] };
  } catch (e) {
    console.error(`Invalid puzzle layout JSON for puzzle ${p.id}:`, e);
    const { layout, ...rest } = p;
    return { ...rest, container: p.container ?? { width: 400, height: 600 }, pieces: [] };
  }
}

export const puzzleConfigs = Object.values(puzzleModules)
  .map((m) => m.default ?? m)
  .map(normalizePuzzle)
  .sort((a, b) => a.id - b.id);

export function getPuzzleById(id) {
  return puzzleConfigs.find((puzzle) => puzzle.id === parseInt(id));
}

export function getAllPuzzles() {
  return puzzleConfigs;
}

/**
 * Filter + order the global puzzles by a chromogramme set's `puzzles` selection.
 * When a set has no selection (field absent or empty), all puzzles are shown.
 */
export function getPuzzlesForSet(setId) {
  const ids = chromogramSets[setId]?.puzzles;
  if (!Array.isArray(ids) || ids.length === 0) return puzzleConfigs;
  const order = new Map(ids.map((pid, i) => [Number(pid), i]));
  return puzzleConfigs
    .filter((p) => order.has(Number(p.id)))
    .sort((a, b) => order.get(Number(a.id)) - order.get(Number(b.id)));
}

/** Puzzles available for the active chromogramme set (respects CMS order). */
export const activePuzzles = derived(activeChromogramId, ($id) => getPuzzlesForSet($id));

// --- Camaïeu par tangram (expérimental) ------------------------------------
// Chaque puzzle est décliné dans les tons d'UNE seule des 7 couleurs du set :
// la couleur de base est celle de la forme dont l'id correspond au n° du
// puzzle (modulo 7), et chaque pièce reçoit une clarté différente de cette
// teinte (conversions via OKLCH pour des paliers perceptuellement réguliers).

function srgbToOklch(hex) {
  const clean = String(hex ?? '').replace('#', '').slice(0, 6);
  if (clean.length < 6) return null;
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = [0, 2, 4].map((i) => lin(parseInt(clean.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return { L, C: Math.hypot(a, bb), h: Math.atan2(bb, a) };
}

function oklchToSrgbHex(L, C, h) {
  const unlin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  // réduit la chroma jusqu'à rentrer dans le gamut sRGB
  for (let c = C; c >= 0; c -= 0.002) {
    const a = c * Math.cos(h);
    const bb = c * Math.sin(h);
    const l = (L + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * bb) ** 3;
    const r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    const g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    const b = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
    if ([r, g, b].every((v) => v >= -1e-4 && v <= 1 + 1e-4)) {
      const to255 = (v) => Math.round(Math.min(1, Math.max(0, unlin(v))) * 255);
      return `#${[r, g, b].map((v) => to255(v).toString(16).padStart(2, '0')).join('')}`;
    }
  }
  return '#808080';
}

// Camaïeu RELATIF à la couleur de base : la pièce 1 porte la couleur exacte
// de l'œuvre, puis chaque pièce éclaircit par paliers réguliers entre la
// clarté de la base et CAMAIEU_L_MAX. Aucun saut : la gamme part toujours
// de la vraie couleur, quelle que soit sa clarté d'origine.
const CAMAIEU_L_MAX = 0.93;

/**
 * Nuance camaïeu d'une pièce pour un puzzle donné.
 * @param {string|number} puzzleId n° du puzzle (choisit la couleur de base)
 * @param {string|number} pieceId forme 1..7 (choisit la clarté)
 * @param {Record<string, {color?: string}>} shapes map des formes actives (shapesWithViewBox)
 */
// Couleur de base du camaïeu de chaque puzzle, par n° d'ŒUVRE (pieceId du set).
// Pour chromo-2 : 1 -> bleu (œuvre 6), 2 -> gris (œuvre 2), 3 -> rouge (œuvre 7),
// puis les couleurs restantes pour éviter les doublons ; à ajuster librement.
export const CAMAIEU_BASE_ARTWORK = { 1: 6, 2: 2, 3: 7, 4: 3, 5: 5, 6: 1, 7: 4 };
const ARTWORK_TO_SHAPE = Object.fromEntries(
  Object.entries(SHAPE_TO_ARTWORK).map(([shape, artwork]) => [artwork, Number(shape)])
);

export function getCamaieuColor(puzzleId, pieceId, shapes) {
  const artworkId = CAMAIEU_BASE_ARTWORK[Number(puzzleId)];
  const baseId =
    artworkId != null
      ? ARTWORK_TO_SHAPE[artworkId]
      : ((Number(puzzleId) - 1) % 7 + 7) % 7 + 1;
  const baseHex = shapes?.[baseId]?.color;
  const base = srgbToOklch(baseHex);
  if (!base) return PIECE_GREY_COLOR;
  const step = Math.min(Math.max(Number(pieceId) - 1, 0), 6);
  if (step === 0) return baseHex; // pièce 1 : couleur de base exacte
  // Course minimale pour que le camaïeu reste lisible : si la base est déjà
  // trop claire pour éclaircir (jaune, sable…), on décline vers le foncé.
  const MIN_SPAN = 0.15; // course d'éclaircissement
  const DARK_SPAN = 0.09; // course plus courte quand la base est déjà claire
  const darkening = CAMAIEU_L_MAX - base.L < MIN_SPAN;
  const target = darkening ? base.L - DARK_SPAN : CAMAIEU_L_MAX;
  const L = base.L + (step / 6) * (target - base.L);
  let C = base.C;
  let h = base.h;
  if (darkening) {
    // Un jaune/sable qu'on fonce à teinte constante vire au kaki : on
    // réchauffe légèrement la teinte et on sature un peu en descendant.
    h -= (step / 6) * (10 * Math.PI / 180);
    C *= 1 + 0.18 * (step / 6);
  }
  return oklchToSrgbHex(L, C, h);
}
