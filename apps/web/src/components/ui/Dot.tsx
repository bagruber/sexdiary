interface Props {
  color: string;
  size?: number;
}

export function Dot({ color, size = 7 }: Props) {
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
        display: "inline-block",
      }}
    />
  );
}
