/**
 * Shared store for managing found pieces state and localStorage persistence
 */

import { browser } from '$app/environment';
import { writable, get } from 'svelte/store';
import { activeChromogramId } from './chromogramStore.js';

// Found pieces are scoped per chromogramme set so progress in one set does not
// leak into another. Key: `piece_<chromogramId>`.
const keyForActiveSet = () => `piece_${get(activeChromogramId)}`;

/**
 * PiecesStore class for managing found pieces with localStorage persistence
 */
class PiecesStore {
    #pieces = [];
    #hasInitialized = false;
    #store = writable([]);

    constructor() {
        // Subscribe to our own store to get the subscribe method
        this.subscribe = this.#store.subscribe;

        // When the active set changes, reload progress for the new set.
        if (browser) {
            activeChromogramId.subscribe(() => {
                if (this.#hasInitialized) {
                    this.#pieces = this.#loadFromStorage();
                    this.#update();
                }
            });
        }
    }

    /**
     * Load pieces from localStorage
     * @private
     */
    #loadFromStorage() {
        if (!browser) return [];

        try {
            const stored = localStorage.getItem(keyForActiveSet());
            return stored ? stored.split(',').filter(Boolean) : [];
        } catch (e) {
            console.error('Could not read from localStorage:', e);
            return [];
        }
    }

    /**
     * Save pieces to localStorage
     * @private
     */
    #saveToStorage() {
        if (!browser || !this.#hasInitialized) return;

        try {
            localStorage.setItem(keyForActiveSet(), this.#pieces.join(','));
        } catch (e) {
            console.error('Could not save to localStorage:', e);
        }
    }

    /**
     * Update internal state and notify subscribers
     * @private
     */
    #update() {
        this.#store.set([...this.#pieces]);
    }

    /**
     * Initialize the store by loading from localStorage
     */
    initialize() {
        this.#pieces = this.#loadFromStorage();
        this.#hasInitialized = true;
        this.#update();
    }

    /**
     * Add a piece to the found pieces if it's not already there
     * @param {string} pieceId - The piece ID to add
     */
    addPiece(pieceId) {
        if (pieceId && !this.#pieces.includes(pieceId)) {
            this.#pieces = [...this.#pieces, pieceId];
            this.#saveToStorage();
            this.#update();
        }
    }

    /**
     * Remove a piece from the found pieces
     * @param {string} pieceId - The piece ID to remove
     */
    removePiece(pieceId) {
        this.#pieces = this.#pieces.filter(id => id !== pieceId);
        this.#saveToStorage();
        this.#update();
    }

    /**
     * Check if a piece has been found
     * @param {string} pieceId - The piece ID to check
     * @returns {boolean} True if the piece has been found
     */
    hasPiece(pieceId) {
        return this.#pieces.includes(pieceId);
    }

    /**
     * Clear all found pieces
     */
    clear() {
        this.#pieces = [];
        this.#saveToStorage();
        this.#update();
    }

    // Getters
    /**
     * Get all found pieces
     * @returns {string[]} Array of found piece IDs
     */
    get pieces() {
        return [...this.#pieces];
    }

    /**
     * Get the total number of found pieces
     * @returns {number} Number of found pieces
     */
    get count() {
        return this.#pieces.length;
    }

    /**
     * Check if the store has been initialized
     * @returns {boolean} True if initialized
     */
    get hasInitialized() {
        return this.#hasInitialized;
    }
}

// Create a singleton instance for global use
export const piecesStore = new PiecesStore();