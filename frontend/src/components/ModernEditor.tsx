import { useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Heading from '@tiptap/extension-heading';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import Link from '@tiptap/extension-link';
import { createLowlight } from 'lowlight';
import {
  Bold as BoldIcon,
  Italic as ItalicIcon,
  Underline as UnderlineIcon,
  Strikethrough as StrikeIcon,
  Type,
  List,
  ListOrdered,
  Quote,
  Code as CodeIcon,
  Code2,
  Highlighter,
  Undo,
  Redo,
  Minus,
  Link as LinkIcon,
  Eye,
  EyeOff
} from 'lucide-react';

interface ModernEditorProps {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  onSave?: () => void;
  isTypewriterMode?: boolean;
  onTypewriterToggle?: () => void;
  isFocusMode?: boolean;
  onFocusToggle?: () => void;
}

export default function ModernEditor({
  value,
  onChange,
  placeholder = "Start writing your story...",
  onSave,
  isTypewriterMode = false,
  onTypewriterToggle,
  isFocusMode = false,
  onFocusToggle
}: ModernEditorProps) {
  // Use placeholder in editor configuration
  const editorPlaceholder = placeholder;
  const lastExternalValue = useRef(value);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Strike,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(),
      }),
      Highlight.configure({
        multicolor: true,
      }),
      HorizontalRule,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 hover:text-blue-800 underline',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-lg max-w-none focus:outline-none ${
          isTypewriterMode ? 'typewriter-mode' : ''
        }`,
        'data-placeholder': editorPlaceholder,
      },
    },
  });

  useEffect(() => {
    if (editor && value !== lastExternalValue.current) {
      // Only update content if the editor is not focused (to avoid interrupting typing)
      if (!editor.isFocused) {
        editor.commands.setContent(value);
        lastExternalValue.current = value;
      }
    }
  }, [value, editor]);

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [editor]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            onSave?.();
            break;
          case 'b':
            e.preventDefault();
            editor?.chain().focus().toggleBold().run();
            break;
          case 'i':
            e.preventDefault();
            editor?.chain().focus().toggleItalic().run();
            break;
          case 'u':
            e.preventDefault();
            editor?.chain().focus().toggleUnderline().run();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor, onSave]);

  if (!editor) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const ToolbarButton = ({ 
    onClick, 
    isActive = false, 
    children, 
    title, 
    disabled = false 
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
    title: string;
    disabled?: boolean;
  }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`p-2 rounded-lg transition-colors ${
        isActive
          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center space-x-1">
          {/* Text Formatting */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold (⌘B)"
            >
              <BoldIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic (⌘I)"
            >
              <ItalicIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              isActive={editor.isActive('underline')}
              title="Underline (⌘U)"
            >
              <UnderlineIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <StrikeIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Headings */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Type className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <span className="text-xs font-bold">H2</span>
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <span className="text-xs font-bold">H3</span>
            </ToolbarButton>
          </div>

          {/* Lists */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Other Formatting */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Inline Code"
            >
              <CodeIcon className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              isActive={editor.isActive('codeBlock')}
              title="Code Block"
            >
              <Code2 className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHighlight().run()}
              isActive={editor.isActive('highlight')}
              title="Highlight"
            >
              <Highlighter className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* History */}
          <div className="flex items-center space-x-1 pr-2 border-r border-gray-300 dark:border-gray-600">
            <ToolbarButton
              onClick={() => editor.chain().focus().undo().run()}
              disabled={!editor.can().undo()}
              title="Undo (⌘Z)"
            >
              <Undo className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => editor.chain().focus().redo().run()}
              disabled={!editor.can().redo()}
              title="Redo (⌘⇧Z)"
            >
              <Redo className="w-4 h-4" />
            </ToolbarButton>
          </div>

          {/* Insert */}
          <div className="flex items-center space-x-1">
            <ToolbarButton
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              title="Horizontal Rule"
            >
              <Minus className="w-4 h-4" />
            </ToolbarButton>
            <ToolbarButton
              onClick={() => {
                const url = window.prompt('Enter URL:');
                if (url) {
                  editor.chain().focus().setLink({ href: url }).run();
                }
              }}
              isActive={editor.isActive('link')}
              title="Add Link"
            >
              <LinkIcon className="w-4 h-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Right Side Controls */}
        <div className="flex items-center space-x-1">
          {onTypewriterToggle && (
            <ToolbarButton
              onClick={onTypewriterToggle}
              isActive={isTypewriterMode}
              title="Typewriter Mode"
            >
              <Type className="w-4 h-4" />
            </ToolbarButton>
          )}
          {onFocusToggle && (
            <ToolbarButton
              onClick={onFocusToggle}
              isActive={isFocusMode}
              title="Focus Mode"
            >
              {isFocusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </ToolbarButton>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6">
          <EditorContent
            editor={editor}
            className="min-h-full"
            style={{
              minHeight: 'calc(100vh - 200px)',
            }}
          />
        </div>
      </div>

      {/* Typewriter Mode Styles */}
      <style>{`
        .typewriter-mode .ProseMirror {
          font-family: 'Courier New', monospace;
        }
        .typewriter-mode .ProseMirror p {
          line-height: 1.8;
        }
      `}</style>
    </div>
  );
}
