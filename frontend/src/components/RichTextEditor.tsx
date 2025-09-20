import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import Strike from "@tiptap/extension-strike";
import Heading from "@tiptap/extension-heading";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Blockquote from "@tiptap/extension-blockquote";
import Code from "@tiptap/extension-code";
import Highlight from "@tiptap/extension-highlight";
import History from "@tiptap/extension-history";
import { useEffect } from "react";

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export default function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      Strike,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Code,
      Highlight,
      History,
    ],
    content: value,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none focus:outline-none min-h-[60vh] p-6",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) editor.commands.setContent(value);
  }, [value]);

  if (!editor) return null;

  const Btn = ({
    on,
    active,
    label,
  }: {
    on: () => void;
    active?: boolean;
    label: string;
  }) => (
    <button
      onClick={on}
      className={`px-2 py-1 rounded text-sm border ${active ? "bg-black text-white" : "hover:bg-gray-100"}`}
    >
      {label}
    </button>
  );

  return (
    <div className="border rounded bg-white">
      <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50">
        <Btn
          label="B"
          active={editor.isActive("bold")}
          on={() => editor.chain().focus().toggleBold().run()}
        />
        <Btn
          label="I"
          active={editor.isActive("italic")}
          on={() => editor.chain().focus().toggleItalic().run()}
        />
        <Btn
          label="U"
          active={editor.isActive("underline")}
          on={() => editor.chain().focus().toggleUnderline().run()}
        />
        <Btn
          label="S"
          active={editor.isActive("strike")}
          on={() => editor.chain().focus().toggleStrike().run()}
        />
        <Btn
          label="H1"
          active={editor.isActive("heading", { level: 1 })}
          on={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        />
        <Btn
          label="H2"
          active={editor.isActive("heading", { level: 2 })}
          on={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        />
        <Btn
          label="H3"
          active={editor.isActive("heading", { level: 3 })}
          on={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        />
        <Btn
          label="• List"
          active={editor.isActive("bulletList")}
          on={() => editor.chain().focus().toggleBulletList().run()}
        />
        <Btn
          label="1. List"
          active={editor.isActive("orderedList")}
          on={() => editor.chain().focus().toggleOrderedList().run()}
        />
        <Btn
          label="> Quote"
          active={editor.isActive("blockquote")}
          on={() => editor.chain().focus().toggleBlockquote().run()}
        />
        <Btn
          label="Code"
          active={editor.isActive("code")}
          on={() => editor.chain().focus().toggleCode().run()}
        />
        <Btn
          label="HL"
          active={editor.isActive("highlight")}
          on={() => editor.chain().focus().toggleHighlight().run()}
        />
        <Btn label="↺" on={() => editor.chain().focus().undo().run()} />
        <Btn label="↻" on={() => editor.chain().focus().redo().run()} />
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
