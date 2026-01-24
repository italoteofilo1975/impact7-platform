/**
 * Sanitization Module
 * Camada 4: Proteção contra Injeção
 * Camada 5: Proteção contra Ataques Web (XSS)
 * 
 * Implementa sanitização de HTML/JavaScript conforme MYFIPE
 */

// Mapa de entidades HTML
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;',
};

// Tags HTML permitidas (whitelist)
const ALLOWED_TAGS = new Set([
  'p', 'br', 'b', 'i', 'u', 'strong', 'em', 'a', 'ul', 'ol', 'li',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
  'table', 'thead', 'tbody', 'tr', 'th', 'td', 'span', 'div',
]);

// Atributos permitidos por tag
const ALLOWED_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
  table: new Set(['border', 'cellpadding', 'cellspacing']),
  td: new Set(['colspan', 'rowspan']),
  th: new Set(['colspan', 'rowspan']),
  span: new Set(['class']),
  div: new Set(['class']),
};

// Protocolos permitidos em URLs
const ALLOWED_URL_PROTOCOLS = ['http:', 'https:', 'mailto:'];

/**
 * Escapar caracteres HTML especiais
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  return text.replace(/[&<>"'`=\/]/g, char => HTML_ENTITIES[char] || char);
}

/**
 * Desescapar entidades HTML
 */
export function unescapeHtml(text: string): string {
  if (!text || typeof text !== 'string') return '';
  
  const reverseEntities: Record<string, string> = {};
  for (const [char, entity] of Object.entries(HTML_ENTITIES)) {
    reverseEntities[entity] = char;
  }
  
  return text.replace(/&(?:amp|lt|gt|quot|#x27|#x2F|#x60|#x3D);/g, 
    entity => reverseEntities[entity] || entity
  );
}

/**
 * Sanitizar HTML removendo tags e atributos perigosos
 */
export function sanitizeHtml(html: string, options: {
  allowedTags?: Set<string>;
  allowedAttributes?: Record<string, Set<string>>;
  stripAll?: boolean;
} = {}): string {
  if (!html || typeof html !== 'string') return '';
  
  const {
    allowedTags = ALLOWED_TAGS,
    allowedAttributes = ALLOWED_ATTRIBUTES,
    stripAll = false,
  } = options;
  
  if (stripAll) {
    // Remover todas as tags HTML
    return html.replace(/<[^>]*>/g, '').trim();
  }
  
  // Remover scripts e event handlers
  let sanitized = html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/on\w+\s*=\s*[^\s>]*/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/vbscript:/gi, '')
    .replace(/data:/gi, '');
  
  // Processar tags
  sanitized = sanitized.replace(/<\/?([a-z][a-z0-9]*)\b([^>]*)>/gi, 
    (match, tagName, attributes) => {
      const tag = tagName.toLowerCase();
      
      // Remover tags não permitidas
      if (!allowedTags.has(tag)) {
        return '';
      }
      
      // Processar atributos
      const tagAllowedAttrs = allowedAttributes[tag] || new Set();
      const cleanAttributes = sanitizeAttributes(attributes, tagAllowedAttrs);
      
      // Reconstruir tag
      if (match.startsWith('</')) {
        return `</${tag}>`;
      }
      
      return cleanAttributes ? `<${tag} ${cleanAttributes}>` : `<${tag}>`;
    }
  );
  
  return sanitized.trim();
}

/**
 * Sanitizar atributos HTML
 */
function sanitizeAttributes(attributes: string, allowedAttrs: Set<string>): string {
  if (!attributes) return '';
  
  const attrRegex = /([a-z][a-z0-9-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]*))/gi;
  const cleanAttrs: string[] = [];
  
  let match;
  while ((match = attrRegex.exec(attributes)) !== null) {
    const attrName = match[1].toLowerCase();
    const attrValue = match[2] || match[3] || match[4] || '';
    
    // Verificar se atributo é permitido
    if (!allowedAttrs.has(attrName)) continue;
    
    // Sanitizar valor do atributo
    let cleanValue = escapeHtml(attrValue);
    
    // Validar URLs em href e src
    if (attrName === 'href' || attrName === 'src') {
      if (!isValidUrl(attrValue)) continue;
      cleanValue = attrValue; // URL já validada
    }
    
    cleanAttrs.push(`${attrName}="${cleanValue}"`);
  }
  
  return cleanAttrs.join(' ');
}

/**
 * Validar URL
 */
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url, 'https://example.com');
    return ALLOWED_URL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    // URLs relativas são permitidas
    return !url.includes(':') || url.startsWith('/');
  }
}

/**
 * Sanitizar para uso em atributos HTML
 */
export function sanitizeAttribute(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return value
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`/g, '&#x60;');
}

/**
 * Sanitizar para uso em JavaScript
 */
export function sanitizeJs(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return value
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/</g, '\\x3c')
    .replace(/>/g, '\\x3e')
    .replace(/&/g, '\\x26');
}

/**
 * Sanitizar para uso em JSON
 */
export function sanitizeJson(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return JSON.stringify(value).slice(1, -1);
}

/**
 * Sanitizar para uso em SQL (prepared statements são preferíveis)
 */
export function sanitizeSql(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return value
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\x00/g, '')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Sanitizar nome de arquivo
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') return 'unnamed';
  
  return filename
    .replace(/\.\./g, '') // Prevenir path traversal
    .replace(/[\/\\]/g, '') // Remover separadores de diretório
    .replace(/[<>:"|?*\x00-\x1f]/g, '') // Remover caracteres inválidos
    .replace(/^\.+/, '') // Remover pontos iniciais
    .trim()
    .slice(0, 255) || 'unnamed'; // Limitar tamanho
}

/**
 * Sanitizar path de arquivo
 */
export function sanitizePath(path: string, basePath: string): string | null {
  if (!path || typeof path !== 'string') return null;
  
  // Normalizar path
  const normalized = path
    .replace(/\\/g, '/')
    .replace(/\/+/g, '/')
    .replace(/\.\./g, '');
  
  // Verificar se está dentro do basePath
  const fullPath = `${basePath}/${normalized}`.replace(/\/+/g, '/');
  
  if (!fullPath.startsWith(basePath)) {
    return null; // Path traversal detectado
  }
  
  return fullPath;
}

/**
 * Sanitizar para uso em CSS
 */
export function sanitizeCss(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return value
    .replace(/[<>"'`]/g, '')
    .replace(/expression\s*\(/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/behavior\s*:/gi, '')
    .replace(/@import/gi, '')
    .replace(/url\s*\(/gi, '');
}

/**
 * Sanitizar para uso em URLs (query parameters)
 */
export function sanitizeUrlParam(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return encodeURIComponent(value);
}

/**
 * Sanitizar para uso em regex
 */
export function sanitizeRegex(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Sanitizar para uso em shell commands (evitar command injection)
 */
export function sanitizeShell(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return value
    .replace(/[;&|`$(){}[\]<>!#*?~]/g, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '');
}

/**
 * Sanitizar para uso em LDAP
 */
export function sanitizeLdap(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return value
    .replace(/\\/g, '\\5c')
    .replace(/\*/g, '\\2a')
    .replace(/\(/g, '\\28')
    .replace(/\)/g, '\\29')
    .replace(/\x00/g, '\\00');
}

/**
 * Sanitizar para uso em XML
 */
export function sanitizeXml(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Remover caracteres de controle
 */
export function stripControlChars(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  // Manter apenas caracteres imprimíveis, tabs, newlines
  return value.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Normalizar espaços em branco
 */
export function normalizeWhitespace(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return value
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Sanitização completa para input de usuário
 */
export function sanitizeUserInput(value: string): string {
  if (!value || typeof value !== 'string') return '';
  
  return normalizeWhitespace(
    stripControlChars(
      escapeHtml(value)
    )
  );
}

export const sanitizationConfig = {
  ALLOWED_TAGS,
  ALLOWED_ATTRIBUTES,
  ALLOWED_URL_PROTOCOLS,
};
