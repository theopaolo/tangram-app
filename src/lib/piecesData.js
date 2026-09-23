// DEPRECATED: artwork content now lives in `content/chromograms/` and is served
// reactively via `activeArtworks` from `chromogramStore.js`.
//
// This module is kept only as a static, non-reactive compatibility export for
// the legacy `/piece/[id]` route. It exposes the DEFAULT set's artworks keyed by
// piece id (1..7). New code must import `activeArtworks` instead so colours/text
// follow the active chromogramme set.

import { getArtworks, chromogramIds } from './chromogramStore.js';

export const PIECES_DATA = getArtworks(chromogramIds[0]);
