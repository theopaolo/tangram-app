/**
 * Active chromogramme set selection.
 *
 * Each chromogramme set is a full collection of 7 artworks (colour, story,
 * artist, image, quiz) authored via /admin and stored in the database. The
 * root layout load fetches every set and calls `initChromograms` (via
 * `initContent` in puzzleData.js) before any consumer renders. The QR scanned
 * by a visitor selects which set is "active"; every colour/text consumer reads
 * the active set.
 */

import { browser } from '$app/environment';
import { writable, derived, get } from 'svelte/store';

/** Normalise a set id so URLs/filenames resolve regardless of case. */
export const normalizeId = (id) => String(id ?? '').toLowerCase();

/**
 * Map of normalised set id -> set definition ({ id, name, pieces: [...] }).
 * Keyed by lowercased id because the URL slug is lowercased while the `id`
 * field may be typed with capitals — both must resolve to the same set.
 * Populated (mutated in place) by `initChromograms` so existing imports keep
 * pointing at the same object.
 */
export const chromogramSets = {};

/** Sorted list of available set ids (mutated in place by `initChromograms`). */
export const chromogramIds = [];

/** A set is complete when it has an artwork for every tangram piece (1..7). */
export function isCompleteSet(set) {
  if (!set?.pieces?.length) return false;
  const ids = new Set(set.pieces.map((p) => Number(p.pieceId)));
  return [1, 2, 3, 4, 5, 6, 7].every((n) => ids.has(n));
}

// Default to the first *complete* set so a half-authored draft never becomes
// the landing set. Set by `initChromograms`.
let defaultId = null;
const STORAGE_KEY = 'active_chromogram';

/** The currently active set id (persisted to localStorage). Null until init. */
export const activeChromogramId = writable(null);

if (browser) {
  activeChromogramId.subscribe((id) => {
    try {
      if (id) localStorage.setItem(STORAGE_KEY, id);
    } catch (e) {
      console.error('Could not save active chromogram:', e);
    }
  });
}

/**
 * Populate the sets from the layout-load data and pick the active id.
 * Called once per render on the server and once at hydration on the client.
 * @param {Array<object>} sets chromogramme set definitions from the DB
 */
export function initChromograms(sets) {
  for (const key of Object.keys(chromogramSets)) delete chromogramSets[key];
  for (const set of sets ?? []) {
    if (set?.id) chromogramSets[normalizeId(set.id)] = set;
  }
  chromogramIds.length = 0;
  chromogramIds.push(...Object.keys(chromogramSets).sort());
  defaultId = chromogramIds.find((id) => isCompleteSet(chromogramSets[id])) ?? chromogramIds[0] ?? null;

  if (browser) {
    let initial = defaultId;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && chromogramSets[stored]) initial = stored;
    } catch (e) {
      console.error('Could not read active chromogram:', e);
    }
    const current = get(activeChromogramId);
    if (!current || !chromogramSets[normalizeId(current)]) activeChromogramId.set(initial);
  } else {
    // SSR: always reset — the store module is shared across requests, so a
    // previous request's selection must not leak into this one. Pages that
    // target a specific set (e.g. /[chromogramId]) re-select after this.
    activeChromogramId.set(defaultId);
  }
}

/**
 * Select the active chromogramme set. Returns false if the id is unknown.
 * @param {string} id
 */
export function setActiveChromogram(id) {
  const key = normalizeId(id);
  if (chromogramSets[key]) {
    activeChromogramId.set(key);
    return true;
  }
  return false;
}

/** @param {string} id @returns {boolean} whether the set exists */
export function hasChromogram(id) {
  return Boolean(chromogramSets[normalizeId(id)]);
}

/**
 * Build an artwork-id-keyed map ({ 1..7: {...} }) for a given set,
 * falling back to the default set when the id is unknown.
 * @param {string} id
 */
export function getArtworks(id) {
  const set = chromogramSets[normalizeId(id)] ?? chromogramSets[defaultId];
  const map = {};
  if (set) for (const piece of set.pieces) map[piece.pieceId] = piece;
  return map;
}

/** Get a whole set definition by id (falls back to the default set). */
export function getSet(id) {
  return chromogramSets[normalizeId(id)] ?? chromogramSets[defaultId];
}

/** Read the active set's artworks once (non-reactive). */
export function getActiveArtworks() {
  return getArtworks(get(activeChromogramId));
}

/** The active set definition ({ id, name, title, intro, pieces }). */
export const activeSet = derived(activeChromogramId, ($id) => getSet($id));

/**
 * Artwork content for the active set, keyed by piece id (1..7).
 * Drop-in replacement for the old static `PIECES_DATA` from piecesData.js.
 */
export const activeArtworks = derived(activeChromogramId, ($id) => getArtworks($id));
