import { writable } from 'svelte/store';

export const isTransitionActive = writable(false);
export const transitionDirection = writable('forward');

export function startPageTransition(direction = 'forward') {
  transitionDirection.set(direction);
  isTransitionActive.set(true);
}

export function endPageTransition() {
  isTransitionActive.set(false);
}
