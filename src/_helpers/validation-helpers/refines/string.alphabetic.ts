export function isAlphabeticSpaced(str: string): boolean {
  return /^[A-Za-z\s]+$/.test(str);
}
