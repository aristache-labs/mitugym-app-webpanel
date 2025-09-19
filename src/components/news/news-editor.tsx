"use client";

import { BubbleMenu, EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface NewsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function NewsEditor({ value, onChange }: NewsEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: true })],
    content: value,
    editorProps: {
      attributes: {
        class:
          "min-h-[200px] rounded-[16px] border border-surface/50 bg-surface p-4 text-sm text-text focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [editor, value]);

  if (!editor) {
    return null;
  }

  return (
    <div className="space-y-2">
      <BubbleMenu editor={editor} className="flex items-center gap-2 rounded-full bg-surface/80 px-3 py-1 shadow-lg">
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => editor.chain().focus().toggleBulletList().run()}>
          Bullet
        </Button>
      </BubbleMenu>
      <EditorContent editor={editor} />
    </div>
  );
}
