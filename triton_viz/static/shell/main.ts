import { createEditor } from './editor.ts';
import { createPaneHost } from './paneHost.ts';
import { createSplit } from './split.ts';
import { createTabs } from './tabs.ts';
import {
    loadState,
    subscribe,
    setCode,
    setLeftWidth,
    setSelection,
    setTab
} from './state.ts';
import { fetchKernelData } from './api.ts';

// 1. Initialize State
// Load any previous settings (like which tab was open) from the browser memory.
const state = loadState();

// 2. Get References to DOM Elements
// These are the empty HTML boxes we will fill with our application components.
const tabBar = document.getElementById('tab-bar')!;
const splitRoot = document.getElementById('split-root')!;
const leftPane = document.getElementById('left-pane')!;
const rightPane = document.getElementById('right-pane')!;
const gutter = document.getElementById('gutter')!;
const editorHost = document.getElementById('editor-host')!;
const graphPane = document.getElementById('graph-pane')!;
const opPane = document.getElementById('op-pane')!;

// 3. Create Components

// Tabs: The buttons at the top ("Graph", "Op")
const tabs = createTabs({
    mountEl: tabBar,
    activeTab: state.tab,
    onTabChange: setTab // When clicked, update the global state
});

// Add a spacer and a 'Run' button (visual only for now)
const tabSpacer = document.createElement('div');
tabSpacer.className = 'tab-spacer';
tabBar.appendChild(tabSpacer);

const runButton = document.createElement('button');
runButton.type = 'button';
runButton.className = 'run-button';
runButton.setAttribute('aria-label', 'Run');
runButton.setAttribute('title', 'Run');
tabBar.appendChild(runButton);

// Split: The resizable divider between code and visualization
const split = createSplit({
    rootEl: splitRoot,
    leftPane,
    rightPane,
    gutter,
    initialLeftWidth: state.leftWidth,
    onResize: setLeftWidth // When dragged, save the new width
});

// Editor: The code typing area on the left
const editor = createEditor({
    mountEl: editorHost,
    text: state.code,
    onSelect: setSelection // When a line is clicked, update global selection
});

// PaneHost: The content area on the right (shows Graph or Ops)
const paneHost = createPaneHost({
    graphEl: graphPane,
    opEl: opPane
});

// Show the correct initial pane
paneHost.show(state.tab);

// 4. Subscribe to State Changes
// This is the core logic: "When data changes, update the screen."
subscribe((nextState, prevState) => {
    // If the tab changed, update the buttons and show the correct pane
    if (nextState.tab !== prevState.tab) {
        tabs.setActive(nextState.tab);
        paneHost.show(nextState.tab);
    }
    // If the width changed (e.g. via code), update the splitter
    if (nextState.leftWidth !== prevState.leftWidth) {
        split.applyLeftWidth(nextState.leftWidth);
    }
    // If the code changed (e.g. from network fetch), update the editor
    if (nextState.code !== prevState.code) {
        editor.setText(nextState.code);
    }
    // If the selection changed (e.g. via clicking a node in the graph),
    // highlight the line in the editor and show details in the pane.
    if (nextState.selection !== prevState.selection) {
        if (nextState.selection?.line && nextState.selection.source !== 'editor') {
            editor.highlightLine(nextState.selection.line);
        }
        paneHost.updateSelection(nextState.selection);
    }
});

// 5. Initial Data Fetch
// Go get the code from the server.
fetchKernelData().then((data) => {
    setCode(data.code);
});

// Reload data when the "Run" button is clicked
runButton.addEventListener('click', () => {
    fetchKernelData().then((data) => {
        setCode(data.code);
    });
});
