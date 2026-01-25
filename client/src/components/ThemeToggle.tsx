import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { motion, AnimatePresence } from 'framer-motion';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
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
      aria-label={theme === 'light' ? 'Ativar modo escuro' : 'Ativar modo claro'}
      title={theme === 'light' ? 'Modo Escuro' : 'Modo Claro'}
    >
      <AnimatePresence mode="wait">
        {theme === 'light' ? (
          <motion.div
            key="moon"
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute"
          >
            <Moon 
              size={24} 
              className="text-primary drop-shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" 
            />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ rotate: 90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: -90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="absolute"
          >
            <Sun 
              size={24} 
              className="text-primary drop-shadow-[0_0_12px_rgba(var(--primary-rgb),0.7)]
                         animate-[spin_20s_linear_infinite]" 
            />
          </motion.div>
        )}
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
