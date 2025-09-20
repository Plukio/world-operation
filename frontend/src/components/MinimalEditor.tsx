import { useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import Strike from '@tiptap/extension-strike';
import Heading from '@tiptap/extension-heading';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import Blockquote from '@tiptap/extension-blockquote';
import Code from '@tiptap/extension-code';
import Highlight from '@tiptap/extension-highlight';
import { useFirebaseStore } from '../store/useFirebaseStore';

interface MinimalEditorProps {
  currentSceneId?: string;
  currentSceneTitle?: string;
}

export default function MinimalEditor({ currentSceneId }: MinimalEditorProps) {
  const { editor: storeEditor, setEditorHtml } = useFirebaseStore();
  const [showFormatting, setShowFormatting] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Strike,
      Heading.configure({
        levels: [1, 2, 3],
      }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Code,
      Highlight,
    ],
    content: storeEditor.html,
    onUpdate: ({ editor }) => {
      setEditorHtml(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none p-6',
      },
    },
  });

  if (!editor) {
    return null;
  }

  const FormattingToolbar = () => (
    <div className="border-b border-gray-200 p-2 bg-gray-50 flex items-center space-x-1">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`p-2 rounded ${editor.isActive('bold') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Bold"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h9a4 4 0 014 4 4 4 0 01-4 4H6z" />
        </svg>
      </button>
      
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`p-2 rounded ${editor.isActive('italic') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Italic"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M8 20h4M12 4l-2 16" />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        className={`p-2 rounded ${editor.isActive('underline') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Underline"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4v16M18 4v16M6 4h12M6 20h12" />
        </svg>
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Heading 1"
      >
        H1
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Heading 2"
      >
        H2
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded ${editor.isActive('heading', { level: 3 }) ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Heading 3"
      >
        H3
      </button>

      <div className="w-px h-6 bg-gray-300 mx-1"></div>

      <button
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded ${editor.isActive('bulletList') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Bullet List"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded ${editor.isActive('orderedList') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Numbered List"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded ${editor.isActive('blockquote') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Quote"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`p-2 rounded ${editor.isActive('code') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Code"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      </button>

      <button
        onClick={() => editor.chain().focus().toggleHighlight().run()}
        className={`p-2 rounded ${editor.isActive('highlight') ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-200'}`}
        title="Highlight"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
        </svg>
      </button>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-white">
      {currentSceneId ? (
        <>
          {/* Formatting Toggle */}
          <div className="border-b border-gray-200 px-4 py-2 bg-gray-50">
            <button
              onClick={() => setShowFormatting(!showFormatting)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {showFormatting ? 'Hide' : 'Show'} Formatting
            </button>
          </div>

          {/* Formatting Toolbar */}
          {showFormatting && <FormattingToolbar />}

          {/* Editor */}
          <div className="flex-1 overflow-y-auto">
            <EditorContent editor={editor} />
          </div>
        </>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No scene selected</h3>
            <p className="text-gray-500">Choose a scene from the sidebar to start writing</p>
          </div>
        </div>
      )}
    </div>
  );
}
