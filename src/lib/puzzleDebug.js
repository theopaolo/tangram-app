/**
 * Puzzle Debug Utilities
 *
 * Debug functions and utilities for puzzle solution checking and triangle interchangeability.
 * This module can be imported when debugging is needed and removed for production.
 */

/**
 * Calculate triangle area using shoelace formula
 * @param {string} pointsStr - Space-separated coordinate pairs like "x1,y1 x2,y2 x3,y3"
 * @returns {number} Triangle area
 */
export function calculateTriangleArea(pointsStr) {
  const points = pointsStr.split(' ').map(p => p.split(',').map(Number));
  if (points.length !== 3) return 0; // Not a triangle

  const [x1, y1] = points[0];
  const [x2, y2] = points[1];
  const [x3, y3] = points[2];

  return Math.abs((x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2)) / 2);
}

/**
 * Get triangle similarity groups based on area calculations
 * @param {Object} PIECES_DATA - The pieces data object
 * @param {boolean} enableLogging - Whether to log debug info
 * @returns {Array} Array of triangle groups with similar areas
 */
export function getTriangleSimilarityGroups(PIECES_DATA, enableLogging = false) {
  const trianglePieces = [1, 2, 3, 6, 7]; // All triangle pieces
  const areas = {};

  // Calculate areas for all triangles
  trianglePieces.forEach(id => {
    areas[id] = calculateTriangleArea(PIECES_DATA[id.toString()].points);
  });

  if (enableLogging) {
    console.log("Triangle areas:", areas);
  }

  // Group triangles by similar area (within 5% tolerance)
  const groups = [];
  const used = new Set();

  trianglePieces.forEach(id1 => {
    if (used.has(id1)) return;

    const group = [id1];
    used.add(id1);

    trianglePieces.forEach(id2 => {
      if (id1 !== id2 && !used.has(id2)) {
        const areaDiff = Math.abs(areas[id1] - areas[id2]) / areas[id1];
        if (areaDiff < 0.05) { // 5% tolerance
          group.push(id2);
          used.add(id2);
        }
      }
    });

    if (group.length > 1) {
      groups.push(group);
    }
  });

  if (enableLogging) {
    console.log("Triangle similarity groups:", groups);
  }

  return groups;
}

/**
 * Check if rotation is valid for a piece/target combination with smart logic
 * @param {number} pieceId - ID of the piece being placed
 * @param {number} pieceRotation - Current rotation of the piece
 * @param {number} targetId - ID of the target position
 * @param {number} targetRotation - Expected rotation for the target
 * @param {Array} planePuzzle - Array of target definitions
 * @param {Object} PIECES_DATA - The pieces data object
 * @param {boolean} enableLogging - Whether to log debug info
 * @returns {boolean} Whether the rotation is acceptable
 */
export function checkRotationMatch(pieceId, pieceRotation, targetId, targetRotation, planePuzzle, PIECES_DATA, enableLogging = false) {
  // Normalize rotations to 0-359 range
  const normalizeDegrees = (deg) => ((deg % 360) + 360) % 360;
  const pieceRot = normalizeDegrees(pieceRotation);
  const targetRot = normalizeDegrees(targetRotation);

  // Square (piece 4) is rotationally symmetric every 90°
  if (pieceId === 4) {
    const diff = Math.abs(pieceRot - targetRot);
    const normalizedDiff = Math.min(diff, 360 - diff);
    const result = normalizedDiff % 90 === 0;

    if (enableLogging) {
      console.log(`    🔄 Square rotation: ${pieceRotation}° vs ${targetRotation}° (90° symmetric) = ${result}`);
    }

    return result;
  }

  // For interchangeable triangles, use dynamic similarity groups
  const triangleGroups = getTriangleSimilarityGroups(PIECES_DATA, false);
  const triangleGroup = triangleGroups.find(g => g.includes(pieceId) && g.includes(targetId));

  if (triangleGroup) {
    // For similar triangles, allow very flexible rotation
    // Get all target rotations used by pieces in this group
    const groupTargetRotations = triangleGroup.map(id => {
      const target = planePuzzle.find(t => t.id === id);
      return target ? normalizeDegrees(target.rotation) : null;
    }).filter(rot => rot !== null);

    const result = groupTargetRotations.includes(pieceRot);

    if (enableLogging) {
      console.log(`    🔄 Similar triangles: piece ${pieceId}@${pieceRotation}° → target ${targetId} (group ${triangleGroup} allows: ${groupTargetRotations.join('° or ')}°) = ${result}`);
    }

    return result;
  }

  // Default: exact rotation match
  const result = pieceRot === targetRot;

  if (enableLogging) {
    console.log(`    🔄 Rotation match: ${result} (${pieceRotation}° vs ${targetRotation}°)`);
  }

  return result;
}

/**
 * Check if two pieces are interchangeable
 * @param {number} pieceId1 - First piece ID
 * @param {number} pieceId2 - Second piece ID
 * @param {Object} PIECES_DATA - The pieces data object
 * @returns {boolean} Whether the pieces are interchangeable
 */
export function areInterchangeable(pieceId1, pieceId2, PIECES_DATA) {
  // Get dynamic triangle similarity groups
  const triangleSimilarityGroups = getTriangleSimilarityGroups(PIECES_DATA, false);

  // Check triangle similarity groups
  const inSameTriangleGroup = triangleSimilarityGroups.some(group =>
    group.includes(pieceId1) && group.includes(pieceId2)
  );

  // Also keep square compatibility for any target (squares work anywhere squares are expected)
  const bothSquares = pieceId1 === 4 && pieceId2 === 4;

  return inSameTriangleGroup || bothSquares;
}

/**
 * Log detailed puzzle solution checking information
 * @param {string} message - Debug message to log
 * @param {any} data - Optional data to log
 */
export function debugLog(message, data = null) {
  if (data !== null) {
    console.log(message, data);
  } else {
    console.log(message);
  }
}

/**
 * Create debug state object for tracking puzzle solving
 * @returns {Object} Debug state object
 */
export function createDebugState() {
  return {
    tolerance: 0,
    piecesInContainer: [],
    matchResults: [],
    lastCheck: null,
    triangleGroups: []
  };
}

/**
 * Initialize debug mode for puzzle
 * @param {Object} PIECES_DATA - The pieces data object
 */
export function initializeDebugMode(PIECES_DATA) {
  console.log("🔍 Initializing robust triangle interchangeability...");
  const groups = getTriangleSimilarityGroups(PIECES_DATA, true);
  return groups;
}