import { useState, useEffect, useRef } from "react";

interface InlineEditProps {
  value: string;
  onSave: (newValue: string) => void;
  onCancel: () => void;
  className?: string;
  placeholder?: string;
}

export default function InlineEdit({
  value,
  onSave,
  onCancel,
  className = "",
  placeholder = "",
}: InlineEditProps) {
  const [editValue, setEditValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setEditValue(value);
    if (inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSave(editValue);
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const handleBlur = () => {
    onSave(editValue);
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={editValue}
      onChange={(e) => setEditValue(e.target.value)}
      onKeyDown={handleKeyDown}
      onBlur={handleBlur}
      className={`px-1 py-0.5 border border-blue-500 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      placeholder={placeholder}
    />
  );
}
