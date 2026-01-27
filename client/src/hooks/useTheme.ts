// Re-export useTheme from ThemeContext for backward compatibility
export { useTheme, ThemeProvider } from '../contexts/ThemeContext';
export type { Theme } from '../contexts/ThemeContext';

// Legacy type alias for compatibility
export type { Theme as ThemeType } from '../contexts/ThemeContext';
