// Suprimir erros de WebSocket do Vite HMR no console
// Este script deve ser importado antes de qualquer outro código

if (typeof window !== 'undefined') {
  // Salvar referência original do console.error
  const originalConsoleError = console.error;
  
  // Sobrescrever console.error para filtrar erros de WebSocket do Vite
  console.error = (...args: any[]) => {
    const message = args[0]?.toString?.() || '';
    
    // Filtrar erros relacionados ao WebSocket do Vite HMR
    if (
      message.includes('WebSocket connection to') ||
      message.includes('@vite/client') ||
      message.includes('failed to connect to websocket') ||
      message.includes(':24678')
    ) {
      // Silenciosamente ignorar esses erros
      return;
    }
    
    // Passar outros erros para o console.error original
    originalConsoleError.apply(console, args);
  };

  // Também suprimir erros de WebSocket não tratados
  window.addEventListener('error', (event) => {
    if (
      event.message?.includes('WebSocket') ||
      event.message?.includes('24678')
    ) {
      event.preventDefault();
      return false;
    }
  });
}

export {};
