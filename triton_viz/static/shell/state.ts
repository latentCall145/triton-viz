// Keys used to save settings in the browser's Local Storage
// so they persist after you refresh the page.
const STORAGE_KEYS = {
    tab: 'tviz:lastTab',
    leftWidth: 'tviz:leftWidth'
};

// Types representing the possible states of our application.
export type Tab = 'graph' | 'op';

export type Selection = {
    line: number;
    text: string;
    source: string;
};

export type ShellState = {
    tab: Tab;          // Which tab is currently active
    leftWidth: number; // Width of the left panel (0-100%)
    code: string;      // The current Python code
    selection: Selection | null; // Which line is highlighted
};

// A "Subscriber" is a function that gets called whenever state changes.
type Subscriber = (next: ShellState, prev: ShellState) => void;

// The initial default state of the application.
let state: ShellState = {
    tab: 'graph',
    leftWidth: 50,
    code: '',
    selection: null
};

// A list of all functions waiting to be notified of changes.
const subscribers = new Set<Subscriber>();

// Helper to keep numbers within a range (e.g., 0 to 100).
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// Helper to safely parse numbers from storage, handling bad/null values.
const safeNumber = (value: string | null) => {
    if (value === null || value === undefined) {
        return null;
    }
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
};

// Loads saved settings from the browser's Local Storage.
// If no settings exist, it uses defaults.
export const loadState = (): ShellState => {
    const storedTab = localStorage.getItem(STORAGE_KEYS.tab);
    const storedWidth = safeNumber(localStorage.getItem(STORAGE_KEYS.leftWidth));

    // Merge saved values into the current state
    state = {
        ...state,
        tab: storedTab === 'op' ? 'op' : 'graph',
        leftWidth: storedWidth === null ? 50 : clamp(storedWidth, 0, 100)
    };
    return { ...state };
};

// Tells all subscribers that the state has changed.
// Passes them the new state AND the previous state.
const notify = (prev: ShellState) => {
    subscribers.forEach((subscriber) => subscriber({ ...state }, prev));
};

// Allows other parts of the app to "listen" for changes.
// Returns a function to "unsubscribe" (stop listening) later.
export const subscribe = (subscriber: Subscriber) => {
    subscribers.add(subscriber);
    return () => subscribers.delete(subscriber);
};

// Returns a copy of the current state.
export const getState = (): ShellState => ({ ...state });

// Updates the active tab and saves it to storage.
export const setTab = (tab: Tab) => {
    if (tab !== 'graph' && tab !== 'op') {
        return;
    }
    if (state.tab === tab) {
        return; // Don't update if nothing changed
    }
    const prev = { ...state };
    state = { ...state, tab };
    localStorage.setItem(STORAGE_KEYS.tab, tab);
    notify(prev);
};

// Updates the left panel width and saves it to storage.
export const setLeftWidth = (width: number) => {
    const nextWidth = clamp(width, 0, 100);
    if (state.leftWidth === nextWidth) {
        return;
    }
    const prev = { ...state };
    state = { ...state, leftWidth: nextWidth };
    localStorage.setItem(STORAGE_KEYS.leftWidth, String(nextWidth));
    notify(prev);
};

// Updates the code text.
export const setCode = (code: string) => {
    if (state.code === code) {
        return;
    }
    const prev = { ...state };
    state = { ...state, code };
    notify(prev);
};

// Updates the text selection (highlighted line).
export const setSelection = (selection: Selection | null) => {
    // Check if the selection is actually different to avoid unnecessary updates
    if (
        state.selection?.line === selection?.line
        && state.selection?.text === selection?.text
        && state.selection?.source === selection?.source
    ) {
        return;
    }
    const prev = { ...state };
    state = { ...state, selection };
    notify(prev);
};
