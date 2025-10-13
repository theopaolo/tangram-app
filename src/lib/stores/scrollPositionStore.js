import { writable } from 'svelte/store';

// Create scroll position store for managing scroll positions across routes
function createScrollPositionStore() {
	const { subscribe, set, update } = writable({});

	return {
		subscribe,
		// Save scroll position for a specific route
		save: (route, position) => {
			update(positions => ({
				...positions,
				[route]: position
			}));
		},
		// Get scroll position for a specific route
		get: (route) => {
			let currentPositions;
			subscribe(positions => {
				currentPositions = positions;
			})();
			return currentPositions[route] || 0;
		},
		// Clear scroll position for a specific route
		clear: (route) => {
			update(positions => {
				const { [route]: _, ...rest } = positions;
				return rest;
			});
		},
		// Clear all scroll positions
		clearAll: () => {
			set({});
		}
	};
}

export const scrollPosition = createScrollPositionStore();
