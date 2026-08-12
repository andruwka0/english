"use client";

import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";

export function CodeEditor({
  value,
  onChange,
  readOnly = false,
  height = "320px",
}: {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  height?: string;
}) {
  return (
    <CodeMirror
      value={value}
      height={height}
      extensions={[python()]}
      onChange={onChange}
      readOnly={readOnly}
      basicSetup={{ tabSize: 4, autocompletion: false }}
      className="overflow-hidden rounded-2xl border-2 border-primary-soft text-sm"
    />
  );
}
