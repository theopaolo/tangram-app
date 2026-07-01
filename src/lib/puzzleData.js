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
  1: { name: 'Le Grand Triangle',        points: P([[0, 0], [5, 5], [10, 0]]) },
  2: { name: 'Le Second Grand Triangle', points: P([[0, 0], [5, 5], [0, 10]]) },
  3: { name: 'Le Petit Triangle',        points: P([[5, 5], [7.5, 7.5], [7.5, 2.5]]) },
  4: { name: 'Le Carré',                 points: P([[5, 5], [7.5, 7.5], [5, 10], [2.5, 7.5]]) },
  5: { name: 'Le Parallélogramme',       points: P([[7.5, 2.5], [7.5, 7.5], [10, 5], [10, 0]]) },
  6: { name: 'Le 2e Petit Triangle',     points: P([[0, 10], [5, 10], [2.5, 7.5]]) },
  7: { name: 'Le Moyen Triangle',        points: P([[5, 10], [10, 5], [10, 10]]) }
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
