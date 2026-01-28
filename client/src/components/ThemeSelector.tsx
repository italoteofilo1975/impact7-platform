import { Sun, Moon, Monitor, Clock, Sunrise, Brain, Palette } from 'lucide-react';
import { useTheme, type Theme } from '../hooks/useTheme';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function ThemeSelector() {
  const { theme, resolvedTheme, setTheme, autoSwitchTimes, setAutoSwitchTimes, sunTimes } = useTheme();
  const [showAutoSettings, setShowAutoSettings] = useState(false);
  const [showCustomTheme, setShowCustomTheme] = useState(false);
  const [lightStart, setLightStart] = useState(autoSwitchTimes.lightStart);
  const [darkStart, setDarkStart] = useState(autoSwitchTimes.darkStart);
  const [customColors, setCustomColors] = useState({
    primary: '#ff6b35',
    background: '#ffffff',
    foreground: '#000000',
  });
  const [hoveredTheme, setHoveredTheme] = useState<Theme | null>(null);
  const previewTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
    { 
      value: 'circadian', 
      label: 'Circadian Rhythm', 
      icon: Brain,
      preview: { bg: 'bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-900', text: 'text-white' }
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
    if (theme === 'circadian') {
      return `Circadian (${resolvedTheme === 'dark' ? 'Dark' : 'Light'}) 🧠`;
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
            {/* Badge showing resolved theme for system/auto/sunset/circadian mode */}
            {(theme === 'system' || theme === 'auto' || theme === 'sunset' || theme === 'circadian') && (
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
              onMouseEnter={() => {
                // Debounce preview to avoid flickering
                if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
                previewTimeoutRef.current = setTimeout(() => {
                  setHoveredTheme(value);
                }, 200);
              }}
              onMouseLeave={() => {
                if (previewTimeoutRef.current) clearTimeout(previewTimeoutRef.current);
                setHoveredTheme(null);
              }}
              className="flex items-center gap-3 py-2 cursor-pointer group relative overflow-hidden transition-all duration-300 hover:scale-[1.02]"
            >
              {/* Preview thumbnail with animation */}
              <div className={`w-8 h-8 rounded-md ${preview.bg} border border-border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg ${hoveredTheme === value ? 'ring-2 ring-primary ring-offset-2' : ''}`}>
                <Icon size={16} className={`${preview.text} transition-transform duration-300 group-hover:rotate-12`} />
              </div>
              
              {/* Animated background on hover */}
              {hoveredTheme === value && (
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 animate-in fade-in duration-300" />
              )}
              
              {/* Label */}
              <div className="flex-1 relative z-10">
                <div className="font-medium transition-colors duration-300 group-hover:text-primary">{label}</div>
                {value === 'sunset' && sunTimes && (
                  <div className="text-xs text-muted-foreground">
                    ☀️ {new Date(sunTimes.sunrise).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                    🌙 {new Date(sunTimes.sunset).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
              </div>
              
              {/* Active indicator with animation */}
              {theme === value && (
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse relative z-10" />
              )}
              
              {/* Hover preview mini UI */}
              {hoveredTheme === value && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                  <div className="flex gap-1 animate-in slide-in-from-right duration-300">
                    <div className={`w-1.5 h-6 rounded-full ${preview.bg} border border-border/50`} />
                    <div className={`w-1.5 h-4 rounded-full ${preview.bg} border border-border/50 mt-1`} />
                    <div className={`w-1.5 h-5 rounded-full ${preview.bg} border border-border/50 mt-0.5`} />
                  </div>
                </div>
              )}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowCustomTheme(true)}
            className="flex items-center gap-3 py-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-md bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 border border-border flex items-center justify-center">
              <Palette size={16} className="text-white" />
            </div>
            <div className="flex-1">
              <div className="font-medium">Custom Theme</div>
              <div className="text-xs text-muted-foreground">Create your own</div>
            </div>
          </DropdownMenuItem>
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

      {/* Custom Theme Dialog */}
      <Dialog open={showCustomTheme} onOpenChange={setShowCustomTheme}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Custom Theme Creator</DialogTitle>
            <DialogDescription>
              Create your own color palette. Changes apply in real-time. Export and share with your team!
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="primary">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary"
                    type="color"
                    value={customColors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={customColors.primary}
                    onChange={(e) => setCustomColors({ ...customColors, primary: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="background">Background</Label>
                <div className="flex gap-2">
                  <Input
                    id="background"
                    type="color"
                    value={customColors.background}
                    onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={customColors.background}
                    onChange={(e) => setCustomColors({ ...customColors, background: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="foreground">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="foreground"
                    type="color"
                    value={customColors.foreground}
                    onChange={(e) => setCustomColors({ ...customColors, foreground: e.target.value })}
                    className="w-20 h-10 cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={customColors.foreground}
                    onChange={(e) => setCustomColors({ ...customColors, foreground: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Live Preview */}
            <div className="space-y-2">
              <Label>Live Preview</Label>
              <div 
                className="p-6 rounded-lg border-2 transition-colors duration-300"
                style={{ 
                  backgroundColor: customColors.background,
                  color: customColors.foreground,
                  borderColor: customColors.primary 
                }}
              >
                <h3 className="text-xl font-bold mb-2" style={{ color: customColors.primary }}>IMPACT7 Platform</h3>
                <p className="mb-4">This is how your custom theme will look. All text and UI elements will adapt to your chosen colors.</p>
                <button 
                  className="px-4 py-2 rounded-md font-medium transition-opacity hover:opacity-80"
                  style={{ backgroundColor: customColors.primary, color: customColors.background }}
                >
                  Primary Button
                </button>
              </div>
            </div>

            {/* Export/Import */}
            <div className="space-y-2">
              <Label>Export / Import</Label>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const json = JSON.stringify(customColors, null, 2);
                    navigator.clipboard.writeText(json);
                  }}
                  className="flex-1"
                >
                  📋 Copy JSON
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    const json = prompt('Paste your custom theme JSON:');
                    if (json) {
                      try {
                        const parsed = JSON.parse(json);
                        setCustomColors(parsed);
                      } catch (e) {
                        alert('Invalid JSON format');
                      }
                    }
                  }}
                  className="flex-1"
                >
                  📥 Import JSON
                </Button>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCustomTheme(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Apply custom theme to CSS variables
              const root = document.documentElement;
              root.style.setProperty('--primary', customColors.primary);
              root.style.setProperty('--background', customColors.background);
              root.style.setProperty('--foreground', customColors.foreground);
              localStorage.setItem('customTheme', JSON.stringify(customColors));
              setShowCustomTheme(false);
            }}>
              Apply Theme
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
