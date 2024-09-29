export function removeExtraSpaces(str: string): string {
  return str.trim().replace(/\s+/g, ' ');
}
