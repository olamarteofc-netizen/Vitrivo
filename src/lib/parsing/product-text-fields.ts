export function parseBenefitsText(text: string): string[] {
  return text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .slice(0, 20);
}

export function benefitsToText(benefits: string[]): string {
  return benefits.join("\n");
}

export function parseSpecificationsText(text: string): { label: string; value: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const idx = line.indexOf(":");
      if (idx === -1) return { label: line, value: "" };
      return { label: line.slice(0, idx).trim(), value: line.slice(idx + 1).trim() };
    })
    .filter((s) => s.label && s.value)
    .slice(0, 30);
}

export function specificationsToText(specs: { label: string; value: string }[]): string {
  return specs.map((s) => `${s.label}: ${s.value}`).join("\n");
}
