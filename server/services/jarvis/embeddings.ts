/**
 * Serviço de Embeddings do Jarvis (RAG)
 * ------------------------------------------------------------------
 * Gera vetores de embedding para busca semântica sobre a base de
 * conhecimento (`knowledgeDocuments`).
 *
 * Estratégia de provider (com costura para upgrade sem quebrar contrato):
 *  - DEFAULT: embedding LOCAL determinístico (hashing trick sobre tokens +
 *    trigramas de caracteres, L2-normalizado). Funciona 100% offline, é
 *    determinístico (testável) e dá similaridade de cosseno significativa
 *    para sobreposição léxica/semântica-lexical.
 *  - FUTURO: quando um provider remoto de embeddings estiver disponível
 *    (Forge `/v1/embeddings` ou OpenAI `text-embedding-3-*`), basta
 *    implementar `remoteEmbedding()` e ativar via env EMBEDDINGS_PROVIDER.
 *
 * O restante do RAG (armazenamento, busca por cosseno, ingestão) independe
 * do provider — só depende de `generateEmbedding()` e `EMBEDDING_DIM`.
 */

export const EMBEDDING_DIM = 256;

/** Normaliza texto: minúsculas, remove acentos, colapsa espaços. */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Hash determinístico (FNV-1a 32-bit) de uma string para um inteiro. */
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Extrai features de um texto: tokens (palavras) + trigramas de caracteres. */
function extractFeatures(normalized: string): string[] {
  const tokens = normalized.split(" ").filter(Boolean);
  const features: string[] = [];
  for (const tok of tokens) {
    features.push(`w:${tok}`);
    const padded = `^${tok}$`;
    for (let i = 0; i < padded.length - 2; i++) {
      features.push(`t:${padded.slice(i, i + 3)}`);
    }
  }
  return features;
}

/**
 * Embedding LOCAL determinístico via hashing trick.
 * Cada feature é projetada num índice do vetor com um sinal derivado do hash,
 * acumulada, e o vetor final é L2-normalizado.
 */
export function localEmbedding(text: string): number[] {
  const vec = new Array<number>(EMBEDDING_DIM).fill(0);
  const features = extractFeatures(normalize(text));
  if (features.length === 0) return vec;

  for (const feat of features) {
    const h = fnv1a(feat);
    const idx = h % EMBEDDING_DIM;
    const sign = (h & 0x100) === 0 ? 1 : -1;
    vec[idx] += sign;
  }

  // L2-normalização
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm);
  if (norm === 0) return vec;
  for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  return vec;
}

/**
 * Gera o embedding de um texto. Ponto único de troca de provider.
 * Hoje: local determinístico. Amanhã: remoto (Forge/OpenAI) sob env flag.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  // Espaço reservado para provider remoto:
  // if (process.env.EMBEDDINGS_PROVIDER === "forge") return remoteEmbedding(text);
  return localEmbedding(text);
}

/** Similaridade de cosseno entre dois vetores de mesma dimensão. */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length || a.length === 0) return 0;
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Divide um texto longo em chunks aproximados por tamanho de caractere,
 * quebrando preferencialmente em fronteiras de parágrafo/frase.
 * (Usado pela ingestão para documentos grandes.)
 */
export function chunkText(text: string, maxChars = 1200, overlap = 150): string[] {
  const clean = text.trim();
  if (clean.length <= maxChars) return clean.length ? [clean] : [];

  const chunks: string[] = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + maxChars, clean.length);
    if (end < clean.length) {
      // tenta quebrar numa fronteira natural (., \n, espaço) antes do limite
      const slice = clean.slice(start, end);
      const boundary = Math.max(
        slice.lastIndexOf("\n"),
        slice.lastIndexOf(". "),
        slice.lastIndexOf(" ")
      );
      if (boundary > maxChars * 0.5) end = start + boundary + 1;
    }
    chunks.push(clean.slice(start, end).trim());
    if (end >= clean.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks.filter(Boolean);
}
