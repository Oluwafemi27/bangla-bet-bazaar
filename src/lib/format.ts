export function bdt(n: number | string | null | undefined): string {
  const num = Number(n ?? 0);
  return "৳" + num.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}

export function bnNum(n: number | string): string {
  const map = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return String(n).replace(/\d/g, (d) => map[+d]);
}
