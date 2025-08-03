/**
 * Creates a generic handler for pointer interactions.
 * It distinguishes between a tap and a drag.
 * Optimized for both mouse and touch devices.
 * @param {object} callbacks - Functions to call for each interaction type.
 * @returns {function} A pointerDown event handler to attach to a node.
 */
export default function createInteractionHandler({ onDown, onDrag, onEnd }) {
	const state = { isDragging: false, startX: 0, startY: 0, startTime: 0 };
	const TAP_THRESHOLD_MS = 350; // Slightly longer for touch devices
	const DRAG_THRESHOLD_PX = 8; // Smaller threshold for touch sensitivity

	const handlePointerMove = (e) => {
		// Handle both pointer and touch events
		e.preventDefault(); // Prevent scrolling/zooming

		// Get coordinates (touch events have different structure)
		const clientX = e.clientX ?? e.touches?.[0]?.clientX;
		const clientY = e.clientY ?? e.touches?.[0]?.clientY;

		if (!clientX || !clientY) return;

		if (!state.isDragging) {
			const dx = clientX - state.startX;
			const dy = clientY - state.startY;
			if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
				state.isDragging = true;
			}
		}

		if (state.isDragging) {
			// Create a normalized event object for consistency
			const normalizedEvent = {
				...e,
				clientX,
				clientY
			};
			onDrag?.(normalizedEvent);
		}
	};

	const handlePointerUp = (e) => {
		// Clean up all event listeners
		window.removeEventListener('pointermove', handlePointerMove);
		window.removeEventListener('touchmove', handlePointerMove);
		window.removeEventListener('pointerup', handlePointerUp);
		window.removeEventListener('touchend', handlePointerUp);

		const duration = Date.now() - state.startTime;
		const wasTap = !state.isDragging && duration < TAP_THRESHOLD_MS;

		// Handle both pointer and touch events for coordinates
		const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX;
		const clientY = e.clientY ?? e.changedTouches?.[0]?.clientY;

		const normalizedEvent = {
			...e,
			clientX: clientX || e.clientX,
			clientY: clientY || e.clientY
		};

		onEnd?.(normalizedEvent, wasTap, state.isDragging);
	};

	// This is the function we'll attach to our element
	return function handlePointerDown(e) {
		e.preventDefault(); // Prevent default touch behaviors
		e.stopPropagation();

		// Handle both pointer and touch events for coordinates
		const clientX = e.clientX ?? e.touches?.[0]?.clientX;
		const clientY = e.clientY ?? e.touches?.[0]?.clientY;

		state.isDragging = false;
		state.startX = clientX;
		state.startY = clientY;
		state.startTime = Date.now();

		// Create normalized event for consistency
		const normalizedEvent = {
			...e,
			clientX,
			clientY
		};

		onDown?.(normalizedEvent);

		window.addEventListener('pointermove', handlePointerMove, { passive: false });
		window.addEventListener('pointerup', handlePointerUp, { once: true });
		// Fallback for older browsers - handle touch events
		window.addEventListener('touchmove', handlePointerMove, { passive: false });
		window.addEventListener('touchend', handlePointerUp, { once: true });
	};
}
