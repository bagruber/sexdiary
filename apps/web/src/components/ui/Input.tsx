import { useApp } from "../../state/store";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}

export function Input({ value, onChange, placeholder, type = "text" }: Props) {
  const { palette } = useApp();
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        padding: "12px 14px",
        borderRadius: 12,
        border: `1.5px solid ${palette.border}`,
        background: palette.cardEl,
        fontSize: 14,
        color: palette.text,
        outline: "none",
        transition: "border .15s",
        boxSizing: "border-box",
      }}
      onFocus={(e) => (e.target.style.borderColor = palette.teal)}
      onBlur={(e) => (e.target.style.borderColor = palette.border)}
    />
  );
}
