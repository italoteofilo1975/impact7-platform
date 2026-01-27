import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  const getIcon = () => {
    switch (theme) {
      case 'light':
        return { Icon: Moon, label: 'Ativar modo escuro', title: 'Modo Escuro' };
      case 'dark':
        return { Icon: Monitor, label: 'Ativar modo sistema', title: 'Modo Sistema' };
      case 'system':
        return { Icon: Sun, label: 'Ativar modo claro', title: 'Modo Claro' };
      default:
        return { Icon: Moon, label: 'Ativar modo escuro', title: 'Modo Escuro' };
    }
  };

  const { Icon, label, title } = getIcon();
  
  return (
    <button
      onClick={toggleTheme}
      className="relative w-14 h-14 rounded-full flex items-center justify-center
                 bg-gradient-to-br from-primary/10 to-primary/5
                 hover:from-primary/20 hover:to-primary/10
                 border border-primary/20 hover:border-primary/30
                 transition-all duration-300 ease-in-out
                 hover:scale-110 active:scale-95
                 shadow-lg hover:shadow-xl"
      aria-label={label}
      title={title}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, scale: 0, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute"
        >
          <Icon 
            size={24} 
            className={`text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)] ${
              theme === 'light' ? 'animate-[spin_20s_linear_infinite]' : ''
            }`} 
          />
        </motion.div>
      </AnimatePresence>
      
      {/* Efeito de brilho ao clicar */}
      <motion.div
        className="absolute inset-0 rounded-full bg-primary/20"
        initial={{ scale: 0, opacity: 0.5 }}
        animate={{ scale: 0, opacity: 0 }}
        transition={{ duration: 0.6 }}
        key={theme}
      />
    </button>
  );
}
