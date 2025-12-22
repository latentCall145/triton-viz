import {
    EditorSelection,
    EditorState,
    EditorView,
    classHighlighter,
    defaultKeymap,
    drawSelection,
    LanguageSupport,
    LRLanguage,
    delimitedIndent,
    history,
    historyKeymap,
    highlightActiveLine,
    highlightActiveLineGutter,
    indentNodeProp,
    indentOnInput,
    indentUnit,
    indentWithTab,
    keymap,
    lineNumbers,
    pythonParser,
    syntaxHighlighting
} from '../vendor/codemirror/codemirror.bundle.js';

import type { Selection } from './state.ts';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

// --- Python Indentation Logic Start ---
// These functions help the editor know how much to indent new lines
// (e.g., after a colon ':') just like a real Python IDE.

const innerBody = (context: any) => {
    let { node, pos } = context;
    let lineIndent = context.lineIndent(pos, -1);
    let found = null;
    // Walk backwards to find the parent block (like a 'def' or 'if')
    for (;;) {
        const before = node.childBefore(pos);
        if (!before) {
            break;
        } else if (before.name === 'Comment') {
            pos = before.from;
        } else if (before.name === 'Body' || before.name === 'MatchBody') {
            if (context.baseIndentFor(before) + context.unit <= lineIndent) {
                found = before;
            }
            node = before;
        } else if (before.name === 'MatchClause') {
            node = before;
        } else if (before.type.is('Statement')) {
            node = before;
        } else {
            break;
        }
    }
    return found;
};

const indentBody = (context: any, node: any) => {
    const base = context.baseIndentFor(node);
    const line = context.lineAt(context.pos, -1);
    const to = line.from + line.text.length;
    // Prevent over-indenting empty lines or comments
    if (
        /^\s*($|#)/.test(line.text)
        && context.node.to < to + 100
        && !/\S/.test(context.state.sliceDoc(to, context.node.to))
        && context.lineIndent(context.pos, -1) <= base
    ) {
        return null;
    }
    // Handle dedent for 'else', 'elif', etc.
    if (
        /^\s*(else:|elif |except |finally:|case\s+[^=:]+:)/.test(context.textAfter)
        && context.lineIndent(context.pos, -1) > base
    ) {
        return null;
    }
    return base + context.unit;
};

// Define a custom Python Language configuration for CodeMirror
const pythonLanguage = LRLanguage.define({
    parser: pythonParser.configure({
        props: [
            indentNodeProp.add({
            Body: (context: any) => {
                const body = (/^\s*(#|$)/.test(context.textAfter) && innerBody(context)) || context.node;
                return indentBody(context, body) ?? context.continue();
            },
            MatchBody: (context: any) => {
                const body = innerBody(context) || context.node;
                return indentBody(context, body) ?? context.continue();
            },
            IfStatement: (context: any) => (/^\s*(else:|elif )/.test(context.textAfter)
                ? context.baseIndent
                : context.continue()),
            'ForStatement WhileStatement': (context: any) => (/^\s*else:/.test(context.textAfter)
                ? context.baseIndent
                : context.continue()),
            TryStatement: (context: any) => (/^\s*(except[ :]|finally:|else:)/.test(context.textAfter)
                ? context.baseIndent
                : context.continue()),
            MatchStatement: (context: any) => (/^\s*case /.test(context.textAfter)
                ? context.baseIndent + context.unit
                : context.continue()),
            'TupleExpression ComprehensionExpression ParamList ArgList ParenthesizedExpression': delimitedIndent({
                closing: ')'
            }),
            'DictionaryExpression DictionaryComprehensionExpression SetExpression SetComprehensionExpression': delimitedIndent({
                closing: '}'
            }),
            'ArrayExpression ArrayComprehensionExpression': delimitedIndent({ closing: ']' }),
            MemberExpression: (context: any) => context.baseIndent + context.unit,
            'String FormatString': () => null,
            Script: (context: any) => {
                const body = innerBody(context);
                return (body && indentBody(context, body)) ?? context.continue();
            }
            })
        ]
    }),
    languageData: {
        commentTokens: { line: '#' },
        indentOnInput: /^\s*([\}\]\)]|else:|elif |except |finally:|case\s+[^:]*:?)$/
    }
});
const pythonSupport = new LanguageSupport(pythonLanguage);
// --- Python Indentation Logic End ---

type CreateEditorArgs = {
    mountEl: HTMLElement;
    text: string;
    onSelect: (selection: Selection) => void;
};

type EditorApi = {
    highlightLine: (lineNumber: number) => void;
    setText: (value: string) => void;
};

// Initializes the CodeMirror editor
export const createEditor = ({ mountEl, text, onSelect }: CreateEditorArgs): EditorApi => {
    // 1. Define the visual theme (colors, fonts)
    const theme = EditorView.theme(
        {
            '&': {
                height: '100%',
                backgroundColor: 'var(--editor-bg)',
                color: 'var(--text)'
            },
            '.cm-content': {
                fontFamily: '"SFMono-Regular", "Menlo", "Monaco", "Consolas", "Liberation Mono", monospace',
                fontSize: '0.9rem'
            },
            '.cm-gutters': {
                backgroundColor: '#0d111b',
                color: '#667089',
                border: 'none'
            },
            '.cm-activeLine': {
                backgroundColor: 'var(--editor-active)'
            },
            '.cm-activeLineGutter': {
                color: 'var(--text)'
            }
        },
        { dark: true }
    );

    // 2. Helper to extract the currently selected line details
    const getSelection = (state: any): Selection => {
        const head = state.selection.main.head;
        const line = state.doc.lineAt(head);
        return { line: line.number, text: line.text, source: 'editor' };
    };

    // 3. Listener that triggers when the user clicks or types
    const selectionListener = EditorView.updateListener.of((update: any) => {
        if (update.selectionSet || update.docChanged) {
            onSelect(getSelection(update.state));
        }
    });

    let anchorLine: number | null = null;

    // 4. Custom mouse handling (e.g. for Shift+Click selection)
    const handleLineSelection = (event: MouseEvent, view: any) => {
        if (event.button !== 0) {
            return false;
        }
        const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
        if (pos === null) {
            return false;
        }
        const line = view.state.doc.lineAt(pos);
        const lineRange = EditorSelection.range(line.from, line.to);

        // Handle Shift+Click (select range of lines)
        if (event.shiftKey) {
            const base = anchorLine ?? view.state.doc.lineAt(view.state.selection.main.head).number;
            const startLine = Math.min(base, line.number);
            const endLine = Math.max(base, line.number);
            const from = view.state.doc.line(startLine).from;
            const to = view.state.doc.line(endLine).to;
            view.dispatch({
                selection: EditorSelection.create([EditorSelection.range(from, to)], 0),
                scrollIntoView: true
            });
            view.focus();
            return true;
        }

        // Handle Ctrl/Cmd+Click (add single line to selection)
        if (event.ctrlKey || event.metaKey) {
            const ranges = view.state.selection.ranges.slice();
            const exists = ranges.some((range) => range.from === lineRange.from && range.to === lineRange.to);
            if (!exists) {
                ranges.push(lineRange);
            }
            view.dispatch({
                selection: EditorSelection.create(ranges, ranges.length - 1),
                scrollIntoView: true
            });
            view.focus();
            anchorLine = line.number;
            return true;
        }

        anchorLine = line.number;
        return false;
    };

    // 5. Build the initial state with all extensions
    const startState = EditorState.create({
        doc: text || '',
        extensions: [
            lineNumbers(),
            highlightActiveLineGutter(),
            EditorState.allowMultipleSelections.of(true),
            EditorState.tabSize.of(4),
            indentUnit.of('    '),
            pythonSupport,
            indentOnInput(),
            keymap.of([indentWithTab, ...defaultKeymap, ...historyKeymap]),
            history(),
            drawSelection(),
            highlightActiveLine(),
            syntaxHighlighting(classHighlighter),
            selectionListener,
            theme
        ]
    });

    // 6. Create the actual Editor View on the page
    const view = new EditorView({
        state: startState,
        parent: mountEl
    });

    // Attach custom mouse handler
    view.dom.addEventListener('mousedown', (event) => {
        if (!event.shiftKey && !event.ctrlKey && !event.metaKey) {
            return;
        }
        if (handleLineSelection(event, view)) {
            event.preventDefault();
        }
    });

    // Initial notification of selection
    onSelect(getSelection(view.state));

    // API to programmatically highlight a line
    const highlightLine = (lineNumber: number) => {
        const safeLine = clamp(lineNumber, 1, view.state.doc.lines);
        const line = view.state.doc.line(safeLine);
        view.dispatch({
            selection: { anchor: line.from },
            scrollIntoView: true
        });
    };

    // API to replace the entire text content
    const setText = (value: string) => {
        const next = value || '';
        const current = view.state.doc.toString();
        if (next === current) {
            return;
        }
        view.dispatch({
            changes: { from: 0, to: current.length, insert: next }
        });
    };

    return {
        highlightLine,
        setText
    };
};
