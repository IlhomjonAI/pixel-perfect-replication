/** Match Uzbek text regardless of the keyboard's apostrophe glyph or extra spaces. */
export function normalizeSearch(value: string) {
  return value
    .replace(/['‘’ʻʼ`´]/g, "")
    .normalize("NFKC")
    .toLocaleLowerCase("uz")
    .replace(/\s+/g, " ")
    .trim();
}

export function matchesSearch(text: string, query: string) {
  const haystack = normalizeSearch(text);
  return normalizeSearch(query)
    .split(" ")
    .every((word) => haystack.includes(word));
}
