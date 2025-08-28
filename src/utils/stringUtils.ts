export function normalizeText(str: string) {
  return str
    .normalize('NFD') // décompose caractères accentués
    .replace(/[\u0300-\u036f]/g, '') // supprime accents
    .replace(/œ/g, 'oe') // gère ligatures manuellement
    .replace(/æ/g, 'ae')
}

export function matchWordsInsensitive(word1: string, word2: string) {
  return normalizeText(word1).toLowerCase() === normalizeText(word2).toLowerCase()
}
