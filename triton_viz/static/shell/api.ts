// Default Python code to show if we can't load any real data.
// This ensures the editor is never just empty/blank.
const stubCode = `# triton viz shell
# waiting for kernel source data

def kernel(X, Y):
    acc = 0
    for i in range(16):
        acc += X[i] * Y[i]
    return acc
`;

// Defines the structure of the data we expect from the server.
// "KernelPayload" is the raw JSON, "KernelData" is our clean version.
type KernelPayload = {
    ops?: { kernel_src?: string };
    source?: { text?: string };
    kernel_src?: string;
    [key: string]: unknown;
};

type KernelData = {
    code: string;
    raw: KernelPayload;
};

// Helper function to clean up the raw data from the server.
// It checks multiple possible locations for the source code.
const normalize = (data: KernelPayload | null): KernelData => {
    const code = data?.ops?.kernel_src
        || data?.source?.text
        || data?.kernel_src
        || '';

    // Return the found code, or use our default "stubCode" if nothing was found.
    return {
        code: code || stubCode,
        raw: data ?? {}
    };
};

// Main function to get data. It uses a "try/catch" strategy:
// 1. Try fetching the new "v2" API.
// 2. If that fails, try the older "v1" API.
// 3. If that also fails, return the default stub code.
export const fetchKernelData = async (): Promise<KernelData> => {
    try {
        // Attempt 1: Version 2 API
        const response = await fetch('/api/data?version=2');
        if (!response.ok) {
            throw new Error('v2 fetch failed');
        }
        return normalize(await response.json());
    } catch (_error) {
        try {
            // Attempt 2: Fallback to Version 1 API
            const response = await fetch('/api/data');
            if (!response.ok) {
                throw new Error('v1 fetch failed');
            }
            return normalize(await response.json());
        } catch (_fallbackError) {
            // Final Fallback: Just return empty/stub data
            return normalize(null);
        }
    }
};
