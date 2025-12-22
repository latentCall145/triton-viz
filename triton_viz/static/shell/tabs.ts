import type { Tab } from './state.ts';

// Maps internal IDs ('graph', 'op') to readable labels ('Graph', 'Op').
const TAB_LABELS: Record<Tab, string> = {
    graph: 'Graph',
    op: 'Op'
};

type CreateTabsArgs = {
    mountEl: HTMLElement;           // The HTML element to put the tabs inside
    activeTab: Tab;                 // Which tab starts as active
    onTabChange: (tab: Tab) => void; // Function to call when a tab is clicked
};

type TabsApi = {
    setActive: (tab: Tab) => void;  // Function to change the visual active state
};

// Creates the tab buttons and attaches them to the DOM.
export const createTabs = ({ mountEl, activeTab, onTabChange }: CreateTabsArgs): TabsApi => {
    // Store references to the button elements so we can update them later
    const buttons: Partial<Record<Tab, HTMLButtonElement>> = {};

    // Loop through our definitions and create a button for each
    Object.entries(TAB_LABELS).forEach(([tab, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'tab-button';
        button.textContent = label;
        button.dataset.tab = tab;

        // When clicked, tell the parent component via the callback
        button.addEventListener('click', () => onTabChange(tab as Tab));

        mountEl.appendChild(button);
        buttons[tab as Tab] = button;
    });

    // Helper to visually highlight the correct button
    const setActive = (tab: Tab) => {
        (Object.keys(buttons) as Tab[]).forEach((key) => {
            // Add 'active' class to the matching button, remove from others
            buttons[key]?.classList.toggle('active', key === tab);
        });
    };

    // Set the initial state
    setActive(activeTab);

    return { setActive };
};
