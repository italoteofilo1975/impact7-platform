import { Sun, Moon, Monitor, Clock, Sunrise } from 'lucide-react';
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
  const { theme, resolvedTheme, setTheme, autoSwitchTimes, setAutoSwitchTimes, sunTimes } = useTheme();
  const [showAutoSettings, setShowAutoSettings] = useState(false);
  const [lightStart, setLightStart] = useState(autoSwitchTimes.lightStart);
  const [darkStart, setDarkStart] = useState(autoSwitchTimes.darkStart);

  const themes: { value: Theme; label: string; icon: typeof Sun; preview: { bg: string; text: string } }[] = [
    { 
      value: 'light', 
      label: 'Light', 
      icon: Sun,
      preview: { bg: 'bg-white', text: 'text-gray-900' }
    },
    { 
      value: 'dark', 
      label: 'Dark', 
      icon: Moon,
      preview: { bg: 'bg-gray-900', text: 'text-white' }
    },
    { 
      value: 'system', 
      label: 'System', 
      icon: Monitor,
      preview: { bg: 'bg-gradient-to-br from-white to-gray-900', text: 'text-gray-900' }
    },
    { 
      value: 'auto', 
      label: 'Auto (Time)', 
      icon: Clock,
      preview: { bg: 'bg-gradient-to-r from-orange-200 via-blue-300 to-indigo-900', text: 'text-gray-900' }
    },
    { 
      value: 'sunset', 
      label: 'Sunset/Sunrise', 
      icon: Sunrise,
      preview: { bg: 'bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-500', text: 'text-white' }
    },
  ];

  const currentTheme = themes.find(t => t.value === theme) || themes[0];
  const CurrentIcon = currentTheme.icon;

  // Show resolved theme in parentheses for system/auto/sunset mode
  const getLabel = () => {
    if (theme === 'system') {
      return `System (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
    if (theme === 'auto') {
      return `Auto (${resolvedTheme === 'dark' ? 'Dark' : 'Light'})`;
    }
    if (theme === 'sunset') {
      const sunriseTime = sunTimes ? new Date(sunTimes.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--';
      const sunsetTime = sunTimes ? new Date(sunTimes.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '--:--';
      return `Sunset (${resolvedTheme === 'dark' ? 'Dark' : 'Light'}) ☀️${sunriseTime} 🌙${sunsetTime}`;
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
            {/* Badge showing resolved theme for system/auto/sunset mode */}
            {(theme === 'system' || theme === 'auto' || theme === 'sunset') && (
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-md animate-in fade-in duration-200">
                {resolvedTheme === 'dark' ? 'D' : 'L'}
              </span>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground">
            Select Theme
          </div>
          <DropdownMenuSeparator />
          {themes.map(({ value, label, icon: Icon, preview }) => (
            <DropdownMenuItem
              key={value}
              onClick={() => {
                if (value === 'auto') {
                  setShowAutoSettings(true);
                } else {
                  setTheme(value);
                }
              }}
              className="flex items-center gap-3 py-2 cursor-pointer"
            >
              {/* Preview thumbnail */}
              <div className={`w-8 h-8 rounded-md ${preview.bg} border border-border flex items-center justify-center`}>
                <Icon size={16} className={preview.text} />
              </div>
              
              {/* Label */}
              <div className="flex-1">
                <div className="font-medium">{label}</div>
                {value === 'sunset' && sunTimes && (
                  <div className="text-xs text-muted-foreground">
                    ☀️ {new Date(sunTimes.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                    🌙 {new Date(sunTimes.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              
              {/* Active indicator */}
              {theme === value && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Auto Settings Dialog */}
      <Dialog open={showAutoSettings} onOpenChange={setShowAutoSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Auto Theme Settings</DialogTitle>
            <DialogDescription>
              Configure when to switch between light and dark themes automatically based on time of day.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="lightStart">Light Theme Starts At (Hour)</Label>
              <Input
                id="lightStart"
                type="number"
                min="0"
                max="23"
                value={lightStart}
                onChange={(e) => setLightStart(parseInt(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                Default: 6 (6:00 AM)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="darkStart">Dark Theme Starts At (Hour)</Label>
              <Input
                id="darkStart"
                type="number"
                min="0"
                max="23"
                value={darkStart}
                onChange={(e) => setDarkStart(parseInt(e.target.value))}
              />
              <p className="text-sm text-muted-foreground">
                Default: 18 (6:00 PM)
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowAutoSettings(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveAutoSettings}>
              Save & Apply
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
