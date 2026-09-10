import { useApp } from "../../state/store";

export type Option = string | { value: string; label: string };

interface Props {
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  placeholder?: string;
}

export function Select({ value, onChange, options, placeholder }: Props) {
  const { palette } = useApp();
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: `1.5px solid ${palette.border}`,
        background: palette.cardEl,
        fontSize: 14,
        color: value ? palette.text : palette.muted,
        outline: "none",
        cursor: "pointer",
        boxSizing: "border-box",
      }}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>
            {o}
          </option>
        ) : (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ),
      )}
    </select>
  );
}
