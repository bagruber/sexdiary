let counter = 100;

export function gid(prefix = "x"): string {
  counter += 1;
  return `${prefix}${counter}_${Math.random().toString(36).slice(2, 7)}`;
}

export function genToken(): string {
  const a = new Uint8Array(12);
  if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    crypto.getRandomValues(a);
  } else {
    for (let i = 0; i < 12; i++) a[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(a, (b) => b.toString(16).padStart(2, "0")).join("");
}
