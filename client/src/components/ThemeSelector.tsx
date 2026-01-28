import { Sun, Moon, Monitor, Clock } from 'lucide-react';
import { useTheme, type Theme } from '../hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function ThemeSelector() {
  const { theme, resolvedTheme, setTheme, autoSwitchTimes, setAutoSwitchTimes } = useTheme();
  const [showAutoSettings, setShowAutoSettings] = useState(false);
  const [lightStart, setLightStart] = useState(autoSwitchTimes.lightStart);
  const [darkStart, setDarkStart] = useState(autoSwitchTimes.darkStart);

  const themes: { value: Theme; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
    { value: 'auto', label: 'Auto (Time)', icon: Clock },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  // Show resolved theme in parentheses for system/auto mode
  const getLabel = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
    if (theme === 'auto') {
      return `Auto (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
    return currentTheme.label;
  };

  const handleSaveAutoSettings = () => {
    setAutoSwitchTimes({ lightStart, darkStart });
    setShowAutoSettings(false);
  };

  return (
    <>
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
            {/* Badge showing resolved theme for system/auto mode */}
            {(theme === 'system' || theme === 'auto') && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-md animate-in fade-in duration-200">
                {resolvedTheme === 'dark' ? 'D' : 'L'}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {themes.map(({ value, label, icon: Icon }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => {
                if (value === 'auto') {
                  setShowAutoSettings(true);
                }
                setTheme(value);
              }}
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
                {value === 'auto' && theme === 'auto' && (
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
          {theme === 'auto' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setShowAutoSettings(true)}
                className="flex items-center gap-3 cursor-pointer text-xs text-muted-foreground"
              >
                <Clock size={14} />
                <span>Configure times...</span>
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Auto Settings Dialog */}
      <Dialog open={showAutoSettings} onOpenChange={setShowAutoSettings}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Auto Theme Schedule</DialogTitle>
            <DialogDescription>
              Configure when to switch between light and dark themes automatically based on time of day.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lightStart" className="text-right">
                Light starts
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="lightStart"
                  type="number"
                  min="0"
                  max="23"
                  value={lightStart}
                  onChange={(e) => setLightStart(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">:00 (24h format)</span>
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="darkStart" className="text-right">
                Dark starts
              </Label>
              <div className="col-span-3 flex items-center gap-2">
                <Input
                  id="darkStart"
                  type="number"
                  min="0"
                  max="23"
                  value={darkStart}
                  onChange={(e) => setDarkStart(parseInt(e.target.value) || 0)}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">:00 (24h format)</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
              <strong>Example:</strong> Light starts at {lightStart}:00, Dark starts at {darkStart}:00
              <br />
              Current time: {new Date().getHours()}:{String(new Date().getMinutes()).padStart(2, '0')}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAutoSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAutoSettings}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
