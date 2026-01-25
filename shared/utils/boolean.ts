/**
 * Boolean Conversion Utilities
 * 
 * MySQL não tem tipo boolean nativo, então armazenamos como int (0/1).
 * Estes helpers facilitam a conversão entre number e boolean.
 */

/**
 * Converte number (0/1) para boolean
 * @param value - Valor numérico (0 ou 1)
 * @returns true se value === 1, false caso contrário
 */
export function toBoolean(value: number | null | undefined): boolean {
  return value === 1;
}

/**
 * Converte boolean para number (0/1)
 * @param value - Valor booleano
 * @returns 1 se true, 0 se false
 */
export function fromBoolean(value: boolean): number {
  return value ? 1 : 0;
}

/**
 * Converte array de objetos com campos boolean-like para boolean real
 * Útil para resultados de queries Drizzle
 */
export function convertBooleanFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[]
): T {
  const result = { ...obj };
  for (const field of fields) {
    if (typeof result[field] === 'number') {
      result[field] = toBoolean(result[field] as number) as any;
    }
  }
  return result;
}

/**
 * Converte array de objetos
 */
export function convertBooleanFieldsArray<T extends Record<string, any>>(
  arr: T[],
  fields: (keyof T)[]
): T[] {
  return arr.map(obj => convertBooleanFields(obj, fields));
}
