# Puzzle Debug Utilities

This module provides debugging functionality for the tangram puzzle solution checking system.

## Quick Start

### Enable/Disable Debug Mode

In `src/routes/puzzles/+page.svelte`, change the `DEBUG_MODE` constant:

```javascript
// Set to true for development, false for production
const DEBUG_MODE = true;  // Shows debug panel and console logs
const DEBUG_MODE = false; // Clean production mode
```

## Features

### 1. Automatic Triangle Interchangeability
- **Calculates triangle areas** using the shoelace formula
- **Groups similar triangles** automatically (within 5% area tolerance)
- **Allows flexible placement** - any triangle can go in any target for triangles of the same size

### 2. Smart Rotation Logic
- **Square pieces** accept any 90° rotation increment
- **Triangle pieces** can use any rotation valid for their similarity group
- **Maintains puzzle challenge** while being user-friendly

### 3. Visual Debug Panel
When `DEBUG_MODE = true`:
- Shows current tolerance and scale
- Displays pieces still in container
- Real-time match results for each target
- Green/red color coding for success/failure

### 4. Console Logging
Detailed console output showing:
- Triangle area calculations and groupings
- Distance and rotation checking for each piece
- Match/fail reasons for debugging

## Functions

### `calculateTriangleArea(pointsStr)`
Calculates triangle area using the shoelace formula.

### `getTriangleSimilarityGroups(PIECES_DATA, enableLogging)`
Groups triangles with similar areas for interchangeability.

### `checkRotationMatch(pieceId, pieceRotation, targetId, targetRotation, planePuzzle, PIECES_DATA, enableLogging)`
Smart rotation checking with special logic for squares and interchangeable triangles.

### `areInterchangeable(pieceId1, pieceId2, PIECES_DATA)`
Checks if two pieces can be swapped in the puzzle.

### `debugLog(message, data?)`
Console logging that can be easily disabled.

## Usage Example

```javascript
import {
  getTriangleSimilarityGroups,
  checkRotationMatch,
  areInterchangeable
} from '../../lib/puzzleDebug.js';

// Check if pieces can be swapped
const canSwap = areInterchangeable(1, 2, PIECES_DATA); // true for similar triangles

// Check rotation validity
const isValidRotation = checkRotationMatch(4, 135, 4, 45, planePuzzle, PIECES_DATA, true);
// Returns true for squares (135° is 90° away from 45°)
```

## For Production

1. Set `DEBUG_MODE = false`
2. Debug panel disappears
3. Console logging stops
4. All debug utilities remain available but unused
5. Clean, fast puzzle experience

## Future Enhancements

- Add new triangle pieces → automatic detection and grouping
- Modify similarity tolerance by changing the 5% threshold
- Add debug keyboard shortcuts (e.g., 'D' to toggle debug mode)
- Export debug data for analysis