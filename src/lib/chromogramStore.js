/**
 * Active chromogramme set selection.
 *
 * Each chromogramme set is a full collection of 7 artworks (colour, story,
 * artist, image, quiz) authored via the CMS and stored as JSON in
 * `content/chromograms/`. The QR scanned by a visitor selects which set is
 * "active"; every colour/text consumer reads the active set.
 */

import { browser } from '$app/environment';
import { writable, derived, get } from 'svelte/store';

// Eager-load every chromogramme set at build time.
const modules = import.meta.glob('/content/chromograms/*.json', { eager: true });

/** Normalise a set id so URLs/filenames resolve regardless of case. */
export const normalizeId = (id) => String(id ?? '').toLowerCase();

/**
 * Map of normalised set id -> set definition ({ id, name, pieces: [...] }).
 * Keyed by lowercased id because the CMS/filename slug is lowercased while the
 * `id` field may be typed with capitals — both must resolve to the same set.
 */
export const chromogramSets = {};
for (const path in modules) {
  const set = modules[path].default ?? modules[path];
  if (set?.id) chromogramSets[normalizeId(set.id)] = set;
}

/** Sorted list of available set ids. */
export const chromogramIds = Object.keys(chromogramSets).sort();

/** A set is complete when it has an artwork for every tangram piece (1..7). */
export function isCompleteSet(set) {
  if (!set?.pieces?.length) return false;
  const ids = new Set(set.pieces.map((p) => Number(p.pieceId)));
  return [1, 2, 3, 4, 5, 6, 7].every((n) => ids.has(n));
}

// Default to the first *complete* set so a half-authored CMS draft never
// becomes the landing set. Fall back to the first set if none are complete.
const DEFAULT_ID = chromogramIds.find((id) => isCompleteSet(chromogramSets[id])) ?? chromogramIds[0];
const STORAGE_KEY = 'active_chromogram';

function loadInitialId() {
  if (browser) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && chromogramSets[stored]) return stored;
    } catch (e) {
      console.error('Could not read active chromogram:', e);
    }
  }
  return DEFAULT_ID;
}

/** The currently active set id (persisted to localStorage). */
export const activeChromogramId = writable(loadInitialId());

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
  const set = chromogramSets[normalizeId(id)] ?? chromogramSets[DEFAULT_ID];
  const map = {};
  if (set) for (const piece of set.pieces) map[piece.pieceId] = piece;
  return map;
}

/** Get a whole set definition by id (falls back to the default set). */
export function getSet(id) {
  return chromogramSets[normalizeId(id)] ?? chromogramSets[DEFAULT_ID];
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
