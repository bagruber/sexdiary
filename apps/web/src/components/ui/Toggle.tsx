import { useApp } from "../../state/store";

interface Props {
  value: boolean;
  onChange: (v: boolean) => void;
}

export function Toggle({ value, onChange }: Props) {
  const { palette } = useApp();
  return (
    <div
      onClick={() => onChange(!value)}
      role="switch"
      aria-checked={value}
      style={{
        width: 48,
        height: 28,
        borderRadius: 14,
        background: value ? palette.teal : palette.border,
        position: "relative",
        cursor: "pointer",
        transition: "background .2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "#fff",
          position: "absolute",
          top: 3,
          left: value ? 23 : 3,
          transition: "left .2s",
          boxShadow: "0 1px 4px rgba(0,0,0,.15)",
        }}
      />
    </div>
  );
}
