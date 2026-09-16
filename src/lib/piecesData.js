// DEPRECATED: artwork content lives in the DB and is served reactively via
// `activeArtworks` from `chromogramStore.js`.
//
// This module is kept only as a static, non-reactive compatibility helper for
// the legacy `/piece/[id]` route. It exposes the DEFAULT set's artworks keyed
// by piece id (1..7). New code must import `activeArtworks` instead so
// colours/text follow the active chromogramme set.

import { getArtworks, chromogramIds } from './chromogramStore.js';

// A function (not a module-scope constant) because the stores are only
// populated once the root layout has run initContent().
export function getDefaultArtworks() {
	return getArtworks(chromogramIds[0]);
}
