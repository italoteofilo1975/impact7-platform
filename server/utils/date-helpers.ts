/**
 * Date Helpers - Conversão entre Date e Unix timestamps
 * 
 * MySQL/Drizzle usa timestamps Unix (number) para armazenar datas.
 * Estes helpers facilitam a conversão bidirecional.
 */

/**
 * Converte Date para Unix timestamp (milliseconds)
 */
export function dateToUnix(date: Date | number): number {
  if (typeof date === 'number') return date;
  return date.getTime();
}

/**
 * Converte Unix timestamp para Date
 */
export function unixToDate(timestamp: number): Date {
  return new Date(timestamp);
}

/**
 * Retorna timestamp Unix atual
 */
export function now(): number {
  return Date.now();
}

/**
 * Adiciona dias a um timestamp
 */
export function addDays(timestamp: number, days: number): number {
  return timestamp + (days * 24 * 60 * 60 * 1000);
}

/**
 * Adiciona horas a um timestamp
 */
export function addHours(timestamp: number, hours: number): number {
  return timestamp + (hours * 60 * 60 * 1000);
}

/**
 * Verifica se um timestamp expirou
 */
export function isExpired(timestamp: number): boolean {
  return timestamp < Date.now();
}

/**
 * Formata timestamp para string legível
 */
export function formatTimestamp(timestamp: number, locale: string = 'pt-BR'): string {
  return new Date(timestamp).toLocaleString(locale);
}
