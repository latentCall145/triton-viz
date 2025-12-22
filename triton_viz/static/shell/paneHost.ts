import type { Selection, Tab } from './state.ts';

// Helper to show a "Drop content here" message if a pane is empty.
const ensurePlaceholder = (paneEl: HTMLElement, label: string) => {
    if (paneEl.children.length > 0) {
        return;
    }
    paneEl.innerHTML = `
        <div class="pane-placeholder">
            <div class="pane-title">${label}</div>
            <div class="pane-note">Drop embed content here when ready.</div>
            <div class="pane-selection" data-selection>no line selected</div>
        </div>
    `;
};

// Helper to clear old content and insert new content.
const setContent = (paneEl: HTMLElement, content: string | HTMLElement | null) => {
    paneEl.innerHTML = '';
    if (typeof content === 'string') {
        paneEl.innerHTML = content;
        return;
    }
    if (content) {
        paneEl.appendChild(content);
    }
};

type CreatePaneHostArgs = {
    graphEl: HTMLElement; // Container for the Graph view
    opEl: HTMLElement;    // Container for the Operations view
};

type PaneHostApi = {
    show: (tab: Tab) => void;
    render: (tab: Tab, content: string | HTMLElement | null) => void;
    injectIframe: (tab: Tab, url: string) => void;
    updateSelection: (selection: Selection | null) => void;
};

// Manages the right-side display area.
export const createPaneHost = ({ graphEl, opEl }: CreatePaneHostArgs): PaneHostApi => {
    // Setup initial empty states
    ensurePlaceholder(graphEl, 'Graph');
    ensurePlaceholder(opEl, 'Op');

    // Find the specific elements where we display selection info (line numbers)
    const selectionEls: Record<Tab, Element | null> = {
        graph: graphEl.querySelector('[data-selection]'),
        op: opEl.querySelector('[data-selection]')
    };

    // Switches visibility between Graph and Op panes
    const show = (tab: Tab) => {
        graphEl.classList.toggle('active', tab === 'graph');
        opEl.classList.toggle('active', tab === 'op');
    };

    // Renders content into the active pane
    const render = (tab: Tab, content: string | HTMLElement | null) => {
        if (tab === 'graph') {
            setContent(graphEl, content);
        } else {
            setContent(opEl, content);
        }
    };

    // Creates a secure iframe to load external content
    const injectIframe = (tab: Tab, url: string) => {
        const frame = document.createElement('iframe');
        frame.src = url;
        // Sandbox for security: allow scripts but prevent navigation/popups
        frame.setAttribute('sandbox', 'allow-scripts allow-same-origin');
        frame.setAttribute('referrerpolicy', 'no-referrer');
        frame.style.border = '0';
        frame.style.width = '100%';
        frame.style.height = '100%';
        render(tab, frame);
    };

    // Updates the "line X selected" text in the UI
    const updateSelection = (selection: Selection | null) => {
        const text = selection?.line
            ? `line ${selection.line}: ${selection.text || ''}`
            : 'no line selected';
        Object.values(selectionEls).forEach((el) => {
            if (el) {
                el.textContent = text;
            }
        });
    };

    return {
        show,
        render,
        injectIframe,
        updateSelection
    };
};
