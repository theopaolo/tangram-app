<script>
  import { browser } from '$app/environment';
  import { goto } from '$app/navigation';
  import { page } from '$app/stores';
  import { onMount } from 'svelte';
  import { fly } from 'svelte/transition';
  import createInteractionHandler from '../../../lib/interaction.js';


  import Breadcrumb from '$lib/Breadcrumb.svelte';
  import { getPuzzleById, puzzleConfigs, PIECES_DATA, PIECES_DATA_WITH_VIEWBOX, PIECE_GREY_COLOR } from '$lib/puzzleData.js';
  import {
  	checkRotationMatch,
  	debugLog,
  	initializeDebugMode
  } from '../../../lib/puzzleDebug.js';



  let showHelp = $state(true); // rune => re-render quand on assigne

  // Get puzzle ID from URL params
  const puzzleId = $derived($page.params.id);
  const currentPuzzle = $derived(getPuzzleById(puzzleId));
  let planePuzzle = $state([]);

  // Breadcrumb items
  const breadcrumbItems = [
    { label: 'Accueil', href: '/home' },
    { label: 'Le Chromogram', href: '/start' },
    { label: 'Les Tangrams', href: '/puzzles' },
    { label: `numéro ${puzzleId}`, current: true }
  ];





// --- 🎉 EFFET DE PAILLETTES ---
function triggerConfetti() {
  const container = document.querySelector('.success-message');
  if (!container) return;

  const pieces = Object.values(PIECES_DATA_WITH_VIEWBOX);
  const canvas = document.createElement('canvas');
  canvas.className = 'confetti-canvas';
  Object.assign(canvas.style, {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100dvh',
    pointerEvents: 'none',
    zIndex: 3000,
  });
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.95; // départ à 90 %

  const total = 100;
  const particles = Array.from({ length: total }, () => {
    const piece = pieces[Math.floor(Math.random() * pieces.length)];

    // 💥 Ajustement subtil :
    // on limite la poussée vers le haut à un arc de ~25 % à 70 % de l’écran
    // sans rallonger l’effet ni tout décaler vers le bas
    const baseVy = -(Math.random() * 12 + 7); // vitesse initiale vers le haut (modérée)
    const gravity = 0.32;                    // gravité un peu plus forte pour recentrer
    const life = Math.random() * 90 + 60;    // durée légèrement raccourcie (~1,2 s)

    return {
      x: originX + (Math.random() - 0.5) * 200, // légère largeur de départ
      y: originY,
      shape: piece.points,
      color: piece.color,
      size: Math.random() * 0.12 + 0.05,
      rotation: Math.random() * 60,
      vx: (Math.random() - 0.5) * 13,
      vy: baseVy,
      vrot: (Math.random() - 0.5) * 10,
      gravity,
      life,
    };
  });

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  function drawPolygon(points, fill, x, y, scale, rotation) {
    const pts = points.split(' ').map(p => p.split(',').map(Number));
    const radians = (rotation * Math.PI) / 180;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(radians);
    ctx.scale(scale, scale);
    ctx.beginPath();
    pts.forEach(([px, py], i) => {
      if (i === 0) ctx.moveTo(px - 150, py - 150);
      else ctx.lineTo(px - 150, py - 150);
    });
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
    ctx.restore();
  }

  let frame = 0;
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity; // gravité légèrement plus rapide
      p.rotation += p.vrot;
      p.life--;
      drawPolygon(p.shape, p.color, p.x, p.y, p.size, p.rotation);
    });

    frame++;
    if (particles.some(p => p.life > 0) && frame < 180) {
      requestAnimationFrame(animate);
    } else {
      canvas.remove();
    }
  }

  animate();
}






  // Update planePuzzle when currentPuzzle changes
  $effect(() => {
    if (currentPuzzle) {
      planePuzzle = currentPuzzle.data;
    }
  });

  // Redirect if puzzle not found
  $effect(() => {
    if (puzzleId && !currentPuzzle) {
      goto('/puzzles');
    }
  });

  // Toggle debug mode - set to false for production
  const DEBUG_MODE = false;

  let pickupSound, dropSound;
  let audioUnlocked = false;
  let audioContext;

  if (browser) {
    pickupSound = new Audio('/snd/tap_01.mp3');
    dropSound = new Audio('/snd/tap_04.mp3');
  }

  function unlockAudio() {
    if (audioUnlocked) return;

    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }

    if (audioContext.state === 'suspended') {
      audioContext.resume();
    }

    audioUnlocked = true;
  }

  function playSound(audio) {
    if (!audio) return;
    audio.currentTime = 0;
    // audio.play();
  }

  // --- DRAG AND DROP STATE ---
  let pieces = $state([]);
  let targetPieces = $state([]);
  let activePieceId = $state(null);
  let containerSize = $state({ width: 0, height: 0 });
  let puzzleScale = $state(1);
  let puzzleSolved = $state(false);
  let puzzleContainer, piecesContainer;
  let matchesFromStorage = $state([]); // [{ targetId, pieceId }]
  let hasAppliedStoredPlacement = $state(false);

  // --- PUZZLE PROGRESSION TRACKING ---
  const PUZZLE_PROGRESS_KEY = `puzzle_${puzzleId}_progress`;
  const HELP_DISMISSED_KEY = 'tangram_help_dismissed';

  // Helper: find the target this piece currently matches (within tolerance and rotation rules)
  function findMatchedTargetForPiece(piece) {
    if (!piece || piece.inContainer) return null;
    const tolerance = 25 * puzzleScale;
    const target = targetPieces.find((t) => {
      // Only exact ID matches - no interchangeable pieces
      if (piece.id !== t.id) return false;
      const distance = Math.hypot(piece.x - t.screenX, piece.y - t.screenY);
      if (distance >= tolerance) return false;
      const rotOk = checkRotationMatch(piece.id, piece.rotation, t.id, t.rotation, planePuzzle, PIECES_DATA, false);
      return rotOk;
    });
    return target || null;
  }

  // Save puzzle progress to localStorage (matched pairs: targetId <- pieceId)
  function savePuzzleProgress() {
    if (typeof localStorage === 'undefined') return;

    const matches = [];
    const usedTargetIds = new Set();
    for (const piece of pieces) {
      const target = findMatchedTargetForPiece(piece);
      if (target && !usedTargetIds.has(target.id)) {
        matches.push({ targetId: target.id, pieceId: piece.id, rotation: ((piece.rotation % 360) + 360) % 360 });
        usedTargetIds.add(target.id);
      }
    }

    // Determine completion state directly here for easier consumption elsewhere
    const allPiecesOutOfContainer = pieces.every((p) => !p.inContainer);
    const completed = allPiecesOutOfContainer && matches.length === targetPieces.length;

    const progress = {
      matches,
      puzzleId: puzzleId,
      timestamp: Date.now(),
      completed
    };

    localStorage.setItem(PUZZLE_PROGRESS_KEY, JSON.stringify(progress));
  }

  // Load puzzle progress from localStorage (matched pairs)
  function loadPuzzleProgress() {
    if (typeof localStorage === 'undefined') return false;

    try {
      const saved = localStorage.getItem(PUZZLE_PROGRESS_KEY);
      if (!saved) return false;

      const progress = JSON.parse(saved);

      // Verify this is for the current puzzle
      if (progress.puzzleId !== puzzleId) return false;

      // Backward compatibility: accept either matches or matchedTargetIds
      if (Array.isArray(progress.matches)) {
        matchesFromStorage = progress.matches
          .filter(m => m && typeof m.targetId !== 'undefined' && typeof m.pieceId !== 'undefined')
          .map(m => ({ targetId: m.targetId, pieceId: m.pieceId, rotation: typeof m.rotation === 'number' ? ((m.rotation % 360) + 360) % 360 : null }));
      } else if (Array.isArray(progress.matchedTargetIds)) {
        matchesFromStorage = progress.matchedTargetIds.map((tid) => ({ targetId: tid, pieceId: null, rotation: null }));
      } else {
        matchesFromStorage = [];
      }
      hasAppliedStoredPlacement = false;
      return matchesFromStorage.length > 0;
    } catch (error) {
      console.warn('Failed to load puzzle progress:', error);
    }

    return false;
  }

  // Clear puzzle progress (when puzzle is completed or reset)
  function clearPuzzleProgress() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(PUZZLE_PROGRESS_KEY);
  }

  // Check if help has been dismissed before
  function isHelpDismissed() {
    if (typeof localStorage === 'undefined') return false;
    return localStorage.getItem(HELP_DISMISSED_KEY) === 'true';
  }

  // Save help dismissal state
  function dismissHelp() {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(HELP_DISMISSED_KEY, 'true');
    showHelp = false;
  }

  // --- MAGNETIC EFFECT CONSTANTS ---
  const MAGNETIC_SNAP_DISTANCE = 100; // Distance in pixels to begin attraction
  const MAGNETIC_SMOOTHNESS = 0.2; // Lower = stronger attraction each frame
  const HARD_LOCK_DISTANCE = 28; // Inside this radius, piece locks to target and overrides grabbing
  const SNAP_ON_RELEASE_DISTANCE = 48; // On release, snap perfectly if within this distance
  let magneticTarget = $state(null); // Currently attracted target
  let isMagnetLocked = $state(false); // When true, piece stays fixed on target while dragging

  // Debug state
  let debugInfo = $state({
    tolerance: 0,
    piecesInContainer: [],
    matchResults: [],
    lastCheck: null,
    triangleGroups: []
  });

  // Derived state
  const activePiece = $derived(pieces.find(p => p.id === activePieceId));

  // --- COLORING BASED ON PROGRESS ---
  function isPieceProperlyPlacedCurrent(piece) {
    if (!piece || piece.inContainer) return false;

    const tolerance = 25 * puzzleScale;

    // Only exact ID matches - no interchangeable pieces
    const target = targetPieces.find(t => piece.id === t.id);
    if (!target) return false;

    const distance = Math.hypot(piece.x - target.screenX, piece.y - target.screenY);
    const rotationMatch = checkRotationMatch(
      piece.id,
      piece.rotation,
      target.id,
      target.rotation,
      planePuzzle,
      PIECES_DATA,
      false
    );

    return distance < tolerance && rotationMatch;
  }

  function getPieceFillColor(pieceId) {
    const piece = pieces.find(p => p.id === pieceId);

    if (!piece || piece.inContainer) return PIECE_GREY_COLOR;

    if (puzzleSolved || isPieceProperlyPlacedCurrent(piece)) {
      return PIECES_DATA_WITH_VIEWBOX[pieceId].color;
    }

    // Placed but not correctly aligned: keep base color; opacity handled separately
    return PIECES_DATA_WITH_VIEWBOX[pieceId].color;
  }

  // No opacity variations needed

  // Find the closest compatible target for magnetic attraction
  function findMagneticTarget(piece) {
    if (!piece || piece.inContainer) return null;

    let closestTarget = null;
    let minDistance = MAGNETIC_SNAP_DISTANCE;

    for (const target of targetPieces) {
      // Only exact ID matches - no interchangeable pieces
      if (piece.id !== target.id) continue;

      // Check rotation compatibility
      const rotationMatch = checkRotationMatch(piece.id, piece.rotation, target.id, target.rotation, planePuzzle, PIECES_DATA, false);
      if (!rotationMatch) continue;

      // Calculate distance
      const distance = Math.hypot(piece.x - target.screenX, piece.y - target.screenY);

      if (distance < minDistance) {
        minDistance = distance;
        closestTarget = target;
      }
    }

    return closestTarget;
  }

  const TRIANGLE_IDS = new Set([1, 2, 3, 6, 7]);

  function normalizeRotation(angle) {
    return ((angle % 360) + 360) % 360;
  }

  function getSymmetryStep(pieceId) {
    if (pieceId === 5) return 180; // parallelogram repeats every 180°
    if (pieceId === 4) return 90; // square repeats every 90°
    if (TRIANGLE_IDS.has(pieceId)) return 90; // right triangles repeat every 90°
    return 360;
  }

  function getBaseRotationForPiece(pieceId) {
    const placement = planePuzzle.find((p) => p.id === pieceId);
    return placement ? normalizeRotation(placement.rotation ?? 0) : null;
  }

  function getTransformedPoints(piece, pieceData) {
    const originX = 150, originY = 150;
    const angle = piece.rotation * (Math.PI / 180);
    const cos = Math.cos(angle), sin = Math.sin(angle);
    const scaleX = 1;
    const basePoints = pieceData.points.split(' ').map((p) => p.split(',').map(Number));
    return basePoints.map(([px, py]) => {
      let x = px - originX, y = py - originY;
      x *= scaleX;
      const rx = x * cos - y * sin;
      const ry = x * sin + y * cos;
      return { x: rx + piece.x, y: ry + piece.y };
    });
  }

  // Compute a rotation for pieceId that is compatible with the given target
  function findCompatibleRotationForPlacement(pieceId, target) {
    const targetRotation = normalizeRotation(target.rotation ?? 0);

    // Only exact matches - piece must match target ID
    if (pieceId !== target.id) {
      return targetRotation;
    }

    // For exact matches, just use the target rotation
    return targetRotation;
  }

  // Store original and transformed bounds for positioning
  let originalBounds = { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  let fitScale = 1;

  // Initialize pieces in the container at the bottom
  function initializePieces() {
    pieces =
      Object.keys(PIECES_DATA)
      .map((id) => (
        {
          id: parseInt(id), x: 0, y: 0, rotation: 0, origX: 0, origY: 0, inContainer: true, animationKey: 0, matched: false,
        }
      ));
  }

  function fitTargets() {
    if (!containerSize.width || planePuzzle.length === 0) return;

    const gutter = 40;
    const availableWidth = containerSize.width - gutter * 2;
    const availableHeight = containerSize.height - gutter * 2;
    const screenCenterX = containerSize.width / 2;
    const screenCenterY = containerSize.height / 2;

    // Check if puzzle uses new container format
    const currentConfig = puzzleConfigs.find(p => p.id === parseInt(puzzleId));
    const hasContainer = currentConfig && currentConfig.container;

    let scaleFactor, containerWidth, containerHeight;

    if (hasContainer) {
      // New format: use container dimensions
      containerWidth = currentConfig.container.width;
      containerHeight = currentConfig.container.height;

      // Scale container to fit available space
      scaleFactor = Math.min(
        availableWidth / containerWidth,
        availableHeight / containerHeight
      ) * 0.85;

      puzzleScale = scaleFactor;

      // Convert normalized coordinates to screen coordinates
      targetPieces = planePuzzle.map(target => {
        const screenX = screenCenterX - (containerWidth * scaleFactor / 2) + (target.x * containerWidth * scaleFactor);
        const screenY = screenCenterY - (containerHeight * scaleFactor / 2) + (target.y * containerHeight * scaleFactor);
        return { ...target, screenX, screenY };
      });
    } else {
      // Legacy format: calculate bounds from absolute coordinates
      const allFinalVertices = planePuzzle.flatMap(pieceState =>
        getTransformedPoints(pieceState, PIECES_DATA_WITH_VIEWBOX[pieceState.id])
      );

      const xs = allFinalVertices.map(p => p.x);
      const ys = allFinalVertices.map(p => p.y);
      const bounds = {
        minX: Math.min(...xs),
        maxX: Math.max(...xs),
        minY: Math.min(...ys),
        maxY: Math.max(...ys),
      };

      const puzzleWidth = bounds.maxX - bounds.minX;
      const puzzleHeight = bounds.maxY - bounds.minY;

      scaleFactor = Math.min(
        availableWidth / puzzleWidth,
        availableHeight / puzzleHeight
      ) * 0.85;

      puzzleScale = scaleFactor;

      const puzzleCenterX = (bounds.minX + bounds.maxX) / 2;
      const puzzleCenterY = (bounds.minY + bounds.maxY) / 2;

      targetPieces = planePuzzle.map(target => {
        const screenX = screenCenterX + (target.x - puzzleCenterX) * scaleFactor;
        const screenY = screenCenterY + (target.y - puzzleCenterY) * scaleFactor;
        return { ...target, screenX, screenY };
      });
    }

    // If we have stored matched IDs and haven't applied placement yet, do it now
    if (!hasAppliedStoredPlacement && matchesFromStorage.length > 0) {
      // Reset all pieces to container by default
      pieces = pieces.map((piece) => ({
        ...piece,
        inContainer: true,
        x: 0,
        y: 0,
        rotation: 0,
        matched: false
      }));

      for (const match of matchesFromStorage) {
        const target = targetPieces.find((t) => t.id === match.targetId);
        if (!target) continue;

        // Only restore exact ID matches - no interchangeable pieces
        let candidate = match.pieceId != null ? pieces.find((p) => p.inContainer && p.id === match.pieceId) : null;
        if (!candidate) candidate = pieces.find((p) => p.inContainer && p.id === target.id);
        if (!candidate) continue;

        candidate.inContainer = false;
        candidate.x = target.screenX;
        candidate.y = target.screenY;
        // Use saved rotation if available, else use target rotation
        if (match.pieceId != null && candidate.id === match.pieceId && typeof match.rotation === 'number') {
          candidate.rotation = match.rotation;
        } else {
          candidate.rotation = target.rotation;
        }
        candidate.matched = true;
        candidate.animationKey += 1;
      }

      hasAppliedStoredPlacement = true;
      // After applying, re-check solution state
      checkPuzzleSolution();
    }
  }

  function observeResize(node) {
    const observer = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      containerSize.width = width;
      containerSize.height = height;
      fitTargets();
    });
    observer.observe(node);
    return { destroy() { observer.unobserve(node); } };
  }

  // --- INTERACTION FUNCTIONS ---
  function draggable(node, params) {
    let offsetX, offsetY;
    let startedInContainer = false;

    const handlePointerDown = createInteractionHandler({
      onDown: (e) => {
        activePieceId = params.pieceId;
        // playSound(pickupSound);
        unlockAudio();

        const piece = pieces.find(p => p.id === params.pieceId);
        if (!piece) return;

        const rect = puzzleContainer.getBoundingClientRect();

        // Track whether this interaction started from the container
        startedInContainer = piece.inContainer;

        if (piece.inContainer) {
          // Moving from container to puzzle area
          piece.inContainer = false;
          piece.x = e.clientX - rect.left;
          piece.y = e.clientY - rect.top;
        }

        // Calculate offset from pointer to piece center
        offsetX = e.clientX - (piece.x + rect.left);
        offsetY = e.clientY - (piece.y + rect.top);
      },
      onDrag: (e) => {
        const piece = pieces.find(p => p.id === params.pieceId);
        if (!piece) return;

        const rect = puzzleContainer.getBoundingClientRect();
        const newX = Math.round(e.clientX - rect.left - offsetX);
        const newY = Math.round(e.clientY - rect.top - offsetY);

        // Temporarily set position to check for magnetic targets
        piece.x = newX;
        piece.y = newY;

        // Check for magnetic attraction
        const target = findMagneticTarget(piece);
        magneticTarget = target;

        if (target) {
          const targetDistance = Math.hypot(newX - target.screenX, newY - target.screenY);

          // Inside hard-lock zone, override grabbing and stick to target center
          if (targetDistance <= HARD_LOCK_DISTANCE) {
            isMagnetLocked = true;
            piece.x = target.screenX;
            piece.y = target.screenY;
          } else {
            // Outside lock zone but within magnetic range, apply strong attraction
            isMagnetLocked = false;
            const attractionStrength = Math.max(0, 1 - targetDistance / MAGNETIC_SNAP_DISTANCE);
            piece.x = newX + (target.screenX - newX) * attractionStrength * (1 - MAGNETIC_SMOOTHNESS);
            piece.y = newY + (target.screenY - newY) * attractionStrength * (1 - MAGNETIC_SMOOTHNESS);
          }
        } else {
          // No target nearby → ensure lock is cleared
          isMagnetLocked = false;
        }

        pieces = pieces; // Trigger reactivity
      },
      onEnd: (e, wasTap, wasDrag) => {
        const piece = pieces.find(p => p.id === params.pieceId);
        if (!piece) return;

        if (wasTap) {
          if (startedInContainer) {
            // Tap on a container piece: throw it into the puzzle area, just above the container
            const rect = puzzleContainer.getBoundingClientRect();
            const containerRect = piecesContainer.getBoundingClientRect();
            const paddingX = Math.round(rect.width * 0.1);
            const minX = paddingX;
            const maxX = rect.width - paddingX;
            const targetX = Math.max(minX, Math.min(maxX, Math.round(e.clientX - rect.left)));
            const offsetAbove = 40; // place a bit above the pieces container
            const computedY = Math.round(containerRect.top - rect.top - offsetAbove);
            const targetY = Math.max(0, Math.min(rect.height - 1, computedY));

            piece.inContainer = false;
            piece.x = targetX;
            piece.y = targetY;
            piece.animationKey += 1;

            // Save progress when piece is thrown into the puzzle
            savePuzzleProgress();
          } else {
            // Rotate on tap
            piece.rotation = (piece.rotation + 45) % 360;
            piece.animationKey += 1;

            // Save progress when piece is rotated
            savePuzzleProgress();
          }
        } else if (wasDrag) {
          // playSound(dropSound);

          // If near a valid target (highlighted/darker), snap perfectly into place
          const target = findMagneticTarget(piece);
          if (target) {
            piece.inContainer = false;
            piece.x = target.screenX;
            piece.y = target.screenY;
            // Find compatible rotation (handles interchangeable pieces correctly)
            piece.rotation = findCompatibleRotationForPlacement(piece.id, target);
            piece.animationKey += 1;

            // Save progress when piece is properly placed
            savePuzzleProgress();
          } else {
            // Check if piece should return to container
            const piecesRect = piecesContainer.getBoundingClientRect();
            if (e.clientY > piecesRect.top - 50) {
              // Return to container
              piece.inContainer = true;
              piece.x = 0;
              piece.y = 0;
              piece.rotation = 0;
              piece.animationKey += 1;

              // Save progress when piece is returned to container
              savePuzzleProgress();
            }
          }
        }

        // Clear magnetic target
        magneticTarget = null;
        isMagnetLocked = false;

        // Check puzzle solution
        checkPuzzleSolution();
        pieces = pieces; // Trigger reactivity
      }
    });

    node.addEventListener('pointerdown', handlePointerDown);
    return {
      destroy: () => node.removeEventListener('pointerdown', handlePointerDown)
    };
  }

  // Triangle similarity groups are now managed by debug utils
  function checkPuzzleSolution() {
    const tolerance = 25 * puzzleScale; // Scale the tolerance for precision

    if (DEBUG_MODE) {
      debugLog("🔍 Checking puzzle solution...");
      debugLog(`Tolerance: ${tolerance}, Scale: ${puzzleScale}`);
    }

    // Update debug info
    if (DEBUG_MODE) {
      debugInfo.tolerance = Math.round(tolerance);
      debugInfo.lastCheck = new Date().toLocaleTimeString();
    }

    // A piece is still in the container, so it can't be solved yet.
    const piecesInContainer = pieces.filter(p => p.inContainer);
    if (DEBUG_MODE) {
      debugInfo.piecesInContainer = piecesInContainer.map(p => p.id);
    }

    if (piecesInContainer.length > 0) {
      if (DEBUG_MODE) {
        debugLog(`❌ Pieces still in container: ${piecesInContainer.map(p => p.id).join(', ')}`);
        debugInfo.matchResults = [`❌ ${piecesInContainer.length} pieces still in container: ${piecesInContainer.map(p => p.id).join(', ')}`];
      }
      puzzleSolved = false;
      return;
    }

    if (DEBUG_MODE) {
      debugLog("✅ All pieces are out of container");
    }

    // Track which pieces have been matched to avoid double-matching
    const matchedPieceIds = new Set();
    const matchResults = [];

    // Check if every target piece has a corresponding placed piece that matches
    const allCorrect = targetPieces.every(target => {
      if (DEBUG_MODE) {
        debugLog(`\n🎯 Checking target ${target.id} at (${Math.round(target.screenX)}, ${Math.round(target.screenY)}) rotation: ${target.rotation}°`);
      }

      // Find a piece that can fill this target position (exact match only)
      const validPiece = pieces.find(piece => {
        // Skip if this piece is already matched
        if (matchedPieceIds.has(piece.id)) {
          if (DEBUG_MODE) {
            debugLog(`  ⏭️ Piece ${piece.id} already matched, skipping`);
          }
          return false;
        }

        // Only exact ID matches - no interchangeable pieces
        if (piece.id !== target.id) {
          if (DEBUG_MODE) {
            debugLog(`  ❌ Piece ${piece.id} cannot fit target ${target.id} (not same ID)`);
          }
          return false;
        }

        // Calculate the distance between the piece's center and the target's center
        const distance = Math.hypot(piece.x - target.screenX, piece.y - target.screenY);

        // Smart rotation matching
        const rotationMatch = checkRotationMatch(piece.id, piece.rotation, target.id, target.rotation, planePuzzle, PIECES_DATA, DEBUG_MODE);

        if (DEBUG_MODE) {
          debugLog(`  🔍 Piece ${piece.id} at (${Math.round(piece.x)}, ${Math.round(piece.y)}) rotation: ${piece.rotation}°`);
          debugLog(`    📏 Distance: ${Math.round(distance)} (tolerance: ${Math.round(tolerance)})`);
        }

        // Check for correct position AND rotation
        const isValid = distance < tolerance && rotationMatch;

        if (DEBUG_MODE) {
          debugLog(`    ${isValid ? '✅' : '❌'} Valid: ${isValid}`);
        }

        return isValid;
      });

      // If we found a valid piece, mark it as matched
      if (validPiece) {
        matchedPieceIds.add(validPiece.id);
        if (DEBUG_MODE) {
          const distance = Math.hypot(validPiece.x - target.screenX, validPiece.y - target.screenY);
          matchResults.push(`✅ Target ${target.id} ← Piece ${validPiece.id} (dist: ${Math.round(distance)}, rot: ${validPiece.rotation}°/${target.rotation}°)`);
          debugLog(`  ✅ Target ${target.id} MATCHED with piece ${validPiece.id}`);
        }
        return true;
      } else {
        if (DEBUG_MODE) {
          // Find the closest piece for debugging
          const closestPiece = pieces.filter(p => !matchedPieceIds.has(p.id)).reduce((closest, piece) => {
            const distance = Math.hypot(piece.x - target.screenX, piece.y - target.screenY);
            return (!closest || distance < closest.distance)
              ? { piece, distance }
              : closest;
          }, null);

          if (closestPiece) {
            const canFit = closestPiece.piece.id === target.id;
            const rotMatch = checkRotationMatch(closestPiece.piece.id, closestPiece.piece.rotation, target.id, target.rotation, planePuzzle, PIECES_DATA, false);
            const rotInfo = `${closestPiece.piece.rotation}°→${target.rotation}°`;
            matchResults.push(`❌ Target ${target.id}: closest is piece ${closestPiece.piece.id} (dist: ${Math.round(closestPiece.distance)}, fit: ${canFit}, rot: ${rotMatch ? '✓' : '✗'}${rotInfo})`);
          } else {
            matchResults.push(`❌ Target ${target.id}: no available pieces`);
          }

          debugLog(`  ❌ Target ${target.id} NOT MATCHED`);
        }
        return false;
      }
    });

    if (DEBUG_MODE) {
      debugInfo.matchResults = matchResults;
      debugLog("\n📊 MATCH RESULTS:");
      matchResults.forEach(result => debugLog(result));
      debugLog(`\n🏁 Puzzle solved: ${allCorrect}`);
    }

    puzzleSolved = allCorrect;

    if (allCorrect) {
      // Mark current puzzle as completed in localStorage
      if (DEBUG_MODE) {
        debugLog("🎉 CONGRATULATIONS! PUZZLE SOLVED! 🎉");
      }

      // Save final progress state (all pieces matched)
      savePuzzleProgress();

      // 🎆 Ajout ici :
      setTimeout(() => triggerConfetti(), 100);
    }
  }

  function backToPuzzleList() {
    goto('/puzzles');
  }

  function resetPuzzle() {
    console.log('🔄 Resetting puzzle...');

    // Clear saved progress
    clearPuzzleProgress();

    // Reset puzzle solved state first
    puzzleSolved = false;

    // Reset pieces to initial state
    initializePieces();

    // Re-fit targets
    fitTargets();

    console.log('✅ Puzzle reset complete');
  }


  onMount(async () => {
      if (!browser) return;

      // Import scroll freeze utility
      const { freezeScroll, unfreezeScroll } = await import('$lib/utils/scrollFreeze.js');

      // Freeze scroll
      freezeScroll();

      return () => {
        unfreezeScroll();
      };
    });


  onMount(() => {
    initializePieces();
    fitTargets();

    // Check if help has been dismissed before
    showHelp = !isHelpDismissed();

    // Try to load saved progress (matched pieces only)
    const progressLoaded = loadPuzzleProgress();
    if (progressLoaded) {
      // Re-fit targets after loading progress to ensure proper scaling
      fitTargets();
      // Check if puzzle is already solved with loaded progress
      checkPuzzleSolution();
    }

    // Initialize debug mode if enabled
    if (DEBUG_MODE) {
      initializeDebugMode(PIECES_DATA);
    }
  });
</script>

<style>

  .puzzle-wrapper {
    position: relative;
    width: 100%;
    height: 100dvh;
    padding: 0 20px;
    margin: auto;
  }

  .puzzle-container {
    position: relative;
    top: 0;
    width: 100%;
    height: 100svh;
    margin-top: 40px;
    padding-bottom: 180px;
    border-radius: 8px;
    /* Prevent scrolling/zooming when interacting with pieces */
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .target-outline, .tangram-piece {
    position: absolute;
    top: 0;
    left: 0;
    width: var(--w);
    height: var(--h);
    transform: translate(calc(var(--x) * 1px - var(--w) / 2), calc(var(--y) * 1px - var(--h) / 2)) rotate(var(--rotation)) scaleX(var(--scaleX));
    transform-origin: 50% 50%;
    pointer-events: none;
  }

  .target-outline.magnetic-target svg polygon {
    /* stroke: #1c1c1c; */
    fill: #8e8e8e;
  }

  .tangram-piece {
     transition: transform 0.2s;
     will-change: transform;
     /* Prevent default touch behaviors during drag */
     touch-action: none;
     user-select: none;
     -webkit-user-select: none;
     -webkit-touch-callout: none;
  }
  .tangram-piece-svg polygon {
    pointer-events: auto;
  }

  .tangram-piece:active {
    cursor: grabbing;
  }

  .tangram-piece.active {
    z-index: 100;
    transition: none;
  }

  @keyframes wiggle {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-2deg); }
    75% { transform: rotate(2deg); }
    100% { transform: rotate(0deg); }
  }

  .tangram-piece.active .tangram-piece-svg,
  .wiggling-svg {
    animation: wiggle 0.3s ease-in-out;
  }

  .tangram-piece-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
    pointer-events: none;
  }

  .tangram-piece-svg polygon {
    stroke-linejoin: round;
    stroke: transparent;
    stroke-width: 0;
    pointer-events: auto;
    transition: stroke 0.2s, stroke-width 0.2s;
    /* Prevent default touch behaviors during drag */
    touch-action: none;
  }

  .tangram-piece.active .tangram-piece-svg polygon {
    /* stroke: rgb(191, 191, 191);
    stroke-width: 1;
    filter: drop-shadow(4px 8px 0px rgb(191, 191, 191)); */
    will-change: transform;
  }

  .pieces-container {
    display: flex;
    padding-left: 20px;
    padding-right: 20px;
    position: absolute;
    bottom: 85px;
    left: 0;
    right: 0;
    height: 60px;
    gap: .5rem;
  }
.pieces-container {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.3s ease, transform 0.4s ease;
}

.pieces-container.hide-container {
  opacity: 0;
  transform: translateY(5px);
  pointer-events: none;
}


  .container-piece {
    width: 100px;
    height: 100%;
    cursor: grab;
    pointer-events: none;
    /* Prevent default touch behaviors */
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
  }

  .container-piece:active {
    cursor: grabbing;
  }

  .container-piece.is-placeholder {
    cursor: default;
  }

  .container-piece.is-placeholder svg {
    pointer-events: none;
  }

  .container-piece svg {
    pointer-events: auto;
    height: 100%;
    width: 100%;
    /* Prevent default touch behaviors during drag */
    touch-action: none;
  }
  .success-message {
      position: fixed;
      bottom: 60px;
      right: 0;
      z-index: 2000;
      left:0;
      margin: auto;
  }

  .action-buttons {
    position: absolute;
    top: var(--y);
    left: var(--x);
    transform: translate(-50%, -150%);
    display: flex;
    gap: 4px;
    z-index: 200;
  }

  .action-buttons button {
    pointer-events: auto;
    background: rgba(0,0,0,0.8);
    color: white;
    border: none;
    padding: 8px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }

  .action-buttons button:hover {
    transform: scale(1.1);
    background: rgba(0,0,0,0.9);
  }

  .debug-panel {
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    font-family: monospace;
    font-size: 12px;
    max-width: 400px;
    z-index: 1000;
    max-height: 50vh;
    overflow-y: auto;
  }

  .debug-panel h3 {
    margin: 0 0 0.5rem 0;
    color: #4CAF50;
  }

  .debug-panel .debug-item {
    margin: 0.25rem 0;
    line-height: 1.4;
  }

  .debug-panel .match-result {
    padding: 2px 4px;
    margin: 2px 0;
    border-radius: 3px;
  }

  .debug-panel .match-result.success {
    background: rgba(76, 175, 80, 0.3);
  }

  .debug-panel .match-result.failure {
    background: rgba(244, 67, 54, 0.3);
  }
</style>

<header class="fixed left-5 top-0 z-10 flex items-center pt-4 ">
    <a href="/puzzles" class="flex gap-2" aria-label="Retour à l'accueil">
      <!-- <img
      src="/images/chat.svg"
      alt="grey"
      class="h-auto !w-[42px]"
    /> -->
      <img
      src="/images/retour_tangrams.svg"
      alt="retour"
      class="h-auto !w-[162px]"
    />
    </a>
</header>


{#if showHelp}
  <div class="fixed inset-0 z-[9999] grid place-items-center p-10">
    <div class="absolute inset-0 bg-black/30" onclick={dismissHelp} />
    <div class="relative mx-auto w-full border drop-shadow-[var(--my-drop-shadow)] text-13 px-8 py-8 max-h-max bg-white">
      <button
        type="button"
        class="absolute right-3 top-3 oki"
        aria-label="Fermer l'aide"
        onclick={dismissHelp}
      >
        <svg width="16" height="16" viewBox="0 0 29 29" fill="black" xmlns="http://www.w3.org/2000/svg">
          <path d="M28.8613 25.8936L26.0347 28.7238L0.173337 2.83019L3 0L28.8613 25.8936Z" fill="black"/>
          <path d="M3.13867 28.8936L0.312005 26.0634L26.1733 0.16981L29 3L3.13867 28.8936Z" fill="black"/>
        </svg>
      </button>
      1. Fais glisser une des formes du bas vers le tangram.<br/>
      2. Appuie sur la forme pour la faire pivoter.<br/>
      3. Dépose la forme à son emplacement.
    </div>
  </div>
{/if}

<div class="puzzle-wrapper" onpointerdown={unlockAudio}>

  <!-- Puzzle area centered -->
  <div class="puzzle-container {puzzleSolved ? 'puzzle-solved' : ''}"
        bind:this={puzzleContainer}
        use:observeResize
        role="main"
        onpointerdown={() => activePieceId = null} >

    <!-- Target outline -->
    {#each targetPieces as target (target.id)}
      {@const pieceData = PIECES_DATA_WITH_VIEWBOX[target.id]}
      {@const isMagneticTarget = magneticTarget && magneticTarget.id === target.id}
      <div class="target-outline"
        class:magnetic-target={isMagneticTarget}
        style="
          --x: {target.screenX};
          --y: {target.screenY};
          --w: {pieceData.width * puzzleScale}px;
          --h: {pieceData.height * puzzleScale}px;
          --rotation: {target.rotation}deg;
          --scaleX: 1;"
        >
        <svg class="tangram-piece-svg" viewBox={pieceData.viewBox}>
          <polygon points={pieceData.points} fill="#e7e7e7" stroke-width="0" />
        </svg>
      </div>
    {/each}

    {#each pieces.filter(p => !p.inContainer) as piece (piece.id)}
      {@const pieceData = PIECES_DATA_WITH_VIEWBOX[piece.id]}
      <div
        class="tangram-piece"
        class:active={activePieceId === piece.id}
        style="
          --x: {piece.x};
          --y: {piece.y};
          --w: {pieceData.width * puzzleScale}px;
          --h: {pieceData.height * puzzleScale}px;
          --rotation: {piece.rotation}deg;
          --scaleX: 1;
          --z-index: {activePieceId === piece.id ? 100 : 10};
        "
      >
        {#key piece.animationKey}
          <svg class="tangram-piece-svg" class:wiggling-svg={activePieceId === piece.id} viewBox={pieceData.viewBox}>
            <polygon use:draggable={{ pieceId: piece.id }} points={pieceData.points} fill={getPieceFillColor(piece.id)} />
          </svg>
        {/key}
      </div>
    {/each}
  </div>

  {#if activePiece && !activePiece.inContainer}
    <div
      class="action-buttons"
      style="--x: {activePiece.x}px; --y: {activePiece.y}px;"
      onpointerdown={(e) => e.stopPropagation()}
    >
    </div>
  {/if}

  <div class="pieces-container" class:hide-container={puzzleSolved} bind:this={piecesContainer}>
    {#each pieces.map(p => p.id === 3 ? pieces.find(x => x.id === 4) : p.id === 4 ? pieces.find(x => x.id === 3) : p) as piece (piece.id)}
      {@const pieceData = PIECES_DATA_WITH_VIEWBOX[piece.id]}
        <div class="container-piece relative z-1 numero-{piece.id}" class:is-placeholder={!piece.inContainer}>
          <svg viewBox={pieceData.viewBox}>
            <polygon
              use:draggable={piece.inContainer && { pieceId: piece.id }}
              points={pieceData.points}
              fill={piece.inContainer ? pieceData.color : 'transparent'}
              stroke={piece.inContainer ? 'none' : pieceData.color}
              stroke-width={piece.inContainer ? '0' : '2'}
              vector-effect="non-scaling-stroke"
              pointer-events={piece.inContainer ? 'auto' : 'none'}
            />
          </svg>
        </div>
    {/each}
  </div>

<footer class="fixed bottom-0 left-0 z-40 flex w-full items-center justify-between px-5 py-2">
	<Breadcrumb items={breadcrumbItems} />
</footer>

{#if puzzleSolved}
    <div class="success-message text-corps flex flex-row justify-center items-end" transition:fly={{ y: 20, duration: 300 }}>
        <button onclick={resetPuzzle} class="h-[87.08px] !w-[100px] mr-[10%] bg-transparent border-none cursor-pointer hover:opacity-80 transition-opacity">
          <img
          src="/images/rebuild.svg"
          alt="Recommencer ce tangram"
          class="h-[87.08px] !w-[100px]"
          />
        </button>

    <!-- {#if allPuzzlesCompleted}
      <a href="/puzzles" class="h-[68.41px" aria-label="Retour à l'accueil">
        <img
        src="/images/continuer_2.svg"
        alt="retour"
        class="h-[68.41px] !w-[101px]"
        />
      </a>
    {/else}
      <a href="/puzzles" class="h-[68.41px" aria-label="Retour à l'accueil">
        <img
        src="/images/continuer.svg"
        alt="retour"
        class="h-[68.41px] !w-[101px]"
        />
      </a>
    {/if} -->
      <a href="/puzzles" class="h-[68.41px" aria-label="Continuer">
        <img
        src="/images/continuer.svg"
        alt="Continuer"
        class="h-[68.41px] !w-[101px]"
        />
      </a>
    </div>
  {/if}



    <!-- Debug Panel - Only shown when DEBUG_MODE is true -->
  {#if DEBUG_MODE}
    <div class="debug-panel">
      <h3>🔍 Debug Info</h3>
      <div class="debug-item">
        <strong>Last Check:</strong> {debugInfo.lastCheck || 'Never'}
      </div>
      <div class="debug-item">
        <strong>Tolerance:</strong> {debugInfo.tolerance}px
      </div>
      <div class="debug-item">
        <strong>Scale:</strong> {puzzleScale.toFixed(2)}
      </div>
      {#if debugInfo.piecesInContainer.length > 0}
        <div class="debug-item">
          <strong>In Container:</strong> {debugInfo.piecesInContainer.join(', ')}
        </div>
      {/if}

      <h3>📊 Match Results</h3>
      {#each debugInfo.matchResults as result}
        <div class="match-result {result.startsWith('✅') ? 'success' : 'failure'}">
          {result}
        </div>
      {/each}

      {#if debugInfo.matchResults.length === 0}
        <div class="debug-item">Move a piece to see matching status</div>
      {/if}
    </div>
  {/if}
</div>