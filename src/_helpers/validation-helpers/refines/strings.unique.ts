export function uniqueStringsIgnoreCase(arr: string[]): boolean {
  const lowerCasedArray = arr.map((str) => str.toLowerCase());
  const uniqueSet = new Set(lowerCasedArray);
  return uniqueSet.size === lowerCasedArray.length; // Check uniqueness
}
