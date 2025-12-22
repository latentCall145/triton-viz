const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

type CreateSplitArgs = {
    rootEl: HTMLElement;           // The main container
    leftPane: HTMLElement;         // The left content area
    rightPane: HTMLElement;        // The right content area
    gutter: HTMLElement;           // The draggable handle in the middle
    initialLeftWidth: number;      // Starting width percentage
    onResize: (width: number) => void; // Callback when resizing finishes
};

type SplitApi = {
    applyLeftWidth: (percent: number) => void;
};

// Enables the draggable "gutter" to resize the left and right panels.
export const createSplit = ({
    rootEl,
    leftPane,
    rightPane,
    gutter,
    initialLeftWidth,
    onResize
}: CreateSplitArgs): SplitApi => {
    let isDragging = false;
    let currentLeftWidth = initialLeftWidth;

    // Updates the CSS width of the panels based on percentage
    const applyLeftWidth = (percent: number) => {
        const clamped = clamp(percent, 0, 100);
        currentLeftWidth = clamped;
        leftPane.style.width = `${clamped}%`;
        rightPane.style.width = `${100 - clamped}%`;
    };

    // Calculates the new width percentage based on mouse/touch position
    const updateFromPointer = (event: PointerEvent) => {
        const rect = rootEl.getBoundingClientRect();
        const offset = event.clientX - rect.left; // Mouse X relative to container
        const percent = (offset / rect.width) * 100;
        applyLeftWidth(percent);
        return clamp(percent, 0, 100);
    };

    // Called every time the mouse moves while dragging
    const onPointerMove = (event: PointerEvent) => {
        if (!isDragging) {
            return;
        }
        updateFromPointer(event);
    };

    // Called when the user releases the mouse button
    const onPointerUp = (event: PointerEvent) => {
        if (!isDragging) {
            return;
        }
        isDragging = false;
        gutter.classList.remove('dragging');
        gutter.releasePointerCapture(event.pointerId); // Stop tracking this pointer

        const percent = updateFromPointer(event);
        onResize(percent); // Save the final new width

        // Clean up global event listeners
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('pointerup', onPointerUp);
    };

    // Start dragging when the user clicks down on the gutter
    gutter.addEventListener('pointerdown', (event) => {
        isDragging = true;
        gutter.classList.add('dragging');
        gutter.setPointerCapture(event.pointerId); // Keep tracking even if mouse leaves the element

        // Listen for moves/up on the whole window so you don't lose the drag
        // if you move your mouse too fast outside the gutter.
        window.addEventListener('pointermove', onPointerMove);
        window.addEventListener('pointerup', onPointerUp);
    });

    // Handle window resizing (e.g. if user resizes browser window)
    window.addEventListener('resize', () => applyLeftWidth(currentLeftWidth));

    // Set initial layout
    applyLeftWidth(initialLeftWidth);

    return { applyLeftWidth };
};
