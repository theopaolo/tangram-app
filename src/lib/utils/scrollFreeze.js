/**
 * Unified scroll freeze utility for tangram app
 * Handles both CSS overflow and touch event prevention uniformly across pages
 */

let isScrollFrozen = false;
let originalOverflow = '';
let preventScrollHandler = null;

/**
 * Prevent scroll function for touch events
 */
const preventScroll = (e) => e.preventDefault();

/**
 * Freeze scroll on the page
 * Prevents both CSS overflow and touch scroll events
 */
export function freezeScroll() {
  if (isScrollFrozen) return;

  // Store original overflow value
  originalOverflow = document.body.style.overflow;

  // Set CSS overflow to hidden
  document.body.style.overflow = 'hidden';

  // Prevent touch scroll events
  preventScrollHandler = preventScroll;
  document.addEventListener('touchmove', preventScrollHandler, { passive: false });

  isScrollFrozen = true;
}

/**
 * Unfreeze scroll on the page
 * Restores normal scroll behavior
 */
export function unfreezeScroll() {
  if (!isScrollFrozen) return;

  // Restore original overflow value
  document.body.style.overflow = originalOverflow;

  // Remove touch event listener
  if (preventScrollHandler) {
    document.removeEventListener('touchmove', preventScrollHandler);
    preventScrollHandler = null;
  }

  isScrollFrozen = false;
}

/**
 * Check if scroll is currently frozen
 */
export function isScrollCurrentlyFrozen() {
  return isScrollFrozen;
}

/**
 * Svelte action for automatic scroll freeze management
 * Usage: <div use:scrollFreezeAction>
 */
export function scrollFreezeAction(node) {
  freezeScroll();

  return {
    destroy() {
      unfreezeScroll();
    }
  };
}

/**
 * Composable for automatic scroll freeze with cleanup
 * Returns cleanup function to call manually if needed
 */
export function useScrollFreeze() {
  freezeScroll();

  // Return cleanup function
  return unfreezeScroll;
}