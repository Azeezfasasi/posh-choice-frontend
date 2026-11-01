import { useEffect, useRef, useState } from 'react';
import { useEditor, useEditorState, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle, Color } from '@tiptap/extension-text-style';
import { Placeholder, CharacterCount } from '@tiptap/extensions';
import {
  AlignCenter, AlignJustify, AlignLeft, AlignRight, Bold, ChevronDown, Italic, Link2, List, ListOrdered, Minus,
  Quote, Redo2, RemoveFormatting, Strikethrough, Underline, Undo2,
} from 'lucide-react';

// Brand colours offered in the colour picker (null = default text colour)
const COLORS = [
  { name: 'Default', value: null },
  { name: 'Plum', value: '#5b2a86' },
  { name: 'Ink', value: '#0f1b3d' },
  { name: 'Gold', value: '#a8822f' },
  { name: 'Red', value: '#b42318' },
  { name: 'Green', value: '#067647' },
];

const BLOCKS = [
  { label: 'Paragraph', apply: (c) => c.setParagraph(), active: (e) => e.isActive('paragraph') },
  { label: 'Heading', apply: (c) => c.toggleHeading({ level: 2 }), active: (e) => e.isActive('heading', { level: 2 }) },
  { label: 'Subheading', apply: (c) => c.toggleHeading({ level: 3 }), active: (e) => e.isActive('heading', { level: 3 }) },
];

function ToolButton({ label, active, disabled, onClick, children }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()} // keep the editor selection
      onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-lg transition disabled:opacity-35 disabled:cursor-not-allowed ${
        active ? 'bg-plum-600 text-white' : 'text-ink hover:bg-plum-50 hover:text-plum-700'
      }`}
    >
      {children}
    </button>
  );
}

const Divider = () => <span className="mx-1 h-5 w-px bg-line" aria-hidden="true" />;

function Popover({ open, onClose, children, className = '' }) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className={`absolute top-full mt-1 z-30 rounded-xl border border-line bg-white p-2 shadow-[0_16px_40px_-12px_rgba(15,27,61,0.25)] ${className}`}>
      {children}
    </div>
  );
}

function Toolbar({ editor }) {
  const [menu, setMenu] = useState(null); // 'block' | 'color' | 'link'
  const [linkUrl, setLinkUrl] = useState('');

  // Re-render the toolbar when the selection or formatting changes
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      bold: e.isActive('bold'), italic: e.isActive('italic'), underline: e.isActive('underline'), strike: e.isActive('strike'),
      bullet: e.isActive('bulletList'), ordered: e.isActive('orderedList'), quote: e.isActive('blockquote'), link: e.isActive('link'),
      align: ['left', 'center', 'right', 'justify'].find(a => e.isActive({ textAlign: a })) || 'left',
      block: BLOCKS.find(b => b.active(e))?.label || 'Paragraph',
      color: e.getAttributes('textStyle').color || null,
      canUndo: e.can().undo(), canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();
  const close = () => setMenu(null);

  const openLink = () => {
    setLinkUrl(editor.getAttributes('link').href || '');
    setMenu('link');
  };
  const applyLink = (e) => {
    e.preventDefault();
    const url = linkUrl.trim();
    if (!url) chain().extendMarkRange('link').unsetLink().run();
    else chain().extendMarkRange('link').setLink({ href: /^(https?:|mailto:|tel:|\/)/i.test(url) ? url : `https://${url}` }).run();
    close();
  };

  const alignIcons = { left: AlignLeft, center: AlignCenter, right: AlignRight, justify: AlignJustify };

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-line bg-cream/70 px-2 py-1.5 rounded-t-xl" role="toolbar" aria-label="Formatting">
      <ToolButton label="Undo" disabled={!state.canUndo} onClick={() => chain().undo().run()}><Undo2 className="w-4 h-4" /></ToolButton>
      <ToolButton label="Redo" disabled={!state.canRedo} onClick={() => chain().redo().run()}><Redo2 className="w-4 h-4" /></ToolButton>
      <Divider />

      <div className="relative">
        <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => setMenu(menu === 'block' ? null : 'block')}
          aria-haspopup="menu" aria-expanded={menu === 'block'}
          className="inline-flex items-center gap-1 h-8 rounded-lg px-2.5 text-sm font-medium text-ink hover:bg-plum-50">
          {state.block} <ChevronDown className="w-3.5 h-3.5 text-ink-soft" />
        </button>
        <Popover open={menu === 'block'} onClose={close} className="w-44">
          {BLOCKS.map(b => (
            <button key={b.label} type="button" onClick={() => { b.apply(chain()).run(); close(); }}
              className={`w-full text-left rounded-lg px-3 py-2 hover:bg-cream ${state.block === b.label ? 'text-plum-700 font-semibold' : 'text-ink'} ${
                b.label === 'Heading' ? 'font-display text-lg' : b.label === 'Subheading' ? 'font-display text-base' : 'text-sm'}`}>
              {b.label}
            </button>
          ))}
        </Popover>
      </div>
      <Divider />

      <ToolButton label="Bold (Ctrl+B)" active={state.bold} onClick={() => chain().toggleBold().run()}><Bold className="w-4 h-4" /></ToolButton>
      <ToolButton label="Italic (Ctrl+I)" active={state.italic} onClick={() => chain().toggleItalic().run()}><Italic className="w-4 h-4" /></ToolButton>
      <ToolButton label="Underline (Ctrl+U)" active={state.underline} onClick={() => chain().toggleUnderline().run()}><Underline className="w-4 h-4" /></ToolButton>
      <ToolButton label="Strikethrough" active={state.strike} onClick={() => chain().toggleStrike().run()}><Strikethrough className="w-4 h-4" /></ToolButton>

      <div className="relative">
        <button type="button" title="Text colour" aria-label="Text colour" aria-haspopup="menu" aria-expanded={menu === 'color'}
          onMouseDown={(e) => e.preventDefault()} onClick={() => setMenu(menu === 'color' ? null : 'color')}
          className="inline-flex flex-col items-center justify-center w-8 h-8 rounded-lg text-ink hover:bg-plum-50">
          <span className="text-sm font-bold leading-none">A</span>
          <span className="mt-0.5 h-1 w-4 rounded-full" style={{ backgroundColor: state.color || '#0f1b3d' }} />
        </button>
        <Popover open={menu === 'color'} onClose={close} className="w-40">
          <div className="grid grid-cols-3 gap-1.5">
            {COLORS.map(c => (
              <button key={c.name} type="button" title={c.name} aria-label={c.name}
                onClick={() => { (c.value ? chain().setColor(c.value) : chain().unsetColor()).run(); close(); }}
                className={`h-9 rounded-lg border flex items-center justify-center text-[10px] font-semibold ${
                  (state.color || null) === c.value ? 'border-plum-600 ring-2 ring-plum-200' : 'border-line'}`}
                style={c.value ? { backgroundColor: c.value, color: '#fff' } : { color: '#0f1b3d' }}>
                {c.value ? '' : 'Auto'}
              </button>
            ))}
          </div>
        </Popover>
      </div>
      <Divider />

      {['left', 'center', 'right', 'justify'].map(a => {
        const Icon = alignIcons[a];
        return (
          <ToolButton key={a} label={`Align ${a}`} active={state.align === a} onClick={() => chain().setTextAlign(a).run()}>
            <Icon className="w-4 h-4" />
          </ToolButton>
        );
      })}
      <Divider />

      <ToolButton label="Bulleted list" active={state.bullet} onClick={() => chain().toggleBulletList().run()}><List className="w-4 h-4" /></ToolButton>
      <ToolButton label="Numbered list" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}><ListOrdered className="w-4 h-4" /></ToolButton>
      <ToolButton label="Quote" active={state.quote} onClick={() => chain().toggleBlockquote().run()}><Quote className="w-4 h-4" /></ToolButton>

      <div className="relative">
        <ToolButton label="Link" active={state.link} onClick={openLink}><Link2 className="w-4 h-4" /></ToolButton>
        <Popover open={menu === 'link'} onClose={close} className="w-72 right-0 sm:left-0 sm:right-auto">
          <form onSubmit={applyLink} className="space-y-2">
            <label htmlFor="rte-link" className="block text-xs font-semibold text-ink-soft">Link address</label>
            <input id="rte-link" autoFocus value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://…"
              className="w-full h-9 rounded-lg border border-line px-3 text-sm focus:outline-none focus:border-plum-400" />
            <div className="flex justify-between gap-2">
              {state.link ? (
                <button type="button" onClick={() => { chain().extendMarkRange('link').unsetLink().run(); close(); }}
                  className="text-xs font-semibold text-red-600 hover:underline">Remove link</button>
              ) : <span />}
              <button type="submit" className="rounded-lg bg-plum-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-plum-700">Apply</button>
            </div>
          </form>
        </Popover>
      </div>
      <ToolButton label="Divider line" onClick={() => chain().setHorizontalRule().run()}><Minus className="w-4 h-4" /></ToolButton>
      <Divider />
      <ToolButton label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()}><RemoveFormatting className="w-4 h-4" /></ToolButton>
    </div>
  );
}

/**
 * Rich text editor (TipTap) that reads and writes HTML.
 * @param {{ value: string, onChange: (html: string) => void, placeholder?: string, minHeight?: number, id?: string, invalid?: boolean }} props
 */
function RichTextEditor({ value, onChange, placeholder = 'Start writing…', minHeight = 260, id, invalid }) {
  // Keep the latest callback without re-creating the editor
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: { openOnClick: false, autolink: true, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } },
      }),
      TextStyle,
      Color,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      CharacterCount,
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: 'rich-text focus:outline-none px-4 py-3',
        style: `min-height:${minHeight}px`,
        ...(id ? { id } : {}),
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor: e }) => {
      onChangeRef.current?.(e.isEmpty ? '' : e.getHTML());
    },
  });

  // Load content that arrives later (e.g. when editing an existing record), without fighting the user's typing
  useEffect(() => {
    if (!editor || editor.isFocused) return;
    const current = editor.isEmpty ? '' : editor.getHTML();
    if ((value || '') !== current) editor.commands.setContent(value || '', { emitUpdate: false });
  }, [value, editor]);

  const words = useEditorState({ editor, selector: ({ editor: e }) => e?.storage.characterCount.words() ?? 0 });

  if (!editor) return <div className="rounded-xl border border-line bg-white animate-pulse" style={{ height: minHeight + 48 }} />;

  return (
    <div className={`rounded-xl border bg-white transition focus-within:border-plum-400 focus-within:ring-4 focus-within:ring-plum-100 ${invalid ? 'border-red-400' : 'border-line'}`}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
      <div className="flex justify-end border-t border-line px-3 py-1.5 text-xs text-ink-soft rounded-b-xl">
        {words} word{words === 1 ? '' : 's'}
      </div>
    </div>
  );
}

export default RichTextEditor;
