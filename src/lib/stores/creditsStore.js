import { writable } from 'svelte/store';

// Create credits store for managing overlay state
function createCreditsStore() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		open: () => set(true),
		close: () => set(false),
		toggle: () => update(open => !open)
	};
}

export const isCreditsOpen = createCreditsStore();