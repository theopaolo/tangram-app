import { writable } from 'svelte/store';

// Create aide store for managing overlay state
function createAideStore() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		open: () => set(true),
		close: () => set(false),
		toggle: () => update(open => !open)
	};
}

export const isAideOpen = createAideStore();