import { Check } from "lucide-react";
import { useApp } from "../../state/store";

interface Props {
  checked: boolean;
  onChange: (v: boolean) => void;
  label?: string;
  color?: string;
  dim?: boolean;
}

export function Checkbox({ checked, onChange, label, color, dim }: Props) {
  const { palette } = useApp();
  const c = color ?? palette.teal;
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        cursor: "pointer",
        padding: "7px 0",
        minHeight: 44,
        opacity: dim ? 0.45 : 1,
        transition: "opacity .15s",
      }}
    >
      <div
        onClick={(e) => {
          e.preventDefault();
          onChange(!checked);
        }}
        style={{
          width: 22,
          height: 22,
          borderRadius: 7,
          border: `2px solid ${checked ? c : palette.border}`,
          background: checked ? c : "transparent",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all .15s",
          flexShrink: 0,
        }}
      >
        {checked && <Check size={14} strokeWidth={3} color="#fff" />}
      </div>
      {label && (
        <span style={{ fontSize: 14, color: palette.text }}>{label}</span>
      )}
    </label>
  );
}
