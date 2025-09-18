import { writable } from 'svelte/store';

// Create aide store for managing overlay state
function createAideStore() {
	const { subscribe, set, update } = writable(false);

	return {
		subscribe,
		open: async () => {
			// Import scroll freeze utility and unfreeze scroll when aide opens
			const { unfreezeScroll } = await import('$lib/utils/scrollFreeze.js');
			unfreezeScroll();
			set(true);
		},
		close: async () => {
			// Import scroll freeze utility and restore scroll freeze when aide closes
			const { freezeScroll } = await import('$lib/utils/scrollFreeze.js');
			freezeScroll();
			set(false);
		},
		toggle: () => update(open => !open)
	};
}

export const isAideOpen = createAideStore();