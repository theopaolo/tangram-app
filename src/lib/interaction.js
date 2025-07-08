/**
 * Creates a generic handler for pointer interactions.
 * It distinguishes between a tap and a drag.
 * @param {object} callbacks - Functions to call for each interaction type.
 * @returns {function} A pointerDown event handler to attach to a node.
 */
export default function createInteractionHandler({ onDown, onDrag, onEnd }) {
	const state = { isDragging: false, startX: 0, startY: 0, startTime: 0 };
	const TAP_THRESHOLD_MS = 250;
	const DRAG_THRESHOLD_PX = 10;

	const handlePointerMove = (e) => {
		if (!state.isDragging) {
			const dx = e.clientX - state.startX;
			const dy = e.clientY - state.startY;
			if (Math.hypot(dx, dy) > DRAG_THRESHOLD_PX) {
				state.isDragging = true;
			}
		}

		if (state.isDragging) {
			onDrag?.(e);
		}
	};

	const handlePointerUp = (e) => {
		window.removeEventListener('pointermove', handlePointerMove);
		const duration = Date.now() - state.startTime;
		const wasTap = !state.isDragging && duration < TAP_THRESHOLD_MS;
		onEnd?.(e, wasTap, state.isDragging);
	};

	// This is the function we'll attach to our element
	return function handlePointerDown(e) {
		e.stopPropagation();
		state.isDragging = false;
		state.startX = e.clientX;
		state.startY = e.clientY;
		state.startTime = Date.now();

		onDown?.(e);

		window.addEventListener('pointermove', handlePointerMove);
		window.addEventListener('pointerup', handlePointerUp, { once: true });
	};
}
