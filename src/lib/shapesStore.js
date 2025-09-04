import { writable } from 'svelte/store';

// command: null | { type: 'intro' | 'index' | 'depart', payload?: any }
export const shapesCommand = writable(null);

export function setShapesLayout(layout, payload = {}) {
  shapesCommand.set({ type: layout, payload });
}

// Control stacking order: foreground on intro, background elsewhere
export const isShapesForeground = writable(false);
export function setShapesForeground(value) {
  isShapesForeground.set(!!value);
}
