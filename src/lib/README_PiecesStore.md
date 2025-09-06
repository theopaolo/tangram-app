# Pieces Store

A shared store for managing found pieces state and localStorage persistence across the application.

## Usage

```svelte
<script>
  import { piecesStore } from '$lib/piecesStore.js';
  import { onMount } from 'svelte';

  // Initialize the store on component mount
  onMount(() => {
    piecesStore.initialize();
  });

  // Access reactive state
  $: totalFound = piecesStore.count;
  $: foundPieces = piecesStore.pieces;

  // Check if a piece is found
  function isPieceFound(pieceId) {
    return piecesStore.hasPiece(pieceId);
  }

  // Add a piece
  function addPiece(pieceId) {
    piecesStore.addPiece(pieceId);
  }

  // Remove a piece
  function removePiece(pieceId) {
    piecesStore.removePiece(pieceId);
  }
</script>

<!-- Display found pieces count -->
<p>Found {totalFound} pieces out of 7!</p>

<!-- Show pieces with conditional styling -->
{#each Object.entries(PIECES_DATA) as [id, piece]}
  <span
    style="background-color: {piecesStore.hasPiece(id) ? piece.color : '#DDD'}"
  >
    {piece.name}
  </span>
{/each}
```

## API

### Properties
- `pieces` - Array of found piece IDs
- `count` - Number of found pieces
- `hasInitialized` - Whether the store has been initialized

### Methods
- `initialize()` - Load pieces from localStorage
- `addPiece(pieceId)` - Add a piece if not already found
- `removePiece(pieceId)` - Remove a piece from found pieces
- `hasPiece(pieceId)` - Check if a piece has been found
- `getCount()` - Get total number of found pieces
- `getAll()` - Get array of all found piece IDs
- `clear()` - Clear all found pieces

## Features
- ✅ Automatic localStorage persistence
- ✅ Browser-safe (handles SSR)
- ✅ Reactive state updates
- ✅ Consistent localStorage key ('piece')
- ✅ Error handling for localStorage operations
- ✅ Singleton pattern for global state
