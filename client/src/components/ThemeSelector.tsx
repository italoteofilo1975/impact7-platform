import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type Theme } from '../hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function ThemeSelector() {
  const { theme, resolvedTheme, setTheme } = useTheme();

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  // Show resolved theme in parentheses for system mode
  const getLabel = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
    return currentTheme.label;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative w-14 h-14 rounded-full flex items-center justify-center
                     bg-gradient-to-br from-primary/10 to-primary/5
                     hover:from-primary/20 hover:to-primary/10
                     border border-primary/20 hover:border-primary/30
                     transition-all duration-300 ease-in-out
                     hover:scale-110 active:scale-95
                     shadow-lg hover:shadow-xl"
          aria-label={`Tema atual: ${getLabel()}`}
          title={getLabel()}
        >
          <CurrentIcon 
            size={24} 
            className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" 
          />
          {/* Badge showing resolved theme for system mode */}
          {theme === 'system' && (
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-md animate-in fade-in duration-200">
              {resolvedTheme === 'dark' ? 'D' : 'L'}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {themes.map(({ value, label, icon: Icon }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setTheme(value)}
            className="flex items-center gap-3 cursor-pointer"
          >
            <Icon size={18} className={theme === value ? 'text-primary' : 'text-muted-foreground'} />
            <span className={theme === value ? 'font-semibold text-primary' : ''}>
              {label}
              {value === 'system' && theme === 'system' && (
                <span className="text-xs text-muted-foreground ml-1">
                  ({resolvedTheme === 'dark' ? 'Dark' : 'Light'})
                </span>
              )}
            </span>
            {theme === value && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
