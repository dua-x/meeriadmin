"use client";

interface ComboBoxProps {
  value: string;
  onChange: (value: string) => void;  // Changed from onChangeAction
  options: { label: string; value: string }[];
  placeholder?: string;
}

export function ComboBox({ value, onChange, options, placeholder }: ComboBoxProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="border rounded px-3 py-2 w-full text-sm"
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}